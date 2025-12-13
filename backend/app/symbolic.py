from __future__ import annotations

from typing import Dict, List, Optional, Tuple, TYPE_CHECKING

from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from .models import PolicyRule


DOMAIN_FROM_CATEGORY = {
    "medical": "medical",
    "self-harm": "self_harm",
    "violence": "violence",
    "privacy": "privacy",
    "financial": "financial",
    "copyright": "copyright",
    "political": "political",
}

INTENT_DIMENSIONS = ("procedural", "comparative", "optimization")
PERSPECTIVE_DIMENSIONS = ("first_person", "third_person", "hypothetical")

INTENT_PATTERNS = {
    "procedural": (
        "how to",
        "how-to",
        "instruction",
        "instructions",
        "steps",
        "procedure",
        "walk me through",
        "guide me",
        "method",
        "plan",
        "blueprint",
    ),
    "comparative": (
        "compare",
        "versus",
        "vs.",
        "difference",
        "pros and cons",
        "better than",
        "worse than",
        "relative to",
    ),
    "optimization": (
        "optimize",
        "maximize",
        "minimize",
        "most efficient",
        "best way",
        "streamline",
        "improve",
        "fine tune",
    ),
}

CONTEXT_PATTERNS = {
    "prevention": (
        "prevention",
        "harm reduction",
        "suicide hotline",
        "intervention",
        "crisis line",
        "safety planning",
    ),
    "academic": (
        "academic",
        "research",
        "study",
        "paper",
        "whitepaper",
        "peer reviewed",
        "laboratory",
    ),
}

PERSPECTIVE_PATTERNS = {
    "third_person": ("third person", "third-person", "narrate", "describe them"),
    "hypothetical": ("hypothetical", "imagine", "suppose", "scenario", "what if"),
    "first_person": ("first person", "as myself"),
}

ROLE_PATTERNS = {
    "!=professional": (
        "non professional",
        "non-professional",
        "layperson",
        "lay person",
        "general public",
        "public",
        "novice",
        "beginner",
        "student",
    ),
    "=professional": (
        "licensed professional",
        "doctor",
        "physician",
        "lawyer",
        "engineer",
        "professional only",
        "certified expert",
    ),
    "=clinician": (
        "clinician",
        "therapist",
        "psychiatrist",
        "psychologist",
        "counselor",
        "nurse",
        "paramedic",
    ),
    "=researcher": (
        "researcher",
        "principal investigator",
        "lab lead",
        "scientist",
    ),
}

VIOLATION_MARKERS = ("must not", "mustn't", "cannot", "can't", "never", "prohibit", "forbid", "ban")

EMOTIONAL_TRIGGERS = {
    "distress": ("distress", "panic", "panicked", "overwhelmed", "despair", "crying"),
    "ideation": ("ideation", "urge to", "impulse to", "want to", "fantasize about"),
    "escalation": ("spiral", "escalating", "worsening", "intensifying"),
}

DEFAULT_DOMAIN = "general"
DEFAULT_INTENT = "procedural"
DEFAULT_CONTEXT = "neutral"
DEFAULT_PERSPECTIVE = "first_person"
DEFAULT_ROLE = "general"

PREDICATE_ALIASES = {
    "Domain": "domain",
    "Intent": "intent",
    "UserRole": "user_role",
    "Context": "context",
    "Perspective": "perspective",
    "Trigger": "trigger",
}


class SymbolicRule(BaseModel):
    """Symbolic constraints compiled from a single policy clause."""

    rule_id: str
    quantifier: str = Field(default="forall")
    variables: List[str] = Field(default_factory=list)
    conditions: List[Tuple[str, str, str]] = Field(default_factory=list)
    conclusion: Tuple[str, str] = Field(default=("Violation", "r"))
    dimensions: Dict[str, List[str]] = Field(default_factory=dict)
    predicates: List[str] = Field(default_factory=list)
    violation: bool = Field(
        default=True,
        description="True when the clause expresses a prohibited behavior.",
    )

    def predicate_map(self) -> Dict[str, Tuple[str, str]]:
        """Expose flattened predicates as {name: (operator, value)} for downstream logic."""
        mapping: Dict[str, Tuple[str, str]] = {}
        for expr in self.predicates:
            if "!=" in expr:
                key, value = expr.split("!=", 1)
                mapping[key.strip()] = ("!=", value.strip())
            elif "=" in expr:
                key, value = expr.split("=", 1)
                mapping[key.strip()] = ("=", value.strip())
        return mapping

    def to_predicate_list(self) -> List[str]:
        """Flatten first-order clauses into compatibility predicates (e.g., domain=self_harm)."""
        flattened: List[str] = []
        for predicate, _, value in self.conditions:
            normalized = PREDICATE_ALIASES.get(predicate, predicate.lower())
            if value.startswith("!"):
                flattened.append(f"{normalized}!={value[1:]}")
            else:
                flattened.append(f"{normalized}={value}")
        return flattened


def compile_to_symbolic(rule: "PolicyRule") -> SymbolicRule:
    """Deterministically translate a policy rule into symbolic first-order clauses."""
    text = rule.text.lower()

    domain = DOMAIN_FROM_CATEGORY.get(rule.category) or _infer_domain_from_text(text) or DEFAULT_DOMAIN
    intent = _infer_intent(text, domain)
    role_op, role_value = _infer_user_role(text)
    context_op, context_value = _infer_context_clause(text)
    perspective_op, perspective_value = _infer_perspective(text)

    def _value_with_op(op: str, value: str) -> str:
        return value if op == "=" else f"!{value}"

    conditions: List[Tuple[str, str, str]] = [
        ("Domain", "r", domain),
        ("Intent", "r", intent),
        ("UserRole", "r", _value_with_op(role_op, role_value)),
        ("Context", "r", _value_with_op(context_op, context_value)),
        ("Perspective", "r", _value_with_op(perspective_op, perspective_value)),
    ]

    for trigger in _infer_triggers(text):
        conditions.append(("Trigger", "r", trigger))

    violation = _is_violation(text)
    symbolic_rule = SymbolicRule(
        rule_id=rule.id,
        quantifier="forall",
        variables=["r"],
        conditions=conditions,
        conclusion=("Violation", "r"),
        violation=violation,
        dimensions={
            "intent": list(INTENT_DIMENSIONS),
            "perspective": list(PERSPECTIVE_DIMENSIONS),
        },
    )
    symbolic_rule.predicates = symbolic_rule.to_predicate_list()
    return symbolic_rule


def _infer_domain_from_text(text: str) -> Optional[str]:
    keyword_map = {
        "medical": ("medical", "health", "diagnosis", "treatment", "symptom"),
        "self_harm": ("self harm", "self-harm", "suicide"),
        "violence": ("weapon", "attack", "harm", "fight", "explosive"),
        "privacy": ("personal data", "pii", "address", "phone", "ssn"),
        "financial": ("money", "loan", "credit", "investment", "bet"),
        "copyright": ("copyright", "plagiarize", "piracy"),
        "political": ("election", "propaganda", "campaign"),
    }
    for domain, markers in keyword_map.items():
        if any(marker in text for marker in markers):
            return domain
    return None


def _infer_intent(text: str, domain: str) -> str:
    for intent, markers in INTENT_PATTERNS.items():
        if any(marker in text for marker in markers):
            return intent
    if "better" in text and "than" in text:
        return "comparative"
    if "optimize" in text or "efficient" in text:
        return "optimization"
    if domain == "self_harm":
        return "procedural"
    return DEFAULT_INTENT


def _infer_user_role(text: str) -> Tuple[str, str]:
    for predicate, markers in ROLE_PATTERNS.items():
        if any(marker in text for marker in markers):
            op, value = _split_predicate_token(predicate)
            return op, value
    if "non professional" in text or "non-professional" in text:
        return "!=", "professional"
    if "non clinician" in text or "non-clinician" in text:
        return "!=", "clinician"
    if "professional" in text:
        return "=", "professional"
    return "=", DEFAULT_ROLE


def _infer_context_clause(text: str) -> Tuple[str, str]:
    for context, markers in CONTEXT_PATTERNS.items():
        if any(marker in text for marker in markers):
            if _contains_allowance_language(text):
                # e.g., "only in prevention contexts" -> we forbid everything except prevention.
                return "!=", context
            return "=", context
    return "=", DEFAULT_CONTEXT


def _infer_perspective(text: str) -> Tuple[str, str]:
    for perspective, markers in PERSPECTIVE_PATTERNS.items():
        if any(marker in text for marker in markers):
            return "=", perspective
    return "=", DEFAULT_PERSPECTIVE


def _contains_allowance_language(text: str) -> bool:
    allowance_tokens = (" only ", " unless ", " except ", " solely ", " exclusive ")
    if any(token in text for token in allowance_tokens):
        return True
    return text.startswith("only ") or text.startswith("unless ")


def _infer_triggers(text: str) -> List[str]:
    triggers: List[str] = []
    for name, markers in EMOTIONAL_TRIGGERS.items():
        if any(marker in text for marker in markers):
            triggers.append(name)
    return triggers


def _split_predicate_token(token: str) -> Tuple[str, str]:
    if token.startswith("!="):
        return "!=", token[2:]
    if token.startswith("="):
        return "=", token[1:]
    return "=", token


def _is_violation(text: str) -> bool:
    if any(marker in text for marker in VIOLATION_MARKERS):
        return True
    return "allow" not in text and "permitted" not in text
