import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { GitGraph, AlertTriangle, CheckCircle2, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LogicFlow() {
    const { logicSteps, status } = useAppStore();

    if (status === 'idle' || status === 'extracting') return null;

    return (
        <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-white/5 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-background/50 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            </div>

            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <GitGraph className="w-4 h-4" />
                Logic Verification Chain
            </h3>

            <div className="space-y-0 relative pl-4">
                {/* Connecting Line */}
                <div className="absolute left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-cyan-500/20 via-cyan-500/10 to-transparent" />

                {logicSteps.map((step, index) => (
                    <div key={step.id} className="relative pt-6 first:pt-0">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.4 }}
                            className={cn(
                                "relative p-4 rounded-xl border ml-6 group transition-all duration-300",
                                step.status === 'contradiction'
                                    ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                                    : "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                            )}
                        >
                            {/* Node Point */}
                            <div className={cn(
                                "absolute left-[-31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-background z-10 flex items-center justify-center transition-colors duration-500",
                                step.status === 'contradiction' ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", step.status === 'contradiction' ? "bg-red-500" : "bg-emerald-500")} />
                            </div>

                            {/* Arrow connector */}
                            {index < logicSteps.length - 1 && (
                                <div className="absolute left-[-23px] top-full h-6 w-px border-l border-dashed border-white/20" />
                            )}

                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "mt-1 p-2 rounded-lg",
                                    step.status === 'contradiction' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                                )}>
                                    {step.status === 'contradiction' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white/90 leading-relaxed font-mono">
                                        {step.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                            step.status === 'contradiction'
                                                ? "text-red-400 bg-red-500/10 border-red-500/20"
                                                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                        )}>
                                            {step.status}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            // Process ID: {step.id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Flow Arrow */}
                        {index < logicSteps.length - 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.4 + 0.2 }}
                                className="absolute left-[20px] -bottom-3 text-white/10"
                            >
                                <ArrowDown className="w-3 h-3" />
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
