import { Play, Terminal, Sparkles, Heart, Trophy, HardDrive, Clock } from 'lucide-react';
import { GameItem } from '../types/launcher';
import { CONSOLES } from '../data/consolesAndGames';

interface PS5HeroBackgroundProps {
  activeGame: GameItem | null;
  onPlayClick: () => void;
  onIntentClick: () => void;
  onScrapeClick: () => void;
  onToggleFavorite: () => void;
}

export function PS5HeroBackground({
  activeGame,
  onPlayClick,
  onIntentClick,
  onScrapeClick,
  onToggleFavorite,
}: PS5HeroBackgroundProps) {
  if (!activeGame) return null;

  const consoleMeta = CONSOLES.find((c) => c.id === activeGame.console);

  return (
    <div className="relative w-full min-h-[460px] lg:min-h-[520px] flex flex-col justify-end px-8 pb-8 pt-4 overflow-hidden select-none">
      {/* Dynamic Background Image with Smooth CSS Crossfade Transition */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          key={activeGame.bannerUrl}
          src={activeGame.bannerUrl}
          alt={activeGame.title}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-700 ease-out brightness-[0.75]"
        />

        {/* Cinematic Vignette, Radial Glow, and Bottom Shadow Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,transparent_0%,rgba(2,6,23,0.85)_80%)]" />
      </div>

      {/* Foreground Content: Game HUD Details */}
      <div className="relative z-10 max-w-4xl space-y-4">
        {/* System Pill & Genre Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500 text-white shadow-md shadow-blue-500/30">
            {consoleMeta?.shortName || activeGame.console.toUpperCase()}
          </span>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10 backdrop-blur-md">
            {activeGame.releaseYear}
          </span>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10 backdrop-blur-md">
            ★ {activeGame.rating.toFixed(1)} / 10
          </span>

          {activeGame.criticScore && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {activeGame.criticScore} Metascore
            </span>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 ml-2">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeGame.romFileSize}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 ml-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{Math.floor(activeGame.playTimeMinutes / 60)}h {activeGame.playTimeMinutes % 60}m played</span>
          </div>
        </div>

        {/* Game Title Heading */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            {activeGame.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Developed by {activeGame.developer} • Published by {activeGame.publisher}
          </p>
        </div>

        {/* Synopsis / Description */}
        <p className="text-sm sm:text-base text-slate-300/90 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-2xl font-normal drop-shadow">
          {activeGame.description}
        </p>

        {/* Trophy & Completion HUD */}
        {activeGame.trophies && (
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-black/40 px-3 py-1 rounded-lg border border-white/5 backdrop-blur-sm">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">{activeGame.completionPercent || 0}% Complete</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-300 font-mono">🏆 {activeGame.trophies.platinum}</span>
              <span className="text-amber-400 font-mono">🥇 {activeGame.trophies.gold}</span>
              <span className="text-slate-300 font-mono">🥈 {activeGame.trophies.silver}</span>
              <span className="text-amber-700 font-mono">🥉 {activeGame.trophies.bronze}</span>
            </div>

            <span className="text-xs text-slate-400 hidden sm:inline">
              Core: <code className="text-blue-300 font-mono">{activeGame.emulator.name}</code>
            </span>
          </div>
        )}

        {/* PS5 Style Primary Action Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          {/* Primary Play Button */}
          <button
            onClick={onPlayClick}
            className="group relative flex items-center gap-3 px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-white/20 transition-all duration-200 active:scale-95"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">
              ✕
            </div>
            <span>Play Game</span>
            <Play className="w-4 h-4 fill-current text-slate-950 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Android Intent Inspector Button */}
          <button
            onClick={onIntentClick}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white text-sm font-semibold border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-md"
            title="Inspect Android Intent & Launch parameters"
          >
            <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px] border border-white/20">
              ▢
            </div>
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Intent Launcher</span>
          </button>

          {/* Scrape Metadata Button */}
          <button
            onClick={onScrapeClick}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white text-sm font-semibold border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-md"
            title="Scrape covers, backdrop & details from online database"
          >
            <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px] border border-white/20">
              △
            </div>
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Scrape</span>
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={onToggleFavorite}
            className={`p-3 rounded-full border transition-all active:scale-90 ${
              activeGame.favorite
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/20'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
            }`}
            title="Toggle Favorite"
          >
            <Heart className={`w-4 h-4 ${activeGame.favorite ? 'fill-current text-rose-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
