import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  Droplets,
  Users,
} from 'lucide-react';
import { TriageResult } from '../types';

interface TriagePlaygroundProps {
  onIngestMessage: (rawText: string, city: string, triageResult: TriageResult) => void;
}

export const TriagePlayground: React.FC<TriagePlaygroundProps> = ({ onIngestMessage }) => {
  const [inputText, setInputText] = useState('');
  const [cityContext, setCityContext] = useState('Vijayawada');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [justIngested, setJustIngested] = useState(false);

  const presets = [
    {
      label: 'Vijayawada Budameru (Roof & Cardiac Patient)',
      city: 'Vijayawada',
      lang: 'Telugu / English',
      text: 'Singh nagar vijaya dairy daggara water 9 feet vachesindi. Terrace paina unnam, heart patient thaatha unnaru tablets aipoyayi. Please boat pampandi phone 9848022331',
    },
    {
      label: 'Chittinagar 3-Month Infant (Telugu)',
      city: 'Vijayawada',
      lang: 'Telugu (తెలుగు)',
      text: 'మా ఇంట్లోకి బుడమేరు నీళ్లు చేరాయి. 3 నెలల పసిపిల్ల ఉంది, పాలు తాగడానికి ఏమీ లేవు. పైకప్పు మీదికి ఎక్కాము. చిట్టినగర్ సొరంగం దగ్గర, గొల్లపాలెం గట్టు, విజయవాడ. దయచేసి కాపాడండి 9440112233',
    },
    {
      label: 'Patna Ganga Dialysis Emergency (Hindi)',
      city: 'Patna',
      lang: 'Hindi (हिंदी)',
      text: 'राजेंद्र नगर रोड नंबर 14, पटना। गंगा का पानी सड़कों पर 5 फीट भर चुका है। घर में एक डायलिसिस के मरीज हैं जिनकी आज डायलिसिस होनी थी, मशीन बंद है और ऑक्सीजन सिलिंडर खत्म होने वाला है। फोन: 9334123890',
    },
    {
      label: 'Hyderabad Musi Pregnant Woman (Hinglish)',
      city: 'Hyderabad',
      lang: 'Hindi / English',
      text: 'नदीम कॉलोनी टोलीचौकी में पानी पहली मंजिल की सीढ़ियों तक आ गया है। एक गर्भवती महिला की हालत खराब है, तुरंत एम्बुलेंस या बोट चाहिए। H No 8-1-284/OU Tolichowki Hyderabad 9700345678',
    },
    {
      label: 'Chennai Velachery Live Wire Hazard',
      city: 'Chennai',
      lang: 'English',
      text: 'Velachery AGS Colony 4th Main Road, Chennai. Transformers sparked in floodwater, live wire snapping in water outside building. 18 residents stuck on 2nd floor. Turn off substation grid immediately!',
    },
  ];

  const handleRunTriage = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setJustIngested(false);

    try {
      const resp = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: inputText, city_hint: cityContext }),
      });

      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }

      const data: TriageResult = await resp.json();
      setResult(data);
    } catch (err: any) {
      console.error('Triage failed:', err);
      setErrorMsg('Triage processing failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToFeed = () => {
    if (!result) return;
    onIngestMessage(inputText, cityContext, result);
    setJustIngested(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Context */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight">
          AI Triage &amp; Extraction Simulator
        </h2>
        <p className="text-xs text-slate-400">
          Evaluates raw, unformatted flood distress signals in English, Telugu (తెలుగు), and Hindi (हिंदी).
          Extracts urgency, casualties, vulnerable medical tags, and tactical guidance via Gemini Flash.
        </p>
      </div>

      {/* Preset Selector Strip */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Preset Distress Scenarios:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(p.text);
                setCityContext(p.city);
                setResult(null);
                setJustIngested(false);
              }}
              className="text-left p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="text-xs font-medium text-slate-200 truncate">{p.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{p.lang} · {p.city}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Input */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300">Raw Distress Text</label>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Region Context:</span>
              <input
                type="text"
                value={cityContext}
                onChange={(e) => setCityContext(e.target.value)}
                placeholder="e.g. Vijayawada"
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2 py-0.5 rounded w-28 focus:outline-none"
              />
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            placeholder="Type or paste any emergency distress call in English, Telugu (తెలుగు), or Hindi (हिंदी)..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Supports colloquial slang, dialect mixing &amp; landmarks
            </span>
            <button
              onClick={handleRunTriage}
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run AI Triage</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right: Output */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Classification Result</span>
            {result?.triage_latency_ms && (
              <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {result.triage_latency_ms} ms
              </span>
            )}
          </div>

          {!result && !isLoading && (
            <div className="h-64 border border-dashed border-slate-800/80 rounded-lg flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
              <p>Select a scenario above or enter a custom distress message, then click "Run AI Triage".</p>
            </div>
          )}

          {isLoading && (
            <div className="h-64 rounded-lg flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs space-y-2">
              <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p>Processing dialect semantics and geocoding landmark coordinates...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-3 text-xs">
              {/* Summary line */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-bold uppercase ${result.urgency === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                    {result.urgency}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-200 font-medium">
                    {result.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] font-mono">
                  Lang: <strong className="text-slate-300 uppercase">{result.detected_language}</strong>
                </div>
              </div>

              {/* Data attributes */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> Location
                  </span>
                  <div className="font-medium text-slate-200 mt-0.5">{result.extracted_location}</div>
                  <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                    {result.coordinates?.lat}, {result.coordinates?.lng}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-500" /> Stranded Headcount
                  </span>
                  <div className="font-medium text-slate-200 mt-0.5">{result.people_stranded} persons</div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">
                    Depth: {result.water_depth}
                  </div>
                </div>
              </div>

              {/* Vulnerabilities */}
              {result.vulnerable_tags?.length > 0 && (
                <div className="text-slate-400">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-0.5">
                    Vulnerabilities:
                  </span>
                  <span className="text-red-300 font-medium">
                    {result.vulnerable_tags.join(' · ')}
                  </span>
                </div>
              )}

              {/* Action directive */}
              <div className="p-2.5 bg-blue-950/30 border border-blue-500/20 rounded-lg text-blue-200">
                <span className="text-[10px] text-blue-400 font-semibold uppercase block">
                  Action Directive:
                </span>
                <p className="mt-0.5 font-medium">{result.tactical_action_plan}</p>
              </div>

              {/* Multilingual summaries */}
              {(result.summary_te || result.summary_hi) && (
                <div className="text-[11px] text-slate-400 space-y-0.5 border-l-2 border-slate-700 pl-2">
                  {result.summary_te && <div>Telugu: {result.summary_te}</div>}
                  {result.summary_hi && <div>Hindi: {result.summary_hi}</div>}
                </div>
              )}

              {/* Ingest into queue */}
              <button
                onClick={handleAddToFeed}
                disabled={justIngested}
                className={`w-full py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors ${
                  justIngested
                    ? 'bg-slate-800 text-emerald-400 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {justIngested ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ingested into Live Dispatch Feed</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ingest into Live Dispatch Feed</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
