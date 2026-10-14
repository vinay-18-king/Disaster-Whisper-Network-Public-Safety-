import React from 'react';
import {
  AlertCircle,
  GitMerge,
  Users,
  Clock,
  CheckCircle2,
  Ship,
} from 'lucide-react';
import { DisasterStats } from '../types';

interface MetricCardsProps {
  stats: DisasterStats;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Signals Ingested - Electric Cyan / Sky */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 border border-cyan-500/30 p-3.5 flex flex-col justify-between shadow-sm shadow-cyan-950/30 hover:border-cyan-400/50 transition-all">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
        <div className="flex items-center justify-between text-cyan-300">
          <span className="text-xs font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            SOS Received
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
            LIVE
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-cyan-200 font-mono tracking-tight tabular-nums drop-shadow-sm">
            {stats.total_messages_received}
          </span>
          <span className="text-xs text-cyan-400/70 font-medium">signals</span>
        </div>
        <div className="text-[11px] text-slate-300 truncate font-medium">
          {stats.unique_incident_sites} unique locations
        </div>
      </div>

      {/* 2. Critical Priority - Emergency Crimson / Rose */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-950 border border-rose-500/40 p-3.5 flex flex-col justify-between shadow-md shadow-rose-950/40 hover:border-rose-400/60 transition-all">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-90" />
        <div className="flex items-center justify-between text-rose-300">
          <span className="text-xs font-bold flex items-center gap-1 text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Critical Sites
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
            URGENT
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-rose-400 font-mono tracking-tight tabular-nums drop-shadow-sm">
            {stats.critical_urgency_count}
          </span>
          <span className="text-xs text-rose-400/70 font-medium">missions</span>
        </div>
        <div className="text-[11px] text-rose-200/80 truncate font-medium">
          Immediate water/medical risk
        </div>
      </div>

      {/* 3. Deduplication Rate - Neon Violet / Purple */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-950 border border-purple-500/30 p-3.5 flex flex-col justify-between shadow-sm shadow-purple-950/30 hover:border-purple-400/50 transition-all">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-80" />
        <div className="flex items-center justify-between text-purple-300">
          <span className="text-xs font-semibold flex items-center gap-1 text-purple-300">
            <GitMerge className="w-3.5 h-3.5 text-purple-400" /> Noise Filtered
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
            {stats.deduplication_rate_percent}%
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-purple-200 font-mono tracking-tight tabular-nums drop-shadow-sm">
            {stats.duplicate_calls_filtered}
          </span>
          <span className="text-xs text-purple-400/70 font-medium">duplicates</span>
        </div>
        <div className="text-[11px] text-purple-200/80 truncate font-medium">
          Redundant dispatches avoided
        </div>
      </div>

      {/* 4. Trapped Souls - Tactical Amber / Gold */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 border border-amber-500/35 p-3.5 flex flex-col justify-between shadow-sm shadow-amber-950/30 hover:border-amber-400/50 transition-all">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
        <div className="flex items-center justify-between text-amber-300">
          <span className="text-xs font-semibold flex items-center gap-1 text-amber-300">
            <Users className="w-3.5 h-3.5 text-amber-400" /> Trapped Souls
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
            HEADCOUNT
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-amber-300 font-mono tracking-tight tabular-nums drop-shadow-sm">
            {stats.total_souls_identified}
          </span>
          <span className="text-xs text-amber-400/70 font-medium">citizens</span>
        </div>
        <div className="text-[11px] text-amber-200/80 truncate font-medium">
          {stats.successful_evacuations} safely evacuated
        </div>
      </div>

      {/* 5. Triage Latency - High-Efficiency Emerald */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 border border-emerald-500/30 p-3.5 flex flex-col justify-between shadow-sm shadow-emerald-950/30 hover:border-emerald-400/50 transition-all">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />
        <div className="flex items-center justify-between text-emerald-300">
          <span className="text-xs font-semibold flex items-center gap-1 text-emerald-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Triage Speed
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            FAST
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-emerald-300 font-mono tracking-tight tabular-nums drop-shadow-sm">
            {(stats.mean_triage_latency_ms / 1000).toFixed(2)}s
          </span>
          <span className="text-xs text-emerald-400/70 font-medium">/ signal</span>
        </div>
        <div className="text-[11px] text-emerald-200/80 truncate font-medium">
          Gemini Flash classification
        </div>
      </div>

      {/* 6. Fleet Readiness - Maritime Azure / Sky */}
      <div className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-sky-950/40 via-slate-900/90 to-slate-950 border border-sky-500/35 p-3.5 flex flex-col justify-between shadow-sm shadow-sky-950/30 hover:border-sky-400/50 transition-all">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-80" />
        <div className="flex items-center justify-between text-sky-300">
          <span className="text-xs font-semibold flex items-center gap-1 text-sky-300">
            <Ship className="w-3.5 h-3.5 text-sky-400" /> Fleet Assets
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
            READY
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-sky-300 font-mono tracking-tight tabular-nums drop-shadow-sm">
            {stats.active_rescue_teams}
          </span>
          <span className="text-xs text-sky-400/70 font-medium">squads</span>
        </div>
        <div className="text-[11px] text-sky-200/80 truncate font-medium">
          SDRF, NDRF, Naval airlift
        </div>
      </div>
    </div>
  );
};
