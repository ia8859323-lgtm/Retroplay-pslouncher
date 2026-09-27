import { ConsoleType, ScraperResult } from '../types/launcher';

const MOCK_SCRAPER_DB: ScraperResult[] = [
  {
    title: 'Silent Hill',
    console: 'ps1',
    releaseYear: 1999,
    publisher: 'Konami',
    developer: 'Team Silent',
    genre: ['Survival Horror', 'Psychological Horror'],
    rating: 9.6,
    description: 'Harry Mason frantically searches for his missing adopted daughter Cheryl in the fog-drenched, nightmare-plagued town of Silent Hill. Landmark psychological horror.',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    source: 'ScreenScraper',
  },
  {
    title: 'Super Mario 64',
    console: 'n64',
    releaseYear: 1996,
    publisher: 'Nintendo',
    developer: 'Nintendo EAD',
    genre: ['Platformer', '3D Adventure'],
    rating: 9.8,
    description: 'The revolutionary milestone that established the golden standard for 3D camera controls and movement in video games. Collect 120 Power Stars to rescue Princess Peach.',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1920&q=80',
    source: 'IGDB',
  },
  {
    title: 'The Legend of Zelda: The Minish Cap',
    console: 'gba',
    releaseYear: 2004,
    publisher: 'Nintendo',
    developer: 'Capcom / Flagship',
    genre: ['Action-Adventure', 'Puzzle'],
    rating: 9.4,
    description: 'Shrink Link down to microscopic size with the aid of the magical talking cap Ezlo. Vibrant pixel art and inventive dungeon designs celebrate one of GBA’s finest quests.',
    coverUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80',
    source: 'ScreenScraper',
  },
  {
    title: 'Crisis Core: Final Fantasy VII',
    console: 'psp',
    releaseYear: 2007,
    publisher: 'Square Enix',
    developer: 'Square Enix',
    genre: ['Action RPG', 'Cinematic'],
    rating: 9.3,
    description: 'Witness the emotional journey of Zack Fair, SOLDIER 1st Class, his bond with Sephiroth, and the fateful legacy of the Buster Sword passed to Cloud Strife.',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    source: 'IGDB',
  },
  {
    title: 'Super Metroid',
    console: 'snes',
    releaseYear: 1994,
    publisher: 'Nintendo',
    developer: 'Nintendo R&D1',
    genre: ['Action-Adventure', 'Sci-Fi'],
    rating: 9.9,
    description: 'Descend into the subterranean depths of planet Zebes as bounty hunter Samus Aran. Flawless environmental storytelling and unmatched atmospheric isolation.',
    coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    source: 'ScreenScraper',
  },
  {
    title: 'Tekken 3',
    console: 'ps1',
    releaseYear: 1998,
    publisher: 'Namco',
    developer: 'Namco',
    genre: ['Fighting', '3D Combat'],
    rating: 9.7,
    description: 'The pinnacle of 3D fighting games of the 32-bit era. Introducing Jin Kazama, Ling Xiaoyu, Eddy Gordo, and Hwoarang with blazing 60 FPS combat.',
    coverUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
    source: 'IGDB',
  },
  {
    title: 'Grand Theft Auto: Liberty City Stories',
    console: 'psp',
    releaseYear: 2005,
    publisher: 'Rockstar Games',
    developer: 'Rockstar Leeds',
    genre: ['Open World', 'Action'],
    rating: 9.1,
    description: 'Toni Cipriani returns to Liberty City to bring the Leone crime family back to dominance in an uncompromised full open-world portable marvel.',
    coverUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80',
    source: 'ScreenScraper',
  },
];

export async function searchMetadataScraper(
  query: string,
  consoleType?: ConsoleType
): Promise<ScraperResult[]> {
  // Simulate network scrape latency
  await new Promise(resolve => setTimeout(resolve, 450));

  const cleanQ = query.toLowerCase().trim();
  const filtered = MOCK_SCRAPER_DB.filter(item => {
    const matchesTitle = item.title.toLowerCase().includes(cleanQ);
    const matchesConsole = !consoleType || consoleType === 'all' || item.console === consoleType;
    return matchesTitle && matchesConsole;
  });

  if (filtered.length > 0) {
    return filtered;
  }

  // Dynamic fallback scraper item if not in preset db
  return [
    {
      title: query,
      console: consoleType && consoleType !== 'all' ? consoleType : 'ps1',
      releaseYear: 2001,
      publisher: 'Publisher Online Database',
      developer: 'Retro Development Studio',
      genre: ['Action', 'Adventure', 'Arcade'],
      rating: 9.0,
      description: `Discovered metadata record for "${query}" matched from ScreenScraper v2 API with high-resolution box cover and 1080p backdrop assets.`,
      coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      source: 'ScreenScraper',
    },
  ];
}
