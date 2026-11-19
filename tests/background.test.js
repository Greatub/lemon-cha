const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const root = path.join(__dirname, "..");
const source = readFileSync(path.join(root, "background.js"), "utf8");
const addListener = () => {};

function loadBackground(fetch = () => assert.fail("Unexpected network request"), api = {}) {
  return runInNewContext(`${source}
    ({
      BG_TEXT, bt, normalizeConfig, readServerSentEvents, readNewlineJson,
      handleChatRequest, handleChatStream, openChatWorkspace
    })
  `, {
    chrome: {
      action: { onClicked: { addListener } },
      ...api,
      runtime: { onMessage: { addListener }, onConnect: { addListener }, ...api.runtime }
    },
    console: { error() {} },
    DOMException,
    Response,
    TextDecoder,
    URL,
    fetch
  });
}

function byteChunks(text) {
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream({
    start(controller) {
      for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
      controller.close();
    }
  }));
}

function runStream(background, config, messages = [], signal = new AbortController().signal) {
  const events = [];
  return background.handleChatStream({ config, messages }, {
    postMessage: (event) => events.push(structuredClone(event))
  }, signal).then(() => events);
}

test("SSE handles split CRLF, LF, CR, multiline data, UTF-8 and a final event at EOF", async () => {
  const { readServerSentEvents } = loadBackground();
  const data = [];
  const response = byteChunks(": comment\r\ndata: {\r\ndata: \"text\":\"🍋\"}\r\n\r\ndata: two\r\rdata: three\n\ndata: [DONE]");
  await readServerSentEvents(response, (chunk) => data.push(chunk));
  assert.deepEqual(data, ['{\n"text":"🍋"}', "two", "three", "[DONE]"]);
  assert.equal(response.body.locked, false);
});

test("NDJSON handles split UTF-8 and an unterminated final line", async () => {
  const { readNewlineJson } = loadBackground();
  const data = [];
  await readNewlineJson(byteChunks('{"text":"茶"}\r\n{"done":true}'), (chunk) => data.push(structuredClone(chunk)));
  assert.deepEqual(data, [{ text: "茶" }, { done: true }]);
});

test("Ollama applies both prompts for streaming and non-streaming requests", async () => {
  const bodies = [];
  const background = loadBackground((url, options) => {
    assert.equal(url, "http://127.0.0.1:11434/api/chat");
    const body = JSON.parse(options.body);
    bodies.push(body);
    return body.stream
      ? byteChunks('{"message":{"thinking":"Plan","content":"Hello"},"done":true,"eval_count":5}')
      : Response.json({ message: { content: "Hello" } });
  });
  const config = {
    endpoint: "http://127.0.0.1:11434",
    model: "local",
    provider: "ollama",
    language: "en-US",
    answerLanguage: "en-US",
    systemPrompt: "Answer briefly.",
    thinkingEnabled: true
  };
  const messages = [{ role: "user", content: "Hi" }];
  assert.equal(await background.handleChatRequest({ config, messages }), "Hello");
  const events = await runStream(background, config, messages);
  assert.deepEqual(events.slice(0, 2), [
    { type: "reasoning", content: "Plan" },
    { type: "delta", content: "Hello" }
  ]);
  assert.equal(events.at(-1).meta.completionTokens, 5);
  assert.deepEqual(bodies.map((body) => body.stream), [false, true]);
  for (const body of bodies) {
    assert.equal(body.think, true);
    assert.deepEqual(body.messages, [
      { role: "system", content: "Unless the user explicitly asks for another language, answer in English by default." },
      { role: "system", content: "Answer briefly." },
      ...messages
    ]);
  }
});

test("Ollama retries once without think when a model rejects it", async () => {
  const bodies = [];
  const background = loadBackground((_url, options) => {
    bodies.push(JSON.parse(options.body));
    return bodies.length === 1
      ? Response.json({ error: "model does not support thinking" }, { status: 400 })
      : byteChunks('{"message":{"content":"Hello"},"done":true}');
  });
  const config = {
    endpoint: "http://127.0.0.1:11434",
    model: "local",
    apiFormat: "ollama",
    thinkingEnabled: true
  };
  const events = await runStream(background, config);
  assert.deepEqual(bodies.map((body) => body.think), [true, undefined]);
  assert.deepEqual(events.map((event) => event.type), ["delta", "done"]);
});

test("OpenAI-compatible streams preserve exact zero usage and separate reasoning", async () => {
  const background = loadBackground((_url, options) => {
    assert.deepEqual(JSON.parse(options.body).stream_options, { include_usage: true });
    return byteChunks([
      'data: {"choices":[{"delta":{"reasoning_content":"Plan"}}]}',
      'data: {"usage":{"prompt_tokens":2,"completion_tokens":0},"choices":[{"delta":{"content":"Hi"}}]}',
      'data: {"choices":[{"delta":{"content":"!"}}]}',
      "data: [DONE]"
    ].join("\r\n\r\n"));
  });
  const events = await runStream(background, { endpoint: "https://api.example.test", model: "test" });
  assert.deepEqual(events.slice(0, -1), [
    { type: "reasoning", content: "Plan" },
    { type: "delta", content: "Hi" },
    { type: "delta", content: "!" }
  ]);
  assert.equal(events.at(-1).meta.promptTokens, 2);
  assert.equal(events.at(-1).meta.completionTokens, 0);
});

test("OpenAI-compatible streams retry rejected usage options but preserve unrelated errors", async () => {
  const config = { endpoint: "https://api.example.test", model: "test" };
  const bodies = [];
  const background = loadBackground((_url, options) => {
    bodies.push(JSON.parse(options.body));
    return bodies.length === 1
      ? Response.json({ error: "Unknown parameter: stream_options" }, { status: 400 })
      : byteChunks('data: {"usage":{"prompt_tokens":4},"choices":[{"text":"Hello"}]}');
  });
  const events = await runStream(background, config);
  assert.deepEqual(bodies.map((body) => body.stream_options), [{ include_usage: true }, undefined]);
  assert.equal(events.at(-1).meta.promptTokens, 4);
  assert.equal(events.at(-1).meta.completionTokens, 2);

  let attempts = 0;
  const failing = loadBackground(() => {
    attempts += 1;
    return Response.json({ error: "Unknown model" }, { status: 400 });
  });
  assert.deepEqual(await runStream(failing, config), [{ type: "error", error: "Request failed 400: Unknown model" }]);
  assert.equal(attempts, 1);
});

test("Ollama cancellation reports an aborted stream", async () => {
  const background = loadBackground((_url, { signal }) => {
    throw signal.reason;
  });
  const config = { endpoint: "http://127.0.0.1:11434", model: "local", apiFormat: "ollama" };
  assert.deepEqual(await runStream(background, config, [], AbortSignal.abort()), [{ type: "aborted" }]);
});

test("custom endpoint requests require the currently granted host and reject wildcard hosts", async () => {
  const origins = [];
  let granted = false;
  let fetched = 0;
  const background = loadBackground(() => {
    fetched += 1;
    return byteChunks('data: {"choices":[{"text":"Hello"}]}');
  }, {
    permissions: {
      async contains(permission) {
        origins.push(...permission.origins);
        return granted;
      }
    }
  });
  const config = { endpoint: "https://api.example.test:8443/chat", model: "test", language: "en-US" };
  assert.deepEqual(await runStream(background, config), [{
    type: "error", error: "Save the endpoint in Model Settings and allow access to its host."
  }]);
  assert.equal(fetched, 0);

  granted = true;
  assert.equal((await runStream(background, config)).at(-1).type, "done");
  assert.equal(fetched, 1);
  assert.deepEqual(origins, ["https://api.example.test/*", "https://api.example.test/*"]);

  assert.equal((await runStream(background, { ...config, endpoint: "https://*.example.test/" }))[0].type, "error");
  assert.equal(fetched, 1);
  assert.equal(origins.length, 2);
});

test("rapid workspace opens reuse the pending tab before its context appears", async () => {
  const url = "chrome-extension://local/chat.html";
  const activated = [];
  let created = 0;
  let contexts = [];
  const background = loadBackground(undefined, {
    runtime: {
      getURL: () => url,
      async getContexts(filter) {
        assert.equal(filter.documentUrls[0], url);
        return contexts;
      }
    },
    tabs: {
      async create(options) {
        assert.equal(options.url, url);
        created += 1;
        return { id: 5 };
      },
      async get() { return { id: 5, windowId: 2, status: "loading" }; },
      async update(id) { activated.push(id); }
    },
    windows: { async update() {} }
  });
  await Promise.all([background.openChatWorkspace(2), background.openChatWorkspace(2)]);
  contexts = [{ tabId: 5, windowId: 2 }, { tabId: 8, windowId: 3 }];
  await background.openChatWorkspace(3);
  assert.equal(created, 1);
  assert.deepEqual(activated, [5, 8]);
});

test("background and interface locales have matching keys and background fallback is English", () => {
  const { BG_TEXT, bt, normalizeConfig } = loadBackground();
  const popup = readFileSync(path.join(root, "popup.js"), "utf8");
  const uiText = runInNewContext(popup.slice(popup.indexOf("const UI_TEXT"), popup.indexOf("const state =")) + "\nUI_TEXT");

  const locales = Object.keys(BG_TEXT).sort();
  assert.deepEqual(locales, Object.keys(uiText).sort());
  for (const dictionary of [BG_TEXT, uiText]) {
    const expected = Object.keys(dictionary["en-US"]).sort();
    for (const locale of locales) {
      assert.deepEqual(Object.keys(dictionary[locale]).sort(), expected, locale);
    }
  }
  assert.equal(bt("unknown", "healthFailed"), BG_TEXT["en-US"].healthFailed);
  assert.equal(normalizeConfig({ language: "unknown" }).language, "en-US");
  assert.equal(bt("ja-JP", "apiKeyInvalid"), BG_TEXT["ja-JP"].apiKeyInvalid);
});
