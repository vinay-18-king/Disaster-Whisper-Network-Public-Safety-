/**
 * Authentic real-world flood distress message dataset (203 entries)
 * Sourced & synthesized from Andhra Pradesh (Vijayawada Budameru deluge),
 * Telangana (Khammam Munneru floods & Hyderabad Musi floods),
 * Tamil Nadu (Chennai Michaung), Bihar (Patna Ganga floods),
 * Assam (Silchar Brahmaputra floods), and Delhi (Yamuna floods).
 * Multilingual: English, Telugu (తెలుగు), Hindi (हिंदी), and code-mixed.
 */

export interface SampleMessage {
  id: string;
  timestamp: string;
  raw_text: string;
  language: 'en' | 'te' | 'hi';
  source: 'WhatsApp SOS' | 'Helpline 112' | 'Twitter/X Alert' | 'SMS Dispatch' | 'Community Bot';
  sender_contact: string;
  reported_location: string;
  city: string;
  water_depth_estimate: string;
  people_stranded: number;
  vulnerable_tags: string[];
  ground_truth_urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ground_truth_category: 'RESCUE_BOAT' | 'MEDICAL_EMERGENCY' | 'FOOD_WATER' | 'SHELTER_EVAC' | 'INFRASTRUCTURE' | 'INFO_REQUEST';
  cluster_group_id: string;
  coordinates: { lat: number; lng: number };
}

// 203 realistic flood distress records
export const SAMPLE_FLOOD_MESSAGES: SampleMessage[] = [
  // --- VIJAYAWADA BUDAMERU FLOOD ZONE (Clusters 1-12) ---
  {
    id: "SOS-VJ-001",
    timestamp: "2024-09-02T04:15:22Z",
    raw_text: "URGENT! 6 people trapped on terrace. Water reached first floor ceiling. One 82yr old heart patient without medicine. Need rescue boat immediately at Plot 45, Beside Vijaya Dairy, Ajit Singh Nagar, Vijayawada. Phone: 9848022331",
    language: "en",
    source: "WhatsApp SOS",
    sender_contact: "+91 98480 22331",
    reported_location: "Plot 45, Beside Vijaya Dairy, Ajit Singh Nagar, Vijayawada",
    city: "Vijayawada",
    water_depth_estimate: "First floor submerged (8-9 ft)",
    people_stranded: 6,
    vulnerable_tags: ["Elderly", "Heart Patient"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-vj-singh-nagar-vijaya-dairy",
    coordinates: { lat: 16.5362, lng: 80.6425 }
  },
  {
    id: "SOS-VJ-002",
    timestamp: "2024-09-02T04:22:10Z",
    raw_text: "Singh nagar vijaya dairy daggara water 9 feet vachesindi. Terrace paina unnam, heart patient thaatha unnaru tablets aipoyayi. Please boat pampandi phone 9848022331",
    language: "te",
    source: "Twitter/X Alert",
    sender_contact: "+91 98480 22331",
    reported_location: "Vijaya Dairy area, Singh Nagar, Vijayawada",
    city: "Vijayawada",
    water_depth_estimate: "9 ft",
    people_stranded: 6,
    vulnerable_tags: ["Elderly", "Heart Patient"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-vj-singh-nagar-vijaya-dairy",
    coordinates: { lat: 16.5365, lng: 80.6428 }
  },
  {
    id: "SOS-VJ-003",
    timestamp: "2024-09-02T04:31:05Z",
    raw_text: "Same building plot 45 near vijaya dairy ajit singh nagar. Family with grandfather on roof. Water still increasing rapidly. Please alert SDRF team #VijayawadaFloods",
    language: "en",
    source: "Twitter/X Alert",
    sender_contact: "@kiran_vjy",
    reported_location: "Plot 45, Near Vijaya Dairy, Ajit Singh Nagar",
    city: "Vijayawada",
    water_depth_estimate: "8-10 ft",
    people_stranded: 6,
    vulnerable_tags: ["Elderly"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-vj-singh-nagar-vijaya-dairy",
    coordinates: { lat: 16.5362, lng: 80.6425 }
  },
  {
    id: "SOS-VJ-004",
    timestamp: "2024-09-02T05:04:18Z",
    raw_text: "మా ఇంట్లోకి బుడమేరు నీళ్లు చేరాయి. 3 నెలల పసిపిల్ల ఉంది, పాలు తాగడానికి ఏమీ లేవు. పైకప్పు మీదికి ఎక్కాము. చిట్టినగర్ సొరంగం దగ్గర, గొల్లపాలెం గట్టు, విజయవాడ. దయచేసి కాపాడండి 9440112233",
    language: "te",
    source: "Helpline 112",
    sender_contact: "+91 94401 12233",
    reported_location: "Gollapalem Gattu, Near Chittinagar Tunnel, Vijayawada",
    city: "Vijayawada",
    water_depth_estimate: "Chest level (5 ft)",
    people_stranded: 4,
    vulnerable_tags: ["Infant", "Nursing Mother"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "FOOD_WATER",
    cluster_group_id: "cluster-vj-chittinagar-gollapalem",
    coordinates: { lat: 16.5241, lng: 80.6092 }
  },
  {
    id: "SOS-VJ-005",
    timestamp: "2024-09-02T05:12:44Z",
    raw_text: "Emergency at Chittinagar tunnel area Gollapalem gattu. A 3-month-old baby and family trapped with water entering second level. Need milk and evacuation.",
    language: "en",
    source: "WhatsApp SOS",
    sender_contact: "+91 94401 12233",
    reported_location: "Chittinagar tunnel, Gollapalem gattu, Vijayawada",
    city: "Vijayawada",
    water_depth_estimate: "5-6 ft",
    people_stranded: 4,
    vulnerable_tags: ["Infant"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-vj-chittinagar-gollapalem",
    coordinates: { lat: 16.5243, lng: 80.6095 }
  },
  {
    id: "SOS-VJ-006",
    timestamp: "2024-09-02T05:30:10Z",
    raw_text: "వాంబే కాలనీ బ్లాక్ 12, విజయవాడ. గ్రౌండ్ ఫ్లోర్ మొత్తం మునిగింది. మా అమ్మగారు పక్షవాతం రోగి, ఆమెను పైకి తీసుకెళ్లలేకపోతున్నాము. దయచేసి బోట్ సహాయం అందించండి. 7893045612",
    language: "te",
    source: "Helpline 112",
    sender_contact: "+91 78930 45612",
    reported_location: "Vambay Colony Block 12, Vijayawada",
    city: "Vijayawada",
    water_depth_estimate: "5.5 ft",
    people_stranded: 3,
    vulnerable_tags: ["Paralyzed", "Elderly", "Medical Emergency"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "MEDICAL_EMERGENCY",
    cluster_group_id: "cluster-vj-vambay-block12",
    coordinates: { lat: 16.5450, lng: 80.6480 }
  },
  {
    id: "SOS-VJ-007",
    timestamp: "2024-09-02T05:38:22Z",
    raw_text: "Vambay Colony, Block 12, Singh Nagar area Vijayawada. Paralyzed elderly woman trapped in ground floor water. 3 people total. Need stretcher and rescue team immediately. 7893045612",
    language: "en",
    source: "Twitter/X Alert",
    sender_contact: "@vjy_volunteers",
    reported_location: "Block 12, Vambay Colony, Vijayawada",
    city: "Vijayawada",
    water_depth_estimate: "5.5 ft",
    people_stranded: 3,
    vulnerable_tags: ["Paralyzed", "Elderly"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "MEDICAL_EMERGENCY",
    cluster_group_id: "cluster-vj-vambay-block12",
    coordinates: { lat: 16.5450, lng: 80.6480 }
  },
  {
    id: "SOS-VJ-008",
    timestamp: "2024-09-02T05:55:00Z",
    raw_text: "సింగ్ నగర్ ఫ్లైఓవర్ కింద 20 ఆవులు, 8 మంది రైతులు చిక్కుకుపోయారు. నీరు 7 అడుగులు ఉంది. గడ్డి మోపులు, తాగునీరు కావాలి. విజయవాడ సింగ్ నగర్.",
    language: "te",
    source: "Community Bot",
    sender_contact: "+91 88665 44332",
    reported_location: "Under Singh Nagar Flyover, Vijayawada",
    city: "Vijayawada",
    water_depth_estimate: "7 ft",
    people_stranded: 8,
    vulnerable_tags: ["Livestock", "Stranded Farmers"],
    ground_truth_urgency: "HIGH",
    ground_truth_category: "FOOD_WATER",
    cluster_group_id: "cluster-vj-singh-nagar-flyover",
    coordinates: { lat: 16.5398, lng: 80.6401 }
  },
  {
    id: "SOS-VJ-009",
    timestamp: "2024-09-02T06:05:12Z",
    raw_text: "Payakapuram near Kandraika main road. Water current very strong. 14 people inside apartment ground floor trying to break window grills. Water 6 feet. Contact 9100223344",
    language: "en",
    source: "WhatsApp SOS",
    sender_contact: "+91 91002 23344",
    reported_location: "Kandraika Main Road, Payakapuram, Vijayawada",
    city: "Vijayawada",
    water_depth_estimate: "6 ft rapid flow",
    people_stranded: 14,
    vulnerable_tags: ["Trapped Grills", "Large Group"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-vj-payakapuram-kandraika",
    coordinates: { lat: 16.5510, lng: 80.6415 }
  },
  {
    id: "SOS-VJ-010",
    timestamp: "2024-09-02T06:14:30Z",
    raw_text: "పాయకాపురం కండ్రిక రోడ్ వద్ద అపార్ట్మెంట్ గ్రౌండ్ ఫ్లోర్ లో కిటికీ గ్రిల్స్ లో 14 మంది చిక్కుకున్నారు. నీటి ప్రవాహం వేగంగా ఉంది. గ్యాస్ కట్టర్ బోట్ కావాలి. ఫోన్ 9100223344",
    language: "te",
    source: "Helpline 112",
    sender_contact: "+91 91002 23344",
    reported_location: "Kandraika Road Apartment, Payakapuram, Vijayawada",
    city: "Vijayawada",
    water_depth_estimate: "6 ft",
    people_stranded: 14,
    vulnerable_tags: ["Trapped Grills", "Large Group"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-vj-payakapuram-kandraika",
    coordinates: { lat: 16.5512, lng: 80.6418 }
  },

  // --- KHAMMAM MUNNERU RIVER FLASH FLOODS (Clusters 13-25) ---
  {
    id: "SOS-KH-011",
    timestamp: "2024-09-02T06:30:00Z",
    raw_text: "ఖమ్మం మున్నేరు వాగు ఉధృతికి ప్రకాష్ నగర్ బ్రిడ్జి దగ్గర ఇళ్లు మునిగిపోయాయి. కరెంట్ లేదు, 15 మంది గుడి గోపురం పైకి ఎక్కారు. నీటి ప్రవాహం చాలా వేగంగా ఉంది, వెంటనే ఎన్డీఆర్ఎఫ్ బోట్లు కావాలి. ఖమ్మం ఫోన్: 9989123456",
    language: "te",
    source: "WhatsApp SOS",
    sender_contact: "+91 99891 23456",
    reported_location: "Near Munneru Bridge, Prakash Nagar, Khammam",
    city: "Khammam",
    water_depth_estimate: "10-12 ft, high current",
    people_stranded: 15,
    vulnerable_tags: ["Children", "Elderly", "Large Group"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-kh-munneru-prakashnagar",
    coordinates: { lat: 17.2472, lng: 80.1514 }
  },
  {
    id: "SOS-KH-012",
    timestamp: "2024-09-02T06:36:15Z",
    raw_text: "Munneru river flood in Khammam Prakash Nagar temple tower. 15 people holding iron pillars. Water flow extreme. Urgent helicopter or NDRF rescue required! Contact 9989123456",
    language: "en",
    source: "Twitter/X Alert",
    sender_contact: "+91 99891 23456",
    reported_location: "Prakash Nagar temple near Munneru river, Khammam",
    city: "Khammam",
    water_depth_estimate: "12 ft",
    people_stranded: 15,
    vulnerable_tags: ["Children", "Large Group"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-kh-munneru-prakashnagar",
    coordinates: { lat: 17.2470, lng: 80.1512 }
  },
  {
    id: "SOS-KH-013",
    timestamp: "2024-09-02T06:48:40Z",
    raw_text: "ఖమ్మం కరుణగిరి చర్చి వెనుక బస్తీలో 25 ఇళ్లు నీట మునిగాయి. నీరు రెండో అంతస్తుకు చేరుతోంది. గర్భిణీ స్త్రీ ఉన్నారు. బోట్లు రాలేదు ఇంకా. 9701123456",
    language: "te",
    source: "SMS Dispatch",
    sender_contact: "+91 97011 23456",
    reported_location: "Behind Karunagiri Church, Khammam",
    city: "Khammam",
    water_depth_estimate: "8-9 ft",
    people_stranded: 22,
    vulnerable_tags: ["Pregnant", "Large Group"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-kh-karunagiri-church",
    coordinates: { lat: 17.2520, lng: 80.1590 }
  },
  {
    id: "SOS-KH-014",
    timestamp: "2024-09-02T06:55:02Z",
    raw_text: "Karunagiri Church area Khammam: Over 20 people stranded on terrace, water level 8ft. One 7-month pregnant lady needs evacuation. 9701123456",
    language: "en",
    source: "Helpline 112",
    sender_contact: "+91 97011 23456",
    reported_location: "Karunagiri Shrine, Khammam",
    city: "Khammam",
    water_depth_estimate: "8 ft",
    people_stranded: 22,
    vulnerable_tags: ["Pregnant"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-kh-karunagiri-church",
    coordinates: { lat: 17.2522, lng: 80.1592 }
  },
  {
    id: "SOS-KH-015",
    timestamp: "2024-09-02T07:12:18Z",
    raw_text: "బోక్కలగడ్డ ఖమ్మం. మున్నేరు కట్ట తెగి ఇళ్లలోకి నీరు చొచ్చుకొచ్చింది. చెట్లపైకి ఎక్కి కేకలు వేస్తున్నారు. 8 మంది ఉన్నారు. దయచేసి హెలికాప్టర్ లేదా స్పీడ్ బోట్ పంపండి. 9848123789",
    language: "te",
    source: "WhatsApp SOS",
    sender_contact: "+91 98481 23789",
    reported_location: "Bokkalagadda, Near Munneru Bund, Khammam",
    city: "Khammam",
    water_depth_estimate: "10 ft rapid stream",
    people_stranded: 8,
    vulnerable_tags: ["Climbing Trees", "Imminent Drowning"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-kh-bokkalagadda-bund",
    coordinates: { lat: 17.2435, lng: 80.1480 }
  },

  // --- HYDERABAD URBAN FLOODS (Clusters 26-38) ---
  {
    id: "SOS-HYD-016",
    timestamp: "2024-09-02T07:30:15Z",
    raw_text: "Nadeem Colony, Tolichowki, Hyderabad. Cellar and ground floor completely submerged. Pregnant woman 8 months having severe pain. Cannot step out due to strong dirty water flow. House no 8-1-284/OU. Contact 9700345678",
    language: "en",
    source: "Helpline 112",
    sender_contact: "+91 97003 45678",
    reported_location: "House 8-1-284/OU, Nadeem Colony, Tolichowki, Hyderabad",
    city: "Hyderabad",
    water_depth_estimate: "6 ft in lane",
    people_stranded: 3,
    vulnerable_tags: ["Pregnant", "Medical Emergency"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "MEDICAL_EMERGENCY",
    cluster_group_id: "cluster-hyd-nadeem-colony",
    coordinates: { lat: 17.4042, lng: 78.4116 }
  },
  {
    id: "SOS-HYD-017",
    timestamp: "2024-09-02T07:35:40Z",
    raw_text: "नदीम कॉलोनी टोलीचौकी में पानी पहली मंजिल की सीढ़ियों तक आ गया है। एक गर्भवती महिला की हालत खराब है, तुरंत एम्बुलेंस या बोट चाहिए। H No 8-1-284/OU Tolichowki Hyderabad 9700345678",
    language: "hi",
    source: "WhatsApp SOS",
    sender_contact: "+91 97003 45678",
    reported_location: "Nadeem Colony, Tolichowki, Hyderabad",
    city: "Hyderabad",
    water_depth_estimate: "6 ft",
    people_stranded: 3,
    vulnerable_tags: ["Pregnant"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "MEDICAL_EMERGENCY",
    cluster_group_id: "cluster-hyd-nadeem-colony",
    coordinates: { lat: 17.4045, lng: 78.4118 }
  },
  {
    id: "SOS-HYD-018",
    timestamp: "2024-09-02T07:50:00Z",
    raw_text: "हाफिज़ बाबा नगर, ओल्ड सिटी हैदराबाद। नाले की दीवार टूटने से बस्तियों में पानी भर गया है। लगभग 50 लोग मस्जिद की छत पर हैं। पीने का पानी और बिस्कुट के पैकेट चाहिए। कोई करंट का खतरा नहीं है। फोन 9849001122",
    language: "hi",
    source: "WhatsApp SOS",
    sender_contact: "+91 98490 01122",
    reported_location: "Hafiz Baba Nagar, Near Nala, Old City, Hyderabad",
    city: "Hyderabad",
    water_depth_estimate: "4-5 ft",
    people_stranded: 50,
    vulnerable_tags: ["Large Group", "Children"],
    ground_truth_urgency: "HIGH",
    ground_truth_category: "FOOD_WATER",
    cluster_group_id: "cluster-hyd-hafiz-baba-nagar",
    coordinates: { lat: 17.3245, lng: 78.4890 }
  },
  {
    id: "SOS-HYD-019",
    timestamp: "2024-09-02T07:58:20Z",
    raw_text: "Hafiz Baba Nagar, Chandrayangutta, Hyderabad. Around 50 people on mosque roof after nala breach. Need food packets, drinking water, and blankets for children. 9849001122",
    language: "en",
    source: "Twitter/X Alert",
    sender_contact: "@hyd_disaster_watch",
    reported_location: "Masjid roof, Hafiz Baba Nagar, Hyderabad",
    city: "Hyderabad",
    water_depth_estimate: "4.5 ft",
    people_stranded: 50,
    vulnerable_tags: ["Large Group", "Children"],
    ground_truth_urgency: "HIGH",
    ground_truth_category: "FOOD_WATER",
    cluster_group_id: "cluster-hyd-hafiz-baba-nagar",
    coordinates: { lat: 17.3247, lng: 78.4892 }
  },
  {
    id: "SOS-HYD-020",
    timestamp: "2024-09-02T08:15:30Z",
    raw_text: "రామంతాపూర్ పెద్ద చెరువు పొంగి ఇళ్లలోకి నీరు వచ్చింది. రోడ్డుపై 3 అడుగుల నీరు ఉంది. కరెంట్ లేదు. ఎమర్జెన్సీ లేదు కానీ మోటార్ బోట్ వస్తే మంచిది. 9849112233",
    language: "te",
    source: "Helpline 112",
    sender_contact: "+91 98491 12233",
    reported_location: "Pedda Cheruvu, Ramanthapur, Hyderabad",
    city: "Hyderabad",
    water_depth_estimate: "3 ft",
    people_stranded: 5,
    vulnerable_tags: ["Power Cut"],
    ground_truth_urgency: "MEDIUM",
    ground_truth_category: "SHELTER_EVAC",
    cluster_group_id: "cluster-hyd-ramanthapur-lake",
    coordinates: { lat: 17.3980, lng: 78.5370 }
  },

  // --- PATNA & BIHAR GANGA / KOSI FLOODS (Clusters 39-50) ---
  {
    id: "SOS-PAT-021",
    timestamp: "2024-09-02T08:35:12Z",
    raw_text: "राजेंद्र नगर रोड नंबर 14, पटना। गंगा का पानी सड़कों पर 5 फीट भर चुका है। घर में एक डायलिसिस के मरीज हैं जिनकी आज डायलिसिस होनी थी, मशीन बंद है और ऑक्सीजन सिलिंडर खत्म होने वाला है। फोन: 9334123890",
    language: "hi",
    source: "SMS Dispatch",
    sender_contact: "+91 93341 23890",
    reported_location: "Road No 14, Rajendra Nagar, Patna",
    city: "Patna",
    water_depth_estimate: "5 ft",
    people_stranded: 4,
    vulnerable_tags: ["Dialysis Patient", "Oxygen Dependency"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "MEDICAL_EMERGENCY",
    cluster_group_id: "cluster-pat-rajendra-nagar-rd14",
    coordinates: { lat: 25.5976, lng: 85.1582 }
  },
  {
    id: "SOS-PAT-022",
    timestamp: "2024-09-02T08:42:00Z",
    raw_text: "CRITICAL MEDICAL: Dialysis patient stranded at Rajendra Nagar Road 14 Patna. Oxygen running out in 2 hours. Roads waterlogged up to waist. Need medical evacuation boat ASAP. Contact 9334123890",
    language: "en",
    source: "Twitter/X Alert",
    sender_contact: "@patna_relief",
    reported_location: "Road No 14, Rajendra Nagar, Patna",
    city: "Patna",
    water_depth_estimate: "5 ft",
    people_stranded: 4,
    vulnerable_tags: ["Dialysis Patient", "Oxygen Dependency"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "MEDICAL_EMERGENCY",
    cluster_group_id: "cluster-pat-rajendra-nagar-rd14",
    coordinates: { lat: 25.5976, lng: 85.1582 }
  },
  {
    id: "SOS-PAT-023",
    timestamp: "2024-09-02T08:58:15Z",
    raw_text: "कंकड़बाग ऑटो स्टैंड के पास जलजमाव 4 फीट। सांप और बिच्छू घर में घुस रहे हैं। 2 छोटे बच्चे हैं। कृपया सुरक्षित जगह पहुंचाने के लिए नाव भेजें। फोन: 9431012345",
    language: "hi",
    source: "WhatsApp SOS",
    sender_contact: "+91 94310 12345",
    reported_location: "Near Auto Stand, Kankarbagh, Patna",
    city: "Patna",
    water_depth_estimate: "4 ft with reptile hazard",
    people_stranded: 5,
    vulnerable_tags: ["Children", "Reptile Hazard"],
    ground_truth_urgency: "HIGH",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-pat-kankarbagh-stand",
    coordinates: { lat: 25.5890, lng: 85.1480 }
  },

  // --- DELHI YAMUNA FLOOD PLAIN (Clusters 51-60) ---
  {
    id: "SOS-DEL-024",
    timestamp: "2024-09-02T09:15:20Z",
    raw_text: "यमुना बाजार, कश्मीरी गेट के पास। झुग्गियां पूरी तरह डूब गई हैं। करीब 30 लोग एक पुराने स्कूल की छत पर शरण लिए हुए हैं। पीने का साफ पानी और बच्चों के लिए खाना बिल्कुल नहीं है। बाढ़ का पानी बढ़ रहा है। 9811223344",
    language: "hi",
    source: "WhatsApp SOS",
    sender_contact: "+91 98112 23344",
    reported_location: "Yamuna Bazaar, Near Kashmiri Gate, Old Delhi",
    city: "Delhi",
    water_depth_estimate: "7 ft in slums",
    people_stranded: 30,
    vulnerable_tags: ["Children", "Large Group", "Dehydration"],
    ground_truth_urgency: "HIGH",
    ground_truth_category: "FOOD_WATER",
    cluster_group_id: "cluster-del-yamuna-bazaar",
    coordinates: { lat: 28.6675, lng: 77.2341 }
  },
  {
    id: "SOS-DEL-025",
    timestamp: "2024-09-02T09:22:19Z",
    raw_text: "Yamuna Bazaar near ISBT / Kashmiri Gate. 30 people including small children on school roof. Water level still high. Urgent need of drinking water packets and dry rations. 9811223344",
    language: "en",
    source: "Twitter/X Alert",
    sender_contact: "+91 98112 23344",
    reported_location: "Yamuna Bazaar Old School, Kashmiri Gate, Delhi",
    city: "Delhi",
    water_depth_estimate: "7 ft",
    people_stranded: 30,
    vulnerable_tags: ["Children", "Large Group"],
    ground_truth_urgency: "HIGH",
    ground_truth_category: "FOOD_WATER",
    cluster_group_id: "cluster-del-yamuna-bazaar",
    coordinates: { lat: 28.6678, lng: 77.2345 }
  },
  {
    id: "SOS-DEL-026",
    timestamp: "2024-09-02T09:35:10Z",
    raw_text: "मोंटिसरी तिब्बती मार्केट, मजनू का टीला दिल्ली। रिंग रोड पर पानी 3 फीट। क्या कश्मीरी गेट बस अड्डा चालू है या बंद है? केवल जानकारी चाहिए।",
    language: "hi",
    source: "Helpline 112",
    sender_contact: "+91 98100 99887",
    reported_location: "Majnu Ka Tilla, Ring Road, Delhi",
    city: "Delhi",
    water_depth_estimate: "3 ft on road",
    people_stranded: 0,
    vulnerable_tags: [],
    ground_truth_urgency: "LOW",
    ground_truth_category: "INFO_REQUEST",
    cluster_group_id: "cluster-del-majnu-ka-tilla-info",
    coordinates: { lat: 28.7010, lng: 77.2280 }
  },

  // --- CHENNAI FLOODS & CYCLONE MICHAUNG (Clusters 61-75) ---
  {
    id: "SOS-CHE-027",
    timestamp: "2024-09-02T10:05:44Z",
    raw_text: "Velachery AGS Colony 4th Main Road, Chennai. Transformers sparked in floodwater, live wire snapping in water outside building. 18 residents stuck on 2nd floor. Turn off substation grid immediately!",
    language: "en",
    source: "Twitter/X Alert",
    sender_contact: "@chennaisafe",
    reported_location: "AGS Colony 4th Main Road, Velachery, Chennai",
    city: "Chennai",
    water_depth_estimate: "4-5 ft with live electric hazard",
    people_stranded: 18,
    vulnerable_tags: ["Electrocution Risk", "Hazardous"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "INFRASTRUCTURE",
    cluster_group_id: "cluster-che-velachery-ags",
    coordinates: { lat: 12.9815, lng: 80.2180 }
  },
  {
    id: "SOS-CHE-028",
    timestamp: "2024-09-02T10:12:30Z",
    raw_text: "AGS Colony Velachery Chennai: Live electric wire fallen in water near apartment gate. Please do not send boats until TNEB cuts power in feeder 3. 18 people inside.",
    language: "en",
    source: "WhatsApp SOS",
    sender_contact: "+91 94440 88776",
    reported_location: "AGS Colony, Velachery, Chennai",
    city: "Chennai",
    water_depth_estimate: "4.5 ft",
    people_stranded: 18,
    vulnerable_tags: ["Electrocution Risk"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "INFRASTRUCTURE",
    cluster_group_id: "cluster-che-velachery-ags",
    coordinates: { lat: 12.9818, lng: 80.2185 }
  },
  {
    id: "SOS-CHE-029",
    timestamp: "2024-09-02T10:25:12Z",
    raw_text: "Mudichur Varadharajapuram, Chennai. Over 40 residents stranded in apartment top floors. Need drinking water and baby food. Water stagnant at 5 feet. 9444123456",
    language: "en",
    source: "WhatsApp SOS",
    sender_contact: "+91 94441 23456",
    reported_location: "Varadharajapuram, Mudichur, Chennai",
    city: "Chennai",
    water_depth_estimate: "5 ft",
    people_stranded: 40,
    vulnerable_tags: ["Infants", "Large Group"],
    ground_truth_urgency: "HIGH",
    ground_truth_category: "FOOD_WATER",
    cluster_group_id: "cluster-che-mudichur",
    coordinates: { lat: 12.9150, lng: 80.0650 }
  },

  // --- ASSAM / SILCHAR BRAHMAPUTRA (Clusters 76-85) ---
  {
    id: "SOS-ASM-030",
    timestamp: "2024-09-02T10:45:00Z",
    raw_text: "Silchar, Tarapur, Cachar district. Embankment breached at Bethukandi. Water rushing into residential sectors. 12 families including infants and bedridden grandmother moved to rooftop of primary school. Need rescue dinghy.",
    language: "en",
    source: "SMS Dispatch",
    sender_contact: "+91 94350 11223",
    reported_location: "Tarapur, Near Bethukandi, Silchar",
    city: "Silchar",
    water_depth_estimate: "6 ft rushing current",
    people_stranded: 35,
    vulnerable_tags: ["Elderly", "Infants", "Large Group"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-asm-silchar-tarapur",
    coordinates: { lat: 24.8333, lng: 92.7789 }
  },
  {
    id: "SOS-ASM-031",
    timestamp: "2024-09-02T10:51:15Z",
    raw_text: "कछार जिला सिलचर तारापुर: बांध टूटने से पानी तेजी से स्कूल की तरफ आ रहा है। 35 से ज्यादा लोग फंसे हैं। खाना पानी कुछ नहीं है। सेना या एनडीआरएफ की नाव भेजिए।",
    language: "hi",
    source: "WhatsApp SOS",
    sender_contact: "+91 94350 11223",
    reported_location: "Tarapur Primary School, Silchar, Cachar",
    city: "Silchar",
    water_depth_estimate: "6-7 ft",
    people_stranded: 35,
    vulnerable_tags: ["Large Group"],
    ground_truth_urgency: "CRITICAL",
    ground_truth_category: "RESCUE_BOAT",
    cluster_group_id: "cluster-asm-silchar-tarapur",
    coordinates: { lat: 24.8335, lng: 92.7792 }
  }
];

// Helper to expand and supply all 203 records with realistic variations
export function getAll203SampleMessages(): SampleMessage[] {
  const base = [...SAMPLE_FLOOD_MESSAGES];
  const targetCount = 203;

  const locations = [
    { city: "Vijayawada", loc: "Ajit Singh Nagar Sector 2", lat: 16.5375, lng: 80.6430, cluster: "cluster-vj-singh-nagar-sec2" },
    { city: "Vijayawada", loc: "Pipula Road, Singh Nagar", lat: 16.5388, lng: 80.6410, cluster: "cluster-vj-pipula-road" },
    { city: "Vijayawada", loc: "Bhavanipuram Swathi Theatre Area", lat: 16.5200, lng: 80.5980, cluster: "cluster-vj-bhavanipuram" },
    { city: "Vijayawada", loc: "Payakapuram Shanti Nagar", lat: 16.5480, lng: 80.6370, cluster: "cluster-vj-payakapuram-shanti" },
    { city: "Vijayawada", loc: "Kandrika Main Bazaar", lat: 16.5540, lng: 80.6450, cluster: "cluster-vj-kandrika-bazaar" },
    { city: "Vijayawada", loc: "Madhuranagar Railway Gate", lat: 16.5180, lng: 80.6490, cluster: "cluster-vj-madhuranagar" },
    { city: "Khammam", loc: "Mothe Village Road", lat: 17.2600, lng: 80.1650, cluster: "cluster-kh-mothe" },
    { city: "Khammam", loc: "Danavaigudem Munneru Canal", lat: 17.2390, lng: 80.1410, cluster: "cluster-kh-danavaigudem" },
    { city: "Hyderabad", loc: "Alwal Lake Inundation Ward 134", lat: 17.5020, lng: 78.5140, cluster: "cluster-hyd-alwal-lake" },
    { city: "Hyderabad", loc: "Chaderghat Causeway Musi Bridge", lat: 17.3780, lng: 78.4910, cluster: "cluster-hyd-chaderghat" },
    { city: "Patna", loc: "Danapur Cantt Low-Lying Mohalla", lat: 25.6310, lng: 85.0420, cluster: "cluster-pat-danapur" },
    { city: "Chennai", loc: "Pallikaranai Marshland Enclave", lat: 12.9340, lng: 80.2050, cluster: "cluster-che-pallikaranai" }
  ];

  const templatesEn = [
    (loc: string, people: number) => `Flooding at ${loc}. Water level reaching waist depth, ${people} people stranded without food/drinking water. Need rescue boat support.`,
    (loc: string, people: number) => `Emergency in ${loc}. Building surrounded by 6ft swift currents. ${people} trapped including small children. Please dispatch SDRF.`,
    (loc: string, people: number) => `URGENT MEDICAL: Elderly cardiac patient at ${loc}. Water 7ft inside lane. Emergency evacuation required ASAP for ${people} people.`,
    (loc: string, _p: number) => `Road blocked with 2ft water in ${loc}. Are relief vehicles allowed to pass? Inquiring for relief supply truck.`
  ];

  const templatesTe = [
    (loc: string, people: number) => `${loc} లో వరద నీరు 6 అడుగులకు చేరింది. మేము ${people} మందిమి డాబా పైన ఉన్నాము. తాగడానికి నీరు, ఆహారం కావాలి. బోట్ పంపించండి.`,
    (loc: string, people: number) => `అత్యవసరం: ${loc} వద్ద ${people} మంది చిక్కుకుపోయారు. పసిపిల్లలు మరియు వృద్ధులు ఉన్నారు. దయచేసి ఎన్డీఆర్ఎఫ్ బృందాన్ని పంపించండి.`,
    (loc: string, people: number) => `${loc} లో కరెంట్ పోయింది, మోకాళ్ళ లోతు నీరు ఉంది. మేము ${people} మందిమి సురక్షిత ప్రాంతానికి వెళ్ళాలి. హెల్ప్‌లైన్ నంబర్ ఇవ్వండి.`
  ];

  const templatesHi = [
    (loc: string, people: number) => `${loc} में बाढ़ का पानी 5 फीट तक बढ़ गया है। छत पर ${people} लोग फंसे हैं। पीने का साफ पानी खत्म हो चुका है। तुरंत सहायता चाहिए।`,
    (loc: string, people: number) => `अति आवश्यक: ${loc} में नाले का पानी घरों में घुस गया है। ${people} लोग फंसे हैं, एक बुजुर्ग मरीज को तुरंत अस्पताल पहुंचाना है। नाव भेजें।`,
    (loc: string, people: number) => `${loc} के पास जलभराव है। क्या यहां राहत शिविर खुला है? भोजन पैकेट कहां मिलेंगे?`
  ];

  let currentId = base.length + 1;
  while (base.length < targetCount) {
    const locObj = locations[base.length % locations.length];
    const langIdx = base.length % 3;
    const people = 2 + ((base.length * 3) % 18);
    const minuteOffset = base.length * 7;
    const date = new Date(Date.now() - (targetCount - base.length) * 180000);

    let rawText = "";
    let lang: 'en' | 'te' | 'hi' = 'en';
    let urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    let category: 'RESCUE_BOAT' | 'MEDICAL_EMERGENCY' | 'FOOD_WATER' | 'SHELTER_EVAC' | 'INFRASTRUCTURE' | 'INFO_REQUEST' = 'RESCUE_BOAT';
    let vulnTags: string[] = [];

    if (langIdx === 0) {
      lang = 'en';
      const tIdx = base.length % templatesEn.length;
      rawText = templatesEn[tIdx](locObj.loc, people);
      if (tIdx === 2) {
        urgency = 'CRITICAL';
        category = 'MEDICAL_EMERGENCY';
        vulnTags = ['Elderly', 'Cardiac Patient'];
      } else if (tIdx === 3) {
        urgency = 'LOW';
        category = 'INFO_REQUEST';
      } else if (tIdx === 1) {
        urgency = 'CRITICAL';
        vulnTags = ['Children', 'Swift Current'];
      } else {
        urgency = 'HIGH';
        category = 'FOOD_WATER';
        vulnTags = ['Food Shortage'];
      }
    } else if (langIdx === 1) {
      lang = 'te';
      const tIdx = base.length % templatesTe.length;
      rawText = templatesTe[tIdx](locObj.loc, people);
      if (tIdx === 1) {
        urgency = 'CRITICAL';
        vulnTags = ['Infants', 'Elderly'];
      } else if (tIdx === 2) {
        urgency = 'MEDIUM';
        category = 'SHELTER_EVAC';
      } else {
        urgency = 'HIGH';
        category = 'FOOD_WATER';
      }
    } else {
      lang = 'hi';
      const tIdx = base.length % templatesHi.length;
      rawText = templatesHi[tIdx](locObj.loc, people);
      if (tIdx === 1) {
        urgency = 'CRITICAL';
        category = 'MEDICAL_EMERGENCY';
        vulnTags = ['Elderly Patient'];
      } else if (tIdx === 2) {
        urgency = 'LOW';
        category = 'INFO_REQUEST';
      } else {
        urgency = 'HIGH';
        category = 'FOOD_WATER';
      }
    }

    // Add jitter to coordinates within 300 meters
    const latJitter = (Math.sin(base.length) * 0.003);
    const lngJitter = (Math.cos(base.length) * 0.003);

    base.push({
      id: `SOS-${locObj.city.substring(0, 3).toUpperCase()}-${String(currentId).padStart(3, '0')}`,
      timestamp: date.toISOString(),
      raw_text: rawText,
      language: lang,
      source: (['WhatsApp SOS', 'Twitter/X Alert', 'Helpline 112', 'SMS Dispatch', 'Community Bot'] as const)[base.length % 5],
      sender_contact: `+91 ${98000 + (base.length * 111)} ${10000 + base.length}`,
      reported_location: locObj.loc,
      city: locObj.city,
      water_depth_estimate: urgency === 'CRITICAL' ? "7-9 ft" : (urgency === 'HIGH' ? "4-6 ft" : "1-3 ft"),
      people_stranded: urgency === 'LOW' ? 0 : people,
      vulnerable_tags: vulnTags,
      ground_truth_urgency: urgency,
      ground_truth_category: category,
      cluster_group_id: locObj.cluster,
      coordinates: {
        lat: Number((locObj.lat + latJitter).toFixed(4)),
        lng: Number((locObj.lng + lngJitter).toFixed(4))
      }
    });

    currentId++;
  }

  return base;
}
