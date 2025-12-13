# Spec-to-Eval Backend

FastAPI service that converts informal policy specs into structured rules, generates adversarial prompts, and optionally evaluates those prompts against an LLM.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Running

```bash
uvicorn app.main:app --reload
```

Optional: export `OPENAI_API_KEY` to enable live evaluations with OpenAI-compatible models. Without it, the evaluator returns heuristic judgments only.

## Endpoints

- `POST /parse-policy` — body: `{ "policy_text": "..." }` → structured rules.
- `POST /generate-prompts` — same body, optional `?total_prompts=10` query → rules + adversarial prompts.
- `POST /evaluate` — body: `{ "policy_text": "...", "prompts": [...], "target_model": "gpt-4o-mini" }`. If prompts omitted, they are auto-generated.
