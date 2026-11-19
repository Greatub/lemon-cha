const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const popup = readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");

test("a started code fence is previewed while streaming and closed fences still render normally", () => {
  const start = popup.indexOf("function splitMarkdownCodeBlocks(");
  const end = popup.indexOf("function createCodeBlock(");
  const split = runInNewContext(`${popup.slice(start, end)}\nsplitMarkdownCodeBlocks`);
  const opening = "Intro\n```js\nconst x = 1;";
  assert.deepEqual(structuredClone(split(opening, true)), [
    { type: "text", text: "Intro" },
    { type: "code", lang: "js", code: "const x = 1;" }
  ]);
  assert.deepEqual(structuredClone(split(opening)), [{ type: "text", text: opening }]);
  assert.equal(split(opening + "\n```").at(-1).code.trim(), "const x = 1;");
});

test("streaming updates only the active assistant message and inserts reasoning as text", () => {
  const history = { textContent: "Earlier message" };
  const content = {
    children: [],
    replaceChildren() { this.children = []; }
  };
  let details = null;
  const assistant = {
    prepend(node) { details = node; },
    querySelector(selector) {
      return selector === ".message-content" ? content : details?.children[1];
    }
  };
  const messages = {
    scrollHeight: 480,
    scrollTop: 100,
    querySelector(selector) {
      assert.equal(selector, '.message.assistant[data-index="1"]');
      return assistant;
    }
  };
  const message = { role: "assistant", content: "Hello", reasoning: "<b>Plan</b>" };
  const conversation = { messages: [history, message] };
  let activeConversation = null;
  const context = {
    els: { messages },
    document: {
      createElement(tagName) {
        return { tagName, append(...children) { this.children = children; } };
      }
    },
    t: () => "Think",
    getActiveConversation: () => activeConversation,
    isMessagesNearBottom: () => true,
    updateScrollToBottomButton() {},
    renderMessageContent(node, answer, role, streaming) {
      node.children.push({ answer, role, streaming });
    }
  };
  const end = popup.indexOf("function createMessageMeta(");
  const start = popup.indexOf("function renderMessageBody(");
  const render = runInNewContext(`${popup.slice(start, end)}\nrenderStreamingMessage`, context);

  render(conversation, message);
  assert.equal(details, null);
  activeConversation = conversation;
  render(conversation, message);
  const originalDetails = details;
  assert.equal(details.tagName, "details");
  assert.equal(details.children[1].textContent, "<b>Plan</b>");
  assert.equal(content.children[0].answer, "Hello");
  assert.equal(content.children[0].streaming, true);
  assert.equal(messages.scrollTop, messages.scrollHeight);
  assert.equal(history.textContent, "Earlier message");

  message.reasoning += " Continued";
  render(conversation, message);
  assert.equal(details, originalDetails);
  assert.equal(details.children[1].textContent, "<b>Plan</b> Continued");
});

test("saving a custom endpoint requests a single host and rejects a changed or denied grant", async () => {
  const input = { value: "https://api.example.test:8443/v1/chat/completions" };
  const notices = [];
  const requestedOrigins = [];
  let grant = () => true;
  const globals = {
    URL,
    els: { endpointInput: input, customFormatInput: { value: "openai" } },
    extensionApi: {
      permissions: {
        async request({ origins }) {
          requestedOrigins.push(...origins);
          return grant();
        }
      }
    },
    pushSystemMessage: (text) => notices.push(text),
    t: (key) => key
  };
  const start = popup.indexOf("function configuredEndpointHostPattern(");
  const end = popup.indexOf("async function withConversationEdit(");
  const request = runInNewContext(`${popup.slice(start, end)}\nrequestConfiguredEndpointPermission`, globals);
  assert.equal(await request(), true);
  grant = () => false;
  assert.equal(await request(), false);
  grant = () => {
    input.value = "https://changed.example.test/";
    return true;
  };
  assert.equal(await request(), false);
  assert.deepEqual(requestedOrigins, Array(3).fill("https://api.example.test/*"));
  assert.deepEqual(notices, ["endpointPermissionRequired", "endpointPermissionRequired"]);
});
