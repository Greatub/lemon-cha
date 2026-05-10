chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("chat.html") });
});

const BG_TEXT = {
  "zh-CN": {
    titleFailed: "标题生成失败。",
    healthFailed: "连接检查失败。",
    ollamaFailed: "无法连接 Ollama。",
    requestFailed: "请求失败，请检查接口配置。",
    missingEndpointModel: "请先在设置中填写接口地址和模型名。",
    missingOllamaEndpoint: "请先填写 Ollama 接口地址。",
    missingEndpointModelShort: "请先填写接口地址和模型名。",
    ollamaModelMissing: "Ollama 可连接，但未找到模型 {model}。",
    modelAvailable: "{model} 可用",
    titlePrompt: "请为以上对话生成一个简洁标题。只输出标题，不要解释，最多 12 个中文字符或 8 个英文单词。",
    thinkingPrompt: "请在回答前进行充分分析，但只输出结论、必要推理摘要和可执行建议，不要输出完整隐藏思维过程。",
    nonJson: "接口返回的不是 JSON：{text}",
    ollamaModelNotFound: "Ollama 模型不存在：{message}。请点击“测试 Ollama”，从本地模型列表里选择已安装模型后保存。",
    custom404: "自定义 API 返回 404，当前地址不是聊天接口：{url}。OpenAI 兼容服务通常需要 /v1/chat/completions；如果你的服务是 Ollama 格式，请在设置里把接口格式改为 Ollama /api/chat。",
    ollama403: "Ollama 拒绝了扩展来源。请设置 OLLAMA_ORIGINS=\"chrome-extension://*\" 后完全重启 Ollama。",
    ollamaFetchFailed: "无法连接 Ollama：{message}。请确认 Ollama 已启动，接口地址为 http://127.0.0.1:11434/api/chat，并允许扩展来源。",
    answerLanguagePrompt: "除非用户明确要求其他语言，请默认使用{language}回答。",
    statusFailed: "请求失败 {status}：{message}"
  },
  "en-US": {
    titleFailed: "Title generation failed.",
    healthFailed: "Connection check failed.",
    ollamaFailed: "Could not connect to Ollama.",
    requestFailed: "Request failed. Please check the API settings.",
    missingEndpointModel: "Please fill in the endpoint and model in settings first.",
    missingOllamaEndpoint: "Please fill in the Ollama endpoint first.",
    missingEndpointModelShort: "Please fill in the endpoint and model first.",
    ollamaModelMissing: "Ollama is reachable, but model {model} was not found.",
    modelAvailable: "{model} available",
    titlePrompt: "Generate a concise title for the conversation above. Output only the title, no explanation. Maximum 8 English words or 12 Chinese characters.",
    thinkingPrompt: "Analyze carefully before answering, but only output the conclusion, a necessary reasoning summary, and actionable suggestions. Do not reveal hidden chain-of-thought.",
    nonJson: "The API did not return JSON: {text}",
    ollamaModelNotFound: "Ollama model not found: {message}. Click \"Test Ollama\", choose an installed local model, then save.",
    custom404: "Custom API returned 404. The current URL is not a chat endpoint: {url}. OpenAI-compatible services usually need /v1/chat/completions. If this is an Ollama-format service, change API Format to Ollama /api/chat in settings.",
    ollama403: "Ollama rejected the extension origin. Set OLLAMA_ORIGINS=\"chrome-extension://*\" and fully restart Ollama.",
    ollamaFetchFailed: "Could not connect to Ollama: {message}. Make sure Ollama is running, the endpoint is http://127.0.0.1:11434/api/chat, and the extension origin is allowed.",
    answerLanguagePrompt: "Unless the user explicitly asks for another language, answer in {language} by default.",
    statusFailed: "Request failed {status}: {message}"
  }
};

const OLLAMA_CORS_RULE_ID = 11434;
let activeOllamaCorsOrigin = "";

function bt(configOrLang, key, replacements = {}) {
  const lang = typeof configOrLang === "string"
    ? configOrLang
    : configOrLang?.language || "zh-CN";
  const template = BG_TEXT[lang]?.[key] || BG_TEXT["zh-CN"][key] || key;
  return Object.entries(replacements).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "llm:title") {
    generateChatTitle(message.payload)
      .then((title) => sendResponse({ ok: true, title }))
      .catch((error) => sendResponse({ ok: false, error: error.message || bt(message.payload?.config, "titleFailed") }));

    return true;
  }

  if (message?.type === "llm:health") {
    checkModelHealth(message.payload)
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error) => sendResponse({ ok: false, error: error.message || bt(message.payload?.config, "healthFailed") }));

    return true;
  }

  if (message?.type === "ollama:tags") {
    getOllamaTags(message.payload)
      .then((models) => sendResponse({ ok: true, models }))
      .catch((error) => sendResponse({ ok: false, error: error.message || bt(message.payload?.language, "ollamaFailed") }));

    return true;
  }

  if (message?.type !== "llm:chat") {
    return false;
  }

  handleChatRequest(message.payload)
    .then((content) => sendResponse({ ok: true, content }))
    .catch((error) => sendResponse({ ok: false, error: error.message || bt(message.payload?.config, "requestFailed") }));

  return true;
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "llm-stream") {
    return;
  }

  let controller = null;

  port.onMessage.addListener((message) => {
    if (message?.type === "llm:chat:stop") {
      controller?.abort();
      return;
    }

    if (message?.type !== "llm:chat:stream") {
      return;
    }

    controller = new AbortController();
    handleChatStream(message.payload, port, controller.signal)
      .finally(() => {
        controller = null;
      });
  });

  port.onDisconnect.addListener(() => {
    controller?.abort();
  });
});

async function handleChatRequest(payload) {
  const config = normalizeConfig(payload?.config || {});
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];

  if (!config.endpoint || !config.model) {
    throw new Error(bt(config, "missingEndpointModel"));
  }

  return config.provider === "ollama"
    ? callOllama(config, messages)
    : callCustomApi(config, messages);
}

async function getOllamaTags(payload) {
  const endpoint = String(payload?.endpoint || "").trim();
  if (!endpoint) {
    throw new Error(bt(payload?.language, "missingOllamaEndpoint"));
  }

  const tagsUrl = ollamaEndpointToTagsUrl(endpoint);
  const response = await fetchOllamaDirect(tagsUrl, {}, payload);
  const data = await readJsonResponse(response, "ollama", payload);
  return Array.isArray(data.models)
    ? data.models.map((model) => model.name).filter(Boolean)
    : [];
}

async function checkModelHealth(payload) {
  const config = normalizeConfig(payload?.config || {});
  if (!config.endpoint || !config.model) {
    throw new Error(bt(config, "missingEndpointModelShort"));
  }

  if (config.apiFormat === "ollama" || config.provider === "ollama") {
    const tagsUrl = ollamaEndpointToTagsUrl(config.endpoint);
    const response = await fetchOllamaDirect(tagsUrl, {}, config);
    const data = await readJsonResponse(response, "ollama", config);
    const models = Array.isArray(data.models) ? data.models.map((model) => model.name).filter(Boolean) : [];
    if (!models.includes(config.model)) {
      throw new Error(bt(config, "ollamaModelMissing", { model: config.model }));
    }
    return { status: "ok", detail: bt(config, "modelAvailable", { model: config.model }) };
  }

  const headers = {
    "Content-Type": "application/json"
  };

  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: "ping" }],
      temperature: 0,
      max_tokens: 1,
      stream: false
    })
  });

  await readJsonResponse(response, "custom", config);
  return { status: "ok", detail: bt(config, "modelAvailable", { model: config.model }) };
}

async function generateChatTitle(payload) {
  const config = normalizeConfig(payload?.config || {});
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  const titlePrompt = [
    ...messages.slice(0, 4),
    {
      role: "user",
      content: bt(config, "titlePrompt")
    }
  ];

  const title = config.apiFormat === "ollama" || config.provider === "ollama"
    ? await callOllama({ ...config, thinkingEnabled: false }, titlePrompt)
    : await callCustomApi({ ...config, thinkingEnabled: false, temperature: 0.2 }, titlePrompt);

  return String(title || "").replace(/^["“”']|["“”']$/g, "").trim().slice(0, 40);
}

function ollamaEndpointToTagsUrl(endpoint) {
  const url = new URL(endpoint);
  url.pathname = "/api/tags";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function ollamaEndpointToChatUrl(endpoint) {
  const url = new URL(endpoint);
  url.pathname = "/api/chat";
  url.search = "";
  url.hash = "";
  return url.toString();
}

async function handleChatStream(payload, port, signal) {
  const config = normalizeConfig(payload?.config || {});
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];

  try {
    const meta = {
      promptTokens: estimateTokens(messages.map((message) => message.content).join("\n")),
      completionTokens: 0,
      totalDurationMs: null,
      loadDurationMs: null,
      promptEvalDurationMs: null,
      evalDurationMs: null
    };
    if (!config.endpoint || !config.model) {
      throw new Error(bt(config, "missingEndpointModel"));
    }

    if (config.provider === "ollama" || config.apiFormat === "ollama") {
      await streamOllama(config, messages, port, signal, meta);
    } else {
      await streamCustomApi(config, messages, port, signal, meta);
    }
    port.postMessage({ type: "done", meta });
  } catch (error) {
    if (error.name === "AbortError") {
      port.postMessage({ type: "aborted" });
      return;
    }
    port.postMessage({ type: "error", error: error.message || bt(config, "requestFailed") });
  }
}

function normalizeConfig(config) {
  return {
    provider: config.provider === "ollama" ? "ollama" : "custom",
    endpoint: String(config.endpoint || "").trim(),
    model: String(config.model || "").trim(),
    apiKey: String(config.apiKey || "").trim(),
    apiFormat: config.apiFormat === "ollama" ? "ollama" : "openai",
    temperature: clamp(Number(config.temperature), 0, 2, 0.7),
    maxTokens: Math.max(1, Math.floor(Number(config.maxTokens) || 2048)),
    systemPrompt: String(config.systemPrompt || "").trim(),
    thinkingEnabled: Boolean(config.thinkingEnabled),
    language: config.language === "en-US" ? "en-US" : "zh-CN",
    answerLanguage: String(config.answerLanguage || "").trim(),
    translationLanguage: String(config.translationLanguage || "").trim()
  };
}

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

async function callCustomApi(config, messages) {
  if (config.apiFormat === "ollama") {
    return callOllama(config, messages);
  }

  const headers = {
    "Content-Type": "application/json"
  };

  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: prepareMessages(config, messages),
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })
  });

  const data = await readJsonResponse(response, "custom", config);
  return data?.choices?.[0]?.message?.content
    || data?.choices?.[0]?.text
    || data?.message?.content
    || data?.content
    || "";
}

async function streamCustomApi(config, messages, port, signal, meta) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: prepareMessages(config, messages),
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true
    }),
    signal
  });

  if (!response.ok) {
    await throwResponseError(response, "custom", config);
  }

  await readServerSentEvents(response, (data) => {
    if (data === "[DONE]") {
      return;
    }

    const parsed = safeParseJson(data);
    const delta = parsed?.choices?.[0]?.delta?.content
      || parsed?.choices?.[0]?.message?.content
      || parsed?.choices?.[0]?.text
      || "";

    if (parsed?.usage) {
      meta.promptTokens = parsed.usage.prompt_tokens ?? meta.promptTokens;
      meta.completionTokens = parsed.usage.completion_tokens ?? meta.completionTokens;
    }

    if (delta) {
      meta.completionTokens += estimateTokens(delta);
      port.postMessage({ type: "delta", content: delta });
    }
  });
}

async function callOllama(config, messages) {
  const response = await fetchOllamaDirect(ollamaEndpointToChatUrl(config.endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(createOllamaChatBody(config, messages, false))
  });

  const data = await readJsonResponse(response, "ollama", config);
  return data?.message?.content || data?.response || "";
}

async function streamOllama(config, messages, port, signal, meta) {
  const response = await fetchOllamaDirect(ollamaEndpointToChatUrl(config.endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(createOllamaChatBody(config, messages, true)),
    signal
  });

  if (!response.ok) {
    await throwResponseError(response, "ollama", config);
  }

  await readNewlineJson(response, (data) => {
    const delta = data?.message?.content || data?.response || "";
    if (delta) {
      meta.completionTokens += estimateTokens(delta);
      port.postMessage({ type: "delta", content: delta });
    }
    if (data.done) {
      meta.promptTokens = data.prompt_eval_count ?? meta.promptTokens;
      meta.completionTokens = data.eval_count ?? meta.completionTokens;
      meta.totalDurationMs = nanosToMs(data.total_duration);
      meta.loadDurationMs = nanosToMs(data.load_duration);
      meta.promptEvalDurationMs = nanosToMs(data.prompt_eval_duration);
      meta.evalDurationMs = nanosToMs(data.eval_duration);
    }
  });
}

async function fetchOllamaDirect(url, options = {}, config = {}) {
  try {
    await ensureOllamaCorsRule(url);
    return await fetch(url, options);
  } catch (error) {
    return createJsonResponse(502, {
      error: bt(config, "ollamaFetchFailed", { message: error.message })
    });
  }
}

async function ensureOllamaCorsRule(url) {
  const origin = getLocalOllamaOrigin(url);
  if (!origin || activeOllamaCorsOrigin === origin || !chrome.declarativeNetRequest?.updateDynamicRules) {
    return;
  }

  const rule = {
    id: OLLAMA_CORS_RULE_ID,
    priority: 1,
    action: {
      type: "modifyHeaders",
      requestHeaders: [
        {
          header: "Origin",
          operation: "set",
          value: origin
        }
      ]
    },
    condition: {
      regexFilter: `^${escapeRegExp(origin)}/.*`,
      resourceTypes: ["xmlhttprequest", "other"]
    }
  };

  await updateDynamicRules({
    removeRuleIds: [OLLAMA_CORS_RULE_ID],
    addRules: [rule]
  });
  activeOllamaCorsOrigin = origin;
}

function getLocalOllamaOrigin(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:") return "";
    if (parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") return "";
    if (parsed.hostname === "localhost") {
      parsed.hostname = "127.0.0.1";
    }
    return parsed.origin;
  } catch (error) {
    return "";
  }
}

function updateDynamicRules(options) {
  return new Promise((resolve, reject) => {
    chrome.declarativeNetRequest.updateDynamicRules(options, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve();
    });
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createJsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function createOllamaChatBody(config, messages, stream) {
  const body = {
    model: config.model,
    messages,
    stream,
    options: {
      temperature: config.temperature,
      num_predict: config.maxTokens
    }
  };

  if (config.thinkingEnabled) {
    body.think = true;
  }

  return body;
}

function estimateTokens(text) {
  const value = String(text || "").trim();
  if (!value) return 0;
  const cjk = (value.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (value.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9_]+/g) || []).length;
  return Math.max(1, Math.ceil(cjk * 0.6 + words * 1.3));
}

function nanosToMs(value) {
  return Number.isFinite(value) ? Math.round(value / 1_000_000) : null;
}

function prepareMessages(config, messages) {
  const prepared = [...messages];

  if (config.systemPrompt) {
    prepared.unshift({
      role: "system",
      content: config.systemPrompt
    });
  }

  const answerLanguage = languageName(config.answerLanguage);
  if (answerLanguage) {
    prepared.unshift({
      role: "system",
      content: bt(config, "answerLanguagePrompt", { language: answerLanguage })
    });
  }

  if (!config.thinkingEnabled || config.apiFormat === "ollama") {
    return prepared;
  }

  return [
    {
      role: "system",
      content: bt(config, "thinkingPrompt")
    },
    ...prepared
  ];
}

function languageName(language) {
  const names = {
    "zh-CN": "简体中文",
    "en-US": "English",
    "ja-JP": "日本語",
    "ko-KR": "한국어",
    "fr-FR": "Français",
    "es-ES": "Español",
    "de-DE": "Deutsch"
  };
  return names[language] || "";
}

async function readJsonResponse(response, provider = "custom", config = {}) {
  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(bt(config, "nonJson", { text: text.slice(0, 160) }));
    }
  }

  if (!response.ok) {
    throwFormattedResponseError(response, data, provider, config);
  }

  return data;
}

async function throwResponseError(response, provider, config = {}) {
  const text = await response.text();
  let data = {};

  if (text) {
    data = safeParseJson(text) || { message: text.slice(0, 240) };
  }

  throwFormattedResponseError(response, data, provider, config);
}

function throwFormattedResponseError(response, data, provider, config = {}) {
  const message = data?.error?.message || data?.error || data?.message || response.statusText;
  if (provider === "ollama" && response.status === 404 && String(message).includes("model")) {
    throw new Error(bt(config, "ollamaModelNotFound", { message }));
  }
  if (provider === "custom" && response.status === 404) {
    throw new Error(bt(config, "custom404", { url: response.url }));
  }
  if (provider === "ollama" && response.status === 403) {
    throw new Error(bt(config, "ollama403"));
  }
  throw new Error(bt(config, "statusFailed", { status: response.status, message }));
}

async function readServerSentEvents(response, onData) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      for (const line of event.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data:")) {
          onData(trimmed.slice(5).trim());
        }
      }
    }
  }
}

async function readNewlineJson(response, onData) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const parsed = safeParseJson(line);
      if (parsed) {
        onData(parsed);
      }
    }
  }

  const trailing = safeParseJson(buffer);
  if (trailing) {
    onData(trailing);
  }
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}
