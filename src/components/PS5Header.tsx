import { useState, useEffect } from 'react';
import {
  Gamepad2,
  Volume2,
  VolumeX,
  Radio,
  FolderOpen,
  Sparkles,
  Code2,
  BatteryCharging,
  Wifi,
  Search,
} from 'lucide-react';
import { audioService } from '../services/audioService';

interface PS5HeaderProps {
  gamepadConnected: boolean;
  controllerName: string;
  lastButton: string | null;
  onOpenScanner: () => void;
  onOpenScraper: () => void;
  onOpenAndroidCode: () => void;
  onOpenControllerModal: () => void;
  onSearchClick: () => void;
}

export function PS5Header({
  gamepadConnected,
  controllerName,
  lastButton,
  onOpenScanner,
  onOpenScraper,
  onOpenAndroidCode,
  onOpenControllerModal,
  onSearchClick,
}: PS5HeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAmbient = () => {
    const newState = audioService.toggleAmbient();
    setIsAmbientOn(newState);
    audioService.playSelect();
  };

  const handleToggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    audioService.setMuted(newMute);
    if (!newMute) {
      audioService.playSelect();
    }
  };

  return (
    <header className="relative z-30 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-md">
      {/* Brand & Console Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/20">
            <span className="font-extrabold text-white text-xs tracking-wider font-display">RP5</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold tracking-tight text-sm uppercase">RetroPlay</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">PlayStation 5 Edition for Android</p>
          </div>
        </div>

        {/* Gamepad Connection Badge */}
        <button
          onClick={onOpenControllerModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
            gamepadConnected
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20'
          }`}
          title="Click to view Controller Tester / Button Mapping"
        >
          <Gamepad2 className={`w-3.5 h-3.5 ${gamepadConnected ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
          <span className="max-w-[120px] truncate font-sans">
            {gamepadConnected ? controllerName || 'Gamepad Active' : 'No Gamepad (Keys: ←→↑↓)'}
          </span>
          {lastButton && (
            <span className="ml-1 text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded font-mono">
              {lastButton}
            </span>
          )}
        </button>
      </div>

      {/* Center Shortcuts & Tools */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 transition-all"
        >
          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>ROM Manager</span>
        </button>

        <button
          onClick={onOpenScraper}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Scraper</span>
        </button>

        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 transition-all"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Search</span>
          <kbd className="text-[10px] text-slate-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">△</kbd>
        </button>

        <button
          onClick={onOpenAndroidCode}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all shadow-sm shadow-amber-500/10"
        >
          <Code2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Android Source (Kotlin)</span>
        </button>
      </div>

      {/* Right Side: Audio controls & System HUD */}
      <div className="flex items-center gap-4">
        {/* Ambient PS5 Music Toggle */}
        <button
          onClick={handleToggleAmbient}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            isAmbientOn
              ? 'bg-blue-600/30 text-blue-300 border border-blue-400/50 shadow-md shadow-blue-500/20'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
          }`}
          title="Toggle PS5 Ambient Soundscape"
        >
          <Radio className={`w-3.5 h-3.5 ${isAmbientOn ? 'text-blue-400 animate-spin' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">PS5 Ambient</span>
          {isAmbientOn && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />}
        </button>

        {/* SFX Mute */}
        <button
          onClick={handleToggleMute}
          className="p-2 rounded-full text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Status Indicators */}
        <div className="hidden sm:flex items-center gap-3 text-slate-400 text-xs border-l border-white/10 pl-4">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div className="flex items-center gap-1">
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-mono text-slate-300">96%</span>
          </div>
          <div className="text-white font-semibold text-xs tracking-wider font-mono">
            {timeStr || '12:00'}
          </div>
        </div>

        {/* User Profile Avatar */}
        <div className="w-8 h-8 rounded-full border border-blue-400/40 overflow-hidden ring-2 ring-blue-500/20">
          <img
            src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80"
            alt="Player Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
