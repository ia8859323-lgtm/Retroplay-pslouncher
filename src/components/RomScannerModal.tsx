import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { GameItem, ConsoleType } from '../types/launcher';
import { CONSOLES } from '../data/consolesAndGames';
import { romScannerService, formatBytes } from '../services/romScanner';
import { audioService } from '../services/audioService';
import {
  X,
  UploadCloud,
  FolderSearch,
  HardDrive,
  Trash2,
  RotateCcw,
  CheckCircle2,
  FileCode,
  Sparkles,
  Plus,
} from 'lucide-react';

interface RomScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
  onUpdateGames: (newGames: GameItem[]) => void;
}

export function RomScannerModal({
  isOpen,
  onClose,
  games,
  onUpdateGames,
}: RomScannerModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [scannedNotice, setScannedNotice] = useState<string | null>(null);
  const [selectedConsoleFilter, setSelectedConsoleFilter] = useState<ConsoleType>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    audioService.playSelect();
    const newItems: GameItem[] = [];
    let addedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check if already in library
      const existing = games.some(g => g.romFileName.toLowerCase() === file.name.toLowerCase());
      if (!existing) {
        const item = romScannerService.createGameFromRomFile(
          file,
          `/storage/emulated/0/ROMs/${file.name}`,
          selectedConsoleFilter !== 'all' ? selectedConsoleFilter : undefined
        );
        newItems.push(item);
        addedCount++;
      }
    }

    if (newItems.length > 0) {
      const updated = [...newItems, ...games];
      onUpdateGames(updated);
      romScannerService.saveLibrary(updated);
      setScannedNotice(`Successfully indexed ${addedCount} new ROM file${addedCount > 1 ? 's' : ''}!`);
    } else {
      setScannedNotice('All selected ROMs are already in your library.');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDeleteGame = (id: string) => {
    audioService.playBack();
    const updated = games.filter(g => g.id !== id);
    onUpdateGames(updated);
    romScannerService.saveLibrary(updated);
  };

  const handleResetDefaults = () => {
    audioService.playSelect();
    const defaults = romScannerService.resetToDefault();
    onUpdateGames(defaults);
    setScannedNotice('Reset to default curated library.');
  };

  // Add demo sample ROM
  const handleAddSampleRom = (consoleType: ConsoleType) => {
    audioService.playSelect();
    const sampleNames: Record<string, string> = {
      psp: 'Monster_Hunter_Freedom_Unite.iso',
      ps1: 'Crash_Bandicoot_Warped.chd',
      gba: 'Metroid_Fusion.gba',
      n64: 'Super_Smash_Bros.z64',
      snes: 'Donkey_Kong_Country.sfc',
      nes: 'Castlevania_III.nes',
      sega: 'Streets_of_Rage_2.md',
      nds: 'Mario_Kart_DS.nds',
      dreamcast: 'Shenmue_Disc1.gdi',
    };

    const fileName = sampleNames[consoleType] || 'RetroGame.rom';
    const fakeFile = new File([''], fileName, { type: 'application/octet-stream' });
    Object.defineProperty(fakeFile, 'size', { value: 450 * 1024 * 1024 });

    const newGame = romScannerService.createGameFromRomFile(fakeFile, undefined, consoleType);
    const updated = [newGame, ...games];
    onUpdateGames(updated);
    romScannerService.saveLibrary(updated);
    setScannedNotice(`Added simulated ROM: ${newGame.title}`);
  };

  const filteredGames = selectedConsoleFilter === 'all'
    ? games
    : games.filter(g => g.console === selectedConsoleFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-lg">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FolderSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Storage ROM Manager & Scanner</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                  {games.length} Games
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Index local internal storage and SD card directories across all emulator formats
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
          {/* Notification notice */}
          {scannedNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{scannedNotice}</span>
              </div>
              <button onClick={() => setScannedNotice(null)} className="text-emerald-400 hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".iso,.cso,.bin,.cue,.gba,.nds,.z64,.n64,.nes,.smc,.sfc,.zip,.chd,.pbp,.gdi,.cdi"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Drag & Drop ROM Files or Click to Browse Local Storage
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              Auto-detects console by extension: <code className="text-blue-300 font-mono">.iso, .cso, .chd, .gba, .nds, .z64, .sfc, .nes, .md, .zip</code>
            </p>
          </div>

          {/* Console Filter Pills & Quick Sample Adders */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {CONSOLES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConsoleFilter(c.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedConsoleFilter === c.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {c.shortName}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddSampleRom(selectedConsoleFilter !== 'all' ? selectedConsoleFilter : 'ps1')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 border border-white/10 transition-colors"
                title="Add a sample game to test"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Quick Test ROM</span>
              </button>

              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-xs font-medium text-slate-400 hover:text-rose-300 border border-white/10 transition-colors"
                title="Reset library to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Scanned ROMs Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-2">
              <span>Game Title ({filteredGames.length} in view)</span>
              <span>Emulator & Size</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
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
                        {game.isUserImported && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                            Imported
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {game.romFileName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-mono text-slate-300">{game.romFileSize}</p>
                      <p className="text-[10px] text-slate-500">{game.emulator.name}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove from launcher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-950/40">
          <span className="text-xs text-slate-400">
            Storage Access Framework (SAF) ready for Android Scoped Storage
          </span>
          <button
            onClick={() => {
              audioService.playBack();
              onClose();
            }}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
