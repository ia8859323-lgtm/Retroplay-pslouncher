import { useState } from 'react';
import { ANDROID_CODE_TEMPLATES, CodeTemplate } from '../services/androidCodeTemplates';
import {
  X,
  Code2,
  Copy,
  Check,
  FileCode,
  FolderTree,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { audioService } from '../services/audioService';

interface AndroidCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AndroidCodeViewerModal({
  isOpen,
  onClose,
}: AndroidCodeViewerModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate>(
    ANDROID_CODE_TEMPLATES[0]
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedTemplate.code);
    setCopied(true);
    audioService.playSelect();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-lg">
      <div className="relative w-full max-w-5xl h-[88vh] rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Android Native Architecture & Kotlin Codebase</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                  Jetpack Compose + SAF
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Production-ready code architecture for Android Handhelds & Consoles (Retroid, Odin 2, Phones)
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

        {/* Modal Content: Split Pane (File tree left, Code editor right) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* File Tree Left Sidebar */}
          <div className="w-full md:w-64 border-r border-white/10 bg-slate-950/40 p-4 space-y-2 overflow-y-auto flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/5">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Project Structure</span>
            </div>

            <div className="space-y-1">
              {ANDROID_CODE_TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.fileName === selectedTemplate.fileName;
                return (
                  <button
                    key={tmpl.fileName}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      audioService.playNavTick();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="truncate">{tmpl.fileName}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1 text-slate-300 font-semibold">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Architecture Highlights</span>
              </div>
              <ul className="space-y-1 text-slate-400 list-disc list-inside">
                <li>Intent ACTION_VIEW direct dispatch</li>
                <li>RetroArch LIBRETRO extras handling</li>
                <li>DocumentFile tree SAF traversal</li>
                <li>GenericMotionEvent Gamepad mapping</li>
                <li>Coil 4K asynchronous image loader</li>
              </ul>
            </div>
          </div>

          {/* Code Viewer Main Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-hidden">
            {/* Code Top Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-slate-900/60">
              <div>
                <span className="font-mono text-xs font-bold text-amber-300">
                  {selectedTemplate.fileName}
                </span>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {selectedTemplate.description}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy File'}</span>
              </button>
            </div>

            {/* Code Content Viewport */}
            <div className="flex-1 overflow-auto p-5 font-mono text-xs text-slate-200 leading-relaxed no-scrollbar select-text">
              <pre className="whitespace-pre">
                <code>{selectedTemplate.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-slate-950/50 text-xs text-slate-400">
          <span>Target: Android API 26-34 (Kotlin 2.0 / Compose BOM)</span>
          <button
            onClick={() => {
              audioService.playBack();
              onClose();
            }}
            className="px-5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
