import { ShieldCheck, Activity } from 'lucide-react';

export function Header() {
    return (
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-6 pointer-events-auto bg-black/60 backdrop-blur-2xl border-white/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full animate-pulse" />
                        <ShieldCheck className="w-6 h-6 text-cyan-400 relative z-10" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                        Lexium
                    </h1>
                </div>

                <div className="w-px h-8 bg-white/10" />

                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>System Active</span>
                </div>
            </div>
        </header>
    );
}
