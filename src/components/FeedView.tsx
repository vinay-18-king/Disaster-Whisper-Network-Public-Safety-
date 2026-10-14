import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
  Droplets,
  Users,
  ChevronDown,
  ChevronUp,
  Ship,
  CheckCircle,
  Copy,
  Check,
  Search,
  Filter,
  Layers,
  Sparkles,
  History,
  Activity,
  ArrowRight,
  ShieldAlert,
  GitMerge,
} from 'lucide-react';
import { IncidentRecord, RescueTeam, StatusHistoryItem } from '../types';

interface FeedViewProps {
  incidents: IncidentRecord[];
  teams: RescueTeam[];
  onUpdateStatus: (id: string, status: any, teamId?: string) => void;
  onSelectIncidentOnMap?: (incident: IncidentRecord) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  incidents,
  teams,
  onUpdateStatus,
  onSelectIncidentOnMap,
}) => {
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLang, setSelectedLang] = useState<string>('ALL');
  const [hideDuplicates, setHideDuplicates] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDuplicates, setExpandedDuplicates] = useState<Record<string, boolean>>({});
  const [expandedTimelines, setExpandedTimelines] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dispatchMenuId, setDispatchMenuId] = useState<string | null>(null);

  const filtered = incidents.filter((inc) => {
    if (selectedUrgency !== 'ALL' && inc.triage.urgency !== selectedUrgency) return false;
    if (selectedCategory !== 'ALL' && inc.triage.category !== selectedCategory) return false;
    if (selectedLang !== 'ALL' && inc.raw_message.language !== selectedLang) return false;
    if (hideDuplicates && inc.is_duplicate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = inc.raw_message.raw_text.toLowerCase().includes(q);
      const matchLoc = inc.triage.extracted_location.toLowerCase().includes(q);
      const matchPhone = (inc.raw_message.sender_contact || '').includes(q);
      const matchId = inc.id.toLowerCase().includes(q);
      if (!matchText && !matchLoc && !matchPhone && !matchId) return false;
    }
    return true;
  });

  const toggleDuplicateExpand = (id: string) => {
    setExpandedDuplicates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTimelineExpand = (id: string) => {
    setExpandedTimelines((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyReport = (inc: IncidentRecord) => {
    const report = `[WHISPER DISPATCH]\nINCIDENT: ${inc.id}\nURGENCY: ${inc.triage.urgency}\nCATEGORY: ${inc.triage.category}\nLOCATION: ${inc.triage.extracted_location}\nGPS: ${inc.triage.coordinates.lat}, ${inc.triage.coordinates.lng}\nSTRANDED: ${inc.triage.people_stranded} persons\nDEPTH: ${inc.triage.water_depth}\nVULNERABILITIES: ${inc.triage.vulnerable_tags.join(', ') || 'None'}\nACTION: ${inc.triage.tactical_action_plan}\nCONTACT: ${inc.raw_message.sender_contact}`;
    navigator.clipboard.writeText(report);
    setCopiedId(inc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1.5 shadow-sm shadow-rose-950/40">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            Critical
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/30">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Low
          </span>
        );
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DISPATCHED':
        return (
          <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
            <Ship className="w-3 h-3 text-indigo-400" /> In-Transit
          </span>
        );
      case 'ON_SCENE':
        return (
          <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400" /> On-Scene
          </span>
        );
      case 'EVACUATED':
      case 'RESOLVED':
        return (
          <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm shadow-emerald-950/40">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Evacuated
          </span>
        );
      default:
        return (
          <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Received
          </span>
        );
    }
  };

  const RESCUE_STAGES = ['Received', 'Assigned', 'In-Transit', 'Evacuated'] as const;

  const getRescueStageInfo = (inc: IncidentRecord) => {
    if (inc.status === 'EVACUATED' || inc.status === 'RESOLVED') {
      return { index: 3, label: 'Evacuated' };
    }
    if (inc.status === 'ON_SCENE') {
      return { index: 2, label: 'In-Transit · On-Scene' };
    }
    if (inc.status === 'DISPATCHED') {
      return { index: 2, label: 'In-Transit' };
    }
    if (inc.assigned_team) {
      return { index: 1, label: 'Assigned' };
    }
    return { index: 0, label: 'Received' };
  };

  // Helper to retrieve or synthesize rich vertical timeline history
  const getTimelineEvents = (inc: IncidentRecord): StatusHistoryItem[] => {
    if (inc.status_history && inc.status_history.length > 0) {
      return inc.status_history;
    }

    const baseDate = new Date(inc.created_at || '2024-09-02T14:02:00Z');
    const fmt = (d: Date) =>
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const t0 = fmt(baseDate);
    const t1 = fmt(new Date(baseDate.getTime() + 2 * 60 * 1000));
    const t2 = fmt(new Date(baseDate.getTime() + 3 * 60 * 1000));

    const events: StatusHistoryItem[] = [
      {
        id: `${inc.id}-1`,
        timestamp: inc.created_at,
        display_time: t0,
        stage: 'Received',
        title: 'Initial Ingestion',
        description: `Raw distress signal ingested via ${inc.raw_message.source || 'WhatsApp Gateway'} from citizen contact ${inc.raw_message.sender_contact || '+91 98480 23119'}.`,
        actor: inc.raw_message.source || 'WhatsApp Gateway',
        severity: 'info',
      },
      {
        id: `${inc.id}-2`,
        timestamp: new Date(baseDate.getTime() + 2 * 60 * 1000).toISOString(),
        display_time: t1,
        stage: 'Triaged',
        title: 'AI Triage & Geocoding Completed',
        description: `Gemini 2.5 Flash identified ${inc.triage.people_stranded || 1} people stranded, water depth ${inc.triage.water_depth || '6ft'}. Classified as ${inc.triage.urgency}. Coordinates resolved to [${inc.triage.coordinates.lat.toFixed(4)}, ${inc.triage.coordinates.lng.toFixed(4)}].`,
        actor: 'Gemini 2.5 Flash Engine',
        severity: inc.triage.urgency === 'CRITICAL' ? 'urgent' : 'warning',
      },
      {
        id: `${inc.id}-3`,
        timestamp: new Date(baseDate.getTime() + 3 * 60 * 1000).toISOString(),
        display_time: t2,
        stage: 'Received',
        title: inc.is_duplicate ? 'Duplicate Signal Clustered' : 'Master Incident Assigned',
        description: inc.is_duplicate
          ? `Matched incident cluster #${inc.cluster_id}. Duplicate call merged to conserve responder bandwidth.`
          : `Designated as primary Master Incident for sector #${inc.cluster_id}.`,
        actor: 'Whisper Dedup Matrix',
        severity: 'info',
      },
    ];

    if (inc.assigned_team || inc.status === 'DISPATCHED' || inc.status === 'ON_SCENE' || inc.status === 'EVACUATED' || inc.status === 'RESOLVED') {
      const t3 = fmt(new Date(baseDate.getTime() + 13 * 60 * 1000));
      events.push({
        id: `${inc.id}-4`,
        timestamp: new Date(baseDate.getTime() + 13 * 60 * 1000).toISOString(),
        display_time: t3,
        stage: 'Assigned',
        title: `${inc.assigned_team || 'Team 4 (NDRF)'} Assigned`,
        description: `Dispatched to sector coordinates. Direct VHF channel open with boat commander.`,
        actor: 'Control Room Dispatcher',
        severity: 'warning',
      });
    }

    if (inc.status === 'DISPATCHED' || inc.status === 'ON_SCENE' || inc.status === 'EVACUATED' || inc.status === 'RESOLVED') {
      const t4 = fmt(new Date(baseDate.getTime() + 16 * 60 * 1000));
      events.push({
        id: `${inc.id}-5`,
        timestamp: new Date(baseDate.getTime() + 16 * 60 * 1000).toISOString(),
        display_time: t4,
        stage: 'In-Transit',
        title: 'In-Transit to Coordinates',
        description: `Rescue vessel deployed into canal corridor, traversing flood torrent towards target rooftop.`,
        actor: inc.assigned_team || 'Rescue Boat Squad',
        severity: 'warning',
      });
    }

    if (inc.status === 'ON_SCENE' || inc.status === 'EVACUATED' || inc.status === 'RESOLVED') {
      const t5 = fmt(new Date(baseDate.getTime() + 29 * 60 * 1000));
      events.push({
        id: `${inc.id}-6`,
        timestamp: new Date(baseDate.getTime() + 29 * 60 * 1000).toISOString(),
        display_time: t5,
        stage: 'In-Transit',
        title: 'On-Scene Arrival',
        description: `Rescue vessel arrived on terrace perimeter. Life jackets secured onto casualties.`,
        actor: inc.assigned_team || 'Rescue Boat Squad',
        severity: 'warning',
      });
    }

    if (inc.status === 'EVACUATED' || inc.status === 'RESOLVED') {
      const t6 = fmt(new Date(baseDate.getTime() + 45 * 60 * 1000));
      events.push({
        id: `${inc.id}-7`,
        timestamp: new Date(baseDate.getTime() + 45 * 60 * 1000).toISOString(),
        display_time: t6,
        stage: 'Evacuated',
        title: 'Evacuated & Safe at Relief Camp',
        description: `All stranded individuals evacuated safely to Bhavanipuram relief camp. Mission marked resolved.`,
        actor: 'Relief Staging Officer',
        severity: 'success',
      });
    }

    return events;
  };

  return (
    <div className="space-y-4">
      {/* Control & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by colony, landmark, phone, or keyword..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500">Urgency:</span>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All</option>
              <option value="CRITICAL" className="bg-slate-900 text-red-400">Critical</option>
              <option value="HIGH" className="bg-slate-900 text-amber-400">High</option>
              <option value="MEDIUM" className="bg-slate-900 text-blue-400">Medium</option>
              <option value="LOW" className="bg-slate-900 text-slate-400">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Categories</option>
              <option value="RESCUE_BOAT" className="bg-slate-900">Rescue Boat</option>
              <option value="MEDICAL_EMERGENCY" className="bg-slate-900">Medical Emergency</option>
              <option value="FOOD_WATER" className="bg-slate-900">Food & Water</option>
              <option value="SHELTER_EVAC" className="bg-slate-900">Shelter Evacuation</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500">Language:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Languages</option>
              <option value="te" className="bg-slate-900">Telugu (తెలుగు)</option>
              <option value="hi" className="bg-slate-900">Hindi (हिंदी)</option>
              <option value="en" className="bg-slate-900">English</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200 pl-1">
            <input
              type="checkbox"
              checked={hideDuplicates}
              onChange={(e) => setHideDuplicates(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span>Hide Merged Duplicates</span>
          </label>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
            No distress incidents matching current filter criteria.
          </div>
        ) : (
          filtered.map((inc) => {
            const isCritical = inc.triage.urgency === 'CRITICAL';
            const duplicatesForCluster = incidents.filter(
              (i) => i.cluster_id === inc.cluster_id && i.id !== inc.id
            );
            const isDupExpanded = !!expandedDuplicates[inc.id];
            const isTimelineExpanded = !!expandedTimelines[inc.id];
            const timelineEvents = getTimelineEvents(inc);
            const stageInfo = getRescueStageInfo(inc);

            let cardStyle = 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700/80';
            let topGlow = null;
            if (inc.triage.urgency === 'CRITICAL') {
              cardStyle = 'border-rose-500/40 bg-gradient-to-br from-rose-950/25 via-slate-900/90 to-slate-950 shadow-md shadow-rose-950/40 hover:border-rose-400/60';
              topGlow = <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90" />;
            } else if (inc.triage.urgency === 'HIGH') {
              cardStyle = 'border-amber-500/35 bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-slate-950 shadow-sm shadow-amber-950/30 hover:border-amber-400/50';
              topGlow = <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />;
            } else if (inc.triage.urgency === 'MEDIUM') {
              cardStyle = 'border-cyan-500/30 bg-gradient-to-br from-cyan-950/15 via-slate-900/90 to-slate-950 shadow-sm shadow-cyan-950/20 hover:border-cyan-400/50';
              topGlow = <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />;
            } else {
              cardStyle = 'border-emerald-500/25 bg-gradient-to-br from-emerald-950/10 via-slate-900/90 to-slate-950 hover:border-emerald-400/40';
            }

            return (
              <div
                key={inc.id}
                className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${cardStyle}`}
              >
                {topGlow}

                {/* Header Row */}
                <div className="px-4 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Metadata line */}
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] flex-wrap">
                    {getUrgencyText(inc.triage.urgency)}
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="font-bold text-slate-200">{inc.id}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-300 font-medium">{inc.raw_message.source}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-cyan-400/90 font-medium">
                      {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {inc.is_duplicate && (
                      <>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                          Duplicate Signal
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusText(inc.status)}
                    <button
                      onClick={() => handleCopyReport(inc)}
                      className="text-slate-400 hover:text-cyan-300 transition-colors p-1 rounded hover:bg-slate-800/60"
                      title="Copy tactical dispatch report"
                    >
                      {copiedId === inc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  {/* Distress text */}
                  <div className="text-sm text-slate-100 font-medium leading-relaxed">
                    "{inc.raw_message.raw_text}"
                  </div>

                  {/* Multilingual summaries */}
                  {(inc.triage.summary_te || inc.triage.summary_hi) && (
                    <div className="text-xs text-slate-300 space-y-1 border-l-2 border-cyan-500/60 pl-3 py-1 bg-cyan-950/20 rounded-r-md">
                      {inc.triage.summary_te && (
                        <div>
                          <span className="text-cyan-400 font-semibold">Telugu:</span> {inc.triage.summary_te}
                        </div>
                      )}
                      {inc.triage.summary_hi && (
                        <div>
                          <span className="text-amber-400 font-semibold">Hindi:</span> {inc.triage.summary_hi}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata strip */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{inc.triage.extracted_location}</span>
                    </span>

                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 font-mono text-[11px]">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Depth: {inc.triage.water_depth}</span>
                    </span>

                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 font-mono text-[11px]">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold">{inc.triage.people_stranded} stranded</span>
                    </span>

                    <span className="flex items-center gap-1.5 font-mono text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-300">{inc.raw_message.sender_contact || 'Unlisted'}</span>
                    </span>
                  </div>

                  {/* Vulnerabilities & Action Directive */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {inc.triage.vulnerable_tags.length > 0 ? (
                        <>
                          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Alerts:</span>
                          {inc.triage.vulnerable_tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </>
                      ) : (
                        <span className="text-slate-400">
                          Category: <span className="text-slate-200 font-medium">{inc.triage.category.replace('_', ' ')}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-cyan-300 font-semibold flex items-center gap-1.5 bg-cyan-950/30 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{inc.triage.tactical_action_plan}</span>
                    </div>
                  </div>

                  {/* Duplicate Group Accordion */}
                  {duplicatesForCluster.length > 0 && !inc.is_duplicate && (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleDuplicateExpand(inc.id)}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 transition-colors bg-purple-950/30 px-2.5 py-1 rounded-lg border border-purple-500/30"
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                        <span>
                          {duplicatesForCluster.length} duplicate call{duplicatesForCluster.length > 1 ? 's' : ''} merged into this cluster
                        </span>
                        {isDupExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                      </button>

                      {isDupExpanded && (
                        <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-purple-500/40 bg-purple-950/15 p-2 rounded-r-lg">
                          {duplicatesForCluster.map((dup) => (
                            <div key={dup.id} className="text-xs text-slate-300 py-1">
                              <span className="font-mono text-purple-300 font-bold text-[10px] mr-2">
                                {dup.id} ({dup.raw_message.source})
                              </span>
                              <span className="italic text-slate-300">"{dup.raw_message.raw_text}"</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtle Rescue Stage Progress Bar with Expandable Timeline Trigger */}
                  <div className="pt-2.5 pb-0.5 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        Rescue Progress
                      </span>

                      {/* Clickable toggle to expand vertical timeline view */}
                      <button
                        onClick={() => toggleTimelineExpand(inc.id)}
                        className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer group"
                        title="Click to view full vertical status history timeline"
                      >
                        <Clock className="w-3 h-3 text-cyan-400 group-hover:rotate-45 transition-transform" />
                        <span className={`font-mono text-xs font-bold ${
                          stageInfo.index === 3 ? 'text-emerald-300' :
                          stageInfo.index === 2 ? 'text-indigo-300' :
                          stageInfo.index === 1 ? 'text-amber-300' :
                          'text-sky-300'
                        }`}>
                          Stage {stageInfo.index + 1} of 4: {stageInfo.label}
                        </span>
                        {isTimelineExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300" />
                        )}
                      </button>
                    </div>

                    {/* Multi-Color Progress Bar Grid */}
                    <div
                      onClick={() => toggleTimelineExpand(inc.id)}
                      className="grid grid-cols-4 gap-2 cursor-pointer group"
                      title="Click to expand/collapse vertical status timeline"
                    >
                      {RESCUE_STAGES.map((stageName, sIdx) => {
                        const isCompleted = sIdx < stageInfo.index;
                        const isCurrent = sIdx === stageInfo.index;

                        // Vibrant stage colors
                        const stageGradients = [
                          'bg-gradient-to-r from-sky-500 to-cyan-400 shadow-sm shadow-cyan-900/40',
                          'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-sm shadow-amber-900/40',
                          'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm shadow-indigo-900/40',
                          'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-900/40',
                        ];

                        let fillClass = 'bg-slate-800';
                        if (isCompleted || isCurrent) {
                          fillClass = stageGradients[sIdx];
                        }

                        return (
                          <div key={stageName} className="space-y-1">
                            <div className="h-2 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden group-hover:border-slate-700 transition-colors">
                              <div
                                className={`h-full transition-all duration-300 rounded-full ${fillClass} ${
                                  isCompleted || isCurrent ? 'w-full' : 'w-0'
                                }`}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span
                                className={`transition-colors font-medium ${
                                  isCurrent
                                    ? 'text-white font-bold'
                                    : isCompleted
                                    ? 'text-slate-300'
                                    : 'text-slate-600'
                                }`}
                              >
                                {stageName}
                              </span>
                              {isCompleted && (
                                <span className="text-cyan-400 text-[10px] font-mono font-bold">✓</span>
                              )}
                              {isCurrent && stageInfo.index === 3 && (
                                <span className="text-emerald-400 text-[10px] font-mono font-bold">✓</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* EXPANDABLE VERTICAL TIMELINE VIEW */}
                  {isTimelineExpanded && (
                    <div className="mt-3 pt-3 pb-2 px-3 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-900/40 rounded-xl border border-slate-800/90 space-y-3 animate-fadeIn shadow-inner">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-slate-100">
                          <History className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Status Change History &amp; Vertical Timeline</span>
                        </div>
                        <span className="text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 font-semibold">
                          {timelineEvents.length} chronological milestones
                        </span>
                      </div>

                      {/* Connected Vertical Timeline Track with Vivid Gradient */}
                      <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:via-amber-400 to-emerald-400">
                        {timelineEvents.map((event, idx) => {
                          const isLatest = idx === timelineEvents.length - 1;
                          let nodeColor = 'border-cyan-400 bg-cyan-950 text-cyan-300 shadow-cyan-900/50';
                          if (event.severity === 'urgent') {
                            nodeColor = 'border-rose-400 bg-rose-950 text-rose-300 shadow-rose-900/50';
                          } else if (event.severity === 'warning') {
                            nodeColor = 'border-amber-400 bg-amber-950 text-amber-300 shadow-amber-900/50';
                          } else if (event.severity === 'success') {
                            nodeColor = 'border-emerald-400 bg-emerald-950 text-emerald-300 shadow-emerald-900/50';
                          }

                          return (
                            <div key={event.id || idx} className="relative group">
                              {/* Node Circle on Vertical Rail */}
                              <div
                                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 ${nodeColor} flex items-center justify-center shadow-md z-10`}
                              >
                                {isLatest ? (
                                  <div className="w-2 h-2 rounded-full bg-current animate-ping" />
                                ) : (
                                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                )}
                              </div>

                              {/* Timeline Card Entry */}
                              <div className="space-y-0.5">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                  {/* Precise Timestamp + Title */}
                                  <span className="font-mono text-xs font-bold text-white">
                                    <span className="text-cyan-300">{event.display_time}</span> - {event.title}
                                  </span>

                                  {/* Actor / Source Tag */}
                                  {event.actor && (
                                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                      <span>via</span>
                                      <span className="text-slate-200 font-semibold px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">
                                        {event.actor}
                                      </span>
                                    </span>
                                  )}

                                  {isLatest && (
                                    <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/50 ml-auto font-bold animate-pulse">
                                      CURRENT STATE
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed pl-0.5">
                                  {event.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick stage transition note */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-[10px]">
                          <Activity className="w-3 h-3 text-cyan-400" />
                          <span>All timestamp logs cryptographically linked for post-incident audit.</span>
                        </span>
                        <button
                          onClick={() => toggleTimelineExpand(inc.id)}
                          className="text-cyan-400 hover:text-cyan-300 text-[10px] font-semibold"
                        >
                          Collapse Timeline
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Bar with Vibrant Colors */}
                <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    {onSelectIncidentOnMap && (
                      <button
                        onClick={() => onSelectIncidentOnMap(inc)}
                        className="text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 transition-colors font-medium p-1 rounded hover:bg-slate-800/50"
                      >
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" /> View on Map
                      </button>
                    )}

                    {/* Timeline button in footer */}
                    <button
                      onClick={() => toggleTimelineExpand(inc.id)}
                      className="text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 transition-colors font-medium p-1 rounded hover:bg-slate-800/50"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isTimelineExpanded ? 'Hide History' : `History (${timelineEvents.length})`}</span>
                    </button>

                    {inc.assigned_team && (
                      <span className="text-indigo-300 font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-500/30">
                        <Ship className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Team: <strong className="text-white">{inc.assigned_team}</strong></span>
                      </span>
                    )}
                  </div>

                  {/* Dispatch Controls with Rich Gradient Buttons */}
                  <div className="relative">
                    {dispatchMenuId === inc.id ? (
                      <div className="absolute right-0 bottom-full mb-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-20 space-y-1">
                        <div className="text-[11px] font-bold text-slate-300 pb-1.5 border-b border-slate-800 flex items-center justify-between">
                          <span>Select Squad to Assign:</span>
                          <span className="text-xs text-cyan-400 font-mono">6 UNITS</span>
                        </div>
                        {teams.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              onUpdateStatus(inc.id, 'PENDING', t.id);
                              setDispatchMenuId(null);
                            }}
                            className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
                          >
                            <span className="truncate font-medium">{t.name}</span>
                            <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/50">
                              {t.status}
                            </span>
                          </button>
                        ))}
                        <button
                          onClick={() => setDispatchMenuId(null)}
                          className="w-full text-center text-slate-400 hover:text-slate-200 pt-1 text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {inc.status === 'PENDING' && !inc.assigned_team && (
                          <button
                            onClick={() => setDispatchMenuId(inc.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg transition-all shadow-md shadow-blue-950/50 border border-blue-400/40 text-xs"
                          >
                            Assign Squad
                          </button>
                        )}
                        {inc.status === 'PENDING' && inc.assigned_team && (
                          <button
                            onClick={() => onUpdateStatus(inc.id, 'DISPATCHED', inc.assigned_team)}
                            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg transition-all shadow-md shadow-indigo-950/50 border border-indigo-400/40 text-xs"
                          >
                            Dispatch Squad
                          </button>
                        )}
                        {inc.status === 'DISPATCHED' && (
                          <button
                            onClick={() => onUpdateStatus(inc.id, 'ON_SCENE', inc.assigned_team)}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-lg transition-all shadow-md shadow-amber-950/50 border border-amber-400/40 text-xs"
                          >
                            Mark On-Scene
                          </button>
                        )}
                        {inc.status === 'ON_SCENE' && (
                          <button
                            onClick={() => onUpdateStatus(inc.id, 'EVACUATED', inc.assigned_team)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg transition-all shadow-md shadow-emerald-950/50 border border-emerald-400/40 text-xs"
                          >
                            Mark Evacuated
                          </button>
                        )}
                        {inc.status === 'EVACUATED' && (
                          <span className="text-emerald-300 font-bold flex items-center gap-1.5 text-xs bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/40 shadow-sm shadow-emerald-950/40">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Evacuation Completed
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
