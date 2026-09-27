import { ConsoleMeta, ConsoleType } from '../types/launcher';
import { audioService } from '../services/audioService';

interface ConsoleCategoryBarProps {
  consoles: ConsoleMeta[];
  selectedConsole: ConsoleType;
  onSelectConsole: (id: ConsoleType) => void;
  gameCounts: Record<string, number>;
}

export function ConsoleCategoryBar({
  consoles,
  selectedConsole,
  onSelectConsole,
  gameCounts,
}: ConsoleCategoryBarProps) {
  const handleSelect = (id: ConsoleType) => {
    if (id !== selectedConsole) {
      audioService.playBumper();
      onSelectConsole(id);
    }
  };

  return (
    <div className="relative z-20 px-8 pt-4 pb-2 flex items-center justify-between">
      {/* Category Tabs Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
        {/* L1 Prompt for Gamepad */}
        <div className="hidden sm:flex items-center justify-center h-7 px-2 text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 rounded-md select-none font-mono">
          L1
        </div>

        {consoles.map((console) => {
          const isSelected = console.id === selectedConsole;
          const count = gameCounts[console.id] || 0;

          return (
            <button
              key={console.id}
              onClick={() => handleSelect(console.id)}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-white text-slate-950 shadow-lg shadow-white/20 scale-105'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <span>{console.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-slate-950/20 text-slate-900' : 'bg-white/10 text-slate-400'
                }`}
              >
                {count}
              </span>
              {isSelected && (
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400"
                />
              )}
            </button>
          );
        })}

        {/* R1 Prompt for Gamepad */}
        <div className="hidden sm:flex items-center justify-center h-7 px-2 text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 rounded-md select-none font-mono">
          R1
        </div>
      </div>
    </div>
  );
}
