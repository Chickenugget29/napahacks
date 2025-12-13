const state = {
  rules: [],
  prompts: [],
};

const els = {
  backendUrl: document.getElementById("backendUrl"),
  policyText: document.getElementById("policyText"),
  promptCount: document.getElementById("promptCount"),
  rulesOutput: document.getElementById("rulesOutput"),
  promptsOutput: document.getElementById("promptsOutput"),
  statusLog: document.getElementById("statusLog"),
  parseBtn: document.getElementById("parseBtn"),
  promptBtn: document.getElementById("promptBtn"),
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

const handleParse = async () => {
  try {
    const policy_text = getPolicyText();
    log("Parsing policy...");
    const data = await apiCall("/parse-policy", { policy_text });
    state.rules = data.rules;
    state.prompts = [];
    renderRules();
    renderPrompts();
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
    renderRules();
    renderPrompts();
    log(`Generated ${state.prompts.length} prompt(s).`);
  } catch (error) {
    log(`Prompt generation failed: ${error.message}`);
  }
};

els.parseBtn.addEventListener("click", handleParse);
els.promptBtn.addEventListener("click", handleGenerate);

renderRules();
renderPrompts();
