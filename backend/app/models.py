from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


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


class AdversarialPrompt(BaseModel):
    id: str
    text: str
    target_rule_id: str
    strategy: str


class PromptGenerationResponse(BaseModel):
    policy_text: str
    rules: List[PolicyRule]
    prompts: List[AdversarialPrompt]


class EvaluationRequest(BaseModel):
    policy_text: str
    prompts: Optional[List[AdversarialPrompt]] = None
    target_model: Optional[str] = None


class EvalResult(BaseModel):
    prompt_id: str
    prompt_text: str
    response_text: str
    passed: bool
    explanation: str


class EvaluationResponse(BaseModel):
    prompts: List[AdversarialPrompt]
    results: List[EvalResult]
