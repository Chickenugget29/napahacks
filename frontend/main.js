const state = {
  rules: [],
  prompts: [],
  results: [],
};

const els = {
  backendUrl: document.getElementById("backendUrl"),
  policyText: document.getElementById("policyText"),
  promptCount: document.getElementById("promptCount"),
  targetModel: document.getElementById("targetModel"),
  rulesOutput: document.getElementById("rulesOutput"),
  promptsOutput: document.getElementById("promptsOutput"),
  resultsOutput: document.getElementById("resultsOutput"),
  statusLog: document.getElementById("statusLog"),
  parseBtn: document.getElementById("parseBtn"),
  promptBtn: document.getElementById("promptBtn"),
  evaluateBtn: document.getElementById("evaluateBtn"),
};

const log = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  els.statusLog.textContent = `[${timestamp}] ${message}\n${els.statusLog.textContent}`;
};

const apiCall = async (path, body = {}, query = "") => {
  const url = `${els.backendUrl.value}${path}${query}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }
  return response.json();
};

const getPolicyText = () => {
  const text = els.policyText.value.trim();
  if (!text) {
    throw new Error("Policy text cannot be empty.");
  }
  return text;
};

const renderRules = () => {
  if (!state.rules.length) {
    els.rulesOutput.textContent = "No rules parsed yet.";
    return;
  }
  const list = state.rules
    .map(
      (rule) => `
        <div class="rule">
          <strong>${rule.id}</strong>
          <div>${rule.text}</div>
          <small>Category: ${rule.category} · Keywords: ${rule.keywords.join(", ") || "None"}</small>
        </div>
      `
    )
    .join("");
  els.rulesOutput.innerHTML = list;
};

const renderPrompts = () => {
  if (!state.prompts.length) {
    els.promptsOutput.textContent = "No prompts generated yet.";
    return;
  }
  const list = state.prompts
    .map(
      (prompt) => `
        <div class="prompt">
          <strong>${prompt.strategy}</strong>
          <p>${prompt.text}</p>
          <small>Targets: ${prompt.target_rule_id}</small>
        </div>
      `
    )
    .join("");
  els.promptsOutput.innerHTML = list;
};

const renderResults = () => {
  if (!state.results.length) {
    els.resultsOutput.textContent = "No evaluations run.";
    return;
  }
  const rows = state.results
    .map(
      (result) => `
        <tr class="${result.passed ? "pass" : "fail"}">
          <td>${result.prompt_id}</td>
          <td>${result.passed ? "PASS" : "FAIL"}</td>
          <td>${result.prompt_text}</td>
          <td>${result.response_text}</td>
          <td>${result.explanation}</td>
        </tr>
      `
    )
    .join("");
  els.resultsOutput.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Prompt ID</th>
          <th>Result</th>
          <th>Prompt</th>
          <th>Model Response</th>
          <th>Explanation</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

const handleParse = async () => {
  try {
    const policy_text = getPolicyText();
    log("Parsing policy...");
    const data = await apiCall("/parse-policy", { policy_text });
    state.rules = data.rules;
    state.prompts = [];
    state.results = [];
    renderRules();
    renderPrompts();
    renderResults();
    log(`Parsed ${state.rules.length} rule(s).`);
  } catch (error) {
    log(`Parse failed: ${error.message}`);
  }
};

const handleGenerate = async () => {
  try {
    const policy_text = getPolicyText();
    const total_prompts = Number(els.promptCount.value) || 10;
    log(`Generating ${total_prompts} prompt(s)...`);
    const data = await apiCall(
      "/generate-prompts",
      { policy_text },
      `?total_prompts=${total_prompts}`
    );
    state.rules = data.rules;
    state.prompts = data.prompts;
    state.results = [];
    renderRules();
    renderPrompts();
    renderResults();
    log(`Generated ${state.prompts.length} prompt(s).`);
  } catch (error) {
    log(`Prompt generation failed: ${error.message}`);
  }
};

const handleEvaluate = async () => {
  try {
    const policy_text = getPolicyText();
    const target_model = els.targetModel.value.trim() || null;
    const body = {
      policy_text,
      target_model,
    };
    if (state.prompts.length) {
      body.prompts = state.prompts;
    }
    log("Running evaluation...");
    const data = await apiCall("/evaluate", body);
    state.prompts = data.prompts;
    state.results = data.results;
    renderPrompts();
    renderResults();
    log(`Evaluation complete. ${state.results.length} result(s).`);
  } catch (error) {
    log(`Evaluation failed: ${error.message}`);
  }
};

els.parseBtn.addEventListener("click", handleParse);
els.promptBtn.addEventListener("click", handleGenerate);
els.evaluateBtn.addEventListener("click", handleEvaluate);

renderRules();
renderPrompts();
renderResults();
