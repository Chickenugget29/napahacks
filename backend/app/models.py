from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field

from .symbolic import SymbolicRule


class PolicyRule(BaseModel):
    """Structured representation of a single policy rule."""

    id: str
    text: str
    category: str = Field(
        default="general",
        description="Heuristic bucket for the rule (privacy, self-harm, etc.)",
    )
    keywords: List[str] = Field(default_factory=list)


class PolicyParseRequest(BaseModel):
    policy_text: str = Field(..., min_length=1)


class PolicyParseResponse(BaseModel):
    policy_text: str
    rules: List[PolicyRule]
    symbolic_rules: List[SymbolicRule]


class AdversarialPrompt(BaseModel):
    id: str
    text: str
    target_rule_id: str
    strategy: str
    satisfies: Optional[List[str]] = Field(
        default=None,
        description="Optional list of symbolic predicates the prompt intentionally satisfies.",
    )


class PromptGenerationResponse(BaseModel):
    policy_text: str
    rules: List[PolicyRule]
    symbolic_rules: List[SymbolicRule]
    prompts: List[AdversarialPrompt]


class ExperimentMetrics(BaseModel):
    num_prompts: int
    rules_covered: int
    predicate_combinations: int
    traceable: bool
    coverage_percent: float
    specification_sensitivity: float


class ExperimentResponse(BaseModel):
    agent_only: ExperimentMetrics
    symbolic_guided: ExperimentMetrics
