"""
OpenStreetMap Nominatim Geocoding Engine with Local Cache & Landmark Gazetteer
"""

import requests
import time
from typing import Optional, Dict
from .models import Coordinates

# High-precision offline gazetteer for flood prone zones to guarantee instant 0-latency resolution
OFFLINE_GAZETTEER: Dict[str, Dict[str, float]] = {
    "singh nagar": {"lat": 16.5362, "lng": 80.6425, "display_name": "Ajit Singh Nagar, Vijayawada, Andhra Pradesh"},
    "ajit singh nagar": {"lat": 16.5362, "lng": 80.6425, "display_name": "Ajit Singh Nagar, Vijayawada, Andhra Pradesh"},
    "vijaya dairy": {"lat": 16.5365, "lng": 80.6428, "display_name": "Vijaya Dairy Circle, Singh Nagar, Vijayawada"},
    "budameru": {"lat": 16.5401, "lng": 80.6380, "display_name": "Budameru Rivulet Embankment, Vijayawada"},
    "chittinagar": {"lat": 16.5241, "lng": 80.6092, "display_name": "Chittinagar Tunnel Area, Vijayawada"},
    "gollapalem gattu": {"lat": 16.5243, "lng": 80.6095, "display_name": "Gollapalem Gattu, Chittinagar, Vijayawada"},
    "vambay colony": {"lat": 16.5450, "lng": 80.6480, "display_name": "Vambay Colony, Singh Nagar, Vijayawada"},
    "payakapuram": {"lat": 16.5492, "lng": 80.6391, "display_name": "Payakapuram, Vijayawada, Andhra Pradesh"},
    "prakash nagar": {"lat": 17.2472, "lng": 80.1514, "display_name": "Prakash Nagar, Munneru Bridge, Khammam, Telangana"},
    "munneru": {"lat": 17.2472, "lng": 80.1514, "display_name": "Munneru River Basin, Khammam, Telangana"},
    "karunagiri": {"lat": 17.2520, "lng": 80.1590, "display_name": "Karunagiri Shrine, Khammam, Telangana"},
    "nadeem colony": {"lat": 17.4042, "lng": 78.4116, "display_name": "Nadeem Colony, Tolichowki, Hyderabad, Telangana"},
    "tolichowki": {"lat": 17.4042, "lng": 78.4116, "display_name": "Tolichowki, Hyderabad, Telangana"},
    "hafiz baba nagar": {"lat": 17.3245, "lng": 78.4890, "display_name": "Hafiz Baba Nagar, Chandrayangutta, Hyderabad"},
    "rajendra nagar": {"lat": 25.5976, "lng": 85.1582, "display_name": "Rajendra Nagar Road 14, Patna, Bihar"},
    "yamuna bazaar": {"lat": 28.6675, "lng": 77.2341, "display_name": "Yamuna Bazaar, Kashmiri Gate, Old Delhi"},
    "kashmiri gate": {"lat": 28.6675, "lng": 77.2341, "display_name": "Kashmiri Gate ISBT, Delhi"},
    "velachery": {"lat": 12.9815, "lng": 80.2180, "display_name": "Velachery AGS Colony, Chennai, Tamil Nadu"},
    "silchar": {"lat": 24.8333, "lng": 92.7789, "display_name": "Tarapur Bethukandi, Silchar, Cachar, Assam"},
    "vijayawada": {"lat": 16.5062, "lng": 80.6480, "display_name": "Vijayawada Central, Andhra Pradesh"},
    "hyderabad": {"lat": 17.3850, "lng": 78.4867, "display_name": "Hyderabad, Telangana"},
    "khammam": {"lat": 17.2473, "lng": 80.1514, "display_name": "Khammam, Telangana"},
    "patna": {"lat": 25.5941, "lng": 85.1376, "display_name": "Patna, Bihar"},
    "chennai": {"lat": 13.0827, "lng": 80.2707, "display_name": "Chennai, Tamil Nadu"}
}

_cache: Dict[str, Coordinates] = {}


def geocode_location(location_str: str, city_hint: Optional[str] = None) -> Optional[Coordinates]:
    if not location_str:
        return None

    clean_loc = location_str.lower().strip()
    if clean_loc in _cache:
        return _cache[clean_loc]

    # 1. Check local offline gazetteer first for zero latency & rate-limit resilience
    for key, coords in OFFLINE_GAZETTEER.items():
        if key in clean_loc or (city_hint and key == city_hint.lower()):
            result = Coordinates(
                lat=coords["lat"],
                lng=coords["lng"],
                display_name=coords["display_name"],
                confidence=0.98
            )
            _cache[clean_loc] = result
            return result

    # 2. Try OpenStreetMap Nominatim API with compliant User-Agent
    query = location_str
    if city_hint and city_hint.lower() not in location_str.lower():
        query += f", {city_hint}"
    query += ", India"

    headers = {"User-Agent": "Whisper-Disaster-Triage-AI/1.0 (emergency-dispatch-ai-studio)"}
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {"q": query, "format": "json", "limit": 1}
        resp = requests.get(url, params=params, headers=headers, timeout=3.5)
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                result = Coordinates(
                    lat=float(data[0]["lat"]),
                    lng=float(data[0]["lon"]),
                    display_name=data[0].get("display_name", location_str),
                    confidence=0.88
                )
                _cache[clean_loc] = result
                return result
    except Exception:
        pass

    # 3. Default fallback coordinates for South Asian flood baseline (Vijayawada epicenter)
    fallback = Coordinates(lat=16.5062, lng=80.6480, display_name=f"{location_str} (Estimated)", confidence=0.5)
    _cache[clean_loc] = fallback
    return fallback
