import { useState, useEffect } from 'react';
import {
  X,
  Gamepad2,
  CheckCircle,
  Vibrate,
  HelpCircle,
  ArrowLeftRight,
} from 'lucide-react';
import { audioService } from '../services/audioService';

interface ControllerVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamepadConnected: boolean;
  controllerName: string;
  lastButton: string | null;
  onTriggerHaptic: () => void;
}

export function ControllerVisualizerModal({
  isOpen,
  onClose,
  gamepadConnected,
  controllerName,
  lastButton,
  onTriggerHaptic,
}: ControllerVisualizerModalProps) {
  const [axes, setAxes] = useState<number[]>([0, 0, 0, 0]);
  const [buttonsState, setButtonsState] = useState<boolean[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const poll = () => {
      if (navigator.getGamepads) {
        const gp = navigator.getGamepads()[0];
        if (gp) {
          setAxes(Array.from(gp.axes));
          setButtonsState(gp.buttons.map(b => b.pressed));
        }
      }
      animId = requestAnimationFrame(poll);
    };
    animId = requestAnimationFrame(poll);

    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-lg">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              gamepadConnected
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-white/10'
            }`}>
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Hardware Controller & Gamepad Tester</span>
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                  gamepadConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {gamepadConnected ? 'Connected' : 'Waiting for Input'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Supports Bluetooth, OTG USB controllers (DualSense, Xbox, Gamesir, Retroid, Odin)
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            gamepadConnected
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-950/40 border-white/10 text-slate-300'
          }`}>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <CheckCircle className={`w-4 h-4 ${gamepadConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{gamepadConnected ? 'Device Detected' : 'No Physical Gamepad'}</span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md font-mono">
                {controllerName || 'Press any button on your controller or use keyboard arrow keys'}
              </p>
            </div>

            {gamepadConnected && (
              <button
                onClick={onTriggerHaptic}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
              >
                <Vibrate className="w-3.5 h-3.5" />
                <span>Test Rumble</span>
              </button>
            )}
          </div>

          {/* Live Controller Visualizer */}
          <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Input & Axis Coordinates
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Left Stick X</span>
                <p className="font-mono text-cyan-400 font-bold mt-1">{(axes[0] || 0).toFixed(2)}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Left Stick Y</span>
                <p className="font-mono text-cyan-400 font-bold mt-1">{(axes[1] || 0).toFixed(2)}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Right Stick X</span>
                <p className="font-mono text-purple-400 font-bold mt-1">{(axes[2] || 0).toFixed(2)}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Last Action</span>
                <p className="font-mono text-emerald-400 font-bold mt-1 truncate">{lastButton || 'None'}</p>
              </div>
            </div>
          </div>

          {/* Button Mapping Matrix */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
              <span>PS5 Button to Action Mapping</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Navigate Games / Menu</span>
                <span className="font-mono font-bold text-blue-300">D-Pad / Left Stick / ← →</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Play / Confirm</span>
                <span className="font-mono font-bold text-emerald-400">✕ Cross / Button A / Enter</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Back / Cancel</span>
                <span className="font-mono font-bold text-rose-400">◯ Circle / Button B / Esc</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Switch Console System</span>
                <span className="font-mono font-bold text-amber-300">L1 / R1 Bumpers / Q, E</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Quick Scraper</span>
                <span className="font-mono font-bold text-purple-400">△ Triangle / Button Y / F</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Android Intent Details</span>
                <span className="font-mono font-bold text-cyan-400">▢ Square / Button X / I</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-white/10 bg-slate-950/40">
          <button
            onClick={() => {
              audioService.playBack();
              onClose();
            }}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
