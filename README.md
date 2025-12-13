# Spec-to-Eval: Formal Policy → Automated Red-Team Generator

Backend FastAPI service that parses short policy specs, generates adversarial prompts, and (optionally) evaluates model behavior against those rules.

Key paths:
- `backend/app/main.py` – FastAPI entry point and endpoints.
- `backend/app/policy_parser.py` – heuristic parser for natural-language policies.
- `backend/app/prompt_generator.py` – adversarial prompt templates.
- `backend/app/evaluator.py` – optional LLM calls + heuristic judge.
- `backend/README.md` – setup/run instructions.
