import { ConsoleType, EmulatorProfile, GameItem } from '../types/launcher';
import { CONSOLES, EMULATOR_PROFILES, INITIAL_GAMES } from '../data/consolesAndGames';

const STORAGE_KEY = 'retroplay_user_games_v1';

export function detectConsoleFromFilename(filename: string): ConsoleType {
  const lower = filename.toLowerCase();
  const ext = lower.slice(lower.lastIndexOf('.'));

  if (['.iso', '.cso', '.pbp'].includes(ext)) {
    // Could be PSP or PS1 or PS2. Check hints in name
    if (lower.includes('psp')) return 'psp';
    if (lower.includes('ps1') || lower.includes('psx')) return 'ps1';
    if (lower.includes('ps2')) return 'ps2';
    return 'psp';
  }
  if (['.chd', '.bin', '.cue'].includes(ext)) {
    if (lower.includes('saturn')) return 'sega';
    if (lower.includes('dreamcast') || lower.includes('dc')) return 'dreamcast';
    return 'ps1';
  }
  if (ext === '.gba') return 'gba';
  if (ext === '.nds') return 'nds';
  if (['.z64', '.n64', '.v64'].includes(ext)) return 'n64';
  if (['.sfc', '.smc'].includes(ext)) return 'snes';
  if (['.nes'].includes(ext)) return 'nes';
  if (['.md', '.gen', '.smd'].includes(ext)) return 'sega';
  if (['.cdi', '.gdi'].includes(ext)) return 'dreamcast';

  return 'all';
}

export function cleanGameTitle(filename: string): string {
  // Remove extension
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  // Remove common dumping tags like (USA), [!], (Rev 1), [En,Fr,De], (Track 1)
  const cleaned = withoutExt
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || withoutExt;
}

export function getDefaultEmulatorForConsole(consoleType: ConsoleType): EmulatorProfile {
  switch (consoleType) {
    case 'psp':
      return EMULATOR_PROFILES.ppsspp;
    case 'ps1':
      return EMULATOR_PROFILES.duckstation;
    case 'gba':
      return EMULATOR_PROFILES.retroarch_mgba;
    case 'n64':
      return EMULATOR_PROFILES.mupen64plus;
    case 'snes':
      return EMULATOR_PROFILES.retroarch_snes9x;
    case 'nes':
      return EMULATOR_PROFILES.retroarch_fceumm;
    case 'sega':
      return EMULATOR_PROFILES.retroarch_genesis;
    case 'nds':
      return EMULATOR_PROFILES.drastic;
    case 'dreamcast':
      return EMULATOR_PROFILES.flycast;
    default:
      return EMULATOR_PROFILES.retroarch_mgba;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export class RomScannerService {
  public loadLibrary(): GameItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_GAMES;
  }

  public saveLibrary(games: GameItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch {}
  }

  public resetToDefault(): GameItem[] {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return INITIAL_GAMES;
  }

  public createGameFromRomFile(
    file: File,
    customPath?: string,
    forcedConsole?: ConsoleType
  ): GameItem {
    const consoleType = (forcedConsole && forcedConsole !== 'all')
      ? forcedConsole
      : detectConsoleFromFilename(file.name);

    const title = cleanGameTitle(file.name);
    const consoleMeta = CONSOLES.find(c => c.id === consoleType) || CONSOLES[0];
    const emulator = getDefaultEmulatorForConsole(consoleType);
    const sizeStr = formatBytes(file.size);
    const filePath = customPath || `/storage/emulated/0/ROMs/${consoleType}/${file.name}`;

    // Sample gaming placeholder artwork based on console theme
    const fallbackBanners: Record<string, string> = {
      psp: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
      ps1: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
      gba: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1920&q=80',
      n64: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      snes: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=1920&q=80',
      nes: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80',
      sega: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1920&q=80',
      nds: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1920&q=80',
      dreamcast: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80',
    };

    const fallbackCovers: Record<string, string> = {
      psp: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      ps1: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      gba: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=600&q=80',
      n64: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
      snes: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=600&q=80',
      nes: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      sega: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
      nds: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
      dreamcast: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    };

    const newGame: GameItem = {
      id: `scanned-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      console: consoleType === 'all' ? 'ps1' : consoleType,
      releaseYear: 2000,
      publisher: consoleMeta.company,
      developer: 'Unknown Developer',
      genre: ['Action', 'Retro Classic'],
      rating: 8.8,
      criticScore: 85,
      description: `Scanned local ROM title for ${consoleMeta.name}. Ready to launch via external core ${emulator.name}.`,
      romFileName: file.name,
      romFilePath: filePath,
      romFileSize: sizeStr,
      lastPlayed: 'Just Scanned',
      playTimeMinutes: 0,
      favorite: false,
      coverUrl: fallbackCovers[consoleType] || fallbackCovers.ps1,
      bannerUrl: fallbackBanners[consoleType] || fallbackBanners.ps1,
      screenshotUrls: [],
      emulator,
      isUserImported: true,
      trophies: { platinum: 0, gold: 2, silver: 5, bronze: 10 },
      completionPercent: 0,
    };

    return newGame;
  }
}

export const romScannerService = new RomScannerService();
