import { useState, useMemo, useCallback } from 'react';
import { GameItem, ConsoleType } from './types/launcher';
import { CONSOLES } from './data/consolesAndGames';
import { romScannerService } from './services/romScanner';
import { audioService } from './services/audioService';
import { useGamepad } from './hooks/useGamepad';

import { PS5Header } from './components/PS5Header';
import { ConsoleCategoryBar } from './components/ConsoleCategoryBar';
import { PS5HeroBackground } from './components/PS5HeroBackground';
import { PS5GameCarousel } from './components/PS5GameCarousel';
import { IntentLauncherModal } from './components/IntentLauncherModal';
import { RomScannerModal } from './components/RomScannerModal';
import { MetadataScraperModal } from './components/MetadataScraperModal';
import { AndroidCodeViewerModal } from './components/AndroidCodeViewerModal';
import { ControllerVisualizerModal } from './components/ControllerVisualizerModal';
import { SearchModal } from './components/SearchModal';

export default function App() {
  const [games, setGames] = useState<GameItem[]>(() => romScannerService.loadLibrary());
  const [selectedConsole, setSelectedConsole] = useState<ConsoleType>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Modals
  const [intentGame, setIntentGame] = useState<GameItem | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scrapeGame, setScrapeGame] = useState<GameItem | null>(null);
  const [isAndroidCodeOpen, setIsAndroidCodeOpen] = useState(false);
  const [isControllerModalOpen, setIsControllerModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filtered games based on selected console
  const filteredGames = useMemo(() => {
    if (selectedConsole === 'all') return games;
    return games.filter((g) => g.console === selectedConsole);
  }, [games, selectedConsole]);

  // Active game safely bounded
  const activeGame = filteredGames[selectedIndex] || filteredGames[0] || null;

  // Counts for each console
  const gameCounts = useMemo(() => {
    const counts: Record<string, number> = { all: games.length };
    games.forEach((g) => {
      counts[g.console] = (counts[g.console] || 0) + 1;
    });
    return counts;
  }, [games]);

  // Console category switcher handlers (L1 / R1)
  const handleNextConsole = useCallback(() => {
    const currentIndex = CONSOLES.findIndex((c) => c.id === selectedConsole);
    const nextIndex = (currentIndex + 1) % CONSOLES.length;
    setSelectedConsole(CONSOLES[nextIndex].id);
    setSelectedIndex(0);
    audioService.playBumper();
  }, [selectedConsole]);

  const handlePrevConsole = useCallback(() => {
    const currentIndex = CONSOLES.findIndex((c) => c.id === selectedConsole);
    const prevIndex = (currentIndex - 1 + CONSOLES.length) % CONSOLES.length;
    setSelectedConsole(CONSOLES[prevIndex].id);
    setSelectedIndex(0);
    audioService.playBumper();
  }, [selectedConsole]);

  // Gamepad navigation callbacks
  const handleNavLeft = useCallback(() => {
    if (filteredGames.length === 0) return;
    setSelectedIndex((prev) => {
      const next = prev > 0 ? prev - 1 : filteredGames.length - 1;
      audioService.playNavTick();
      return next;
    });
  }, [filteredGames.length]);

  const handleNavRight = useCallback(() => {
    if (filteredGames.length === 0) return;
    setSelectedIndex((prev) => {
      const next = prev < filteredGames.length - 1 ? prev + 1 : 0;
      audioService.playNavTick();
      return next;
    });
  }, [filteredGames.length]);

  const handleConfirm = useCallback(() => {
    if (activeGame) {
      setIntentGame(activeGame);
    }
  }, [activeGame]);

  const handleBack = useCallback(() => {
    if (intentGame) setIntentGame(null);
    else if (isScannerOpen) setIsScannerOpen(false);
    else if (scrapeGame) setScrapeGame(null);
    else if (isAndroidCodeOpen) setIsAndroidCodeOpen(false);
    else if (isControllerModalOpen) setIsControllerModalOpen(false);
    else if (isSearchOpen) setIsSearchOpen(false);
    else audioService.playBack();
  }, [
    intentGame,
    isScannerOpen,
    scrapeGame,
    isAndroidCodeOpen,
    isControllerModalOpen,
    isSearchOpen,
  ]);

  const handleActionX = useCallback(() => {
    if (activeGame) {
      setIntentGame(activeGame);
    }
  }, [activeGame]);

  const handleActionY = useCallback(() => {
    setIsSearchOpen(true);
    audioService.playNavTick();
  }, []);

  const handleOptions = useCallback(() => {
    setIsScannerOpen(true);
    audioService.playSelect();
  }, []);

  // Hook for hardware gamepads & keyboard
  const { isConnected, controllerName, lastButton, triggerHaptic } = useGamepad({
    onLeft: handleNavLeft,
    onRight: handleNavRight,
    onConfirm: handleConfirm,
    onBack: handleBack,
    onActionX: handleActionX,
    onActionY: handleActionY,
    onBumperL1: handlePrevConsole,
    onBumperR1: handleNextConsole,
    onOptions: handleOptions,
  });

  // Toggle favorite
  const handleToggleFavorite = () => {
    if (!activeGame) return;
    audioService.playSelect();
    const updated = games.map((g) =>
      g.id === activeGame.id ? { ...g, favorite: !g.favorite } : g
    );
    setGames(updated);
    romScannerService.saveLibrary(updated);
  };

  // Update Game after scraper
  const handleUpdateGame = (updated: GameItem) => {
    const nextGames = games.map((g) => (g.id === updated.id ? updated : g));
    setGames(nextGames);
    romScannerService.saveLibrary(nextGames);
    setScrapeGame(null);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden select-none font-sans">
      {/* 1. PS5 Top Header HUD */}
      <PS5Header
        gamepadConnected={isConnected}
        controllerName={controllerName}
        lastButton={lastButton}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenScraper={() => {
          if (activeGame) setScrapeGame(activeGame);
        }}
        onOpenAndroidCode={() => setIsAndroidCodeOpen(true)}
        onOpenControllerModal={() => setIsControllerModalOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {/* 2. Console Category Tabs Bar */}
      <ConsoleCategoryBar
        consoles={CONSOLES}
        selectedConsole={selectedConsole}
        onSelectConsole={(c) => {
          setSelectedConsole(c);
          setSelectedIndex(0);
        }}
        gameCounts={gameCounts}
      />

      {/* 3. PS5 Dynamic Background Crossfade & Hero Game Details */}
      <main className="flex-1 flex flex-col justify-between">
        <PS5HeroBackground
          activeGame={activeGame}
          onPlayClick={() => {
            if (activeGame) setIntentGame(activeGame);
          }}
          onIntentClick={() => {
            if (activeGame) setIntentGame(activeGame);
          }}
          onScrapeClick={() => {
            if (activeGame) setScrapeGame(activeGame);
          }}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* 4. Horizontal Scrolling Game Carousel (PS5 Style) */}
        <PS5GameCarousel
          games={filteredGames}
          selectedIndex={selectedIndex}
          onSelectGame={(idx) => setSelectedIndex(idx)}
          onConfirmGame={(game) => setIntentGame(game)}
        />
      </main>

      {/* Bottom Button Prompt HUD (PS5 Legend) */}
      <footer className="relative z-20 px-8 py-3 bg-slate-950/90 border-t border-white/5 backdrop-blur-md flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">✕</span>
            <span>Enter / Play</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">◯</span>
            <span>Back</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">△</span>
            <span>Search</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-[10px]">▢</span>
            <span>Intent Config</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-[10px]">L1 / R1</kbd>
            <span>Change Console</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsControllerModalOpen(true)}
            className="hover:text-white transition-colors"
          >
            Gamepad Mapping
          </button>
          <span>•</span>
          <button
            onClick={() => setIsAndroidCodeOpen(true)}
            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            Android Kotlin Code
          </button>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <IntentLauncherModal
        game={intentGame}
        onClose={() => setIntentGame(null)}
        gamepadConnected={isConnected}
      />

      <RomScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        games={games}
        onUpdateGames={(newGames) => {
          setGames(newGames);
          setSelectedIndex(0);
        }}
      />

      <MetadataScraperModal
        game={scrapeGame}
        isOpen={!!scrapeGame}
        onClose={() => setScrapeGame(null)}
        onUpdateGame={handleUpdateGame}
      />

      <AndroidCodeViewerModal
        isOpen={isAndroidCodeOpen}
        onClose={() => setIsAndroidCodeOpen(false)}
      />

      <ControllerVisualizerModal
        isOpen={isControllerModalOpen}
        onClose={() => setIsControllerModalOpen(false)}
        gamepadConnected={isConnected}
        controllerName={controllerName}
        lastButton={lastButton}
        onTriggerHaptic={() => triggerHaptic(120, 0.7)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        games={games}
        onSelectGame={(game) => {
          setSelectedConsole('all');
          const idx = games.findIndex((g) => g.id === game.id);
          if (idx !== -1) {
            setSelectedIndex(idx);
          }
        }}
      />
    </div>
  );
}
