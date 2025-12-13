from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

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

PLAYGROUND_HTML = """
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Spec-to-Eval Playground</title>
    <style>
      body {
        font-family: monospace;
        margin: 1rem;
        background: #111;
        color: #eee;
      }
      textarea {
        width: 100%;
        min-height: 140px;
        background: #1b1b1b;
        color: #f8f8f2;
        border: 1px solid #444;
        padding: 0.5rem;
      }
      button {
        margin-right: 0.5rem;
        margin-top: 0.5rem;
        padding: 0.4rem 0.8rem;
        cursor: pointer;
      }
      pre {
        background: #0c0c0c;
        padding: 0.75rem;
        overflow-x: auto;
      }
      .row {
        margin-bottom: 1rem;
      }
      label {
        display: block;
        margin-bottom: 0.25rem;
      }
      input[type="number"] {
        width: 80px;
      }
    </style>
  </head>
  <body>
    <h1>Spec-to-Eval Playground</h1>
    <div class="row">
      <label for="policyText">Policy text</label>
      <textarea id="policyText" placeholder="Paste your policy clauses here..."></textarea>
    </div>
    <div class="row">
      <label for="promptCount">Prompt count</label>
      <input type="number" id="promptCount" value="6" min="1" max="48" />
    </div>
    <div class="row">
      <button id="parseBtn">Parse Policy</button>
      <button id="generateBtn">Generate Prompts</button>
      <button id="evaluateBtn">Evaluate (auto-generate prompts)</button>
    </div>
    <div class="row">
      <strong>Status:</strong> <span id="status">Idle</span>
    </div>
    <div class="row">
      <label>Output</label>
      <pre id="output">{}</pre>
    </div>
    <script>
      async function hitEndpoint({ path, body, query = "" }) {
        const res = await fetch(`${path}${query}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || res.statusText);
        }
        return res.json();
      }

      function getPolicyText() {
        return document.getElementById("policyText").value.trim();
      }

      function setStatus(text) {
        document.getElementById("status").innerText = text;
      }

      function setOutput(data) {
        document.getElementById("output").innerText = JSON.stringify(
          data,
          null,
          2
        );
      }

      document.getElementById("parseBtn").addEventListener("click", async () => {
        const policy = getPolicyText();
        if (!policy) {
          alert("Enter a policy first.");
          return;
        }
        setStatus("Parsing...");
        try {
          const data = await hitEndpoint({
            path: "/parse-policy",
            body: { policy_text: policy },
          });
          setOutput(data);
          setStatus("Parsed.");
        } catch (err) {
          setOutput({ error: err.message });
          setStatus("Parse failed.");
        }
      });

      document.getElementById("generateBtn").addEventListener("click", async () => {
        const policy = getPolicyText();
        if (!policy) {
          alert("Enter a policy first.");
          return;
        }
        const count = Number(document.getElementById("promptCount").value || "6");
        setStatus("Generating...");
        try {
          const data = await hitEndpoint({
            path: "/generate-prompts",
            body: { policy_text: policy },
            query: `?total_prompts=${count}`,
          });
          setOutput(data);
          setStatus("Generated.");
        } catch (err) {
          setOutput({ error: err.message });
          setStatus("Generation failed.");
        }
      });

      document.getElementById("evaluateBtn").addEventListener("click", async () => {
        const policy = getPolicyText();
        if (!policy) {
          alert("Enter a policy first.");
          return;
        }
        setStatus("Evaluating...");
        try {
          const data = await hitEndpoint({
            path: "/evaluate",
            body: { policy_text: policy },
          });
          setOutput(data);
          setStatus("Evaluated.");
        } catch (err) {
          setOutput({ error: err.message });
          setStatus("Evaluation failed.");
        }
      });
    </script>
  </body>
</html>
"""


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/parse-policy", response_model=PolicyParseResponse)
def parse_policy_endpoint(request: PolicyParseRequest) -> PolicyParseResponse:
    rules, symbolic_rules = policy_parser.parse_with_symbolic(request.policy_text)
    if not rules:
        raise HTTPException(status_code=400, detail="No policy rules could be parsed.")
    return PolicyParseResponse(
        policy_text=request.policy_text, rules=rules, symbolic_rules=symbolic_rules
    )


@app.post("/generate-prompts", response_model=PromptGenerationResponse)
def generate_prompts_endpoint(
    request: PolicyParseRequest, total_prompts: int = 10
) -> PromptGenerationResponse:
    rules, symbolic_rules = policy_parser.parse_with_symbolic(request.policy_text)
    if not rules:
        raise HTTPException(status_code=400, detail="No policy rules could be parsed.")
    prompts = prompt_generator.generate(
        rules, symbolic_rules, total_prompts=total_prompts
    )
    return PromptGenerationResponse(
        policy_text=request.policy_text,
        rules=rules,
        symbolic_rules=symbolic_rules,
        prompts=prompts,
    )


@app.post("/evaluate", response_model=EvaluationResponse)
def evaluate_endpoint(request: EvaluationRequest) -> EvaluationResponse:
    rules, symbolic_rules = policy_parser.parse_with_symbolic(request.policy_text)
    if not rules:
        raise HTTPException(status_code=400, detail="No policy rules could be parsed.")

    prompts = request.prompts or prompt_generator.generate(rules, symbolic_rules)
    evaluator = Evaluator(target_model=request.target_model)
    results = evaluator.evaluate(prompts, rules)
    return EvaluationResponse(prompts=prompts, results=results)


@app.get("/playground", response_class=HTMLResponse)
def playground() -> HTMLResponse:
    """Minimal UI so humans can poke the pipeline without curl."""
    return HTMLResponse(content=PLAYGROUND_HTML)
