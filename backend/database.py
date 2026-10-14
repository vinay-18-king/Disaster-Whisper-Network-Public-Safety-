"""
Thread-safe in-memory store for Whisper Emergency Dispatch.
Manages incidents, deduplication clusters, rescue teams, and broadcasts.
"""

import threading
from typing import Dict, List, Optional
from datetime import datetime
from .models import IncidentRecord, DispatchStatus, MultilingualBroadcast


class WhisperDatabase:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(WhisperDatabase, cls).__new__(cls)
                cls._instance._init_db()
            return cls._instance

    def _init_db(self):
        self.incidents: Dict[str, IncidentRecord] = {}
        self.clusters: Dict[str, List[str]] = {}  # cluster_id -> [incident_ids]
        self.broadcasts: List[MultilingualBroadcast] = []
        self.teams = [
            {"id": "TEAM-NDRF-01", "name": "NDRF 10th Battalion Alpha", "type": "Motorized Inflatable Boat", "status": "AVAILABLE", "assigned_incident_id": None},
            {"id": "TEAM-SDRF-02", "name": "SDRF Flood Rescue Squad B", "type": "Deep Water Gemini Craft", "status": "BUSY", "assigned_incident_id": "SOS-VJ-001"},
            {"id": "TEAM-NAVY-03", "name": "Indian Navy Sea King Air Patrol", "type": "Helicopter Air-Lift", "status": "AVAILABLE", "assigned_incident_id": None},
            {"id": "TEAM-VOL-04", "name": "Vijayawada Fishermen Raft Force", "type": "Country Boat Squad", "status": "AVAILABLE", "assigned_incident_id": None},
            {"id": "TEAM-MEDIC-05", "name": "Red Cross Emergency Trauma Unit", "type": "Mobile Amphibious Clinic", "status": "AVAILABLE", "assigned_incident_id": None},
        ]
        self.lock = threading.RLock()

    def add_incident(self, incident: IncidentRecord) -> IncidentRecord:
        with self.lock:
            self.incidents[incident.id] = incident
            if incident.cluster_id:
                if incident.cluster_id not in self.clusters:
                    self.clusters[incident.cluster_id] = []
                self.clusters[incident.cluster_id].append(incident.id)
            return incident

    def get_incident(self, incident_id: str) -> Optional[IncidentRecord]:
        with self.lock:
            return self.incidents.get(incident_id)

    def list_incidents(self, limit: int = 200) -> List[IncidentRecord]:
        with self.lock:
            records = list(self.incidents.values())
            records.sort(key=lambda r: r.created_at, reverse=True)
            return records[:limit]

    def update_status(self, incident_id: str, status: DispatchStatus, assigned_team: Optional[str] = None) -> Optional[IncidentRecord]:
        with self.lock:
            if incident_id in self.incidents:
                self.incidents[incident_id].status = status
                if assigned_team is not None:
                    self.incidents[incident_id].assigned_team = assigned_team
                return self.incidents[incident_id]
            return None

    def add_broadcast(self, broadcast: MultilingualBroadcast):
        with self.lock:
            self.broadcasts.append(broadcast)

    def get_stats(self) -> Dict:
        with self.lock:
            total = len(self.incidents)
            critical = sum(1 for inc in self.incidents.values() if inc.triage.urgency == "CRITICAL")
            high = sum(1 for inc in self.incidents.values() if inc.triage.urgency == "HIGH")
            duplicates = sum(1 for inc in self.incidents.values() if inc.is_duplicate)
            rescued = sum(1 for inc in self.incidents.values() if inc.status in [DispatchStatus.EVACUATED, DispatchStatus.RESOLVED])
            total_stranded = sum(inc.triage.people_stranded for inc in self.incidents.values() if not inc.is_duplicate)
            
            dedup_rate = round((duplicates / total * 100), 1) if total > 0 else 0.0

            return {
                "total_messages_received": total,
                "unique_incident_sites": total - duplicates,
                "critical_urgency_count": critical,
                "high_urgency_count": high,
                "duplicate_calls_filtered": duplicates,
                "deduplication_rate_percent": dedup_rate,
                "total_souls_identified": total_stranded,
                "active_rescue_teams": len(self.teams),
                "successful_evacuations": rescued
            }


db = WhisperDatabase()
