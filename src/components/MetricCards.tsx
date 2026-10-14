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
      {/* 1. Signals Ingested */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">SOS Received</span>
          <span className="font-mono text-[10px] text-slate-500">LIVE</span>
        </div>
        <div className="my-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-white font-mono tracking-tight tabular-nums">
            {stats.total_messages_received}
          </span>
          <span className="text-xs text-slate-500">signals</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          {stats.unique_incident_sites} unique locations
        </div>
      </div>

      {/* 2. Critical Priority */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Critical Sites
          </span>
          <span className="font-mono text-[10px] text-red-500 font-semibold">URGENT</span>
        </div>
        <div className="my-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-red-400 font-mono tracking-tight tabular-nums">
            {stats.critical_urgency_count}
          </span>
          <span className="text-xs text-slate-500">missions</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          Immediate water/medical risk
        </div>
      </div>

      {/* 3. Deduplication Rate */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium text-purple-400 flex items-center gap-1">
            <GitMerge className="w-3.5 h-3.5 text-purple-400" /> Noise Filtered
          </span>
          <span className="font-mono text-[10px] text-purple-400 font-semibold">
            {stats.deduplication_rate_percent}%
          </span>
        </div>
        <div className="my-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-purple-300 font-mono tracking-tight tabular-nums">
            {stats.duplicate_calls_filtered}
          </span>
          <span className="text-xs text-slate-500">duplicates</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          Redundant dispatches avoided
        </div>
      </div>

      {/* 4. Trapped Souls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" /> Trapped Souls
          </span>
          <span className="font-mono text-[10px] text-slate-500">HEADCOUNT</span>
        </div>
        <div className="my-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-blue-400 font-mono tracking-tight tabular-nums">
            {stats.total_souls_identified}
          </span>
          <span className="text-xs text-slate-500">citizens</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          {stats.successful_evacuations} safely evacuated
        </div>
      </div>

      {/* 5. Triage Latency */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Triage Speed
          </span>
          <span className="font-mono text-[10px] text-emerald-400 font-semibold">FAST</span>
        </div>
        <div className="my-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-200 font-mono tracking-tight tabular-nums">
            {(stats.mean_triage_latency_ms / 1000).toFixed(2)}s
          </span>
          <span className="text-xs text-slate-500">/ signal</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          Gemini Flash classification
        </div>
      </div>

      {/* 6. Fleet Readiness */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium flex items-center gap-1">
            <Ship className="w-3.5 h-3.5 text-emerald-400" /> Fleet Assets
          </span>
          <span className="font-mono text-[10px] text-emerald-500 font-semibold">READY</span>
        </div>
        <div className="my-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-emerald-400 font-mono tracking-tight tabular-nums">
            {stats.active_rescue_teams}
          </span>
          <span className="text-xs text-slate-500">squads</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          SDRF, NDRF, Naval airlift
        </div>
      </div>
    </div>
  );
};
