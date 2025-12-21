import { create } from 'zustand';

type AnalysisStatus = 'idle' | 'parsing' | 'generating' | 'experimenting' | 'complete' | 'error';

export interface PolicyRule {
    id: string;
    text: string;
    category: string;
    keywords: string[];
}

export interface SymbolicRulePayload {
    rule_id: string;
    predicates: string[];
    violation: boolean;
    dimensions?: Record<string, string[]>;
}

export interface PromptPayload {
    id: string;
    text: string;
    target_rule_id: string;
    strategy: string;
    request_frame: string;
    satisfies?: string[];
}

export interface ExperimentMetrics {
    prompts_generated: number;
    rules_covered: number;
    regions_covered: number;
    traceable: boolean;
    coverage_percent: number;
    attack_success_rate: number;
    composite_score: number;
}

export interface ExperimentResponse {
    agent_only: ExperimentMetrics;
    symbolic_guided: ExperimentMetrics;
    comparison_table: string;
    takeaway: string;
}

interface AppState {
    policyText: string;
    setPolicyText: (text: string) => void;

    status: AnalysisStatus;
    error: string | null;

    rules: PolicyRule[];
    symbolicRules: SymbolicRulePayload[];
    prompts: PromptPayload[];
    experiment: ExperimentResponse | null;

    parsePolicy: () => Promise<void>;
    generatePrompts: (totalPrompts?: number) => Promise<void>;
    runExperiment: (totalPrompts?: number) => Promise<void>;
    reset: () => void;
}

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const DEFAULT_PROMPT_COUNT = 10;

async function postJSON<T>(path: string, body: unknown, query = ''): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${path}${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || response.statusText);
    }
    return response.json() as Promise<T>;
}

export const useAppStore = create<AppState>((set, get) => ({
    policyText: '',
    setPolicyText: (text) => set({ policyText: text }),

    status: 'idle',
    error: null,

    rules: [],
    symbolicRules: [],
    prompts: [],
    experiment: null,

    async parsePolicy() {
        const policyText = get().policyText.trim();
        if (!policyText) {
            set({ error: 'Please paste a policy before parsing.' });
            return;
        }
        set({ status: 'parsing', error: null });
        try {
            const data = await postJSON<{ rules: PolicyRule[]; symbolic_rules: SymbolicRulePayload[] }>(
                '/parse-policy',
                { policy_text: policyText }
            );
            set({
                rules: data.rules,
                symbolicRules: data.symbolic_rules,
                prompts: [],
                experiment: null,
                status: 'complete',
            });
        } catch (error) {
            set({ status: 'error', error: (error as Error).message });
            throw error;
        }
    },

    async generatePrompts(totalPrompts?: number) {
        const policyText = get().policyText.trim();
        if (!policyText) {
            set({ error: 'Please paste a policy before generating prompts.' });
            return;
        }
        if (!get().rules.length) {
            await get().parsePolicy();
            if (!get().rules.length) return;
        }
        set({ status: 'generating', error: null });
        const promptTarget = totalPrompts ?? DEFAULT_PROMPT_COUNT;
        try {
            const data = await postJSON<{
                rules: PolicyRule[];
                symbolic_rules: SymbolicRulePayload[];
                prompts: PromptPayload[];
            }>(
                '/generate-prompts',
                { policy_text: policyText },
                `?total_prompts=${promptTarget}`
            );
            set({
                rules: data.rules,
                symbolicRules: data.symbolic_rules,
                prompts: data.prompts,
                status: 'complete',
            });
        } catch (error) {
            set({ status: 'error', error: (error as Error).message });
            throw error;
        }
    },

    async runExperiment(totalPrompts?: number) {
        const policyText = get().policyText.trim();
        if (!policyText) {
            set({ error: 'Please paste a policy before running the experiment.' });
            return;
        }
        if (!get().rules.length) {
            await get().parsePolicy();
            if (!get().rules.length) return;
        }
        set({ status: 'experimenting', error: null });
        const promptTarget = totalPrompts ?? DEFAULT_PROMPT_COUNT;
        try {
            const data = await postJSON<ExperimentResponse>(
                '/run-experiment',
                { policy_text: policyText },
                `?total_prompts=${promptTarget}`
            );
            set({
                experiment: data,
                status: 'complete',
            });
        } catch (error) {
            set({ status: 'error', error: (error as Error).message });
            throw error;
        }
    },

    reset: () => set({
        status: 'idle',
        error: null,
        rules: [],
        symbolicRules: [],
        prompts: [],
        experiment: null,
    }),
}));
