import { useAppStore } from '../../store/useAppStore';
import { Sparkles, Play } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming you have a cn utility, if not I'll just use template literals or install it.

export function InputSection() {
    const { inputText, setInputText, status, setStatus, setClaims, setLogicSteps, reset } = useAppStore();

    const handleVerify = () => {
        if (!inputText.trim()) return;

        reset();
        setInputText(inputText); // Ensure text is set (redundant but safe)
        setStatus('extracting');

        // Mock extraction process (this would be in a controller/hook ideally)
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
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Model Output
                </h2>

                <button
                    onClick={handleVerify}
                    disabled={status !== 'idle' && status !== 'complete'}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                        "bg-primary hover:bg-primary/90 text-primary-foreground",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    <Play className="w-4 h-4 fill-current" />
                    {status === 'idle' || status === 'complete' ? 'Verify Logic' : 'Analyzing...'}
                </button>
            </div>

            <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste LLM policy response here..."
                    className="relative w-full h-full bg-black/40 border border-white/10 rounded-xl p-4 text-base leading-relaxed text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none font-mono"
                />
            </div>
        </div>
    );
}
