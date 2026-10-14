export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CategoryType = 
  | 'RESCUE_BOAT' 
  | 'MEDICAL_EMERGENCY' 
  | 'FOOD_WATER' 
  | 'SHELTER_EVAC' 
  | 'INFRASTRUCTURE' 
  | 'INFO_REQUEST';

export type DispatchStatus = 
  | 'PENDING' 
  | 'DISPATCHED' 
  | 'ON_SCENE' 
  | 'EVACUATED' 
  | 'RESOLVED';

export interface Coordinates {
  lat: number;
  lng: number;
  display_name?: string;
  confidence?: number;
}

export interface DistressMessage {
  id: string;
  timestamp: string;
  raw_text: string;
  language: 'en' | 'te' | 'hi' | 'other';
  source: 'WhatsApp SOS' | 'Helpline 112' | 'Twitter/X Alert' | 'SMS Dispatch' | 'Community Bot';
  sender_contact: string;
  reported_location?: string;
  city?: string;
  water_depth_estimate?: string;
  people_stranded?: number;
  vulnerable_tags?: string[];
  ground_truth_urgency?: UrgencyLevel;
  ground_truth_category?: CategoryType;
  cluster_group_id?: string;
  coordinates?: Coordinates;
}

export interface TriageResult {
  message_id: string;
  urgency: UrgencyLevel;
  category: CategoryType;
  extracted_location: string;
  coordinates: Coordinates;
  people_stranded: number;
  water_depth: string;
  vulnerable_tags: string[];
  tactical_action_plan: string;
  detected_language: string;
  sentiment_panic_score: number; // 1 - 10
  confidence: number;
  summary_en: string;
  summary_hi?: string;
  summary_te?: string;
  triage_latency_ms?: number;
}

export interface StatusHistoryItem {
  id: string;
  timestamp: string; // ISO string
  display_time: string; // e.g. "14:02:15" or "14:02"
  stage: 'Received' | 'Assigned' | 'In-Transit' | 'Evacuated' | 'Triaged';
  title: string; // e.g. "Initial Ingestion", "AI Triage & Geocoding", "Team 4 Assigned"
  description: string;
  actor?: string; // e.g. "WhatsApp SOS Gateway", "Gemini 2.5 Flash", "NDRF Squad 1"
  severity?: 'info' | 'success' | 'warning' | 'urgent';
}

export interface IncidentRecord {
  id: string;
  created_at: string;
  raw_message: DistressMessage;
  triage: TriageResult;
  cluster_id: string;
  is_duplicate: boolean;
  duplicate_count: number;
  assigned_team?: string;
  status: DispatchStatus;
  status_history?: StatusHistoryItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}


export interface RescueTeam {
  id: string;
  name: string;
  type: 'Motorized Inflatable Boat' | 'Deep Water Gemini Craft' | 'Helicopter Air-Lift' | 'Country Boat Squad' | 'Mobile Amphibious Clinic';
  status: 'AVAILABLE' | 'DISPATCHED' | 'ON_SCENE' | 'MAINTENANCE';
  base_location: string;
  assigned_incident_id?: string;
  personnel_count: number;
  current_coords?: Coordinates;
}

export interface MultilingualBroadcast {
  id: string;
  timestamp: string;
  zone_name: string;
  flood_level_alert: string;
  english_alert: string;
  hindi_alert: string;
  telugu_alert: string;
  whatsapp_format: string;
  sms_format: string;
  audio_dispatch_script: string;
  audio_base64?: string;
}

export interface DisasterStats {
  total_messages_received: number;
  unique_incident_sites: number;
  critical_urgency_count: number;
  high_urgency_count: number;
  duplicate_calls_filtered: number;
  deduplication_rate_percent: number;
  total_souls_identified: number;
  active_rescue_teams: number;
  successful_evacuations: number;
  mean_triage_latency_ms: number;
}
