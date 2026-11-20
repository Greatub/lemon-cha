const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const popup = readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");

function loadConversationDrafts(config) {
  const labels = {
    "en-US": { newChatTitle: "New Chat", translateMode: "Translate" },
    "zh-CN": { newChatTitle: "新对话", translateMode: "翻译" }
  };
  const state = { conversations: [], draftConversation: null, activeConversationId: "" };
  const saves = [];
  const notices = [];
  const stateFunctions = popup.slice(popup.indexOf("function normalizeConversationMode("), popup.indexOf("function getActiveConfig("));
  const submit = popup.slice(popup.indexOf("async function submitPrompt("), popup.indexOf("function buildTranslationRequestPrompt("));
  const api = runInNewContext(`${stateFunctions}\n${submit}\n({ startConversationDraft, getActiveConversation, readStoredConversations, submitPrompt })`, {
    state,
    UI_TEXT: labels,
    t: (key) => labels["en-US"][key] || key,
    els: { promptInput: { value: "Draft text" } },
    getActiveConfig: () => config,
    pushSystemMessage: (message) => notices.push(message),
    resizePromptInput() {},
    titleFromPrompt: (_conversation, prompt) => prompt,
    getContextMessages: () => [],
    saveConversations: async () => saves.push(structuredClone(state.conversations)),
    render() {},
    async generateAssistantResponse() {},
    generateConversationTitle() {}
  });
  return { ...api, state, saves, notices };
}

test("blank chat and translation drafts stay outside history until the first message", async () => {
  const app = loadConversationDrafts({ endpoint: "https://example.test", model: "test" });
  const initial = app.getActiveConversation();
  app.startConversationDraft("chat");
  const translation = app.startConversationDraft("translate");
  assert.notEqual(initial.id, translation.id);
  assert.equal(app.getActiveConversation(), translation);
  assert.deepEqual(app.state.conversations, []);
  assert.deepEqual(app.saves, []);

  await app.submitPrompt(translation, "Translate this");
  assert.equal(app.state.activeConversationId, translation.id);
  assert.equal(app.state.draftConversation, null);
  assert.equal(app.state.conversations.length, 1);
  assert.equal(app.saves[0][0].mode, "translate");
  assert.deepEqual(app.saves[0][0].messages, [{ role: "user", content: "Translate this" }]);
});

test("a draft stays temporary if the required model configuration is missing", async () => {
  const app = loadConversationDrafts({});
  const draft = app.startConversationDraft();
  await app.submitPrompt(draft, "Try sending");
  assert.equal(app.getActiveConversation(), draft);
  assert.deepEqual(app.saves, []);
  assert.deepEqual(app.notices, ["missingEndpointModel"]);
});

test("only untouched legacy placeholders are filtered from stored history", () => {
  const app = loadConversationDrafts({});
  const blank = { id: "blank", title: "翻译", messages: [], createdAt: 10, updatedAt: 10 };
  const folder = { ...blank, id: "folder", folderId: "work" };
  const renamed = { ...blank, id: "renamed", title: "Travel" };
  const edited = { ...blank, id: "edited", updatedAt: 11 };
  const used = { ...blank, id: "used", messages: [{ role: "user", content: "Hello" }] };
  const records = [blank, folder, renamed, edited, used];
  assert.deepEqual(app.readStoredConversations(records), [folder, renamed, edited, used]);
  assert.equal(records.length, 5);
});
