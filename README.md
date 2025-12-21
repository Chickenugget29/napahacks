# Spec-to-Eval: Formal Policy → Automated Red-Team Generator

FastAPI + React system that turns short policy specs into symbolic constraints, generates adversarial prompts (tagged with semantic `request_frame` metadata), and can compare symbolic coverage against a Claude baseline.

## Repository layout

- `backend/` – FastAPI service (parsing, symbolic compilation, prompt generator, experiment runner).
- `src/` – Vite/React UI (policy console, rule visualizer, prompt schedule, experiment metrics).
- `public/`, `vite.config.ts`, etc. – standard Vite build plumbing.

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm (or pnpm)
- Optional: `ANTHROPIC_API_KEY` if you want `/run-experiment` to call Claude instead of heuristic fallbacks

## Quick start

1. **Backend**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
   The API listens on `http://127.0.0.1:8000` by default. Useful endpoints:
   - `POST /parse-policy`
   - `POST /generate-prompts?total_prompts=10`
   - `POST /run-experiment?total_prompts=10`
   - `GET /playground` – barebones HTML surface for poking endpoints without the React UI.

2. **Frontend**
   ```bash
   npm install
   echo "VITE_BACKEND_URL=http://127.0.0.1:8000" > .env.local  # optional; defaults to 127.0.0.1:8000
   npm run dev
   ```
   Visit `http://localhost:5173`, paste a policy snippet on the left, then:
   - **Parse Rules** → view structured + symbolic rules (with `request_frame` options per clause).
   - **Generate Prompts** → deterministic adversarial prompts grouped by semantic frame.
   - **Run Experiment** → compares symbolic coverage against Claude (needs `ANTHROPIC_API_KEY`).

## Environment variables

| Scope         | Variable            | Purpose                                                       |
|---------------|---------------------|---------------------------------------------------------------|
| Frontend      | `VITE_BACKEND_URL`  | API base URL for the React app (defaults to `http://127.0.0.1:8000`). |
| Backend       | `ANTHROPIC_API_KEY` | Enables live Claude prompt sampling + judging.               |
| Backend       | `ANTHROPIC_MODEL`   | Optional Claude model override (`claude-3-haiku-20240307` default). |

> **Note:** The parser now uses AMR (amrlib) and AllenNLP semantic role labeling under the hood. The first run will download pretrained checkpoints; if either library is missing, the parser falls back to heuristic keyword extraction.
>
> Semantic parsing extras are optional. If you want richer parsing, install PyTorch plus `amrlib`, `allennlp`, and `allennlp-models` manually (see `backend/README.md` for commands). Without them, the parser falls back to heuristics.

## Additional docs

- Backend specifics, curl snippets, and evaluator details live in [`backend/README.md`](backend/README.md).
- The FastAPI playground (`/playground`) remains available if you need a minimal UI for manual testing.
