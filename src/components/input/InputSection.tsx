import { useAppStore } from '../../store/useAppStore';
import { Terminal, Play, FlaskConical, RefreshCw, Wand2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export function InputSection() {
    const {
        policyText,
        setPolicyText,
        status,
        error,
        parsePolicy,
        generatePrompts,
        runExperiment,
    } = useAppStore();

    const disabled = status === 'parsing' || status === 'generating' || status === 'experimenting';

    const handleParse = () => {
        if (!policyText.trim() || disabled) return;
        parsePolicy();
    };

    const handleGenerate = () => {
        if (!policyText.trim() || disabled) return;
        generatePrompts();
    };

    const handleExperiment = () => {
        if (!policyText.trim() || disabled) return;
        runExperiment();
    };

    return (
        <div className="flex flex-col gap-4 lg:h-full lg:overflow-y-auto lg:pr-1 custom-scrollbar">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white/90">Input Console</h2>
                        <p className="text-[10px] text-muted-foreground font-mono">/dev/input/stream</p>
                    </div>
                </div>

                <button
                    onClick={() => setPolicyText('')}
                    className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors"
                    title="Clear Input"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Editor Area */}
            <div className="relative h-[320px] group bg-black/20 rounded-lg overflow-hidden border border-white/5 focus-within:border-cyan-500/30 transition-colors">
                <div className="absolute top-0 bottom-0 left-0 w-8 bg-white/5 border-r border-white/5 flex flex-col items-center py-4 text-[10px] text-muted-foreground font-mono select-none">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>~</span>
                </div>
                <textarea
                    value={policyText}
                    onChange={(e) => setPolicyText(e.target.value)}
                    placeholder="// Paste policy text here..."
                    className="relative w-full h-full bg-transparent border-none p-4 pl-10 text-sm leading-6 text-cyan-50/90 placeholder:text-white/20 focus:outline-none resize-none font-mono"
                    spellCheck={false}
                />

                {/* Status Indicator */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">
                        {policyText.length} chars
                    </span>
                    <div className={cn("w-1.5 h-1.5 rounded-full", policyText.length > 0 ? "bg-cyan-500 animate-pulse" : "bg-white/10")} />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                    <button
                        onClick={handleParse}
                        disabled={disabled || !policyText.trim()}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                            disabled || !policyText.trim()
                                ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                                : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/10"
                        )}
                    >
                        <Play className="w-4 h-4" />
                        Parse Rules
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={disabled || !policyText.trim()}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                            disabled || !policyText.trim()
                                ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                                : "bg-purple-500/80 hover:bg-purple-400 text-black shadow-lg shadow-purple-500/10"
                        )}
                    >
                        <Wand2 className="w-4 h-4" />
                        Generate Prompts
                    </button>
                    <button
                        onClick={handleExperiment}
                        disabled={disabled || !policyText.trim()}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                            disabled || !policyText.trim()
                                ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                                : "bg-emerald-500/80 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10"
                        )}
                    >
                        <FlaskConical className="w-4 h-4" />
                        Run Experiment
                    </button>
                </div>

                <div className="text-[10px] font-mono text-muted-foreground flex justify-between">
                    <span>Backend: {BACKEND_URL}</span>
                    <span>Status: {status.toUpperCase()}</span>
                </div>

                {error && (
                    <div className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
