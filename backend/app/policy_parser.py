from __future__ import annotations

import re
import uuid
from typing import List

from .models import PolicyRule
from .symbolic import SymbolicRule, compile_to_symbolic


STOPWORDS = {
    "the",
    "and",
    "that",
    "this",
    "with",
    "from",
    "about",
    "into",
    "onto",
    "your",
    "their",
    "any",
    "must",
    "not",
    "never",
    "should",
    "shall",
    "cannot",
    "cant",
    "can't",
    "always",
    "only",
    "when",
    "where",
    "what",
    "who",
    "whom",
    "how",
    "why",
    "for",
    "are",
    "you",
    "they",
    "our",
    "please",
}

CATEGORY_KEYWORDS = {
    "self-harm": {"suicide", "self harm", "self-harm", "hurt myself", "kill myself"},
    "violence": {"violence", "weapon", "bomb", "attack", "fight", "harm"},
    "privacy": {"personal data", "pii", "address", "phone", "ssn", "name"},
    "medical": {"medical", "diagnosis", "drug", "medicine", "prescription"},
    "financial": {"money", "credit", "loan", "gambling", "investment"},
    "copyright": {"copyright", "plagiarize", "plagiarism", "piracy"},
    "political": {"election", "political", "campaign", "propaganda"},
}


class PolicyParser:
    """Convert natural language policies into structured rule objects."""

    def parse(self, policy_text: str) -> List[PolicyRule]:
        return self._build_policy_rules(policy_text)

    def parse_with_symbolic(
        self, policy_text: str
    ) -> tuple[List[PolicyRule], List[SymbolicRule]]:
        rules = self._build_policy_rules(policy_text)
        symbolic_rules = [compile_to_symbolic(rule) for rule in rules]
        return rules, symbolic_rules

    def _build_policy_rules(self, policy_text: str) -> List[PolicyRule]:
        raw_rules = self._extract_candidate_rules(policy_text)
        rules: List[PolicyRule] = []
        for idx, sentence in enumerate(raw_rules):
            normalized = sentence.strip()
            if not normalized:
                continue
            category = self._infer_category(normalized)
            keywords = self._extract_keywords(normalized)
            rules.append(
                PolicyRule(
                    id=f"rule-{idx+1}-{uuid.uuid4().hex[:6]}",
                    text=normalized,
                    category=category,
                    keywords=keywords,
                )
            )
        return rules

    def _extract_candidate_rules(self, policy_text: str) -> List[str]:
        # Normalize bullets and numbering.
        text = policy_text.replace("\r\n", "\n")
        lines = []
        for raw_line in text.split("\n"):
            line = raw_line.strip()
            if not line:
                lines.append("")  # Preserve paragraph boundaries
                continue
            line = re.sub(r"^[\-\*\d\.\)\(]+", "", line).strip()
            # Split at sentence terminators when the sentence looks long.
            if len(line) > 180 and ". " in line:
                lines.extend(seg.strip() for seg in line.split(". ") if seg.strip())
            else:
                lines.append(line)

        # Merge contiguous non-empty lines that belong together.
        rules: List[str] = []
        buffer: List[str] = []
        for line in lines:
            if not line:
                if buffer:
                    rules.append(" ".join(buffer))
                    buffer = []
                continue
            buffer.append(line)
        if buffer:
            rules.append(" ".join(buffer))
        return rules

    def _infer_category(self, text: str) -> str:
        lower_text = text.lower()
        for category, keywords in CATEGORY_KEYWORDS.items():
            if any(keyword in lower_text for keyword in keywords):
                return category
        if "must not" in lower_text or "prohibit" in lower_text:
            return "prohibited"
        if "allowed" in lower_text or "permitted" in lower_text:
            return "allowed"
        return "general"

    def _extract_keywords(self, text: str) -> List[str]:
        tokens = re.findall(r"[a-zA-Z][a-zA-Z\-']+", text.lower())
        keywords = []
        for token in tokens:
            if len(token) < 4 or token in STOPWORDS:
                continue
            if token not in keywords:
                keywords.append(token)
        return keywords[:6]


def parse_policy(policy_text: str) -> List[PolicyRule]:
    """Convenience function for callers that don't need the class."""
    parser = PolicyParser()
    return parser.parse(policy_text)
