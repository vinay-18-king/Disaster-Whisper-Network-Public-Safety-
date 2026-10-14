import React, { useState, useEffect } from 'react';
import {
  Radio,
  MapPin,
  Sparkles,
  GitMerge,
  Megaphone,
  Ship,
  FileText,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Shield,
  Bot,
} from 'lucide-react';
import { sirenSynth } from './AudioSiren';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  onSimulateSingle: () => void;
  onReset: () => void;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSimulating,
  setIsSimulating,
  simSpeed,
  setSimSpeed,
  onSimulateSingle,
  onReset,
  criticalCount,
}) => {
  const [sirenActive, setSirenActive] = useState(false);
  const [clockTime, setClockTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSiren = () => {
    sirenSynth.toggleSiren((active) => setSirenActive(active));
  };

  const navItems = [
    { id: 'feed', label: 'Triage Queue', icon: Radio, count: criticalCount },
    { id: 'map', label: 'Incident Map', icon: MapPin },
    { id: 'chat', label: 'AI Advisor', icon: Bot },
    { id: 'triage', label: 'AI Triage', icon: Sparkles },
    { id: 'dedup', label: 'Deduplication', icon: GitMerge },
    { id: 'broadcast', label: 'Broadcaster', icon: Megaphone },
    { id: 'fleet', label: 'Rescue Fleet', icon: Ship },
    { id: 'pitch', label: 'Architecture & Pitch', icon: FileText },
  ];

  return (
    <header className="bg-[#0b101b] border-b border-slate-800/80 sticky top-0 z-50">
      {/* Primary Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between gap-6">
        {/* Brand & Context */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-white">WHISPER</span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              / Flood Crisis Dispatch
            </span>
          </div>
        </div>

        {/* Central Segmented Nav Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="font-mono text-[10px] text-red-400 font-bold ml-0.5">
                    ({item.count})
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Time & Telemetry */}
          <span className="font-mono text-xs text-slate-400 hidden xl:inline pr-2 border-r border-slate-800">
            {clockTime}
          </span>

          {/* Siren Alert Button */}
          <button
            onClick={handleToggleSiren}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
              sirenActive
                ? 'bg-red-500/20 text-red-300 border-red-500/50'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
            title="Civil Defense Siren Synthesizer"
            aria-label="Toggle siren"
          >
            {sirenActive ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Simulation Toggle & Speed */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                isSimulating ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle live distress message ingestion simulation"
            >
              {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span className="hidden sm:inline">{isSimulating ? 'Streaming' : 'Stream'}</span>
            </button>

            {isSimulating && (
              <div className="flex items-center border-l border-slate-800 pl-1 pr-1 gap-0.5">
                {[1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimSpeed(speed)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                      simSpeed === speed ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick SOS Injection Button */}
          <button
            onClick={onSimulateSingle}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            title="Inject next flood distress signal"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inject SOS</span>
          </button>

          {/* Reset Store */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title="Reset incident store"
            aria-label="Reset database"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Nav Row */}
      <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none px-4 py-1.5 flex gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
