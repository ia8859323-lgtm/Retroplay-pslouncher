export type ConsoleType =
  | 'all'
  | 'psp'
  | 'ps1'
  | 'ps2'
  | 'gba'
  | 'n64'
  | 'snes'
  | 'nes'
  | 'sega'
  | 'nds'
  | 'dreamcast';

export interface ConsoleMeta {
  id: ConsoleType;
  name: string;
  shortName: string;
  badge: string;
  company: string;
  defaultEmulator: string;
  defaultPackage: string;
  extensions: string[];
  color: string;
  accentColor: string;
}

export interface EmulatorProfile {
  id: string;
  name: string;
  packageName: string;
  activityName?: string;
  action: string;
  dataUriPattern: string;
  extraFlags: Record<string, string>;
  notes?: string;
}

export interface GameTrophies {
  platinum: number;
  gold: number;
  silver: number;
  bronze: number;
}

export interface GameItem {
  id: string;
  title: string;
  originalTitle?: string;
  console: ConsoleType;
  releaseYear: number;
  publisher: string;
  developer: string;
  genre: string[];
  rating: number; // e.g. 9.5
  criticScore?: number; // e.g. 94
  description: string;
  romFileName: string;
  romFilePath: string;
  romFileSize: string;
  lastPlayed?: string;
  playTimeMinutes: number;
  favorite: boolean;
  coverUrl: string;
  bannerUrl: string;
  logoUrl?: string;
  screenshotUrls: string[];
  emulator: EmulatorProfile;
  trophies?: GameTrophies;
  completionPercent?: number;
  customNotes?: string;
  isUserImported?: boolean;
}

export interface ScraperResult {
  title: string;
  console: ConsoleType;
  releaseYear: number;
  publisher: string;
  developer: string;
  genre: string[];
  rating: number;
  description: string;
  coverUrl: string;
  bannerUrl: string;
  source: 'ScreenScraper' | 'IGDB' | 'RetroArch Thumbnails';
}
