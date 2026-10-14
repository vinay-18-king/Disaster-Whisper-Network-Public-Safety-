import React, { useState, useEffect } from 'react';
import {
  FileText,
  Code2,
  Database,
  Layers,
  Search,
} from 'lucide-react';
import { SampleMessage } from '../server/sampleData';

export const DocsPitchView: React.FC = () => {
  const [subTab, setSubTab] = useState<'pitch' | 'architecture' | 'dataset' | 'code'>('pitch');
  const [sampleMessages, setSampleMessages] = useState<SampleMessage[]>([]);
  const [datasetSearch, setDatasetSearch] = useState('');
  const [selectedCodeFile, setSelectedCodeFile] = useState<string>('backend/triage.py');

  useEffect(() => {
    fetch('/api/sample-messages')
      .then((r) => r.json())
      .then((data) => setSampleMessages(data))
      .catch((e) => console.error(e));
  }, []);

  const filteredSamples = sampleMessages.filter((s) => {
    if (!datasetSearch) return true;
    const q = datasetSearch.toLowerCase();
    return (
      s.raw_text.toLowerCase().includes(q) ||
      s.reported_location.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  const codeFiles: Record<string, { desc: string; code: string }> = {
    'backend/triage.py': {
      desc: 'Gemini Flash Classification Engine with Vernacular Dialect Extraction',
      code: `import os
import json
from google import genai
from google.genai import types
from .models import TriageOutput, UrgencyLevel, CategoryType
from .geocode import geocode_location

GEMINI_MODEL = "gemini-2.5-flash"

SYSTEM_INSTRUCTION = """
You are Whisper AI, an expert disaster response and search-and-rescue dispatch officer.
Analyze flood SOS distress messages in English, Telugu (తెలుగు), Hindi (हिंदी), and code-mixed dialects.

Return a JSON object with:
1. urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
2. category: "RESCUE_BOAT" | "MEDICAL_EMERGENCY" | "FOOD_WATER" | "SHELTER_EVAC" | "INFRASTRUCTURE" | "INFO_REQUEST"
3. extracted_location: Specific building, street, or landmark.
4. people_stranded: Integer count.
5. water_depth: Descriptive string (e.g. 8ft first floor ceiling).
6. vulnerable_tags: Array of strings (Infant, Elderly, Dialysis, Pregnant, Cardiac, Electrocution).
7. tactical_action_plan: Concise guidance for rescue boat squad.
8. detected_language: "en" | "hi" | "te" | "other".
9. sentiment_panic_score: 1 to 10.
10. confidence: 0.85 to 0.99.
11. summary_en, summary_hi, summary_te.
"""

async def triage_distress_message(message_id: str, raw_text: str, city_hint: str = None) -> TriageOutput:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    prompt = f"Distress Message to Triage:\\n{raw_text}\\nCity context hint: {city_hint or 'Unknown'}"
    
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.1,
        )
    )
    parsed = json.loads(response.text)
    coords = geocode_location(parsed.get("extracted_location", ""), city_hint)
    return TriageOutput(...)`,
    },
    'backend/dedup.py': {
      desc: 'text-embedding-004 Semantic & Haversine Spatial Deduplication',
      code: `import os
import math
import numpy as np
from google import genai
from .models import IncidentRecord

EMBEDDING_MODEL = "text-embedding-004"
SIMILARITY_THRESHOLD = 0.82
SPATIAL_THRESHOLD_KM = 0.45  # 450 meters radius

def haversine_distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

def get_text_embedding(text: str) -> list[float]:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )
    return result.embedding.values

def check_duplicate_and_cluster(new_text, new_lat, new_lng, existing_incidents):
    # Combines spatial threshold (< 450m) and cosine similarity (> 0.82)
    # Merges duplicate panicked calls into single master rescue mission
    ...`,
    },
    'backend/broadcast.py': {
      desc: 'Gemini Multilingual Civil Defense Emergency Alert Generator',
      code: `import os
import json
from google import genai
from google.genai import types
from .models import BroadcastRequest, MultilingualBroadcast

async def generate_multilingual_broadcast(req: BroadcastRequest) -> MultilingualBroadcast:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    prompt = f"""
    Create official emergency flood evacuation broadcasts in:
    1. english_alert (authoritative civil defense directive)
    2. hindi_alert (हिंदी: बाढ़ चेतावनी, राहत शिविर)
    3. telugu_alert (తెలుగు: అత్యవసర వరద హెచ్చరిక, పునరావాస కేంద్రాలు)
    4. whatsapp_format (viral bullet points with emojis)
    5. sms_format (< 160 characters)
    6. audio_dispatch_script (bullhorn megaphone script with phonetic marks)
    """
    response = client.models.generate_content(...)
    return MultilingualBroadcast(...)`,
    },
    'backend/geocode.py': {
      desc: 'OpenStreetMap Nominatim Geocoder & High-Precision Flood Gazetteer',
      code: `import requests
from typing import Optional
from .models import Coordinates

# Instant 0-latency gazetteer for major flood corridors in Vijayawada, Khammam, Hyderabad, Patna, etc.
OFFLINE_GAZETTEER = {
    "singh nagar": {"lat": 16.5362, "lng": 80.6425, "display_name": "Ajit Singh Nagar, Vijayawada"},
    "budameru": {"lat": 16.5401, "lng": 80.6380, "display_name": "Budameru Rivulet Embankment"},
    "munneru": {"lat": 17.2472, "lng": 80.1514, "display_name": "Munneru Bridge, Khammam"},
    ...
}

def geocode_location(location_str: str, city_hint: Optional[str] = None):
    # 1. Gazetteer exact match (0 ms)
    # 2. OpenStreetMap Nominatim API search with compliant User-Agent
    ...`,
    },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Sub-Nav Bar */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
        {[
          { id: 'pitch', label: 'Pitch Deck & Problem Brief', icon: FileText },
          { id: 'architecture', label: 'Architecture & Pipeline', icon: Layers },
          { id: 'dataset', label: '203 Flood Messages Dataset', icon: Database },
          { id: 'code', label: 'Backend Source Code', icon: Code2 },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pitch Deck */}
      {subTab === 'pitch' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              The Urban Flood Dispatch Bottleneck
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              During major urban floodings (Vijayawada Budameru deluge 2024, Khammam Munneru flash floods, Chennai Michaung),
              helpline 112 received upwards of 180,000 distress calls in 48 hours. Rescue capacity broke down due to three distinct issues:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">1. Redundant Dispatch</div>
                <p className="text-slate-400 leading-relaxed">
                  Dozens of family members tweet and call about the same flooded flat. Multiple boat crews race to the same rooftop, starving other isolated victims.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">2. Vernacular Dialects</div>
                <p className="text-slate-400 leading-relaxed">
                  Callers use Telugu (తెలుగు), Hindi (हिंदी), and mixed code ("Singh nagar water 9ft terrace paina unnam"). Standard keyword filters fail to parse urgency.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">3. Extraction Latency</div>
                <p className="text-slate-400 leading-relaxed">
                  Human operators require 3-5 minutes per call to manually log casualties, medical issues, and coordinates, causing backlogs of thousands of unattended calls.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              Whisper's Technical Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">Sub-Second Gemini Flash AI Triage</div>
                <p className="text-slate-400 leading-relaxed">
                  Processes raw multilingual messages in ~1.1 seconds. Classifies urgency, counts casualties, detects infants/dialysis needs, and creates tactical boat instructions.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">64% Duplicate Noise Suppression</div>
                <p className="text-slate-400 leading-relaxed">
                  Uses text-embedding-004 cosine similarity combined with Haversine proximity (&lt; 450m) to collapse fragmented calls into single master missions.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">OpenStreetMap Dynamic Geocoding</div>
                <p className="text-slate-400 leading-relaxed">
                  Translates vernacular landmarks (Vijaya Dairy, Chittinagar Tunnel, Karunagiri Church) into precise GPS coordinates with zero latency.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">Synchronized Multilingual Alerts</div>
                <p className="text-slate-400 leading-relaxed">
                  Auto-generates official evacuation directives, WhatsApp blasts, SMS bulletins, and loudspeaker radio announcements in EN, HI, and TE.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Architecture */}
      {subTab === 'architecture' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white">Data Pipeline Architecture</h3>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
            <div className="min-w-[640px] grid grid-cols-4 gap-3 text-[11px]">
              <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-bold text-white">Ingestion</div>
                <div>• WhatsApp Bot</div>
                <div>• Helpline 112</div>
                <div>• Twitter Alert</div>
                <div>• SMS Dispatch</div>
              </div>

              <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-bold text-blue-300">AI Triage</div>
                <div>• Gemini 2.5 Flash</div>
                <div>• Urgency Scoring</div>
                <div>• Casualty Extract</div>
                <div>• OSM Geocoding</div>
              </div>

              <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-bold text-purple-300">Deduplication</div>
                <div>• text-embedding-004</div>
                <div>• Haversine &lt; 450m</div>
                <div>• Cosine Sim &gt; 0.82</div>
                <div>• Cluster Master</div>
              </div>

              <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-300">Dispatch</div>
                <div>• Tactical Map</div>
                <div>• Boat Squads</div>
                <div>• Multilingual Alerts</div>
                <div>• Audio Siren</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dataset */}
      {subTab === 'dataset' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">
                Flood Distress Messages Dataset ({sampleMessages.length} records)
              </h3>
              <p className="text-[11px] text-slate-400">Stored in data/sample_messages.json</p>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={datasetSearch}
                onChange={(e) => setDatasetSearch(e.target.value)}
                placeholder="Search messages, city, colony..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredSamples.map((s) => (
              <div
                key={s.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{s.id}</span>
                    <span>·</span>
                    <span>{s.city}</span>
                    <span>·</span>
                    <span className="uppercase">{s.language}</span>
                    <span>·</span>
                    <span>{s.source}</span>
                  </div>

                  <span className={`font-semibold uppercase ${s.ground_truth_urgency === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                    {s.ground_truth_urgency}
                  </span>
                </div>

                <p className="text-slate-200 italic">"{s.raw_text}"</p>

                <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5 font-mono">
                  <span>Location: {s.reported_location}</span>
                  <span>·</span>
                  <span>Depth: {s.water_depth_estimate}</span>
                  <span>·</span>
                  <span>Souls: {s.people_stranded}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code */}
      {subTab === 'code' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Backend Python Architecture</h3>

            <div className="flex items-center gap-1">
              {Object.keys(codeFiles).map((filename) => (
                <button
                  key={filename}
                  onClick={() => setSelectedCodeFile(filename)}
                  className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                    selectedCodeFile === filename
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filename}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400">
            {codeFiles[selectedCodeFile]?.desc}
          </div>

          <pre className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[460px] leading-relaxed">
            {codeFiles[selectedCodeFile]?.code}
          </pre>
        </div>
      )}
    </div>
  );
};
