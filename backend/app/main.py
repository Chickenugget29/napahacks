from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .evaluator import Evaluator
from .models import (
    EvaluationRequest,
    EvaluationResponse,
    PolicyParseRequest,
    PolicyParseResponse,
    PromptGenerationResponse,
)
from .policy_parser import PolicyParser
from .prompt_generator import PromptGenerator

app = FastAPI(
    title="Spec-to-Eval: Formal Policy → Automated Red-Team Generator",
    version="0.1.0",
    description="Parse policy specs and produce adversarial evaluation prompts.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

policy_parser = PolicyParser()
prompt_generator = PromptGenerator()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/parse-policy", response_model=PolicyParseResponse)
def parse_policy_endpoint(request: PolicyParseRequest) -> PolicyParseResponse:
    rules = policy_parser.parse(request.policy_text)
    if not rules:
        raise HTTPException(status_code=400, detail="No policy rules could be parsed.")
    return PolicyParseResponse(policy_text=request.policy_text, rules=rules)


@app.post("/generate-prompts", response_model=PromptGenerationResponse)
def generate_prompts_endpoint(
    request: PolicyParseRequest, total_prompts: int = 10
) -> PromptGenerationResponse:
    rules = policy_parser.parse(request.policy_text)
    if not rules:
        raise HTTPException(status_code=400, detail="No policy rules could be parsed.")
    prompts = prompt_generator.generate(rules, total_prompts=total_prompts)
    return PromptGenerationResponse(
        policy_text=request.policy_text, rules=rules, prompts=prompts
    )


@app.post("/evaluate", response_model=EvaluationResponse)
def evaluate_endpoint(request: EvaluationRequest) -> EvaluationResponse:
    rules = policy_parser.parse(request.policy_text)
    if not rules:
        raise HTTPException(status_code=400, detail="No policy rules could be parsed.")

    prompts = request.prompts or prompt_generator.generate(rules)
    evaluator = Evaluator(target_model=request.target_model)
    results = evaluator.evaluate(prompts, rules)
    return EvaluationResponse(prompts=prompts, results=results)
