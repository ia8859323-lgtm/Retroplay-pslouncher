import { useState, useRef, useEffect } from 'react';
import { GameItem } from '../types/launcher';
import { Search, X, Play, Terminal } from 'lucide-react';
import { audioService } from '../services/audioService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  games,
  onSelectGame,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? games.filter(
        (g) =>
          g.title.toLowerCase().includes(query.toLowerCase()) ||
          g.genre.some((gn) => gn.toLowerCase().includes(query.toLowerCase())) ||
          g.console.toLowerCase().includes(query.toLowerCase()) ||
          g.developer.toLowerCase().includes(query.toLowerCase())
      )
    : games.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/85 backdrop-blur-lg">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/10 bg-slate-950/50">
          <Search className="w-5 h-5 text-blue-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all consoles by title, genre, or developer..."
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => {
              audioService.playBack();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching games found for "{query}".
            </div>
          ) : (
            filtered.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  audioService.playSelect();
                  onSelectGame(game);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="w-10 h-14 rounded-lg object-cover flex-shrink-0 border border-white/10"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white truncate">{game.title}</h4>
                      <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                        {game.console}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {game.genre.join(', ')} • {game.releaseYear}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-white">
                  <span className="text-blue-300 font-mono font-bold">★ {game.rating.toFixed(1)}</span>
                  <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/10 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Click any title to jump to dashboard card</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
}
