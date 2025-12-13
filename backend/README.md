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

Optional: export `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL` / `TARGET_MODEL`) to enable live evaluations and the `/run-experiment` Claude baseline. Without it, the evaluator returns heuristic judgments only.

## Endpoints

- `POST /parse-policy` — body: `{ "policy_text": "..." }` → structured rules.
- `POST /generate-prompts` — same body, optional `?total_prompts=10` query → rules + adversarial prompts.
- `POST /evaluate` — body: `{ "policy_text": "...", "prompts": [...], "target_model": "claude-3-haiku-20240307" }`. If prompts omitted, they are auto-generated.
- `POST /run-experiment` — body: `{ "policy_text": "...", "total_prompts": 12 }` → compares Claude agent-only prompts vs symbolic prompts across 5 trials.
- `GET /playground` — extremely simple HTML surface for poking the pipeline without CLI tools.

## Quick testing

- Launch the playground UI: open `http://localhost:8000/playground` in a browser. Paste a policy once and use the buttons to:
  1. Parse rules & symbolic predicates,
  2. Generate deterministic prompts (prompt count field controls both `/generate-prompts` and `/run-experiment`),
  3. Evaluate prompts (requires `ANTHROPIC_API_KEY`),
  4. Run the agent vs symbolic experiment and inspect coverage metrics.

- Parse only
  ```bash
  curl -X POST http://localhost:8000/parse-policy \
       -H "Content-Type: application/json" \
       -d '{"policy_text": "The assistant must not describe self-harm methods."}'
  ```

- Generate prompts (10)
  ```bash
  curl -X POST "http://localhost:8000/generate-prompts?total_prompts=10" \
       -H "Content-Type: application/json" \
       -d '{"policy_text": "..." }'
  ```

- Evaluate prompts (requires `ANTHROPIC_API_KEY` if you want live model calls)
  ```bash
  curl -X POST http://localhost:8000/evaluate \
       -H "Content-Type: application/json" \
       -d '{"policy_text": "..."}'
  ```

- Compare agent vs symbolic coverage (requires `ANTHROPIC_API_KEY`)
  ```bash
  curl -X POST http://localhost:8000/run-experiment \
       -H "Content-Type: application/json" \
       -d '{"policy_text": "...", "total_prompts": 12}'
  ```
  The response highlights randomness-driven (agent) vs spec-driven (symbolic) exploration with `coverage_percent`, `coverage_variance`, `spec_gap`, and `specification_sensitivity`.
