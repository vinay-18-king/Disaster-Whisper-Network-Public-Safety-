"""
Whisper AI Triage & Rescue Dispatch Models
Pydantic Schemas for Emergency SOS Ingestion, Classification & Alerts
"""

from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime


class UrgencyLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class CategoryType(str, Enum):
    RESCUE_BOAT = "RESCUE_BOAT"
    MEDICAL_EMERGENCY = "MEDICAL_EMERGENCY"
    FOOD_WATER = "FOOD_WATER"
    SHELTER_EVAC = "SHELTER_EVAC"
    INFRASTRUCTURE = "INFRASTRUCTURE"
    INFO_REQUEST = "INFO_REQUEST"


class DispatchStatus(str, Enum):
    PENDING = "PENDING"
    DISPATCHED = "DISPATCHED"
    ON_SCENE = "ON_SCENE"
    EVACUATED = "EVACUATED"
    RESOLVED = "RESOLVED"


class Coordinates(BaseModel):
    lat: float
    lng: float
    display_name: Optional[str] = None
    confidence: Optional[float] = 1.0


class RawDistressMessage(BaseModel):
    id: str
    raw_text: str
    source: str = "WhatsApp SOS"
    sender_contact: Optional[str] = "Unknown"
    reported_location: Optional[str] = None
    city: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TriageOutput(BaseModel):
    message_id: str
    urgency: UrgencyLevel
    category: CategoryType
    extracted_location: str
    coordinates: Optional[Coordinates] = None
    people_stranded: int = 1
    water_depth: str = "Unknown"
    vulnerable_tags: List[str] = []
    tactical_action_plan: str
    detected_language: str = "en"
    sentiment_panic_score: int = Field(ge=1, le=10, default=5)
    confidence: float = Field(ge=0.0, le=1.0, default=0.95)
    summary_en: str
    summary_hi: Optional[str] = None
    summary_te: Optional[str] = None


class IncidentRecord(BaseModel):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    raw_message: RawDistressMessage
    triage: TriageOutput
    cluster_id: Optional[str] = None
    is_duplicate: bool = False
    duplicate_count: int = 0
    assigned_team: Optional[str] = None
    status: DispatchStatus = DispatchStatus.PENDING


class BroadcastRequest(BaseModel):
    zone_name: str
    flood_level_alert: str
    evacuation_centers: List[str]
    critical_advisory: str
    helpline_numbers: List[str] = ["112", "1070", "0866-2575833"]


class MultilingualBroadcast(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    zone_name: str
    english_alert: str
    hindi_alert: str
    telugu_alert: str
    whatsapp_format: str
    sms_format: str
    audio_dispatch_script: str
