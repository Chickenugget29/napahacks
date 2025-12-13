import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { GitGraph, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LogicFlow() {
    const { logicSteps, status } = useAppStore();

    if (status === 'idle' || status === 'extracting') return null;

    return (
        <div className="flex flex-col gap-4 mt-8 border-t border-white/10 pt-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <GitGraph className="w-4 h-4" />
                Logic Verification Chain
            </h3>

            <div className="space-y-4">
                {logicSteps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.4 }}
                        className={cn(
                            "relative p-4 rounded-lg border",
                            step.status === 'contradiction'
                                ? "bg-red-500/10 border-red-500/20"
                                : "bg-green-500/10 border-green-500/20"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                "mt-0.5 p-1 rounded-full",
                                step.status === 'contradiction' ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
                            )}>
                                {step.status === 'contradiction' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/90">{step.description}</p>
                                <p className={cn(
                                    "text-xs mt-1 font-mono uppercase",
                                    step.status === 'contradiction' ? "text-red-400" : "text-green-400"
                                )}>
                                    Result: {step.status}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
