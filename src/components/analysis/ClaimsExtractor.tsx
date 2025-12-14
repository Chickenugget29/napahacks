import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileCode, Loader2, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { REQUEST_FRAME_ORDER, getFrameInfo } from '../../constants/requestFrames';

export function ClaimsExtractor() {
    const { rules, symbolicRules, status } = useAppStore();

    const symbolicLookup = useMemo(() => {
        const lookup = new Map<string, typeof symbolicRules[number]>();
        for (const symbolic of symbolicRules) {
            lookup.set(symbolic.rule_id, symbolic);
        }
        return lookup;
    }, [symbolicRules]);

    const hasRules = rules.length > 0;
    const isParsing = status === 'parsing';

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Symbolic Rulebook
                </h3>
                {hasRules && (
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        {rules.length} clauses mapped
                    </span>
                )}
            </div>

            <div className="space-y-3 min-h-[140px]">
                <AnimatePresence mode="wait">
                    {!hasRules && (
                        <motion.div
                            key={isParsing ? 'parsing' : 'idle'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-black/40 p-6 text-center"
                        >
                            {isParsing ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                                    <p className="text-sm font-mono text-cyan-200/80">Compiling symbolic predicates...</p>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-6 w-6 text-white/40" />
                                    <p className="text-sm font-mono text-muted-foreground/80">
                                        // Paste a policy and hit Parse Rules to populate this view.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {rules.map((rule, index) => {
                    const symbolic = symbolicLookup.get(rule.id);
                    const predicateBadges = symbolic?.predicates ?? [];
                    const frames = (() => {
                        const raw = symbolic?.dimensions?.request_frame ?? [];
                        if (!raw.length) return ['direct_request'];
                        const order = REQUEST_FRAME_ORDER.reduce<Record<string, number>>((acc, frame, idx) => {
                            acc[frame] = idx;
                            return acc;
                        }, {});
                        return [...new Set(raw)].sort((a, b) => {
                            const idxA = order[a] ?? REQUEST_FRAME_ORDER.length;
                            const idxB = order[b] ?? REQUEST_FRAME_ORDER.length;
                            return idxA - idxB;
                        });
                    })();
                    const otherDimensions = Object.entries(symbolic?.dimensions ?? {}).filter(
                        ([dimension]) => dimension !== 'request_frame'
                    );

                    return (
                        <motion.div
                            key={rule.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-5"
                        >
                            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-transparent" />
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                                        Rule {index + 1} · {rule.id}
                                    </p>
                                    <p className="mt-2 text-sm text-white/90 leading-relaxed">{rule.text}</p>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/80">
                                    {rule.category}
                                </span>
                            </div>

                            {rule.keywords?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {rule.keywords.map((keyword) => (
                                        <span key={keyword} className="rounded-md bg-white/5 px-2 py-1 text-[11px] font-mono text-cyan-200/80">
                                            #{keyword}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {symbolic && (
                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Symbolic predicates</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {predicateBadges.length ? (
                                                predicateBadges.map((predicate) => (
                                                    <span
                                                        key={predicate}
                                                        className="rounded border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-[11px] font-mono text-cyan-100"
                                                    >
                                                        {predicate}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground/80">No predicates detected.</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Request frames</p>
                                        <div className="mt-2 flex flex-col gap-2">
                                            {frames.map((frame) => {
                                                const info = getFrameInfo(frame);
                                                return (
                                                    <div
                                                        key={`${rule.id}-${frame}`}
                                                        className={cn(
                                                            "rounded-lg border px-3 py-2 text-xs text-white/80 bg-gradient-to-r",
                                                            info.accent
                                                        )}
                                                    >
                                                        <p className="font-semibold uppercase tracking-wide text-[11px]">{info.label}</p>
                                                        <p className="mt-0.5 text-[11px] text-white/70">{info.description}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {otherDimensions.length > 0 && (
                                <div className="mt-5 rounded-lg border border-white/5 bg-white/5 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Additional dimensions</p>
                                    <div className="mt-2 grid gap-3 md:grid-cols-2">
                                        {otherDimensions.map(([dimension, values]) => (
                                            <div key={`${rule.id}-${dimension}`}>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/90">
                                                    {dimension.replace(/_/g, ' ')}
                                                </p>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {values.map((value) => (
                                                        <span key={value} className="rounded bg-black/30 px-2 py-0.5 text-[11px] font-mono text-white/80">
                                                            {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
