const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const source = readFileSync(path.join(__dirname, "..", "src/workspace-storage.js"), "utf8");
const WorkspaceStorage = runInNewContext(source + "\nWorkspaceStorage", {
  structuredClone,
  crypto: { randomUUID }
});

function createSharedWorkspace(initial) {
  const stored = structuredClone(initial);
  let requests = Promise.resolve();
  const storage = {
    async get(keys) {
      return Object.fromEntries(keys.map((key) => [key, structuredClone(stored[key])]));
    },
    async set(values) {
      // Chrome can return object properties in a different order than they were written.
      const serialized = JSON.stringify(values, (_key, value) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return value;
        return Object.fromEntries(Object.keys(value).sort().map((key) => [key, value[key]]));
      });
      Object.assign(stored, JSON.parse(serialized));
    }
  };
  const locks = {
    request(_name, callback) {
      const result = requests.then(callback);
      requests = result.catch(() => {});
      return result;
    }
  };
  function openView() {
    const view = WorkspaceStorage.create(storage, locks);
    view.accept(stored);
    return view;
  }
  return { stored, openView };
}

test("separate views merge message, rename, deletion and folder changes", async () => {
  const a = { id: "a", title: "First", messages: ["original"] };
  const b = { id: "b", title: "Second", messages: [] };
  const folder = { id: "folder", name: "Work" };
  const { stored, openView } = createSharedWorkspace({
    conversations: [a, b], conversationFolders: []
  });
  const tab = openView();
  const panel = openView();
  await Promise.all([
    tab.save({ conversations: [{ ...a, messages: ["original", "reply"] }], conversationFolders: [] }),
    panel.save({ conversations: [{ ...a, title: "Renamed" }, { ...b, title: "Old view" }], conversationFolders: [folder] })
  ]);
  assert.deepEqual(stored.conversations, [{ ...a, title: "Renamed", messages: ["original", "reply"] }]);
  assert.deepEqual(stored.conversationFolders, [folder]);
});

test("overlapping message edits preserve a recovery copy", async () => {
  const a = { id: "a", title: "First", messages: ["original"] };
  const { stored, openView } = createSharedWorkspace({ conversations: [a] });
  const tab = openView();
  const panel = openView();
  await tab.save({ conversations: [{ ...a, messages: ["tab"] }] });
  assert.equal(await panel.save({ conversations: [{ ...a, messages: ["panel"] }] }), true);
  assert.deepEqual(stored.conversations.map((item) => item.messages), [["panel"], ["tab"]]);
  assert.notEqual(stored.conversations[0].id, "a");
});

test("saving a streamed reply after its prompt preserves the conversation when Chrome reorders fields", async () => {
  const { stored, openView } = createSharedWorkspace({ conversations: [{ id: "a", messages: [] }] });
  const view = openView();
  const prompt = { role: "user", content: "prompt" };
  const reply = { role: "assistant", content: "reply" };
  await view.save({ conversations: [{ id: "a", messages: [prompt] }] });
  assert.equal(await view.save({ conversations: [{ id: "a", messages: [prompt, reply] }] }), false);
  assert.deepEqual(stored.conversations, [{ id: "a", messages: [prompt, reply] }]);
});

test("a deliberate history replacement clears concurrently added conversations", async () => {
  const a = { id: "a", messages: [] };
  const b = { id: "b", messages: [] };
  const blank = { id: "blank", messages: [] };
  const { stored, openView } = createSharedWorkspace({ conversations: [a] });
  const tab = openView();
  const panel = openView();
  await tab.save({ conversations: [b, a] });
  await panel.save({ conversations: [blank] }, { replace: ["conversations"] });
  await tab.save({ conversations: [{ ...a, messages: ["late reply"] }, b] });
  assert.deepEqual(stored.conversations, [blank]);
});

test("legacy settings keep unrelated changes from another view", async () => {
  const original = { theme: "light", modelConfigs: { first: { model: "a" } } };
  const { stored, openView } = createSharedWorkspace({ settings: original });
  const tab = openView();
  const panel = openView();
  await Promise.all([
    tab.save({ settings: { ...original, theme: "dark" } }),
    panel.save({ settings: { ...original, modelConfigs: { ...original.modelConfigs, second: { model: "b" } } } })
  ]);
  assert.deepEqual(stored.settings, { theme: "dark", modelConfigs: { first: { model: "a" }, second: { model: "b" } } });
});
