"""
Whisper Multilingual Emergency Alert & Public Broadcaster (EN / HI / TE)
Synthesizes urgent civil defense announcements, WhatsApp emergency broadcast text,
and VHF radio dispatch scripts in English, Hindi, and Telugu using Gemini 2.5 Flash.
"""

import os
import json
from datetime import datetime
from google import genai
from google.genai import types
from .models import BroadcastRequest, MultilingualBroadcast

GEMINI_MODEL = "gemini-2.5-flash"


def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    return genai.Client(api_key=api_key)


async def generate_multilingual_broadcast(req: BroadcastRequest) -> MultilingualBroadcast:
    client = get_gemini_client()

    prompt = f"""
    Create official emergency flood evacuation broadcasts and citizen advisories for the following incident:
    - Target Flood Zone: {req.zone_name}
    - Current Water Inflow / Threat Level: {req.flood_level_alert}
    - Designate Evacuation Camps / High Ground: {', '.join(req.evacuation_centers)}
    - Key Advisory Directives: {req.critical_advisory}
    - Helpline Contacts: {', '.join(req.helpline_numbers)}

    You MUST generate a structured JSON object containing:
    1. english_alert: Crisp, authoritative 3-sentence public safety evacuation directive in English.
    2. hindi_alert: Accurate Hindi (हिंदी) translation with native disaster terminology (बाढ़ चेतावनी, सुरक्षित स्थान, राहत शिविर).
    3. telugu_alert: Authentic Telugu (తెలుగు) broadcast message with native emergency phrasing (వరద హెచ్చరిక, పునరావాస కేంద్రాలు, తక్షణ తరలింపు).
    4. whatsapp_format: Formatted for viral forwarding with bold emojis (🚨, ⚠️, 📍, 📞), clear bullets, and helpline numbers.
    5. sms_format: Concise SMS under 160 characters for cell-tower mass broadcasting.
    6. audio_dispatch_script: Script formatted for police loudspeaker / SDRF boat bullhorn announcements with phonetic pause marks.

    Return JSON only.
    """

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            )
        )
        data = json.loads(response.text)
        return MultilingualBroadcast(
            timestamp=datetime.utcnow(),
            zone_name=req.zone_name,
            english_alert=data.get("english_alert", "URGENT FLOOD ALERT: Evacuate immediately."),
            hindi_alert=data.get("hindi_alert", "अति आवश्यक बाढ़ चेतावनी: तत्काल सुरक्षित स्थान पर पहुंचे।"),
            telugu_alert=data.get("telugu_alert", "అత్యవసర వరద హెచ్చరిక: వెంటనే సురక్షిత ప్రాంతాలకు తరలివెళ్ళండి."),
            whatsapp_format=data.get("whatsapp_format", ""),
            sms_format=data.get("sms_format", ""),
            audio_dispatch_script=data.get("audio_dispatch_script", "")
        )
    except Exception:
        # High-fidelity fallback alerts in EN, HI, TE
        return MultilingualBroadcast(
            timestamp=datetime.utcnow(),
            zone_name=req.zone_name,
            english_alert=f"EMERGENCY EVACUATION ALERT for {req.zone_name}. Water levels {req.flood_level_alert}. Move immediately to higher floors or designated relief camps at {req.evacuation_centers[0]}. Call NDRF Control 112.",
            hindi_alert=f"आपातकालीन बाढ़ चेतावनी: {req.zone_name} में जलस्तर तेजी से बढ़ रहा है। सभी नागरिक तुरंत {req.evacuation_centers[0]} स्थित राहत शिविर या ऊपरी मंजिल पर जाएं। हेल्पलाइन: 112 / 1070 पर संपर्क करें।",
            telugu_alert=f"అత్యవసర వరద హెచ్చరిక: {req.zone_name} లో నీటిమట్టం ప్రమాదకర స్థాయికి చేరింది. ప్రజలందరూ వెంటనే {req.evacuation_centers[0]} పునరావాస కేంద్రానికి తరలివెళ్ళండి. ఎలక్ట్రిక్ పోల్స్ ముట్టుకోవద్దు. సహాయం కోసం 112 కి కాల్ చేయండి.",
            whatsapp_format=f"🚨 *CRITICAL FLOOD ALERT - {req.zone_name.upper()}*\n\n⚠️ *Situation:* Water inflow {req.flood_level_alert}\n📍 *Shelter:* {', '.join(req.evacuation_centers)}\n⚡ *Advisory:* {req.critical_advisory}\n📞 *Helpline:* {', '.join(req.helpline_numbers)}\n\n_Forward to all family and colony WhatsApp groups immediately._",
            sms_format=f"FLOOD ALERT {req.zone_name}: Water rising rapidly. Evacuate to {req.evacuation_centers[0]}. Avoid live wires. Emergency SOS call 112.",
            audio_dispatch_script=f"ATTENTION RESIDENTS OF {req.zone_name.upper()}. THIS IS A FLOOD EVACUATION WARNING. PLEASE MOVE IMMEDIATELY TO UPPER FLOORS OR DESIGNATED RESCUE POINTS."
        )
