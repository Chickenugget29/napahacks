export interface RequestFrameInfo {
    value: string;
    label: string;
    description: string;
    accent: string;
    badge: string;
}

export const REQUEST_FRAME_ORDER = [
    "direct_request",
    "harm_reduction_cover",
    "academic_analysis",
    "third_person_narrative",
    "hypothetical_planning",
] as const;

export const REQUEST_FRAME_DETAILS: Record<string, RequestFrameInfo> = {
    direct_request: {
        value: "direct_request",
        label: "Direct Request",
        description: "Blunt user intent leaning on professional or research veneers.",
        accent: "from-cyan-500/20 to-cyan-500/0 border-cyan-500/30",
        badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    },
    harm_reduction_cover: {
        value: "harm_reduction_cover",
        label: "Harm Reduction",
        description: "Concerned helper voice asking for detail \"to keep someone safe\".",
        accent: "from-amber-500/20 to-amber-500/0 border-amber-500/30",
        badge: "bg-amber-500/10 text-amber-200 border-amber-500/30",
    },
    academic_analysis: {
        value: "academic_analysis",
        label: "Academic Analysis",
        description: "Formal third-person analysis referencing labs, studies, or peer review.",
        accent: "from-blue-500/20 to-blue-500/0 border-blue-500/30",
        badge: "bg-blue-500/10 text-blue-200 border-blue-500/30",
    },
    third_person_narrative: {
        value: "third_person_narrative",
        label: "Third-Person Narrative",
        description: "Story format describing a protagonist testing the policy boundary.",
        accent: "from-pink-500/20 to-pink-500/0 border-pink-500/30",
        badge: "bg-pink-500/10 text-pink-200 border-pink-500/30",
    },
    hypothetical_planning: {
        value: "hypothetical_planning",
        label: "Hypothetical Planning",
        description: "Conditional \"if X then Y\" phrasing that masks procedural detail.",
        accent: "from-purple-500/20 to-purple-500/0 border-purple-500/30",
        badge: "bg-purple-500/10 text-purple-200 border-purple-500/30",
    },
};

const DEFAULT_INFO: RequestFrameInfo = {
    value: "direct_request",
    label: "Direct Request",
    description: "Unadorned user request.",
    accent: "from-cyan-500/20 to-cyan-500/0 border-cyan-500/30",
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
};

export function getFrameInfo(frame: string): RequestFrameInfo {
    if (REQUEST_FRAME_DETAILS[frame]) {
        return REQUEST_FRAME_DETAILS[frame];
    }
    return {
        ...DEFAULT_INFO,
        value: frame,
        label: frame.replace(/_/g, " "),
    };
}
