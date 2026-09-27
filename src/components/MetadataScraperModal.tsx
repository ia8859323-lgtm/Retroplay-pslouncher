import { useState, useEffect } from 'react';
import { GameItem, ScraperResult } from '../types/launcher';
import { searchMetadataScraper } from '../services/scraperService';
import { audioService } from '../services/audioService';
import { romScannerService } from '../services/romScanner';
import {
  X,
  Sparkles,
  Search,
  Check,
  Globe,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface MetadataScraperModalProps {
  game: GameItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateGame: (updated: GameItem) => void;
}

export function MetadataScraperModal({
  game,
  isOpen,
  onClose,
  onUpdateGame,
}: MetadataScraperModalProps) {
  const [query, setQuery] = useState(game?.title || '');
  const [results, setResults] = useState<ScraperResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScraperResult | null>(null);

  // Manual image overrides
  const [customCover, setCustomCover] = useState(game?.coverUrl || '');
  const [customBanner, setCustomBanner] = useState(game?.bannerUrl || '');

  useEffect(() => {
    if (game && isOpen) {
      setQuery(game.title);
      setCustomCover(game.coverUrl);
      setCustomBanner(game.bannerUrl);
      setSelectedResult(null);
      setResults([]);
    }
  }, [game, isOpen]);

  if (!isOpen || !game) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    audioService.playNavTick();
    try {
      const data = await searchMetadataScraper(query, game.console);
      setResults(data);
      if (data.length > 0) {
        setSelectedResult(data[0]);
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const handleApply = () => {
    audioService.playSelect();
    const updated: GameItem = {
      ...game,
      title: selectedResult ? selectedResult.title : game.title,
      description: selectedResult ? selectedResult.description : game.description,
      releaseYear: selectedResult ? selectedResult.releaseYear : game.releaseYear,
      developer: selectedResult ? selectedResult.developer : game.developer,
      publisher: selectedResult ? selectedResult.publisher : game.publisher,
      genre: selectedResult ? selectedResult.genre : game.genre,
      rating: selectedResult ? selectedResult.rating : game.rating,
      coverUrl: customCover || (selectedResult ? selectedResult.coverUrl : game.coverUrl),
      bannerUrl: customBanner || (selectedResult ? selectedResult.bannerUrl : game.bannerUrl),
    };

    onUpdateGame(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-lg">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Online Metadata Scraper</span>
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono uppercase">
                  {game.console}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Scrape box art, 4K banners, descriptions, and ratings from ScreenScraper & IGDB
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioService.playBack();
              onClose();
            }}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search game title (e.g. Silent Hill, God of War)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400/60"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-all active:scale-95"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Scrape</span>
            </button>
          </form>

          {/* Results Grid */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Found {results.length} Database Matches
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {results.map((res, i) => {
                  const isSelected = selectedResult === res;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedResult(res);
                        setCustomCover(res.coverUrl);
                        setCustomBanner(res.bannerUrl);
                        audioService.playNavTick();
                      }}
                      className={`cursor-pointer p-3 rounded-xl border flex gap-3 transition-all ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/60 shadow-md shadow-purple-500/20 ring-1 ring-purple-500/50'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <img
                        src={res.coverUrl}
                        alt={res.title}
                        className="w-14 h-18 rounded-lg object-cover flex-shrink-0 border border-white/10"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{res.title}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                            {res.releaseYear}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {res.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-purple-300">
                          <Globe className="w-3 h-3" />
                          <span>Source: {res.source}</span>
                          <span>• ★ {res.rating}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Art Preview & Custom URLs */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Cover & Background Artwork Preview</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cover Preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400">Front Box Artwork</span>
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-800 border border-white/10">
                  <img
                    src={customCover || game.coverUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="text"
                  value={customCover}
                  onChange={(e) => setCustomCover(e.target.value)}
                  placeholder="Custom Cover Image URL..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 focus:outline-none"
                />
              </div>

              {/* Banner Preview */}
              <div className="sm:col-span-2 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400">High-Res PS5 Wallpaper Banner</span>
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-800 border border-white/10">
                  <img
                    src={customBanner || game.bannerUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="text"
                  value={customBanner}
                  onChange={(e) => setCustomBanner(e.target.value)}
                  placeholder="Custom 1080p Wallpaper URL..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-slate-950/40">
          <button
            onClick={() => {
              audioService.playBack();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Metadata</span>
          </button>
        </div>
      </div>
    </div>
  );
}
