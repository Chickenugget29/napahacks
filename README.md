# Spec-to-Eval: Formal Policy → Automated Red-Team Generator

FastAPI backend + super-basic frontend for interacting with the Spec-to-Eval pipeline.

## Backend

- `backend/app/main.py` – FastAPI entry point and endpoints.
- `backend/app/policy_parser.py` – heuristic parser for natural-language policies.
- `backend/app/prompt_generator.py` – adversarial prompt templates.
- `backend/app/experiment.py` – symbolic vs agent coverage benchmarking (requires Anthropic API key).
- `backend/README.md` – setup/run instructions.

## Frontend

- `frontend/index.html` – single-page UI for parsing policies, generating prompts, and running coverage experiments.
- `frontend/main.js` – fetches backend endpoints and renders results in place.
- `frontend/styles.css` – lightweight styling.

Serve the frontend however you like (VS Code Live Server, `python -m http.server`, etc.). Example:

```bash
cd frontend
python -m http.server 5173
```

Make sure the backend is running (default `http://127.0.0.1:8000`). Update the “Backend URL” field in the UI if needed.
