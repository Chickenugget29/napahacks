import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { FileCode, Search, CheckCircle } from 'lucide-react';

export function ClaimsExtractor() {
    const { extractedClaims, status } = useAppStore();

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <FileCode className="w-4 h-4" />
                Extracted Predicates
            </h3>

            <div className="space-y-3 min-h-[100px]">
                <AnimatePresence mode='popLayout'>
                    {status === 'idle' && extractedClaims.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-muted-foreground/40 text-sm font-mono p-4 border border-dashed border-white/10 rounded-lg text-center"
                        >
                            // System awaiting input stream...
                        </motion.div>
                    )}

                    {status === 'extracting' && extractedClaims.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center p-8 bg-cyan-500/5 border border-cyan-500/20 rounded-xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-scan-line opacity-20" />
                            <Search className="w-8 h-8 text-cyan-400 animate-pulse mb-2" />
                            <p className="text-cyan-200 font-mono text-sm">SCANNING TEXT CORPUS...</p>
                        </motion.div>
                    )}

                    {(status === 'extracting' || extractedClaims.length > 0) && extractedClaims.map((claim, index) => (
                        <motion.div
                            key={claim.id}
                            initial={{ opacity: 0, x: -20, rotateX: 90 }}
                            animate={{ opacity: 1, x: 0, rotateX: 0 }}
                            transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                            className="group relative"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg opacity-20 blur group-hover:opacity-40 transition duration-500" />
                            <div className="relative flex items-center gap-4 p-4 rounded-lg bg-black/60 border border-white/10 hover:border-cyan-500/30 transition-colors backdrop-blur-sm">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400 font-mono text-xs">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground truncate font-mono mb-1">"{claim.text}"</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-px bg-white/10 w-4" />
                                        <p className="text-sm font-mono text-cyan-100 font-semibold tracking-wide">
                                            {claim.predicate}
                                        </p>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
