import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { FileCode } from 'lucide-react';

export function ClaimsExtractor() {
    const { extractedClaims, status } = useAppStore();

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Extracted Predicates
            </h3>

            <div className="space-y-2 min-h-[200px]">
                <AnimatePresence>
                    {status === 'idle' && extractedClaims.length === 0 && (
                        <div className="text-muted-foreground/50 text-sm italic py-4">
                            Waiting for input...
                        </div>
                    )}

                    {(status === 'extracting' || extractedClaims.length > 0) && extractedClaims.map((claim, index) => (
                        <motion.div
                            key={claim.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
                        >
                            <div className="w-1 h-8 rounded-full bg-primary/20" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground truncate">{claim.text}</p>
                                <p className="text-sm font-mono text-primary font-medium mt-0.5">{claim.predicate}</p>
                            </div>
                        </motion.div>
                    ))}

                    {status === 'extracting' && extractedClaims.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-primary text-sm p-2"
                        >
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Scanning text structure...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
