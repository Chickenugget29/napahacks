import { create } from 'zustand';

type AnalysisStatus = 'idle' | 'extracting' | 'verifying' | 'complete' | 'error';

interface Claim {
    id: string;
    text: string;
    predicate: string;
}

interface LogicStep {
    id: string;
    description: string;
    status: 'valid' | 'contradiction' | 'pending';
    relatedClaimIds: string[];
}

interface AppState {
    inputText: string;
    setInputText: (text: string) => void;

    status: AnalysisStatus;
    setStatus: (status: AnalysisStatus) => void;

    extractedClaims: Claim[];
    setClaims: (claims: Claim[]) => void;

    logicSteps: LogicStep[];
    setLogicSteps: (steps: LogicStep[]) => void;

    verificationResult: 'consistent' | 'contradiction' | null;
    setVerificationResult: (result: 'consistent' | 'contradiction' | null) => void;

    reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    inputText: '',
    setInputText: (text) => set({ inputText: text }),

    status: 'idle',
    setStatus: (status) => set({ status }),

    extractedClaims: [],
    setClaims: (claims) => set({ extractedClaims: claims }),

    logicSteps: [],
    setLogicSteps: (steps) => set({ logicSteps: steps }),

    verificationResult: null,
    setVerificationResult: (result) => set({ verificationResult: result }),

    reset: () => set({
        status: 'idle',
        extractedClaims: [],
        logicSteps: [],
        verificationResult: null
    }),
}));
