import type { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-cyan-500/20 selection:text-cyan-400 overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" />
            </div>

            <Header />
            
            <main className="relative z-10 pt-24 px-6 pb-12 w-full max-w-[1800px] mx-auto min-h-[calc(100vh-80px)] flex flex-col">
                {children}
            </main>
        </div>
    );
}
