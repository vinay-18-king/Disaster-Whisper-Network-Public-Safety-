import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 20, textTitle: 'text-sm', textSub: 'text-[9px]' },
    md: { box: 'w-9 h-9', icon: 24, textTitle: 'text-base', textSub: 'text-[10px]' },
    lg: { box: 'w-12 h-12', icon: 32, textTitle: 'text-xl', textSub: 'text-xs' },
    xl: { box: 'w-16 h-16', icon: 44, textTitle: 'text-2xl', textSub: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Insignia / Tactical Crest */}
      <div className={`relative ${dim.box} shrink-0 group`}>
        {/* Ambient colored glow */}
        <div
          className={`absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-400 opacity-60 blur-sm transition-all duration-500 group-hover:opacity-100 ${
            animate ? 'animate-pulse' : ''
          }`}
        />

        {/* Outer Shield/Insignia Container */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/20 p-1 flex items-center justify-center shadow-lg shadow-black/60 overflow-hidden">
          {/* Subtle radar background ring */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent pointer-events-none" />

          {/* Custom Multi-Color Emergency Tactical Vector SVG */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="beaconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Tactical Hexagonal / Shield Outer Frame */}
            <path
              d="M24 3L41 10V22C41 33.2 33.8 42.6 24 45C14.2 42.6 7 33.2 7 22V10L24 3Z"
              fill="url(#crestGrad)"
              fillOpacity="0.25"
              stroke="url(#crestGrad)"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Inner Radar Broadcast Rings */}
            <circle
              cx="24"
              cy="23"
              r="12"
              stroke="url(#waveGrad)"
              strokeWidth="1.5"
              strokeDasharray="2 3"
              className={animate ? 'radar-sweep-cell' : ''}
            />

            {/* Emergency Life Buoy / Crosshair Motif */}
            <circle
              cx="24"
              cy="23"
              r="7"
              stroke="#ffffff"
              strokeWidth="2.5"
              fill="#0f172a"
            />
            {/* Buoy Straps */}
            <path d="M24 16V20" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 26V30" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M17 23H21" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M27 23H31" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />

            {/* Central High-Intensity Beacon Star */}
            <circle cx="24" cy="23" r="3" fill="url(#beaconGrad)" />
            <circle cx="24" cy="23" r="1.2" fill="#ffffff" />

            {/* Top Tactical Signal Pulse */}
            <circle cx="24" cy="7" r="1.5" fill="#38bdf8" />
          </svg>
        </div>

        {/* Live Status indicator dot */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-950" />
        </span>
      </div>

      {/* Brand Typography & Badge */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight ${dim.textTitle} bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-sm`}
            >
              WHISPER
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-amber-300 border border-amber-500/40">
              TACTICAL RESCUE
            </span>
          </div>
          <span className={`text-slate-400 font-medium ${dim.textSub} tracking-tight`}>
            Autonomous Flood Dispatch &amp; Geocoding
          </span>
        </div>
      )}
    </div>
  );
};

export default AppLogo;
