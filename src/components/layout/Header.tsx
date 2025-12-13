import { ShieldCheck, BrainCircuit } from 'lucide-react';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-background/80 backdrop-blur-md z-50 flex items-center px-6 justify-between">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        LogicGuard
                    </h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Consistency Checker
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-white/5 text-xs text-muted-foreground">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>v1.0.0-beta</span>
                </div>
            </div>
        </header>
    );
}
