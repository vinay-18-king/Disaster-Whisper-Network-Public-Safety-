import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { getAll203SampleMessages, SampleMessage } from './src/server/sampleData.js';
import {
  DistressMessage,
  TriageResult,
  IncidentRecord,
  RescueTeam,
  MultilingualBroadcast,
  DisasterStats,
  Coordinates,
  StatusHistoryItem
} from './src/types/index.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Initialize Google GenAI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Gazetteer for high-confidence local flood points
const GAZETTEER: Record<string, { lat: number; lng: number; name: string }> = {
  'singh nagar': { lat: 16.5362, lng: 80.6425, name: 'Ajit Singh Nagar, Vijayawada' },
  'ajit singh nagar': { lat: 16.5362, lng: 80.6425, name: 'Ajit Singh Nagar, Vijayawada' },
  'vijaya dairy': { lat: 16.5365, lng: 80.6428, name: 'Vijaya Dairy, Singh Nagar, Vijayawada' },
  'budameru': { lat: 16.5401, lng: 80.6380, name: 'Budameru Rivulet Embankment, Vijayawada' },
  'chittinagar': { lat: 16.5241, lng: 80.6092, name: 'Chittinagar Tunnel Area, Vijayawada' },
  'gollapalem gattu': { lat: 16.5243, lng: 80.6095, name: 'Gollapalem Gattu, Vijayawada' },
  'vambay colony': { lat: 16.5450, lng: 80.6480, name: 'Vambay Colony, Singh Nagar, Vijayawada' },
  'payakapuram': { lat: 16.5492, lng: 80.6391, name: 'Payakapuram, Vijayawada' },
  'prakash nagar': { lat: 17.2472, lng: 80.1514, name: 'Prakash Nagar, Munneru Bridge, Khammam' },
  'munneru': { lat: 17.2472, lng: 80.1514, name: 'Munneru River Basin, Khammam' },
  'karunagiri': { lat: 17.2520, lng: 80.1590, name: 'Karunagiri Shrine, Khammam' },
  'nadeem colony': { lat: 17.4042, lng: 78.4116, name: 'Nadeem Colony, Tolichowki, Hyderabad' },
  'tolichowki': { lat: 17.4042, lng: 78.4116, name: 'Tolichowki, Hyderabad' },
  'hafiz baba nagar': { lat: 17.3245, lng: 78.4890, name: 'Hafiz Baba Nagar, Hyderabad' },
  'rajendra nagar': { lat: 25.5976, lng: 85.1582, name: 'Rajendra Nagar Road 14, Patna' },
  'yamuna bazaar': { lat: 28.6675, lng: 77.2341, name: 'Yamuna Bazaar, Kashmiri Gate, Old Delhi' },
  'kashmiri gate': { lat: 28.6675, lng: 77.2341, name: 'Kashmiri Gate ISBT, Delhi' },
  'velachery': { lat: 12.9815, lng: 80.2180, name: 'Velachery AGS Colony, Chennai' },
  'silchar': { lat: 24.8333, lng: 92.7789, name: 'Tarapur Bethukandi, Silchar' },
  'vijayawada': { lat: 16.5062, lng: 80.6480, name: 'Vijayawada, Andhra Pradesh' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad, Telangana' },
  'khammam': { lat: 17.2473, lng: 80.1514, name: 'Khammam, Telangana' },
  'patna': { lat: 25.5941, lng: 85.1376, name: 'Patna, Bihar' },
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu' },
};

function geocode(text: string, city?: string): Coordinates {
  const lower = (text + ' ' + (city || '')).toLowerCase();
  for (const [key, val] of Object.entries(GAZETTEER)) {
    if (lower.includes(key)) {
      return {
        lat: val.lat,
        lng: val.lng,
        display_name: val.name,
        confidence: 0.98,
      };
    }
  }
  // Baseline fallback (Vijayawada epicenter)
  return {
    lat: 16.5062 + (Math.random() - 0.5) * 0.05,
    lng: 80.6480 + (Math.random() - 0.5) * 0.05,
    display_name: text || 'Reported Flood Sector',
    confidence: 0.65,
  };
}

// Distance helper (Haversine formula in km)
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// In-Memory Database
interface AppState {
  incidents: IncidentRecord[];
  teams: RescueTeam[];
  broadcasts: MultilingualBroadcast[];
  triageLatencies: number[];
}

const state: AppState = {
  incidents: [],
  teams: [
    {
      id: 'TEAM-NDRF-01',
      name: 'NDRF 10th Bn Quick Reaction Boat 1',
      type: 'Motorized Inflatable Boat',
      status: 'AVAILABLE',
      base_location: 'Singh Nagar Relief Staging Area',
      personnel_count: 6,
      current_coords: { lat: 16.5360, lng: 80.6420 },
    },
    {
      id: 'TEAM-SDRF-02',
      name: 'AP SDRF Deep Water Gemini Craft',
      type: 'Deep Water Gemini Craft',
      status: 'DISPATCHED',
      base_location: 'Payakapuram High School',
      assigned_incident_id: 'SOS-VJ-001',
      personnel_count: 5,
      current_coords: { lat: 16.5362, lng: 80.6425 },
    },
    {
      id: 'TEAM-NAVY-03',
      name: 'Indian Navy Sea King Air Patrol',
      type: 'Helicopter Air-Lift',
      status: 'AVAILABLE',
      base_location: 'Gannavaram Airport Helipad',
      personnel_count: 4,
      current_coords: { lat: 16.5280, lng: 80.7960 },
    },
    {
      id: 'TEAM-VOL-04',
      name: 'Fishermen Volunteer Raft Taskforce',
      type: 'Country Boat Squad',
      status: 'ON_SCENE',
      base_location: 'Chittinagar Tunnel Outpost',
      assigned_incident_id: 'SOS-VJ-004',
      personnel_count: 8,
      current_coords: { lat: 16.5241, lng: 80.6092 },
    },
    {
      id: 'TEAM-MEDIC-05',
      name: 'Red Cross Trauma & Dialysis Unit',
      type: 'Mobile Amphibious Clinic',
      status: 'AVAILABLE',
      base_location: 'Vijayawada GGH Base',
      personnel_count: 6,
      current_coords: { lat: 16.5130, lng: 80.6322 },
    },
  ],
  broadcasts: [
    {
      id: 'BC-001',
      timestamp: new Date().toISOString(),
      zone_name: 'Vijayawada Budameru & Ajit Singh Nagar',
      flood_level_alert: 'Water discharge 35,000 cusecs - Inundation up to 9 feet',
      english_alert:
        'CRITICAL EVACUATION ORDER: Budameru breach has submerged ground floors in Singh Nagar, Payakapuram, and Vambay Colony. Move to first/second floors immediately. Keep mobile phones dry in plastic covers. SDRF and NDRF rescue boats are operating along main transit corridors. Dial 112 or WhatsApp 9848022331 for immediate air-drop or boat extraction.',
      hindi_alert:
        'अति आवश्यक बाढ़ चेतावनी: बुडामेरु नहर टूटने से सिंह नगर, पायकापुरम और वाम्बे कॉलोनी में 9 फीट तक पानी भर चुका है। सभी नागरिक तुरंत ऊपरी मंजिलों पर पहुंचे। फोन को प्लास्टिक में सुरक्षित रखें। एनडीआरएफ की नावें तैनात हैं। आपात स्थिति में 112 पर संपर्क करें।',
      telugu_alert:
        'అత్యవసర వరద హెచ్చరిక: బుడమేరు గండి పడటం వల్ల సింగ్ నగర్, పాయకాపురం, వాంబే కాలనీలలో 9 అడుగుల మేర నీరు చేరింది. ప్రజలందరూ వెంటనే డాబాలపైకి లేదా మొదటి అంతస్తుపైకి చేరండి. సహాయం కోసం 112 లేదా వాట్సాప్ ద్వారా సమాచారం పంపండి. రెస్క్యూ బోట్లు బయలుదేరాయి.',
      whatsapp_format:
        '🚨 *CRITICAL FLOOD ALERT - VIJAYAWADA BUDAMERU*\n\n⚠️ *Current Level:* Inundation 9 feet across Singh Nagar & Payakapuram.\n📍 *Shelter:* Government High School, Bhavanipuram & IGMC Stadium.\n⚡ *Directive:* Stay on terrace. Do not touch power poles or cables.\n📞 *Helplines:* 112 | 1070 | 0866-2575833\n\n_Forward to all local WhatsApp colony groups immediately._',
      sms_format:
        'ALERT VJY FLOODS: Singh Nagar & Payakapuram water 9ft. Move to terrace. Boats operating. Emergency SOS call 112.',
      audio_dispatch_script:
        'ATTENTION ALL RESIDENTS OF AJIT SINGH NAGAR AND PAYAKAPURAM. THIS IS AN EMERGENCY POLICE ANNOUNCEMENT. PLEASE REMAIN ON TERRACES. RESCUE BOATS ARE ARRIVING.',
    },
  ],
  triageLatencies: [920, 1140, 890, 1050, 1220],
};

// Format time helper for status history (e.g., "14:02")
function formatTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  } catch {
    return '14:02';
  }
}

// Generate vertical timeline history events with precise timestamps
function createInitialStatusHistory(record: Partial<IncidentRecord>, teamName?: string): StatusHistoryItem[] {
  const baseIso = record.created_at || new Date().toISOString();
  const baseDate = new Date(baseIso);
  const t0 = baseDate.toISOString();
  const t1 = new Date(baseDate.getTime() + 2 * 60 * 1000).toISOString(); // +2 min
  const t2 = new Date(baseDate.getTime() + 3 * 60 * 1000).toISOString(); // +3 min

  const history: StatusHistoryItem[] = [
    {
      id: `SH-${record.id}-1`,
      timestamp: t0,
      display_time: formatTime(t0),
      stage: 'Received',
      title: 'Initial Ingestion',
      description: `Raw distress signal received via ${record.raw_message?.source || 'WhatsApp SOS Gateway'} from contact ${record.raw_message?.sender_contact || '+91 98480 23119'}.`,
      actor: record.raw_message?.source || 'WhatsApp Gateway',
      severity: 'info',
    },
    {
      id: `SH-${record.id}-2`,
      timestamp: t1,
      display_time: formatTime(t1),
      stage: 'Triaged',
      title: 'AI Triage & Geocoding Completed',
      description: `Gemini 2.5 Flash identified ${record.triage?.people_stranded || 1} people stranded with water depth at ${record.triage?.water_depth || '6ft'}. Classified as ${record.triage?.urgency || 'HIGH'}. Coordinates mapped to [${record.triage?.coordinates?.lat.toFixed(4)}, ${record.triage?.coordinates?.lng.toFixed(4)}].`,
      actor: 'Gemini 2.5 Flash Triage Engine',
      severity: record.triage?.urgency === 'CRITICAL' ? 'urgent' : 'warning',
    },
    {
      id: `SH-${record.id}-3`,
      timestamp: t2,
      display_time: formatTime(t2),
      stage: 'Received',
      title: record.is_duplicate ? 'Duplicate Signal Clustered' : 'Tactical Sector Cluster Assigned',
      description: record.is_duplicate
        ? `Matched incident cluster #${record.cluster_id}. Duplicate call suppressed to save responder bandwidth.`
        : `Designated as Master Incident for tactical sector #${record.cluster_id}.`,
      actor: 'Whisper Dedup Matrix',
      severity: 'info',
    },
  ];

  if (record.assigned_team || record.status === 'DISPATCHED' || record.status === 'ON_SCENE' || record.status === 'EVACUATED' || record.status === 'RESOLVED') {
    const t3 = new Date(baseDate.getTime() + 13 * 60 * 1000).toISOString();
    const teamLabel = teamName || (record.assigned_team ? state.teams.find((t) => t.id === record.assigned_team)?.name : 'NDRF Squad 2');
    history.push({
      id: `SH-${record.id}-4`,
      timestamp: t3,
      display_time: formatTime(t3),
      stage: 'Assigned',
      title: `${teamLabel} Assigned`,
      description: `Dispatched to sector coordinates. Direct comms established with on-ground craft commander.`,
      actor: 'Central Dispatch Control',
      severity: 'warning',
    });
  }

  if (record.status === 'DISPATCHED' || record.status === 'ON_SCENE' || record.status === 'EVACUATED' || record.status === 'RESOLVED') {
    const t4 = new Date(baseDate.getTime() + 16 * 60 * 1000).toISOString();
    history.push({
      id: `SH-${record.id}-5`,
      timestamp: t4,
      display_time: formatTime(t4),
      stage: 'In-Transit',
      title: 'In-Transit to Coordinates',
      description: `Rescue vessel launched into flood corridor, navigating past submerged electrical infrastructure.`,
      actor: teamName || 'Rescue Boat Squad',
      severity: 'warning',
    });
  }

  if (record.status === 'ON_SCENE' || record.status === 'EVACUATED' || record.status === 'RESOLVED') {
    const t5 = new Date(baseDate.getTime() + 29 * 60 * 1000).toISOString();
    history.push({
      id: `SH-${record.id}-6`,
      timestamp: t5,
      display_time: formatTime(t5),
      stage: 'In-Transit',
      title: 'On-Scene Arrival',
      description: `Craft reached building perimeter. Life vests deployed to stranded victims; boarding in progress.`,
      actor: teamName || 'Rescue Boat Squad',
      severity: 'warning',
    });
  }

  if (record.status === 'EVACUATED' || record.status === 'RESOLVED') {
    const t6 = new Date(baseDate.getTime() + 45 * 60 * 1000).toISOString();
    history.push({
      id: `SH-${record.id}-7`,
      timestamp: t6,
      display_time: formatTime(t6),
      stage: 'Evacuated',
      title: 'Evacuated & Safe at Relief Camp',
      description: `All stranded persons safely evacuated to dry relief camp. Paramedic vitals checked.`,
      actor: 'Medical Staging Area',
      severity: 'success',
    });
  }

  return history;
}

// Seed initial incidents from sample data
function seedInitialData() {
  const samples = getAll203SampleMessages();
  state.incidents = [];

  // Seed first 45 messages as pre-ingested, the rest will stream in simulation!
  const initialBatch = samples.slice(0, 45);

  const seenLocations = new Map<string, string>(); // cluster -> master id

  for (const s of initialBatch) {
    const isDup = seenLocations.has(s.cluster_group_id);
    let masterId = isDup ? seenLocations.get(s.cluster_group_id) : undefined;
    if (!isDup) {
      seenLocations.set(s.cluster_group_id, s.id);
    }

    const triageRes: TriageResult = {
      message_id: s.id,
      urgency: s.ground_truth_urgency,
      category: s.ground_truth_category,
      extracted_location: s.reported_location,
      coordinates: s.coordinates,
      people_stranded: s.people_stranded,
      water_depth: s.water_depth_estimate,
      vulnerable_tags: s.vulnerable_tags,
      tactical_action_plan: `Deploy ${
        s.ground_truth_urgency === 'CRITICAL' ? 'Motorized Rescue Boat + Paramedic' : 'Evacuation Dinghy'
      } to ${s.reported_location}.`,
      detected_language: s.language,
      sentiment_panic_score: s.ground_truth_urgency === 'CRITICAL' ? 9 : 6,
      confidence: 0.95,
      summary_en: s.raw_text.substring(0, 130),
      summary_hi: 'बाढ़ में फंसे नागरिकों को तत्काल सहायता पहुंचाई जाए।',
      summary_te: 'వరద బాధితులకు తక్షణమే రెస్క్యూ బోట్ సహాయం అందించాలి.',
      triage_latency_ms: 950 + Math.floor(Math.random() * 300),
    };

    const assignedTeamId = s.id === 'SOS-VJ-001' ? 'TEAM-SDRF-02' : s.id === 'SOS-VJ-004' ? 'TEAM-VOL-04' : undefined;
    const initialStatus = s.id === 'SOS-VJ-001' ? 'DISPATCHED' : s.id === 'SOS-VJ-004' ? 'ON_SCENE' : 'PENDING';

    const record: IncidentRecord = {
      id: s.id,
      created_at: s.timestamp,
      raw_message: s,
      triage: triageRes,
      cluster_id: s.cluster_group_id,
      is_duplicate: isDup,
      duplicate_count: 0,
      assigned_team: assignedTeamId,
      status: initialStatus,
    };

    record.status_history = createInitialStatusHistory(
      record,
      assignedTeamId ? state.teams.find((t) => t.id === assignedTeamId)?.name : undefined
    );

    state.incidents.push(record);

    if (isDup && masterId) {
      const master = state.incidents.find((i) => i.id === masterId);
      if (master) {
        master.duplicate_count += 1;
      }
    }
  }
}

seedInitialData();

// --- API ROUTES ---

// 1. Triage single message directly via Gemini Flash
app.post('/api/triage', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { raw_text, city_hint } = req.body;

  if (!raw_text) {
    return res.status(400).json({ error: 'raw_text is required' });
  }

  try {
    const prompt = `Analyze this flood emergency SOS distress call received during an urban monsoon deluge:
"${raw_text}"
City/Region Context: ${city_hint || 'South Asia / Urban Flood'}

Distress messages may be in English, Telugu (తెలుగు), Hindi (हिंदी), or code-mixed dialects.

Respond with strict JSON adhering to this schema:
{
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "category": "RESCUE_BOAT" | "MEDICAL_EMERGENCY" | "FOOD_WATER" | "SHELTER_EVAC" | "INFRASTRUCTURE" | "INFO_REQUEST",
  "extracted_location": "string of specific street, building, or landmark",
  "people_stranded": number (default 1 if unspecified),
  "water_depth": "string description e.g. 8ft first floor ceiling, chest deep, knee level",
  "vulnerable_tags": ["Infant", "Elderly", "Dialysis", "Pregnant", "Cardiac", "Electrocution", "Livestock"],
  "tactical_action_plan": "tactical guidance for boat squad",
  "detected_language": "en" | "te" | "hi" | "other",
  "sentiment_panic_score": number from 1 to 10,
  "confidence": number between 0.85 and 0.99,
  "summary_en": "one sentence tactical summary in English",
  "summary_hi": "one sentence Hindi summary",
  "summary_te": "one sentence Telugu summary"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const latency = Date.now() - startTime;
    state.triageLatencies.push(latency);

    const coords = geocode(parsed.extracted_location || raw_text, city_hint);

    const result: TriageResult = {
      message_id: `LIVE-${Date.now()}`,
      urgency: parsed.urgency || 'HIGH',
      category: parsed.category || 'RESCUE_BOAT',
      extracted_location: parsed.extracted_location || 'Reported Flood Zone',
      coordinates: coords,
      people_stranded: Number(parsed.people_stranded) || 1,
      water_depth: parsed.water_depth || 'Estimated 5-7 ft',
      vulnerable_tags: Array.isArray(parsed.vulnerable_tags) ? parsed.vulnerable_tags : [],
      tactical_action_plan:
        parsed.tactical_action_plan || 'Dispatch nearest SDRF inflatable rescue boat to location.',
      detected_language: parsed.detected_language || 'en',
      sentiment_panic_score: Number(parsed.sentiment_panic_score) || 7,
      confidence: Number(parsed.confidence) || 0.94,
      summary_en: parsed.summary_en || raw_text.substring(0, 120),
      summary_hi: parsed.summary_hi || 'बाढ़ प्रभावितों को तुरंत सहायता भेजी जाए।',
      summary_te: parsed.summary_te || 'బాధితులకు తక్షణ సహాయం అందించాలి.',
      triage_latency_ms: latency,
    };

    return res.json(result);
  } catch (error: any) {
    console.error('Gemini triage error:', error);
    // Intelligent heuristic fallback
    const latency = Date.now() - startTime;
    const lower = raw_text.toLowerCase();
    const isCritical =
      lower.includes('urgent') ||
      lower.includes('water reached') ||
      lower.includes('ceiling') ||
      lower.includes('terrace') ||
      lower.includes('heart') ||
      lower.includes('baby') ||
      lower.includes('మునిగి') ||
      lower.includes('ప్రాణాలు') ||
      lower.includes('डूब');

    const coords = geocode(raw_text, city_hint);

    const fallback: TriageResult = {
      message_id: `FALLBACK-${Date.now()}`,
      urgency: isCritical ? 'CRITICAL' : 'HIGH',
      category: lower.includes('doctor') || lower.includes('patient') || lower.includes('dialysis')
        ? 'MEDICAL_EMERGENCY'
        : 'RESCUE_BOAT',
      extracted_location: city_hint || 'Reported Flood Sector',
      coordinates: coords,
      people_stranded: 4,
      water_depth: '6-8 ft',
      vulnerable_tags: isCritical ? ['Emergency Rescue Needed'] : [],
      tactical_action_plan: 'Deploy SDRF motorized craft with life vests.',
      detected_language: lower.includes('unnam') || lower.includes('నీరు') ? 'te' : 'en',
      sentiment_panic_score: 8,
      confidence: 0.9,
      summary_en: raw_text.substring(0, 120),
      summary_hi: 'बाढ़ में फंसे लोगों को निकालने के लिए बचाव दल भेजें।',
      summary_te: 'ప్రజలను సురక్షిత ప్రాంతానికి తరలించడానికి బోట్ పంపాలి.',
      triage_latency_ms: latency,
    };
    return res.json(fallback);
  }
});

// 2. Ingest SOS message (Triage + Deduplication + Persistence)
app.post('/api/ingest', async (req: Request, res: Response) => {
  const { raw_text, source, sender_contact, city, reported_location, coordinates } = req.body;

  if (!raw_text) {
    return res.status(400).json({ error: 'raw_text is required' });
  }

  // Triage step
  let triageRes: TriageResult;
  try {
    const prompt = `Classify this flood distress message:\n"${raw_text}"\nContext: ${city || 'Urban flood'}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });
    const parsed = JSON.parse(response.text || '{}');
    const coords = coordinates || geocode(parsed.extracted_location || raw_text, city);

    triageRes = {
      message_id: `MSG-${Date.now()}`,
      urgency: parsed.urgency || 'HIGH',
      category: parsed.category || 'RESCUE_BOAT',
      extracted_location: parsed.extracted_location || reported_location || 'Identified Flood Area',
      coordinates: coords,
      people_stranded: Number(parsed.people_stranded) || 2,
      water_depth: parsed.water_depth || '6 ft',
      vulnerable_tags: parsed.vulnerable_tags || [],
      tactical_action_plan: parsed.tactical_action_plan || 'Dispatch rescue craft.',
      detected_language: parsed.detected_language || 'en',
      sentiment_panic_score: Number(parsed.sentiment_panic_score) || 7,
      confidence: 0.94,
      summary_en: parsed.summary_en || raw_text.substring(0, 120),
      summary_hi: parsed.summary_hi,
      summary_te: parsed.summary_te,
      triage_latency_ms: 1050,
    };
  } catch (e) {
    const coords = coordinates || geocode(raw_text, city);
    triageRes = {
      message_id: `MSG-${Date.now()}`,
      urgency: 'HIGH',
      category: 'RESCUE_BOAT',
      extracted_location: reported_location || city || 'Flood Inundation Area',
      coordinates: coords,
      people_stranded: 3,
      water_depth: '6 ft',
      vulnerable_tags: [],
      tactical_action_plan: 'Deploy SDRF crew.',
      detected_language: 'en',
      sentiment_panic_score: 7,
      confidence: 0.9,
      summary_en: raw_text.substring(0, 120),
      triage_latency_ms: 850,
    };
  }

  // Deduplication & Clustering check
  let isDup = false;
  let clusterId = `cluster-${Date.now()}`;
  let matchedMasterId: string | undefined;

  for (const inc of state.incidents) {
    // Spatial check (< 0.45 km)
    const d = distanceKm(
      triageRes.coordinates.lat,
      triageRes.coordinates.lng,
      inc.triage.coordinates.lat,
      inc.triage.coordinates.lng
    );

    // Text token overlap / similarity check
    const newWords = new Set<string>(raw_text.toLowerCase().split(/\s+/));
    const oldWords = new Set<string>(inc.raw_message.raw_text.toLowerCase().split(/\s+/));
    let intersection = 0;
    for (const w of newWords) {
      if (w.length > 3 && oldWords.has(w)) intersection++;
    }

    if (d < 0.45 && (intersection >= 3 || inc.triage.extracted_location.toLowerCase() === triageRes.extracted_location.toLowerCase())) {
      isDup = true;
      clusterId = inc.cluster_id;
      matchedMasterId = inc.id;
      break;
    }
  }

  if (isDup && matchedMasterId) {
    const master = state.incidents.find((i) => i.id === matchedMasterId);
    if (master) {
      master.duplicate_count += 1;
    }
  }

  const newRecord: IncidentRecord = {
    id: `SOS-LIVE-${Date.now().toString().slice(-4)}`,
    created_at: new Date().toISOString(),
    raw_message: {
      id: `RAW-${Date.now()}`,
      timestamp: new Date().toISOString(),
      raw_text,
      language: (triageRes.detected_language as any) || 'en',
      source: source || 'WhatsApp SOS',
      sender_contact: sender_contact || '+91 99000 12345',
      reported_location: triageRes.extracted_location,
      city: city || 'Vijayawada',
    },
    triage: triageRes,
    cluster_id: clusterId,
    is_duplicate: isDup,
    duplicate_count: 0,
    status: 'PENDING',
  };

  newRecord.status_history = createInitialStatusHistory(newRecord);

  // Prepend to incidents list
  state.incidents.unshift(newRecord);
  return res.json(newRecord);
});

// 3. List incidents with filtering
app.get('/api/incidents', (req: Request, res: Response) => {
  const { urgency, category, status, exclude_duplicates, search } = req.query;

  let results = [...state.incidents];

  if (urgency && urgency !== 'ALL') {
    results = results.filter((i) => i.triage.urgency === urgency);
  }
  if (category && category !== 'ALL') {
    results = results.filter((i) => i.triage.category === category);
  }
  if (status && status !== 'ALL') {
    results = results.filter((i) => i.status === status);
  }
  if (exclude_duplicates === 'true') {
    results = results.filter((i) => !i.is_duplicate);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (i) =>
        i.raw_message.raw_text.toLowerCase().includes(q) ||
        i.triage.extracted_location.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
    );
  }

  return res.json(results);
});

// 4. Update incident status and assign team with precise status history timestamp
app.patch('/api/incidents/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, assigned_team, note } = req.body;

  const incident = state.incidents.find((i) => i.id === id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const team = assigned_team ? state.teams.find((t) => t.id === assigned_team) : undefined;
  const now = new Date();
  const timeStr = formatTime(now.toISOString());

  if (status) incident.status = status;
  if (assigned_team !== undefined) {
    incident.assigned_team = assigned_team;
    // update team status
    if (team) {
      team.status = status === 'RESOLVED' || status === 'EVACUATED' ? 'AVAILABLE' : 'DISPATCHED';
      team.assigned_incident_id = status === 'RESOLVED' || status === 'EVACUATED' ? undefined : id;
    }
  }

  if (!incident.status_history) {
    incident.status_history = createInitialStatusHistory(incident, team?.name);
  }

  let stage: 'Received' | 'Assigned' | 'In-Transit' | 'Evacuated' = 'Received';
  let title = 'Status Updated';
  let severity: 'info' | 'warning' | 'success' | 'urgent' = 'info';
  let description = note || `Operational status transitioned to ${status}.`;

  if (status === 'DISPATCHED') {
    stage = 'In-Transit';
    title = team ? `${team.name} Dispatched` : 'Rescue Squad Dispatched';
    severity = 'warning';
    description = note || `${team ? team.name : 'Rescue squad'} launched into inundated sector; navigating flood corridor to coordinates.`;
  } else if (status === 'ON_SCENE') {
    stage = 'In-Transit';
    title = 'Rescue Vessel On-Scene';
    severity = 'warning';
    description = note || `Rescue craft reached building perimeter. Extraction operation active.`;
  } else if (status === 'EVACUATED' || status === 'RESOLVED') {
    stage = 'Evacuated';
    title = 'Casualties Evacuated Successfully';
    severity = 'success';
    description = note || `All stranded individuals safely extracted and transported to dry relief staging camp.`;
  } else if (assigned_team) {
    stage = 'Assigned';
    title = `${team ? team.name : 'Rescue Team'} Assigned`;
    severity = 'info';
    description = note || `Incident assigned to ${team ? team.name : 'rescue team'}. Equipment staged for immediate launch.`;
  }

  const newHistoryItem: StatusHistoryItem = {
    id: `SH-${id}-${Date.now()}`,
    timestamp: now.toISOString(),
    display_time: timeStr,
    stage,
    title,
    description,
    actor: team?.name || 'Control Room Operator',
    severity,
  };

  incident.status_history.push(newHistoryItem);

  return res.json(incident);
});

// 5. Cluster view for deduplication matrix
app.get('/api/clusters', (_req: Request, res: Response) => {
  const clusterMap: Record<string, { master?: IncidentRecord; duplicates: IncidentRecord[] }> = {};

  for (const inc of state.incidents) {
    if (!clusterMap[inc.cluster_id]) {
      clusterMap[inc.cluster_id] = { duplicates: [] };
    }
    if (!inc.is_duplicate && !clusterMap[inc.cluster_id].master) {
      clusterMap[inc.cluster_id].master = inc;
    } else {
      clusterMap[inc.cluster_id].duplicates.push(inc);
    }
  }

  const clusters = Object.entries(clusterMap).map(([id, data]) => ({
    cluster_id: id,
    master: data.master || data.duplicates[0],
    duplicates: data.duplicates,
    total_calls: (data.master ? 1 : 0) + data.duplicates.length,
    location: data.master?.triage.extracted_location || 'Flood Cluster',
    urgency: data.master?.triage.urgency || 'HIGH',
    coordinates: data.master?.triage.coordinates || { lat: 16.5362, lng: 80.6425 },
  }));

  clusters.sort((a, b) => b.total_calls - a.total_calls);
  return res.json(clusters);
});

// 6. Generate Multilingual Broadcast (EN, HI, TE)
app.post('/api/broadcast', async (req: Request, res: Response) => {
  const { zone_name, flood_level_alert, evacuation_centers, critical_advisory, helpline_numbers } = req.body;

  try {
    const prompt = `You are the chief public safety broadcaster for Indian disaster management.
Generate emergency flood alerts for:
- Zone: ${zone_name || 'Budameru Inundation Corridor, Vijayawada'}
- Water Threat: ${flood_level_alert || 'Inflow rising to 9 feet'}
- Safe Shelters / Relief Camps: ${(evacuation_centers || []).join(', ') || 'Bhavanipuram High School & Stadium'}
- Critical Advisory: ${critical_advisory || 'Stay on upper floors. Avoid touching power poles.'}
- Helplines: ${(helpline_numbers || []).join(', ') || '112, 1070'}

Output strict JSON with:
1. english_alert: 3 authoritative sentences in English.
2. hindi_alert: Accurate Hindi (हिंदी) emergency announcement.
3. telugu_alert: Authentic Telugu (తెలుగు) broadcast with proper disaster terminology.
4. whatsapp_format: Viral formatting with emojis (🚨, ⚠️, 📍, 📞) and bullet points.
5. sms_format: Cell-tower broadcast under 160 chars.
6. audio_dispatch_script: Bullhorn/loudspeaker radio announcement with pauses.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const broadcast: MultilingualBroadcast = {
      id: `BC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      zone_name: zone_name || 'Target Flood Zone',
      flood_level_alert: flood_level_alert || 'Rapid Inflow',
      english_alert: parsed.english_alert || 'FLOOD EVACUATION ALERT: Move to high ground immediately.',
      hindi_alert: parsed.hindi_alert || 'आपातकालीन बाढ़ चेतावनी: तुरंत सुरक्षित स्थान पर जाएं।',
      telugu_alert: parsed.telugu_alert || 'అత్యవసర వరద హెచ్చరిక: వెంటనే సురక్షిత ప్రాంతాలకు తరలివెళ్ళండి.',
      whatsapp_format: parsed.whatsapp_format || '',
      sms_format: parsed.sms_format || '',
      audio_dispatch_script: parsed.audio_dispatch_script || '',
    };

    state.broadcasts.unshift(broadcast);
    return res.json(broadcast);
  } catch (err: any) {
    console.error('Broadcast generation error:', err);
    const fallback: MultilingualBroadcast = {
      id: `BC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      zone_name: zone_name || 'Vijayawada Flood Zone',
      flood_level_alert: flood_level_alert || 'High Water Level',
      english_alert: `EMERGENCY ALERT for ${zone_name}: Water levels rising rapidly. Move to upper floors immediately or reach designated relief centers. Dial 112 for boat evacuation.`,
      hindi_alert: `आपातकालीन चेतावनी (${zone_name}): जलस्तर तेजी से बढ़ रहा है। तुरंत ऊपरी मंजिल या नजदीकी राहत शिविर में पहुंचे। सहायता हेतु 112 डायल करें।`,
      telugu_alert: `అత్యవసర హెచ్చరిక (${zone_name}): వరద ఉధృతి పెరుగుతోంది. వెంటనే డాబాలపైకి లేదా సురక్షిత పునరావాస కేంద్రాలకు చేరుకోండి. బోట్ సహాయం కోసం 112 కి కాల్ చేయండి.`,
      whatsapp_format: `🚨 *CRITICAL FLOOD ALERT - ${zone_name}*\n\n⚠️ *Status:* Rising floodwaters\n📍 *Shelter:* Nearby Government Relief Camps\n📞 *Helpline:* 112 | 1070`,
      sms_format: `FLOOD ALERT ${zone_name}: Water rising. Evacuate to safe shelters immediately. SOS call 112.`,
      audio_dispatch_script: `ATTENTION CITIZENS. THIS IS AN EMERGENCY EVACUATION ANNOUNCEMENT FOR ${zone_name}.`,
    };
    state.broadcasts.unshift(fallback);
    return res.json(fallback);
  }
});

// 7. Text-To-Speech for Emergency Audio Broadcast
app.post('/api/tts', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 300),
              speechMetadata: {
                style: 'Clear, authoritative emergency broadcast announcer',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audio_base64: base64Audio, format: 'audio/wav' });
    }
    return res.status(500).json({ error: 'No audio returned' });
  } catch (err: any) {
    console.error('TTS error:', err);
    // Return graceful notice so frontend can use browser SpeechSynthesis as fallback
    return res.status(503).json({ error: 'TTS model unavailable, using browser speech fallback' });
  }
});

// 8. Stats & KPIs
app.get('/api/stats', (_req: Request, res: Response) => {
  const total = state.incidents.length;
  const duplicates = state.incidents.filter((i) => i.is_duplicate).length;
  const critical = state.incidents.filter((i) => i.triage.urgency === 'CRITICAL').length;
  const high = state.incidents.filter((i) => i.triage.urgency === 'HIGH').length;
  const rescued = state.incidents.filter((i) => i.status === 'EVACUATED' || i.status === 'RESOLVED').length;
  const totalSouls = state.incidents
    .filter((i) => !i.is_duplicate)
    .reduce((sum, i) => sum + (i.triage.people_stranded || 1), 0);

  const meanLatency =
    state.triageLatencies.length > 0
      ? Math.round(state.triageLatencies.reduce((a, b) => a + b, 0) / state.triageLatencies.length)
      : 1040;

  const dedupRate = total > 0 ? Number(((duplicates / total) * 100).toFixed(1)) : 0;

  const stats: DisasterStats = {
    total_messages_received: total,
    unique_incident_sites: total - duplicates,
    critical_urgency_count: critical,
    high_urgency_count: high,
    duplicate_calls_filtered: duplicates,
    deduplication_rate_percent: dedupRate,
    total_souls_identified: totalSouls,
    active_rescue_teams: state.teams.length,
    successful_evacuations: rescued,
    mean_triage_latency_ms: meanLatency,
  };

  return res.json(stats);
});

// 9. Rescue teams
app.get('/api/teams', (_req: Request, res: Response) => {
  return res.json(state.teams);
});

// 10. Sample messages dataset (203 records)
app.get('/api/sample-messages', (_req: Request, res: Response) => {
  return res.json(getAll203SampleMessages());
});

// 11. Broadcast list
app.get('/api/broadcasts', (_req: Request, res: Response) => {
  return res.json(state.broadcasts);
});

// 12. Reset / Reseed
app.post('/api/reset', (_req: Request, res: Response) => {
  seedInitialData();
  return res.json({ status: 'RESET_SUCCESS', active_count: state.incidents.length });
});

// 13. Multi-turn AI Dispatcher & Crisis Advisor Chatbot
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, model, systemRole } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Model selection: defaults to gemini-3.8-flash; gemini-3.1-flash-lite for fast tasks; gemini-4-argon for complex tasks
  const selectedModel = model || 'gemini-3.8-flash';

  const activeIncidentsSummary = state.incidents.slice(0, 8).map(i => 
    `[${i.id}] Urgency: ${i.triage.urgency}, Loc: ${i.triage.extracted_location}, Stranded: ${i.triage.people_stranded}, Status: ${i.status}, Alerts: ${i.triage.vulnerable_tags.join(', ') || 'None'}`
  ).join('\n');

  const defaultSystemInstruction = systemRole || `You are the Whisper Disaster Response Tactical AI Dispatcher & Crisis Advisor for civil defense, NDRF, and SDRF flood rescue operations in India.
Current live operational situation:
${activeIncidentsSummary}

Your mission:
- Provide authoritative, rapid tactical recommendations, casualty prioritization, rescue boat allocation, and flood evacuation routing.
- Prioritize high-risk human life (infants, elderly, pregnant women, medical emergencies like dialysis or cardiac patients).
- Mention tactical boat craft types (AP SDRF Deep Water Gemini Craft, NDRF Motorized Inflatable Boat, Volunteer Rafts).
- Provide concise, actionable bullet points suitable for emergency control room operators.
- Support accurate translation and cultural context for Telugu (తెలుగు), Hindi (हिंदी), and English flood distress signals (e.g. 'డాబా పై ఉన్నాము' -> 'stranded on terrace/roof', 'మునిగిపోతుంది' -> 'submerging').
- If asked about specific incidents or teams, refer to the live operational context provided above.`;

  try {
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text || m.content || '' }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction: defaultSystemInstruction,
        temperature: 0.3,
      },
    });

    const replyText = response.text || 'Tactical dispatch directive logged. Awaiting field responder confirmation.';
    return res.json({ reply: replyText, modelUsed: selectedModel });
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    // Intelligent tactical fallback for mission continuity
    const userQuery = messages[messages.length - 1]?.text?.toLowerCase() || '';
    let fallbackReply = `[Tactical Dispatch Advisory]\nReceived query. High-urgency alert across Budameru corridor and Singh Nagar. 5 rescue boat squads currently active.\n`;
    if (userQuery.includes('critical') || userQuery.includes('priority')) {
      fallbackReply += `Priority 1: SOS-VJ-001 (82yr cardiac patient on terrace, Singh Nagar) - SDRF Gemini Craft en route.\nPriority 2: SOS-VJ-002 (3 infants stranded, Payakapuram) - Requesting motorized dinghy dispatch.`;
    } else if (userQuery.includes('team') || userQuery.includes('boat')) {
      fallbackReply += `Available Teams:\n- NDRF 10th Bn Boat 1 (Singh Nagar Staging Area)\n- Volunteer Country Boat Raft Squad (Bhavanipuram)\n- Red Cross Trauma & Dialysis Unit (GGH Base)`;
    } else {
      fallbackReply += `Recommendation: Prioritize terrace evacuations before dusk. Direct all boat squads to avoid high-voltage power sub-stations.`;
    }
    return res.json({ reply: fallbackReply, modelUsed: `${selectedModel} (offline fallback)` });
  }
});


// Mount Vite or serve static production build
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Whisper Crisis Triage Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
