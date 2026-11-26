const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");
const source = readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");
function section(start, end) {
  return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
}
function loadModels(settings = {}) {
  const state = { settings: { preset: "deepseek", provider: "custom", customModel: "deepseek-chat", customEndpoint: "https://api.deepseek.com/chat/completions", customApiKey: "fixture-service-key", modelConfigs: {}, ...settings } };
  function element() {
    return { children: [], append(child) { this.children.push(child); } };
  }
  const select = element();
  Object.defineProperty(select, "innerHTML", { set() { this.children = []; } });
  Object.defineProperty(select, "options", { get() { return this.children.flatMap((group) => group.children); } });
  Object.defineProperty(select, "value", {
    get() { return this.options.find((option) => option.selected)?.value || this.options[0]?.value || ""; },
    set(value) { this.options.forEach((option) => { option.selected = option.value === value; }); }
  });
  const functions = [
    section("const MODEL_PRESETS =", "const extensionApi ="),
    section("function ensureModelConfigs(", "function saveCurrentModelConfig("),
    section("function renderToolbarModelOptions(", "function persistCurrentProviderFields("),
    section("function applyPreset(", "function applyDefaultPromptSelection(")
  ].join("\n");
  const api = runInNewContext(`${functions}\n({ getModelConfigForPreset, renderToolbarModelOptions, toolbarModelValueFor, applyPreset })`, {
    state,
    DEFAULT_SETTINGS: { customModel: "deepseek-chat", customEndpoint: "https://api.deepseek.com/chat/completions", customFormat: "openai", ollamaModel: "llama3.1" },
    document: { createElement: element },
    els: { toolbarModelSelect: select, ollamaModelSelect: { options: [] } },
    t: (key) => key,
    presetLabel: (key) => key,
    saveCurrentModelConfig() {},
    applyModelConfigToSettings(config) { state.applied = config; },
    applyDefaultPromptSelection() {},
    syncSettingsToForm() {}
  });
  function render() {
    const config = api.getModelConfigForPreset(state.settings.preset);
    api.renderToolbarModelOptions(config);
    return select.options;
  }
  return { ...api, state, select, render };
}

test("configuring a service keeps one service entry and uses its saved model name", () => {
  const app = loadModels({ modelConfigs: { deepseek: { modelName: "deepseek-reasoner", model: "deepseek-reasoner", apiKey: "fixture-service-key" } } });
  const options = app.render();
  assert.equal(options.some((option) => option.value === "preset:custom" || option.value.startsWith("current:")), false);
  assert.equal(options.filter((option) => option.value === "preset:deepseek").length, 1);
  assert.equal(options.find((option) => option.value === "preset:deepseek").textContent, "deepseek · deepseek-reasoner");
  assert.equal(app.select.value, "preset:deepseek");
});

test("saved custom endpoints remain independent when another service is active", () => {
  const custom = { endpoint: "https://example.test/v1/chat/completions", model: "my-model", modelName: "my-model", apiKey: "fixture-custom-key", apiFormat: "openai" };
  const app = loadModels({ modelConfigs: { custom } });
  const option = app.render().find((item) => item.value === "preset:custom");
  assert.equal(option.textContent, "presetCustom · my-model");
  app.applyPreset("custom");
  assert.equal(app.state.applied.apiKey, "fixture-custom-key");
  assert.equal(app.state.applied.endpoint, custom.endpoint);
  assert.equal(app.state.applied.model, "my-model");
});

test("a new custom configuration does not inherit another service's API key", () => {
  const app = loadModels();
  app.applyPreset("custom");
  assert.equal(app.state.applied.apiKey, "");
  assert.equal(app.state.settings.preset, "custom");
});

test("legacy active custom settings still appear and retain their endpoint and key", () => {
  const app = loadModels({ preset: "custom", customModel: "legacy-model", customEndpoint: "https://legacy.test/chat", customApiKey: "fixture-legacy-key" });
  const option = app.render().find((item) => item.value === "preset:custom");
  assert.equal(option.textContent, "presetCustom · legacy-model");
  assert.equal(app.select.value, "preset:custom");
  assert.equal(app.getModelConfigForPreset("custom").apiKey, "fixture-legacy-key");
});

test("older saved model fields override the built-in default in inactive service entries", () => {
  const app = loadModels({ modelConfigs: { openai: { model: "saved-openai-model" }, custom: { endpoint: "https://example.test/chat", model: "saved-custom-model" } } });
  const options = app.render();
  assert.equal(options.find((option) => option.value === "preset:openai").textContent, "openai · saved-openai-model");
  app.applyPreset("custom");
  assert.equal(app.state.applied.modelName, "saved-custom-model");
  assert.equal(app.state.applied.baseUrl, "https://example.test/chat");
});
