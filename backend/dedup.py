"""
Whisper Deduplication & Incident Clustering Engine
Uses Google GenAI embeddings (text-embedding-004) and spatial proximity (Haversine)
to detect duplicate SOS calls for the same trapped group, preventing responder fatigue.
"""

import os
import math
from typing import List, Tuple, Optional
import numpy as np
from google import genai
from .models import IncidentRecord

EMBEDDING_MODEL = "text-embedding-004"
SIMILARITY_THRESHOLD = 0.82  # Cosine similarity threshold for duplicate alert
SPATIAL_THRESHOLD_KM = 0.45  # 450 meters radius for same building/cluster


def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    return genai.Client(api_key=api_key)


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_text_embedding(text: str) -> List[float]:
    """Generates a 768-dimensional dense semantic embedding vector."""
    try:
        client = get_gemini_client()
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
        )
        return result.embedding.values
    except Exception:
        # Deterministic pseudo-embedding fallback if offline/no key
        np.random.seed(abs(hash(text)) % (2**32))
        vec = np.random.randn(768).astype(float)
        return (vec / np.linalg.norm(vec)).tolist()


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    a = np.array(v1)
    b = np.array(v2)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    if norm == 0:
        return 0.0
    return float(np.dot(a, b) / norm)


def check_duplicate_and_cluster(
    new_message_text: str,
    new_lat: Optional[float],
    new_lng: Optional[float],
    existing_incidents: List[IncidentRecord]
) -> Tuple[bool, Optional[str], Optional[str], float]:
    """
    Checks if a newly received distress call is a duplicate of an existing active incident.
    Returns: (is_duplicate, master_incident_id, cluster_id, similarity_score)
    """
    if not existing_incidents:
        # Fresh cluster
        cluster_id = f"cluster_{int(os.urandom(3).hex(), 16)}"
        return False, None, cluster_id, 0.0

    new_emb = get_text_embedding(new_message_text)

    best_match_id = None
    best_cluster_id = None
    highest_sim = 0.0

    for inc in existing_incidents:
        # 1. Geographic check first (if coords available)
        geo_match = True
        if (new_lat is not None and new_lng is not None and 
            inc.triage.coordinates and inc.triage.coordinates.lat and inc.triage.coordinates.lng):
            dist_km = haversine_distance_km(
                new_lat, new_lng,
                inc.triage.coordinates.lat, inc.triage.coordinates.lng
            )
            if dist_km > SPATIAL_THRESHOLD_KM:
                geo_match = False

        if not geo_match:
            continue

        # 2. Semantic text similarity check
        inc_emb = get_text_embedding(inc.raw_message.raw_text)
        sim = cosine_similarity(new_emb, inc_emb)

        if sim > highest_sim:
            highest_sim = sim
            best_match_id = inc.id
            best_cluster_id = inc.cluster_id or f"cluster_{inc.id}"

    if highest_sim >= SIMILARITY_THRESHOLD and best_match_id:
        return True, best_match_id, best_cluster_id, highest_sim

    # New distinct event
    new_cluster_id = f"cluster_{int(os.urandom(3).hex(), 16)}"
    return False, None, new_cluster_id, highest_sim
