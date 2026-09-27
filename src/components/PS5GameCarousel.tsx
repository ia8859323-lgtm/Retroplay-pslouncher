import { useRef, useEffect } from 'react';
import { GameItem } from '../types/launcher';
import { CONSOLES } from '../data/consolesAndGames';
import { Heart } from 'lucide-react';
import { audioService } from '../services/audioService';

interface PS5GameCarouselProps {
  games: GameItem[];
  selectedIndex: number;
  onSelectGame: (index: number) => void;
  onConfirmGame: (game: GameItem) => void;
}

export function PS5GameCarousel({
  games,
  selectedIndex,
  onSelectGame,
  onConfirmGame,
}: PS5GameCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Smoothly scroll active card into view
  useEffect(() => {
    const activeEl = itemRefs.current[selectedIndex];
    if (activeEl && containerRef.current) {
      const container = containerRef.current;
      const scrollLeft = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  if (games.length === 0) {
    return (
      <div className="px-8 py-12 text-center text-slate-400">
        <p className="text-sm font-semibold">No games found for this filter.</p>
        <p className="text-xs text-slate-500 mt-1">Use the ROM Manager above to scan or drop your ROM files.</p>
      </div>
    );
  }

  return (
    <div className="relative z-20 px-8 py-4 overflow-visible">
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <span className="font-semibold tracking-wider uppercase text-slate-300">
          Library ({games.length} Titles)
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Game {selectedIndex + 1} of {games.length}
        </span>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={containerRef}
        className="flex items-end gap-5 overflow-x-auto no-scrollbar py-6 scroll-smooth select-none focus:outline-none"
        tabIndex={0}
      >
        {games.map((game, index) => {
          const isSelected = index === selectedIndex;
          const consoleMeta = CONSOLES.find((c) => c.id === game.console);

          return (
            <div
              key={game.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              onClick={() => {
                if (isSelected) {
                  onConfirmGame(game);
                } else {
                  audioService.playNavTick();
                  onSelectGame(index);
                }
              }}
              onMouseEnter={() => {
                if (!isSelected) {
                  audioService.playNavTick();
                  onSelectGame(index);
                }
              }}
              className={`group relative flex-shrink-0 cursor-pointer rounded-2xl transition-all duration-300 ease-out origin-bottom ${
                isSelected
                  ? 'w-44 sm:w-52 h-64 sm:h-76 ring-4 ring-white shadow-2xl shadow-blue-500/30 scale-110 z-30'
                  : 'w-36 sm:w-44 h-52 sm:h-64 opacity-70 hover:opacity-100 hover:scale-102 z-10'
              }`}
            >
              {/* Card Container */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg">
                {/* Cover Artwork */}
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Shading / Gradient overlay on bottom of card */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Console System Tag Pill */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-950/80 text-white backdrop-blur-md border border-white/10 shadow-sm font-display tracking-wider">
                    {consoleMeta?.shortName || game.console.toUpperCase()}
                  </span>
                </div>

                {/* Favorite badge */}
                {game.favorite && (
                  <div className="absolute top-2.5 right-2.5 p-1 rounded-full bg-slate-950/70 text-rose-400 backdrop-blur-md border border-white/10 shadow-sm">
                    <Heart className="w-3 h-3 fill-current text-rose-500" />
                  </div>
                )}

                {/* Card Title & Core info */}
                <div className="absolute bottom-0 inset-x-0 p-3 space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2 drop-shadow">
                    {game.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                    <span>{game.releaseYear}</span>
                    <span className="font-mono text-blue-300">★ {game.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Active Indicator Pulse Ring */}
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-blue-400/40 rounded-2xl pointer-events-none" />
                )}
              </div>

              {/* Reflection Floor Glow on active item */}
              {isSelected && (
                <div className="absolute -bottom-4 inset-x-4 h-3 bg-blue-500/20 blur-md rounded-full pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
