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

INTENT_PATTERNS = {
    "advice": ("advise", "advice", "guidance", "recommendation"),
    "instructions": ("instruction", "instructions", "how to", "steps", "procedure"),
    "analysis": ("analyze", "analysis", "evaluate", "assessment", "diagnose"),
    "information": ("explain", "describe", "outline", "information", "details"),
    "classification": ("classify", "categorize", "label", "determine"),
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
    "=minor": ("minor", "child", "children", "teen", "teenager", "underage"),
}

VIOLATION_MARKERS = ("must not", "mustn't", "cannot", "can't", "never", "prohibit", "forbid", "ban")


class SymbolicRule(BaseModel):
    """Symbolic constraints compiled from a single policy clause."""

    rule_id: str
    predicates: List[str] = Field(default_factory=list)
    violation: bool = Field(
        default=True,
        description="True when the clause expresses a prohibited behavior.",
    )

    def predicate_map(self) -> Dict[str, Tuple[str, str]]:
        """Expose predicates as {name: (operator, value)} for downstream logic."""
        mapping: Dict[str, Tuple[str, str]] = {}
        for expr in self.predicates:
            if "!=" in expr:
                key, value = expr.split("!=", 1)
                mapping[key.strip()] = ("!=", value.strip())
            elif "=" in expr:
                key, value = expr.split("=", 1)
                mapping[key.strip()] = ("=", value.strip())
        return mapping


def compile_to_symbolic(rule: "PolicyRule") -> SymbolicRule:
    """Deterministically translate a policy rule into symbolic predicates."""
    text = rule.text.lower()
    predicates: List[str] = []

    domain = DOMAIN_FROM_CATEGORY.get(rule.category)
    if not domain:
        domain = _infer_domain_from_text(text)
    if domain:
        predicates.append(f"domain={domain}")

    intent = _infer_intent(text)
    if intent:
        predicates.append(f"intent={intent}")

    role_predicate = _infer_user_role(text)
    if role_predicate:
        predicates.append(f"user_role{role_predicate}")

    if not predicates:
        predicates.append("domain=general")

    violation = _is_violation(text)
    return SymbolicRule(rule_id=rule.id, predicates=predicates, violation=violation)


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


def _infer_intent(text: str) -> Optional[str]:
    for intent, markers in INTENT_PATTERNS.items():
        if any(marker in text for marker in markers):
            return intent
    if "role-play" in text or "role play" in text:
        return "simulation"
    return None


def _infer_user_role(text: str) -> Optional[str]:
    for predicate, markers in ROLE_PATTERNS.items():
        if any(marker in text for marker in markers):
            return predicate
    if "non professional" in text or "non-professional" in text:
        return "!=professional"
    if "professional" in text:
        return "=professional"
    return None


def _is_violation(text: str) -> bool:
    if any(marker in text for marker in VIOLATION_MARKERS):
        return True
    return "allow" not in text and "permitted" not in text
