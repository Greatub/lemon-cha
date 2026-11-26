const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const source = readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");
function section(start, end) {
  return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
}

function loadPresets() {
  const templates = new Map([
    ["summarize", { id: "summarize", name: "Summarize", content: "Summarize accurately" }],
    ["custom", { id: "custom", name: "Custom", content: "Original instructions" }]
  ]);
  const state = { composerMode: "chat" };
  const els = {
    promptInput: { value: "My existing text" },
    promptTemplateSelect: { value: "" },
    presetDetails: { open: true }
  };
  const functions = [
    section("function selectedPromptPresetSnapshot(", "function syncThinkingToggle("),
    section("function applyPromptPreset(", 'els.promptTemplateSelect.addEventListener("change"'),
    section("function serializeContextMessages(", "function pushSystemMessage("),
    section("async function regenerateFromMessage(", "async function continueFromMessage(")
  ].join("\n");
  const requests = [];
  const api = runInNewContext(`${functions}\n({ applyPromptPreset, selectedPromptPresetSnapshot, composePresetPrompt, serializeContextMessages, regenerateFromMessage })`, {
    state, els,
    getPromptTemplate: (id) => templates.get(id),
    localizedTemplateName: (template) => template.name,
    localizedTemplateContent: (template) => template.content,
    resolvePromptTemplateVariables: (content) => content,
    requestCloseSettingsPage: () => true,
    collapsePanelSidebar() {},
    setComposerMode: (mode) => { state.composerMode = mode; },
    syncCustomSelects() {},
    resizePromptInput() {},
    getActiveConfig: () => ({ memoryEnabled: true, historyLimit: 10 }),
    async saveConversations() {},
    render() {},
    async generateAssistantResponse(_conversation, _config, messages) { requests.push(messages); }
  });
  return { ...api, els, state, templates, requests };
}

test("switching or removing a preset preserves entered text and restores ordinary chat", () => {
  const app = loadPresets();
  for (const id of ["summarize", "custom", ""]) {
    app.applyPromptPreset(id, { fromSidebar: true });
    assert.equal(app.els.promptInput.value, "My existing text");
    assert.equal(app.els.promptTemplateSelect.value, id);
    assert.equal(app.els.presetDetails.open, false);
  }
  assert.equal(app.selectedPromptPresetSnapshot(), null);
  assert.equal(app.composePresetPrompt("Hello", null), "Hello");
  app.applyPromptPreset("summarize");
  app.state.composerMode = "translate";
  assert.equal(app.selectedPromptPresetSnapshot(), null);
});

test("regeneration and context use the sent snapshot after a preset changes or is removed", async () => {
  const app = loadPresets();
  app.applyPromptPreset("custom");
  const promptPreset = app.selectedPromptPresetSnapshot();
  const user = { role: "user", content: "Source text", promptPreset };
  app.templates.get("custom").content = "Changed instructions";
  app.templates.delete("custom");
  app.applyPromptPreset("");
  const conversation = { messages: [user, { role: "assistant", content: "Old response" }] };
  await app.regenerateFromMessage(conversation, 1);
  assert.deepEqual(structuredClone(app.requests[0]), [
    { role: "user", content: "Original instructions\n\nSource text" }
  ]);
  assert.equal(user.content, "Source text");
  assert.equal(user.promptPreset.name, "Custom");
  const context = app.serializeContextMessages([user, { role: "user", content: "Follow-up" }], 10);
  assert.equal(context[0].content, "Original instructions\n\nSource text");
  assert.equal(context[1].content, "Follow-up");
});
