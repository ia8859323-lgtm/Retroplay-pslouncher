import { useState, useEffect, useRef } from 'react';
import { GameItem } from '../types/launcher';
import {
  X,
  Copy,
  Check,
  Play,
  Terminal,
  Settings,
  Tv,
  Gamepad,
  Sparkles,
} from 'lucide-react';
import { audioService } from '../services/audioService';

interface IntentLauncherModalProps {
  game: GameItem | null;
  onClose: () => void;
  gamepadConnected: boolean;
}

export function IntentLauncherModal({
  game,
  onClose,
  gamepadConnected,
}: IntentLauncherModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPlayingSimulation, setIsPlayingSimulation] = useState(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [fps, setFps] = useState(60);
  const [score, setScore] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const gameStateRef = useRef({
    playerX: 160,
    lasers: [] as { x: number; y: number }[],
    invaders: [] as { x: number; y: number; alive: boolean; color: string }[],
    moveDir: 1,
    lastShoot: 0,
  });

  useEffect(() => {
    if (!game) {
      setIsPlayingSimulation(false);
      return;
    }
    audioService.playSelect();
  }, [game]);

  // Launch retro simulator
  const handleStartSimulation = () => {
    audioService.playLaunch();
    setIsPlayingSimulation(true);
  };

  // Canvas Retro Game Loop
  useEffect(() => {
    if (!game || !isPlayingSimulation) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize invaders
    const invaders: { x: number; y: number; alive: boolean; color: string }[] = [];
    const colors = ['#f43f5e', '#a855f7', '#06b6d4', '#10b981'];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        invaders.push({
          x: 35 + c * 32,
          y: 35 + r * 22,
          alive: true,
          color: colors[r],
        });
      }
    }
    gameStateRef.current.invaders = invaders;
    gameStateRef.current.playerX = canvas.width / 2;
    gameStateRef.current.lasers = [];
    gameStateRef.current.moveDir = 1;

    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = lastTime;

    const keys: Record<string, boolean> = {};
    const handleKey = (e: KeyboardEvent) => {
      keys[e.key] = e.type === 'keydown';
      if (e.key === ' ' && e.type === 'keydown') {
        shootLaser();
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    const shootLaser = () => {
      const now = performance.now();
      if (now - gameStateRef.current.lastShoot > 220) {
        gameStateRef.current.lasers.push({
          x: gameStateRef.current.playerX + 12,
          y: canvas.height - 35,
        });
        gameStateRef.current.lastShoot = now;
        audioService.playNavTick();
      }
    };

    const render = (time: number) => {
      frameCount++;
      if (time - lastFpsUpdate >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsUpdate = time;
      }

      // Check Gamepad
      if (navigator.getGamepads) {
        const gp = navigator.getGamepads()[0];
        if (gp) {
          if (gp.axes[0] < -0.3 || gp.buttons[14]?.pressed) {
            gameStateRef.current.playerX = Math.max(10, gameStateRef.current.playerX - 4);
          }
          if (gp.axes[0] > 0.3 || gp.buttons[15]?.pressed) {
            gameStateRef.current.playerX = Math.min(canvas.width - 34, gameStateRef.current.playerX + 4);
          }
          if (gp.buttons[0]?.pressed || gp.buttons[2]?.pressed) {
            shootLaser();
          }
        }
      }

      // Keyboard movement
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        gameStateRef.current.playerX = Math.max(10, gameStateRef.current.playerX - 4);
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        gameStateRef.current.playerX = Math.min(canvas.width - 34, gameStateRef.current.playerX + 4);
      }

      // Update invaders
      const state = gameStateRef.current;
      let hitEdge = false;
      state.invaders.forEach((inv) => {
        if (!inv.alive) return;
        if (inv.x + state.moveDir * 1.2 > canvas.width - 25 || inv.x + state.moveDir * 1.2 < 10) {
          hitEdge = true;
        }
      });
      if (hitEdge) {
        state.moveDir *= -1;
        state.invaders.forEach((inv) => (inv.y += 6));
      } else {
        state.invaders.forEach((inv) => (inv.x += state.moveDir * 0.9));
      }

      // Update lasers
      for (let i = state.lasers.length - 1; i >= 0; i--) {
        const laser = state.lasers[i];
        laser.y -= 7;
        if (laser.y < 0) {
          state.lasers.splice(i, 1);
          continue;
        }

        // Collision check
        for (const inv of state.invaders) {
          if (
            inv.alive &&
            laser.x >= inv.x &&
            laser.x <= inv.x + 20 &&
            laser.y >= inv.y &&
            laser.y <= inv.y + 14
          ) {
            inv.alive = false;
            state.lasers.splice(i, 1);
            setScore((s) => s + 100);
            audioService.playNavTick();
            break;
          }
        }
      }

      // Clear & Draw
      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 47 + time * 0.02) % canvas.width);
        const sy = (i * 23) % canvas.height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Draw Invaders
      state.invaders.forEach((inv) => {
        if (!inv.alive) return;
        ctx.fillStyle = inv.color;
        ctx.fillRect(inv.x, inv.y, 20, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(inv.x + 4, inv.y + 3, 3, 3);
        ctx.fillRect(inv.x + 13, inv.y + 3, 3, 3);
      });

      // Draw Lasers
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      state.lasers.forEach((laser) => {
        ctx.fillRect(laser.x, laser.y, 3, 10);
      });
      ctx.shadowBlur = 0;

      // Draw Player Ship
      ctx.fillStyle = '#10b981';
      ctx.fillRect(state.playerX + 9, canvas.height - 35, 6, 8);
      ctx.fillRect(state.playerX + 3, canvas.height - 27, 18, 6);
      ctx.fillRect(state.playerX, canvas.height - 21, 24, 7);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, [game, isPlayingSimulation]);

  if (!game) return null;

  const dataUri = `content://com.android.externalstorage.documents/document/primary%3AROMs%2F${game.console}%2F${encodeURIComponent(game.romFileName)}`;

  const adbCommand = `adb shell am start \\
  -a ${game.emulator.action} \\
  -d "${dataUri}" \\
  -p ${game.emulator.packageName} \\
  ${game.emulator.activityName ? `-n ${game.emulator.packageName}/${game.emulator.activityName} \\` : ''}
  --grant-read-uri-permission \\
  --grant-write-uri-permission${
    game.emulator.extraFlags
      ? Object.entries(game.emulator.extraFlags)
          .map(([k, v]) => ` \\\n  -e ${k} "${v.replace('{ROM_PATH}', game.romFilePath)}"` )
          .join('')
      : ''
  }`;

  const handleCopyAdb = () => {
    navigator.clipboard.writeText(adbCommand);
    setCopied(true);
    audioService.playSelect();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-lg">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Android Intent Dispatcher</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                  {game.emulator.packageName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct Intent execution payload for {game.title}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Action Choice: Live Test or Intent Spec */}
          {!isPlayingSimulation ? (
            <div className="rounded-2xl p-5 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start text-blue-300 font-semibold text-sm">
                  <Play className="w-4 h-4 fill-current" />
                  <span>Interactive Live Emulator Simulation</span>
                </div>
                <p className="text-xs text-slate-300 max-w-md">
                  Boot up a playable 60 FPS retro canvas demo with full gamepad, D-pad, CRT scanlines, and audio to test your controls immediately.
                </p>
              </div>

              <button
                onClick={handleStartSimulation}
                className="flex-shrink-0 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate Boot Sequence</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-4 bg-black border border-white/15 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 px-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    RUNNING ({fps} FPS)
                  </span>
                  <span className="text-slate-400 font-mono">Score: {score}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setScanlinesEnabled(!scanlinesEnabled)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 border ${
                      scanlinesEnabled
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    <Tv className="w-3 h-3" />
                    <span>CRT Scanlines</span>
                  </button>
                  <button
                    onClick={() => setIsPlayingSimulation(false)}
                    className="text-rose-400 hover:text-rose-300 font-semibold text-xs"
                  >
                    Stop Simulation
                  </button>
                </div>
              </div>

              {/* Canvas viewport */}
              <div className="relative w-full aspect-[4/3] max-h-[320px] mx-auto rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={255}
                  className="w-full h-full object-contain"
                />

                {/* CRT Scanline Filter Overlay */}
                {scanlinesEnabled && (
                  <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.35)_0px,rgba(0,0,0,0.35)_1px,transparent_1px,transparent_2px)] opacity-60 mix-blend-overlay" />
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
                <span>
                  Controls: <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">←</kbd> <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">→</kbd> Move, <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">Space</kbd> or <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">Button A</kbd> Fire
                </span>
                <span className="text-blue-300 font-medium">
                  {gamepadConnected ? '🎮 Gamepad Connected' : '⌨ Keyboard Mode'}
                </span>
              </div>
            </div>
          )}

          {/* Android Intent Field Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Intent Parameters for Android OS</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase text-slate-400 font-mono">Intent Action</span>
                <p className="font-mono text-emerald-400 font-semibold truncate">{game.emulator.action}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase text-slate-400 font-mono">Target Package</span>
                <p className="font-mono text-cyan-400 font-semibold truncate">{game.emulator.packageName}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 sm:col-span-2">
                <span className="text-[10px] uppercase text-slate-400 font-mono">Scoped Storage Content URI (SAF)</span>
                <p className="font-mono text-slate-200 break-all text-[11px]">{dataUri}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 sm:col-span-2">
                <span className="text-[10px] uppercase text-slate-400 font-mono">Core / Extras Payload</span>
                <div className="space-y-1 pt-1 font-mono text-[11px] text-slate-300">
                  {Object.entries(game.emulator.extraFlags).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-purple-400">{key}:</span>
                      <span className="text-slate-200 truncate">{val.replace('{ROM_PATH}', game.romFilePath)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Command (ADB Shell) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ADB Command (Direct Shell Execution)
              </span>
              <button
                onClick={handleCopyAdb}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy ADB'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              <code>{adbCommand}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-slate-950/40">
          <button
            onClick={() => {
              audioService.playBack();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleCopyAdb}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            Copy Intent
          </button>
        </div>
      </div>
    </div>
  );
}
