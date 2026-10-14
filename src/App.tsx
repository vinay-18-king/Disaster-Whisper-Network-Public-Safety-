import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { FeedView } from './components/FeedView';
import { TacticalMap } from './components/TacticalMap';
import { TriagePlayground } from './components/TriagePlayground';
import { DedupMatrix } from './components/DedupMatrix';
import { BroadcastCenter } from './components/BroadcastCenter';
import { RescueFleet } from './components/RescueFleet';
import { DocsPitchView } from './components/DocsPitchView';
import { GeminiChatbot } from './components/GeminiChatbot';
import { sirenSynth } from './components/AudioSiren';
import {
  MapPin,
  Radio,
  Layers,
  Bot,
  X,
  Sparkles,
} from 'lucide-react';
import {
  IncidentRecord,
  RescueTeam,
  MultilingualBroadcast,
  DisasterStats,
  TriageResult,
} from './types';
import { SampleMessage } from './server/sampleData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [dashboardLayout, setDashboardLayout] = useState<'split' | 'queue' | 'map'>('split');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [broadcasts, setBroadcasts] = useState<MultilingualBroadcast[]>([]);
  const [stats, setStats] = useState<DisasterStats>({
    total_messages_received: 0,
    unique_incident_sites: 0,
    critical_urgency_count: 0,
    high_urgency_count: 0,
    duplicate_calls_filtered: 0,
    deduplication_rate_percent: 0,
    total_souls_identified: 0,
    active_rescue_teams: 5,
    successful_evacuations: 0,
    mean_triage_latency_ms: 1100,
  });

  const [allSamples, setAllSamples] = useState<SampleMessage[]>([]);
  const [sampleIndex, setSampleIndex] = useState<number>(45); // First 45 pre-ingested
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [selectedIncidentForMap, setSelectedIncidentForMap] = useState<IncidentRecord | null>(null);

  // Initial load
  const fetchData = async () => {
    try {
      const [incRes, teamsRes, statsRes, broadRes, samplesRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/teams'),
        fetch('/api/stats'),
        fetch('/api/broadcasts'),
        fetch('/api/sample-messages'),
      ]);

      if (incRes.ok) setIncidents(await incRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (broadRes.ok) setBroadcasts(await broadRes.json());
      if (samplesRes.ok) setAllSamples(await samplesRes.json());
    } catch (e) {
      console.error('Error fetching initial app data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Simulation streamer: ingests realistic flood distress calls from the 203 dataset
  useEffect(() => {
    if (!isSimulating || allSamples.length === 0) return;

    const intervalMs = Math.max(1200, 4200 / simSpeed);

    const timer = setInterval(async () => {
      const nextMsg = allSamples[sampleIndex % allSamples.length];
      setSampleIndex((prev) => (prev + 1) % allSamples.length);

      try {
        const resp = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            raw_text: nextMsg.raw_text,
            source: nextMsg.source,
            sender_contact: nextMsg.sender_contact,
            city: nextMsg.city,
            reported_location: nextMsg.reported_location,
            coordinates: nextMsg.coordinates,
          }),
        });

        if (resp.ok) {
          const newRecord: IncidentRecord = await resp.json();
          setIncidents((prev) => [newRecord, ...prev]);

          // Play short emergency audio ping if critical
          if (newRecord.triage.urgency === 'CRITICAL') {
            sirenSynth.playEmergencyBeep(400);
          }

          const statsRes = await fetch('/api/stats');
          if (statsRes.ok) setStats(await statsRes.json());
        }
      } catch (err) {
        console.error('Ingest simulation failed:', err);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, allSamples, sampleIndex, simSpeed]);

  // Manual ingest from Triage Playground
  const handleIngestManual = async (rawText: string, city: string, triageResult: TriageResult) => {
    try {
      const resp = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: rawText,
          city,
          reported_location: triageResult.extracted_location,
          coordinates: triageResult.coordinates,
        }),
      });

      if (resp.ok) {
        const record = await resp.json();
        setIncidents((prev) => [record, ...prev]);
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Single on-demand SOS injection
  const handleSimulateSingle = async () => {
    if (allSamples.length === 0) return;
    const nextMsg = allSamples[sampleIndex % allSamples.length];
    setSampleIndex((prev) => (prev + 1) % allSamples.length);

    try {
      const resp = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: nextMsg.raw_text,
          source: nextMsg.source,
          sender_contact: nextMsg.sender_contact,
          city: nextMsg.city,
          reported_location: nextMsg.reported_location,
          coordinates: nextMsg.coordinates,
        }),
      });

      if (resp.ok) {
        const newRecord: IncidentRecord = await resp.json();
        setIncidents((prev) => [newRecord, ...prev]);
        sirenSynth.playEmergencyBeep(350);
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update status / assign boat
  const handleUpdateStatus = async (id: string, status: any, teamId?: string, note?: string) => {
    try {
      const resp = await fetch(`/api/incidents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assigned_team: teamId, note }),
      });

      if (resp.ok) {
        const updated = await resp.json();
        setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
        const [teamsRes, statsRes] = await Promise.all([fetch('/api/teams'), fetch('/api/stats')]);
        if (teamsRes.ok) setTeams(await teamsRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset database to initial state
  const handleReset = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      setSampleIndex(45);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectIncidentForMap = (inc: IncidentRecord) => {
    setSelectedIncidentForMap(inc);
    if (activeTab === 'feed' && dashboardLayout === 'queue') {
      setDashboardLayout('split');
    } else if (activeTab !== 'feed') {
      setActiveTab('map');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Emergency Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        onSimulateSingle={handleSimulateSingle}
        onReset={handleReset}
        criticalCount={stats.critical_urgency_count}
      />

      {/* Main Operational Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-6">
        {/* Real-time KPI Ribbon */}
        {activeTab !== 'pitch' && <MetricCards stats={stats} />}

        {/* Dynamic Tab Views */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {/* Command Dashboard Layout Switcher (Makes Map visible to all by default) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-2.5 rounded-xl border border-slate-800 shadow-md text-xs">
              <div className="flex items-center gap-2.5 font-semibold text-slate-200">
                <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Layers className="w-4 h-4" />
                </span>
                <span>Command Dashboard View:</span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  MAP ONLINE
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-inner">
                <button
                  onClick={() => setDashboardLayout('split')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 border ${
                    dashboardLayout === 'split'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400/50 shadow-md shadow-blue-950/60'
                      : 'text-slate-400 border-transparent hover:text-cyan-300 hover:bg-slate-800/40'
                  }`}
                  title="Show Tactical Map & Live Feed side-by-side or stacked"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Split View (Map + Triage)</span>
                </button>

                <button
                  onClick={() => setDashboardLayout('queue')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 border ${
                    dashboardLayout === 'queue'
                      ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-rose-400/50 shadow-md shadow-rose-950/60'
                      : 'text-slate-400 border-transparent hover:text-rose-300 hover:bg-slate-800/40'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Queue Only</span>
                </button>

                <button
                  onClick={() => setDashboardLayout('map')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 border ${
                    dashboardLayout === 'map'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/50 shadow-md shadow-emerald-950/60'
                      : 'text-slate-400 border-transparent hover:text-emerald-300 hover:bg-slate-800/40'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Map Only</span>
                </button>
              </div>
            </div>

            {/* Tactical Map (Visible to all users on main view in split mode) */}
            {(dashboardLayout === 'split' || dashboardLayout === 'map') && (
              <div className="animate-fadeIn">
                <TacticalMap
                  incidents={incidents}
                  teams={teams}
                  selectedIncident={selectedIncidentForMap}
                  onSelectIncident={(inc) => setSelectedIncidentForMap(inc)}
                  onUpdateStatus={handleUpdateStatus}
                  apiKey="YOUR_KEY"
                  className={dashboardLayout === 'split' ? 'h-[480px]' : 'h-[640px]'}
                />
              </div>
            )}

            {/* Live Triage Queue Feed with Vertical Timelines */}
            {(dashboardLayout === 'split' || dashboardLayout === 'queue') && (
              <div className="animate-fadeIn">
                <FeedView
                  incidents={incidents}
                  teams={teams}
                  onUpdateStatus={handleUpdateStatus}
                  onSelectIncidentOnMap={handleSelectIncidentForMap}
                />
              </div>
            )}
          </div>
        )}

        {/* Dedicated Full Map View */}
        {activeTab === 'map' && (
          <TacticalMap
            incidents={incidents}
            teams={teams}
            selectedIncident={selectedIncidentForMap}
            onSelectIncident={(inc) => setSelectedIncidentForMap(inc)}
            onUpdateStatus={handleUpdateStatus}
            apiKey="YOUR_KEY"
            className="h-[660px]"
          />
        )}

        {/* Gemini Multi-turn Chatbot Tab */}
        {activeTab === 'chat' && (
          <GeminiChatbot
            incidents={incidents}
            teams={teams}
            onSelectIncidentOnMap={handleSelectIncidentForMap}
          />
        )}

        {activeTab === 'triage' && (
          <TriagePlayground onIngestMessage={handleIngestManual} />
        )}

        {activeTab === 'dedup' && <DedupMatrix incidents={incidents} />}

        {activeTab === 'broadcast' && (
          <BroadcastCenter
            broadcasts={broadcasts}
            onAddBroadcast={(bc) => setBroadcasts((prev) => [bc, ...prev])}
          />
        )}

        {activeTab === 'fleet' && (
          <RescueFleet
            teams={teams}
            incidents={incidents}
            onSelectIncident={handleSelectIncidentForMap}
          />
        )}

        {activeTab === 'pitch' && <DocsPitchView />}
      </main>

      {/* Floating Tactical AI Dispatcher Drawer & Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isChatDrawerOpen ? (
          <button
            onClick={() => setIsChatDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-2xl shadow-blue-500/40 border border-blue-400/40 transition-all hover:scale-105 cursor-pointer text-xs"
            title="Open Gemini Tactical AI Crisis Advisor"
          >
            <Bot className="w-4 h-4 animate-bounce" />
            <span>AI Crisis Advisor</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
          </button>
        ) : (
          <div className="w-[360px] sm:w-[460px] h-[580px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp">
            <div className="px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-100">
                <Bot className="w-4 h-4 text-blue-400" />
                <span>Tactical AI Advisor</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsChatDrawerOpen(false);
                    setActiveTab('chat');
                  }}
                  className="text-slate-400 hover:text-slate-200 text-[11px] underline"
                >
                  Full Screen
                </button>
                <button
                  onClick={() => setIsChatDrawerOpen(false)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <GeminiChatbot
                incidents={incidents}
                teams={teams}
                onSelectIncidentOnMap={handleSelectIncidentForMap}
              />
            </div>
          </div>
        )}
      </div>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b12] py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-slate-400">
            Whisper Crisis Dispatch · Flood Emergency Triage Engine
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <span>Gemini Flash</span>
            <span>·</span>
            <span>text-embedding-004</span>
            <span>·</span>
            <span>OpenStreetMap & Radar</span>
            <span>·</span>
            <span>203 Verified Records</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
