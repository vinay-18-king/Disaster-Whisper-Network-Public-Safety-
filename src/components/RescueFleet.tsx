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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const assignedInc = incidents.find((i) => i.id === team.assigned_incident_id);

          const getStatusText = () => {
            switch (team.status) {
              case 'AVAILABLE':
                return <span className="text-emerald-400 font-medium">Ready</span>;
              case 'DISPATCHED':
                return <span className="text-indigo-400 font-medium">En Route</span>;
              case 'ON_SCENE':
                return <span className="text-amber-400 font-medium">On-Scene</span>;
              default:
                return <span className="text-slate-500 font-medium">Standby</span>;
            }
          };

          return (
            <div
              key={team.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-mono text-slate-500 font-semibold">{team.id}</span>
                {getStatusText()}
              </div>

              <div>
                <h3 className="font-semibold text-slate-100 text-sm">{team.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5">{team.type}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono">
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Staging Base</span>
                  <div className="font-medium text-slate-300 truncate mt-0.5">{team.base_location}</div>
                </div>

                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Crew</span>
                  <div className="font-medium text-slate-300 mt-0.5">{team.personnel_count} rescuers</div>
                </div>
              </div>

              {assignedInc ? (
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-xs space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase flex items-center justify-between">
                    <span>Assigned Mission</span>
                    <span className="font-mono text-slate-400">{assignedInc.id}</span>
                  </div>
                  <p className="text-slate-200 truncate font-medium">
                    {assignedInc.triage.extracted_location}
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
                    <span>{assignedInc.triage.people_stranded} souls stranded</span>
                    {onSelectIncident && (
                      <button
                        onClick={() => onSelectIncident(assignedInc)}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-sans"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 rounded-lg p-2 text-center text-xs text-slate-500">
                  Unassigned · Ready for immediate dispatch
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
