import React, { useState } from 'react';
import {
  Megaphone,
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Clock,
} from 'lucide-react';
import { MultilingualBroadcast } from '../types';

interface BroadcastCenterProps {
  broadcasts: MultilingualBroadcast[];
  onAddBroadcast: (broadcast: MultilingualBroadcast) => void;
}

export const BroadcastCenter: React.FC<BroadcastCenterProps> = ({
  broadcasts,
  onAddBroadcast,
}) => {
  const [zoneName, setZoneName] = useState('Ajit Singh Nagar & Payakapuram, Vijayawada');
  const [floodLevel, setFloodLevel] = useState('Inflow rising to 9 feet (Budameru Breach)');
  const [evacCenters, setEvacCenters] = useState('Bhavanipuram Govt High School, IGMC Indoor Stadium');
  const [advisory, setAdvisory] = useState('Move immediately to upper floors. Do not touch electrical cables. Keep phones dry in plastic.');
  const [helplines, setHelplines] = useState('112, 1070, 0866-2575833');

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'TE' | 'HI' | 'EN' | 'WHATSAPP' | 'SMS' | 'AUDIO'>('TE');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activeBroadcast = broadcasts[0];

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone_name: zoneName,
          flood_level_alert: floodLevel,
          evacuation_centers: evacCenters.split(',').map((s) => s.trim()),
          critical_advisory: advisory,
          helpline_numbers: helplines.split(',').map((s) => s.trim()),
        }),
      });

      if (resp.ok) {
        const data: MultilingualBroadcast = await resp.json();
        onAddBroadcast(data);
      }
    } catch (e) {
      console.error('Failed to generate broadcast:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSpeak = (text: string, lang = 'te-IN') => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Context */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Multilingual Civil Defense Public Warning Center
        </h2>
        <p className="text-xs text-slate-400">
          Synthesizes synchronized emergency advisories in English, Telugu (తెలుగు), and Hindi (हिंदी).
          Formats outputs for viral WhatsApp forwarding, cell-tower SMS bulletins, and loudspeaker radio dispatch.
        </p>
      </div>

      {/* Main Form & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
          <div className="font-semibold text-slate-200 pb-2 border-b border-slate-800">
            Compose Evacuation Directive
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Flood Zone</label>
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Water Inflow / Breach Threat</label>
              <input
                type="text"
                value={floodLevel}
                onChange={(e) => setFloodLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Evacuation Centers / High Ground</label>
              <input
                type="text"
                value={evacCenters}
                onChange={(e) => setEvacCenters(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Directives &amp; Safety Advisories</label>
              <textarea
                value={advisory}
                onChange={(e) => setAdvisory(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Helpline Contacts</label>
              <input
                type="text"
                value={helplines}
                onChange={(e) => setHelplines(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer mt-1 shadow-md shadow-orange-950/50 border border-orange-400/30"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Multilingual Bulletins (Gemini)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Multilingual Alerts</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
          {activeBroadcast ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <div>
                  <span className="font-mono text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                    LATEST RELEASE: {activeBroadcast.id}
                  </span>
                  <div className="font-bold text-white mt-1 text-sm">{activeBroadcast.zone_name}</div>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[11px] bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{new Date(activeBroadcast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Segmented Format Switcher with Vivid Channel Colors */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                {[
                  { id: 'TE', label: 'తెలుగు (Telugu)', active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                  { id: 'HI', label: 'हिंदी (Hindi)', active: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                  { id: 'EN', label: 'English', active: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
                  { id: 'WHATSAPP', label: '💬 WhatsApp', active: 'bg-emerald-600 text-white border-emerald-400/50 shadow-md shadow-emerald-950/60' },
                  { id: 'SMS', label: '📱 SMS Blast', active: 'bg-indigo-600 text-white border-indigo-400/50 shadow-md shadow-indigo-950/60' },
                  { id: 'AUDIO', label: '📢 Loudspeaker Script', active: 'bg-rose-600 text-white border-rose-400/50 shadow-md shadow-rose-950/60' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all border ${
                      activeTab === tab.id
                        ? `${tab.active} shadow-sm`
                        : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Box */}
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 min-h-[200px] flex flex-col justify-between">
                <div>
                  {activeTab === 'TE' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>అధికారిక వరద హెచ్చరిక (Telugu Directive)</span>
                        <button
                          onClick={() => handleSpeak(activeBroadcast.telugu_alert, 'te-IN')}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeaking ? 'Stop' : 'Play Voice'}</span>
                        </button>
                      </div>
                      <p className="text-sm text-slate-100 font-medium leading-relaxed font-sans pt-1">
                        {activeBroadcast.telugu_alert}
                      </p>
                    </div>
                  )}

                  {activeTab === 'HI' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>आपातकालीन बाढ़ चेतावनी (Hindi Directive)</span>
                        <button
                          onClick={() => handleSpeak(activeBroadcast.hindi_alert, 'hi-IN')}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeaking ? 'Stop' : 'Play Voice'}</span>
                        </button>
                      </div>
                      <p className="text-sm text-slate-100 font-medium leading-relaxed pt-1">
                        {activeBroadcast.hindi_alert}
                      </p>
                    </div>
                  )}

                  {activeTab === 'EN' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Official Civil Defense Order (English)</span>
                        <button
                          onClick={() => handleSpeak(activeBroadcast.english_alert, 'en-IN')}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeaking ? 'Stop' : 'Play Voice'}</span>
                        </button>
                      </div>
                      <p className="text-sm text-slate-100 font-medium leading-relaxed pt-1">
                        {activeBroadcast.english_alert}
                      </p>
                    </div>
                  )}

                  {activeTab === 'WHATSAPP' && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-slate-500 font-mono">Format: WhatsApp Forward</div>
                      <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                        {activeBroadcast.whatsapp_format}
                      </pre>
                    </div>
                  )}

                  {activeTab === 'SMS' && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-slate-500 font-mono">Format: Cell Broadcast (&lt; 160 chars)</div>
                      <div className="text-xs text-slate-200 font-mono">
                        {activeBroadcast.sms_format}
                      </div>
                    </div>
                  )}

                  {activeTab === 'AUDIO' && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-slate-500 font-mono">Format: Megaphone / VHF Script</div>
                      <div className="text-xs text-slate-200 font-mono uppercase tracking-wider leading-relaxed">
                        {activeBroadcast.audio_dispatch_script}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      const textToCopy =
                        activeTab === 'TE'
                          ? activeBroadcast.telugu_alert
                          : activeTab === 'HI'
                          ? activeBroadcast.hindi_alert
                          : activeTab === 'EN'
                          ? activeBroadcast.english_alert
                          : activeTab === 'WHATSAPP'
                          ? activeBroadcast.whatsapp_format
                          : activeTab === 'SMS'
                          ? activeBroadcast.sms_format
                          : activeBroadcast.audio_dispatch_script;
                      copyToClipboard(textToCopy, activeTab);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey === activeTab ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">No broadcast alerts yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
