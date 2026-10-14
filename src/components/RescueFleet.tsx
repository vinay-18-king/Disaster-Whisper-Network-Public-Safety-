import React from 'react';
import {
  Ship,
  MapPin,
  Users,
  ExternalLink,
} from 'lucide-react';
import { RescueTeam, IncidentRecord } from '../types';

interface RescueFleetProps {
  teams: RescueTeam[];
  incidents: IncidentRecord[];
  onSelectIncident?: (incident: IncidentRecord) => void;
}

export const RescueFleet: React.FC<RescueFleetProps> = ({
  teams,
  incidents,
  onSelectIncident,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Context */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Rescue Assets &amp; Fleet Deployment
        </h2>
        <p className="text-xs text-slate-400">
          Tracks deployed SDRF motorized inflatable boats, deep-water Gemini crafts, Indian Navy air-lift squads,
          and community volunteer boat units across flood sectors.
        </p>
      </div>

      {/* Grid of Tactical Fleet Squads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const assignedInc = incidents.find((i) => i.id === team.assigned_incident_id);

          const getStatusBadge = () => {
            switch (team.status) {
              case 'AVAILABLE':
                return (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm shadow-emerald-950/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    READY
                  </span>
                );
              case 'DISPATCHED':
                return (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 shadow-sm shadow-indigo-950/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    EN ROUTE
                  </span>
                );
              case 'ON_SCENE':
                return (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm shadow-amber-950/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    ON SCENE
                  </span>
                );
              default:
                return (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    STANDBY
                  </span>
                );
            }
          };

          // Determine squad logo & theme based on squad ID or type
          const isAirlift = team.name.toLowerCase().includes('air') || team.type.toLowerCase().includes('heli');
          const isNDRF = team.name.toLowerCase().includes('ndrf') || team.type.toLowerCase().includes('ndrf');
          const isVolunteer = team.name.toLowerCase().includes('volunteer') || team.type.toLowerCase().includes('community');

          let iconBg = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
          let borderGlow = 'border-slate-800 hover:border-cyan-500/40';
          if (isAirlift) {
            iconBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            borderGlow = 'border-slate-800 hover:border-amber-500/40';
          } else if (isNDRF) {
            iconBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            borderGlow = 'border-slate-800 hover:border-rose-500/40';
          } else if (isVolunteer) {
            iconBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
            borderGlow = 'border-slate-800 hover:border-emerald-500/40';
          }

          return (
            <div
              key={team.id}
              className={`relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 rounded-xl p-4 space-y-3.5 border transition-all duration-200 shadow-md ${borderGlow}`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-[10px]">
                  {team.id}
                </span>
                {getStatusBadge()}
              </div>

              {/* Squad Logo & Info Header */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${iconBg}`}>
                  <Ship className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm tracking-tight truncate">{team.name}</h3>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">{team.type}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono">
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Staging Base</span>
                  <div className="font-semibold text-slate-200 truncate mt-0.5">{team.base_location}</div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Crew</span>
                  <div className="font-semibold text-cyan-300 mt-0.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{team.personnel_count} rescuers</span>
                  </div>
                </div>
              </div>

              {assignedInc ? (
                <div className="bg-gradient-to-r from-rose-950/20 via-slate-950 to-slate-950 border border-rose-500/30 rounded-lg p-2.5 text-xs space-y-1.5 shadow-sm">
                  <div className="text-[10px] text-rose-300 uppercase font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                      Active Mission
                    </span>
                    <span className="font-mono text-slate-300 font-semibold">{assignedInc.id}</span>
                  </div>
                  <p className="text-white truncate font-semibold">
                    {assignedInc.triage.extracted_location}
                  </p>
                  <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 font-mono">
                    <span className="text-amber-300 font-bold">{assignedInc.triage.people_stranded} souls stranded</span>
                    {onSelectIncident && (
                      <button
                        onClick={() => onSelectIncident(assignedInc)}
                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 font-sans text-xs"
                      >
                        Inspect Map <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 rounded-lg p-2 text-center text-xs text-emerald-400/90 font-medium border border-emerald-500/20">
                  ✓ Unassigned · Ready for immediate crisis deployment
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
