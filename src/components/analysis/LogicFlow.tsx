import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitGraph, Loader2, Sparkles, FlaskConical, Target } from 'lucide-react';
import { useAppStore, type ExperimentMetrics } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import {
    REQUEST_FRAME_DETAILS,
    REQUEST_FRAME_ORDER,
    getFrameInfo,
} from '../../constants/requestFrames';

type NumericMetricKey =
    | 'num_prompts'
    | 'rules_covered'
    | 'predicate_combinations'
    | 'coverage_percent'
    | 'specification_sensitivity'
    | 'spec_gap';

const METRIC_FIELDS: Array<{ key: NumericMetricKey; label: string; suffix?: string; precision?: number }> = [
    { key: 'num_prompts', label: 'Prompts' },
    { key: 'rules_covered', label: 'Rules Hit' },
    { key: 'predicate_combinations', label: 'Predicate Regions' },
    { key: 'coverage_percent', label: 'Coverage', suffix: '%', precision: 1 },
    { key: 'spec_gap', label: 'Spec Gap' },
    { key: 'specification_sensitivity', label: 'Sensitivity', suffix: '%', precision: 1 },
];

export function LogicFlow() {
    const { prompts, experiment, status } = useAppStore();

    const groupedPrompts = useMemo(() => {
        const map = new Map<string, typeof prompts>();
        for (const prompt of prompts) {
            const list = map.get(prompt.request_frame) ?? [];
            list.push(prompt);
            map.set(prompt.request_frame, list);
        }
        return map;
    }, [prompts]);

    const orderedFrames = useMemo(() => {
        const known = REQUEST_FRAME_ORDER.filter((frame) => groupedPrompts.has(frame));
        const unknown = Array.from(groupedPrompts.keys()).filter(
            (frame) => !REQUEST_FRAME_ORDER.includes(frame as typeof REQUEST_FRAME_ORDER[number])
        );
        return [...known, ...unknown];
    }, [groupedPrompts]);

    const hasPrompts = prompts.length > 0;
    const isGenerating = status === 'generating';
    const isExperimenting = status === 'experimenting';

    return (
        <div className="flex flex-col gap-8 pt-6 border-t border-white/5">
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <GitGraph className="w-4 h-4" />
                        Symbolic Prompt Compiler
                    </h3>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        {status.toUpperCase()}
                    </span>
                </div>

                {!hasPrompts && (
                    <div className="rounded-xl border border-dashed border-white/10 bg-black/40 p-6 text-center text-sm font-mono text-muted-foreground/90">
                        {isGenerating ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                                Synthesizing prompts for each symbolic frame...
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <Sparkles className="h-6 w-6 text-white/30" />
                                Run <span className="text-white">Generate Prompts</span> or <span className="text-white">Run Experiment</span> to populate this section.
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-6">
                    {orderedFrames.map((frame) => {
                        const promptsForFrame = groupedPrompts.get(frame) ?? [];
                        const info = getFrameInfo(frame);
                        const frameDetails = REQUEST_FRAME_DETAILS[frame] ?? info;

                        return (
                            <motion.div
                                key={frame}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                    "rounded-2xl border p-5 bg-black/40",
                                    `bg-gradient-to-br ${frameDetails.accent}`
                                )}
                            >
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-[11px] font-mono uppercase tracking-widest text-white/80">
                                            {info.label}
                                        </p>
                                        <p className="text-xs text-white/70">{info.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest",
                                            frameDetails.badge
                                        )}>
                                            {promptsForFrame.length} prompts
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {promptsForFrame.map((prompt) => (
                                        <div key={prompt.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                                            <p className="text-sm text-white/90 leading-relaxed">{prompt.text}</p>
                                            <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-mono text-muted-foreground/90">
                                                <span className="rounded bg-white/5 px-2 py-0.5">target: {prompt.target_rule_id}</span>
                                                <span className="rounded bg-white/5 px-2 py-0.5">{prompt.strategy}</span>
                                            </div>
                                            {prompt.satisfies?.length ? (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {prompt.satisfies.map((predicate) => (
                                                        <span key={`${prompt.id}-${predicate}`} className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-mono text-white/80">
                                                            {predicate}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {experiment && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <FlaskConical className="w-4 h-4" />
                            Experiment Metrics
                        </h3>
                        {isExperimenting && (
                            <span className="flex items-center gap-2 text-[11px] font-mono text-emerald-200/80">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Comparing coverage...
                            </span>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {([
                            { key: 'symbolic_guided', title: 'Symbolic Guidance', accent: 'from-emerald-500/20 to-emerald-500/0', caption: 'Request-frame constrained prompts' },
                            { key: 'agent_only', title: 'Agent Baseline', accent: 'from-orange-500/20 to-orange-500/0', caption: 'Claude-generated prompts' },
                        ] as const).map(({ key, title, accent, caption }) => {
                            const metrics: ExperimentMetrics = experiment[key];
                            return (
                                <div key={key} className={cn("rounded-2xl border border-white/10 bg-black/40 p-5 bg-gradient-to-br", accent)}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-mono uppercase tracking-widest text-white/80">{title}</p>
                                            <p className="text-xs text-white/60">{caption}</p>
                                        </div>
                                        <Target className="h-4 w-4 text-white/50" />
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        {METRIC_FIELDS.map(({ key: fieldKey, label, suffix, precision }) => {
                                            const value = metrics[fieldKey];
                                            const formatted =
                                                typeof value === 'number'
                                                    ? `${value.toFixed(precision ?? 0).replace(/\.0+$/, '')}${suffix ?? ''}`
                                                    : value
                                                        ? 'Yes'
                                                        : 'No';
                                            return (
                                                <div key={`${title}-${label}`} className="rounded-lg border border-white/5 bg-white/5 p-3">
                                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                                                    <p className="text-lg font-semibold text-white/90 mt-1">{formatted}</p>
                                                </div>
                                            );
                                        })}
                                        <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Traceable</p>
                                            <p className="text-lg font-semibold text-white/90 mt-1">{metrics.traceable ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}
