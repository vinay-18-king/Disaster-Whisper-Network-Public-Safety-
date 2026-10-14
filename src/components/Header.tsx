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
import { AppLogo } from './AppLogo';

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
    {
      id: 'feed',
      label: 'Triage Queue',
      icon: Radio,
      count: criticalCount,
      activeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-rose-950/40',
      iconColor: 'text-rose-400',
    },
    {
      id: 'map',
      label: 'Incident Map',
      icon: MapPin,
      activeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'chat',
      label: 'AI Advisor',
      icon: Bot,
      activeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-indigo-950/40',
      iconColor: 'text-indigo-400',
    },
    {
      id: 'triage',
      label: 'AI Triage',
      icon: Sparkles,
      activeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-amber-950/40',
      iconColor: 'text-amber-400',
    },
    {
      id: 'dedup',
      label: 'Deduplication',
      icon: GitMerge,
      activeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-purple-950/40',
      iconColor: 'text-purple-400',
    },
    {
      id: 'broadcast',
      label: 'Broadcaster',
      icon: Megaphone,
      activeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/40 shadow-orange-950/40',
      iconColor: 'text-orange-400',
    },
    {
      id: 'fleet',
      label: 'Rescue Fleet',
      icon: Ship,
      activeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-cyan-950/40',
      iconColor: 'text-cyan-400',
    },
    {
      id: 'pitch',
      label: 'Architecture & Pitch',
      icon: FileText,
      activeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-blue-950/40',
      iconColor: 'text-blue-400',
    },
  ];

  return (
    <header className="bg-gradient-to-b from-[#0e1526] via-[#090e1a] to-[#070b14] border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-md">
      {/* Primary Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand & Context with Colorful Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <AppLogo size="md" showText={true} />
        </div>

        {/* Central Segmented Nav Tabs with Vivid Color Themes */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shadow-inner shadow-black/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? `${item.activeColor} shadow-sm`
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? item.iconColor : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="font-mono text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 py-0.2 rounded-full font-bold ml-0.5">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Time & Telemetry with Neon Dot */}
          <div className="hidden xl:flex items-center gap-2 pr-2 border-r border-slate-800 text-xs font-mono text-cyan-300/90">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
            <span>{clockTime}</span>
          </div>

          {/* Siren Alert Button */}
          <button
            onClick={handleToggleSiren}
            className={`p-2 rounded-lg text-xs font-medium border transition-all duration-300 shadow-sm ${
              sirenActive
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 shadow-rose-950/60 animate-pulse'
                : 'bg-slate-900/90 text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border-slate-800 hover:border-rose-800/60'
            }`}
            title="Civil Defense Siren Synthesizer"
            aria-label="Toggle siren"
          >
            {sirenActive ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Simulation Toggle & Speed */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs shadow-inner">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-semibold transition-all ${
                isSimulating
                  ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40 shadow-sm shadow-amber-950/50'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60'
              }`}
              title="Toggle live distress message ingestion simulation"
            >
              {isSimulating ? (
                <Pause className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden sm:inline">{isSimulating ? 'Streaming' : 'Stream'}</span>
            </button>

            {isSimulating && (
              <div className="flex items-center border-l border-slate-800 pl-1 pr-1 gap-0.5">
                {[1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimSpeed(speed)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                      simSpeed === speed
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick SOS Injection Button with High-Voltage Gradient */}
          <button
            onClick={onSimulateSingle}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-rose-950/50 hover:shadow-rose-900/60 hover:scale-[1.02] active:scale-[0.98] border border-rose-400/30"
            title="Inject next flood distress signal"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inject SOS</span>
          </button>

          {/* Reset Store */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-800/50 transition-colors"
            title="Reset incident store"
            aria-label="Reset database"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Nav Row */}
      <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/80 overflow-x-auto scrollbar-none px-4 py-2 flex gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap border transition-all ${
                isActive
                  ? `${item.activeColor} shadow-sm`
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? item.iconColor : 'text-slate-500'}`} />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="font-mono text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 py-0.2 rounded-full font-bold ml-0.5">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
