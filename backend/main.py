"""
Whisper - FastAPI AI Triage Service Entrypoint
Autonomous AI Triage, Semantic Deduplication, and Multilingual Dispatch Service
"""

import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from .models import (
    RawDistressMessage,
    TriageOutput,
    IncidentRecord,
    BroadcastRequest,
    MultilingualBroadcast,
    DispatchStatus
)
from .database import db
from .triage import triage_distress_message
from .dedup import check_duplicate_and_cluster
from .broadcast import generate_multilingual_broadcast

app = FastAPI(
    title="Whisper: AI Flood Distress Triage & Multilingual Dispatch API",
    version="1.0.0",
    description="Mission-critical crisis response API using Gemini 2.5 Flash and text-embedding-004."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "service": "Whisper Flood Triage Engine",
        "status": "OPERATIONAL",
        "timestamp": datetime.utcnow().isoformat(),
        "models": {
            "triage": "gemini-2.5-flash",
            "dedup": "text-embedding-004",
            "broadcaster": "gemini-2.5-flash (EN/HI/TE)"
        }
    }


@app.post("/api/triage", response_model=TriageOutput)
async def triage_message(raw_msg: RawDistressMessage):
    """Directly triage a distress message using Gemini Flash."""
    triage_result = await triage_distress_message(
        message_id=raw_msg.id,
        raw_text=raw_msg.raw_text,
        city_hint=raw_msg.city
    )
    return triage_result


@app.post("/api/ingest", response_model=IncidentRecord)
async def ingest_sos_call(raw_msg: RawDistressMessage):
    """
    Ingests an incoming raw SOS call.
    1. Runs Gemini Flash AI Triage.
    2. Runs text-embedding-004 semantic + spatial deduplication.
    3. Persists into incident database.
    """
    # 1. Triage
    triage_result = await triage_distress_message(
        message_id=raw_msg.id,
        raw_text=raw_msg.raw_text,
        city_hint=raw_msg.city
    )

    # 2. Check for duplicate against existing incidents
    all_incidents = db.list_incidents(limit=300)
    lat = triage_result.coordinates.lat if triage_result.coordinates else None
    lng = triage_result.coordinates.lng if triage_result.coordinates else None

    is_dup, master_id, cluster_id, sim = check_duplicate_and_cluster(
        new_message_text=raw_msg.raw_text,
        new_lat=lat,
        new_lng=lng,
        existing_incidents=all_incidents
    )

    # If duplicate, increment duplicate count on master incident
    if is_dup and master_id:
        master_inc = db.get_incident(master_id)
        if master_inc:
            master_inc.duplicate_count += 1

    record = IncidentRecord(
        id=raw_msg.id,
        created_at=datetime.utcnow(),
        raw_message=raw_msg,
        triage=triage_result,
        cluster_id=cluster_id,
        is_duplicate=is_dup,
        duplicate_count=0,
        status=DispatchStatus.PENDING
    )

    db.add_incident(record)
    return record


@app.get("/api/incidents", response_model=List[IncidentRecord])
def get_incidents(
    urgency: Optional[str] = None,
    category: Optional[str] = None,
    exclude_duplicates: bool = False,
    limit: int = 150
):
    incidents = db.list_incidents(limit=limit)
    if urgency:
        incidents = [i for i in incidents if i.triage.urgency == urgency.upper()]
    if category:
        incidents = [i for i in incidents if i.triage.category == category.upper()]
    if exclude_duplicates:
        incidents = [i for i in incidents if not i.is_duplicate]
    return incidents


@app.patch("/api/incidents/{incident_id}/status")
def update_incident_status(incident_id: str, status: DispatchStatus, team_id: Optional[str] = None):
    updated = db.update_status(incident_id, status=status, assigned_team=team_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found")
    return updated


@app.post("/api/broadcast", response_model=MultilingualBroadcast)
async def create_broadcast(req: BroadcastRequest):
    """Generates official civil defense alerts in English, Hindi, and Telugu."""
    broadcast = await generate_multilingual_broadcast(req)
    db.add_broadcast(broadcast)
    return broadcast


@app.get("/api/broadcasts", response_model=List[MultilingualBroadcast])
def get_broadcasts():
    return db.broadcasts


@app.get("/api/stats")
def get_stats():
    return db.get_stats()


@app.get("/api/teams")
def get_teams():
    return db.teams


@app.post("/api/seed-samples")
def seed_from_sample_file():
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sample_messages.json")
    if not os.path.exists(data_path):
        raise HTTPException(status_code=404, detail="sample_messages.json not found")
    
    with open(data_path, "r", encoding="utf-8") as f:
        samples = json.load(f)

    loaded = 0
    for s in samples:
        # Load sample into in-memory store
        triage_out = TriageOutput(
            message_id=s["id"],
            urgency=s.get("ground_truth_urgency", "HIGH"),
            category=s.get("ground_truth_category", "RESCUE_BOAT"),
            extracted_location=s.get("reported_location", "Unknown Location"),
            coordinates=s.get("coordinates"),
            people_stranded=s.get("people_stranded", 1),
            water_depth=s.get("water_depth_estimate", "Unknown"),
            vulnerable_tags=s.get("vulnerable_tags", []),
            tactical_action_plan=f"Deploy boat unit to {s.get('reported_location')}",
            detected_language=s.get("language", "en"),
            sentiment_panic_score=8 if s.get("ground_truth_urgency") == "CRITICAL" else 5,
            confidence=0.96,
            summary_en=s.get("raw_text", "")[:120],
            summary_hi="",
            summary_te=""
        )
        raw_m = RawDistressMessage(
            id=s["id"],
            raw_text=s["raw_text"],
            source=s.get("source", "WhatsApp SOS"),
            sender_contact=s.get("sender_contact", "Unknown"),
            reported_location=s.get("reported_location"),
            city=s.get("city"),
            timestamp=datetime.utcnow()
        )
        record = IncidentRecord(
            id=s["id"],
            created_at=datetime.utcnow(),
            raw_message=raw_m,
            triage=triage_out,
            cluster_id=s.get("cluster_group_id"),
            is_duplicate=s.get("id") in ["SOS-VJ-002", "SOS-VJ-003", "SOS-VJ-005", "SOS-KH-007", "SOS-PAT-011", "SOS-CHE-017"],
            duplicate_count=2 if s.get("id") == "SOS-VJ-001" else 0,
            status=DispatchStatus.PENDING
        )
        db.add_incident(record)
        loaded += 1

    return {"status": "SUCCESS", "loaded_records": loaded}
