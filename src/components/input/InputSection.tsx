import { useAppStore } from '../../store/useAppStore';
import { Terminal, Play, Zap, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export function InputSection() {
    const { inputText, setInputText, status, setClaims, setLogicSteps, reset, setStatus } = useAppStore();

    const handleVerify = () => {
        if (!inputText.trim()) return;

        reset();
        setInputText(inputText);
        setStatus('extracting');

        // Mock extraction process
        setTimeout(() => {
            setClaims([
                { id: '1', text: "The model claims P is true", predicate: "True(P)" },
                { id: '2', text: "Later it implies P is false", predicate: "False(P)" },
                { id: '3', text: "Safety guardrails engaged", predicate: "Active(Guardrails)" }
            ]);
            setStatus('verifying');

            setTimeout(() => {
                setLogicSteps([
                    { id: 's1', description: "Checking consistency of True(P) AND False(P)", status: 'contradiction', relatedClaimIds: ['1', '2'] },
                    { id: 's2', description: "Verifying Active(Guardrails)", status: 'valid', relatedClaimIds: ['3'] }
                ]);
                setStatus('complete');
            }, 2000);

        }, 1500);
    };

    return (
        <div className="flex flex-col h-full gap-4">
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setInputText('')}
                        className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors"
                        title="Clear Input"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleVerify}
                        disabled={!inputText.trim() || (status !== 'idle' && status !== 'complete')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-lg shadow-cyan-500/10",
                            status === 'idle' || status === 'complete'
                                ? "bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                                : "bg-white/5 text-muted-foreground cursor-wait"
                        )}
                    >
                        {status === 'idle' || status === 'complete' ? (
                            <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Run Analysis</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-3.5 h-3.5 animate-bounce" />
                                <span>Processing...</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="relative flex-1 group bg-black/20 rounded-lg overflow-hidden border border-white/5 focus-within:border-cyan-500/30 transition-colors">
                <div className="absolute top-0 bottom-0 left-0 w-8 bg-white/5 border-r border-white/5 flex flex-col items-center py-4 text-[10px] text-muted-foreground font-mono select-none">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>~</span>
                </div>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="// Paste LLM output here for logic verification..."
                    className="relative w-full h-full bg-transparent border-none p-4 pl-10 text-sm leading-6 text-cyan-50/90 placeholder:text-white/20 focus:outline-none resize-none font-mono"
                    spellCheck={false}
                />

                {/* Status Indicator */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">
                        {inputText.length} chars
                    </span>
                    <div className={cn("w-1.5 h-1.5 rounded-full", inputText.length > 0 ? "bg-cyan-500 animate-pulse" : "bg-white/10")} />
                </div>
            </div>
        </div>
    );
}
