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

Object.assign(BG_TEXT, {
  "zh-TW": {
    titleFailed: "標題生成失敗。",
    healthFailed: "連線檢查失敗。",
    ollamaFailed: "無法連線 Ollama。",
    requestFailed: "請求失敗，請檢查介面設定。",
    missingEndpointModel: "請先在設定中填寫介面位址和模型名稱。",
    missingOllamaEndpoint: "請先填寫 Ollama 介面位址。",
    missingEndpointModelShort: "請先填寫介面位址和模型名稱。",
    ollamaModelMissing: "Ollama 可連線，但找不到模型 {model}。",
    modelAvailable: "{model} 可用",
    titlePrompt: "請為以上對話生成一個簡潔標題。只輸出標題，不要解釋，最多 12 個中文字元或 8 個英文單字。",
    thinkingPrompt: "請在回答前充分分析，但只輸出結論、必要推理摘要和可執行建議，不要輸出完整隱藏思維過程。",
    nonJson: "介面回傳的不是 JSON：{text}",
    ollamaModelNotFound: "Ollama 模型不存在：{message}。請點選「測試 Ollama」，從本機模型清單選擇已安裝模型後儲存。",
    custom404: "自訂 API 回傳 404，目前位址不是聊天介面：{url}。OpenAI 相容服務通常需要 /v1/chat/completions；如果你的服務是 Ollama 格式，請在設定中把介面格式改為 Ollama /api/chat。",
    ollama403: "Ollama 拒絕了擴充功能來源。請設定 OLLAMA_ORIGINS=\"chrome-extension://*\" 後完整重新啟動 Ollama。",
    ollamaFetchFailed: "無法連線 Ollama：{message}。請確認 Ollama 已啟動，介面位址為 http://127.0.0.1:11434/api/chat，並允許擴充功能來源。",
    answerLanguagePrompt: "除非使用者明確要求其他語言，請預設使用{language}回答。",
    statusFailed: "請求失敗 {status}：{message}"
  },
  "ja-JP": {
    titleFailed: "タイトル生成に失敗しました。",
    healthFailed: "接続確認に失敗しました。",
    ollamaFailed: "Ollama に接続できません。",
    requestFailed: "リクエストに失敗しました。API 設定を確認してください。",
    missingEndpointModel: "先に設定でエンドポイントとモデル名を入力してください。",
    missingOllamaEndpoint: "先に Ollama エンドポイントを入力してください。",
    missingEndpointModelShort: "先にエンドポイントとモデル名を入力してください。",
    ollamaModelMissing: "Ollama には接続できますが、モデル {model} が見つかりません。",
    modelAvailable: "{model} は利用可能です",
    titlePrompt: "上の会話に短いタイトルを付けてください。タイトルだけを出力し、説明は不要です。最大 8 英単語または 12 中国語文字。",
    thinkingPrompt: "回答前に十分分析してください。ただし出力は結論、必要な推論要約、実行可能な提案だけにし、隠れた思考過程は出力しないでください。",
    nonJson: "API が JSON を返しませんでした: {text}",
    ollamaModelNotFound: "Ollama モデルが見つかりません: {message}。「Ollama をテスト」をクリックし、インストール済みのローカルモデルを選んで保存してください。",
    custom404: "カスタム API が 404 を返しました。現在の URL はチャットエンドポイントではありません: {url}。OpenAI 互換サービスでは通常 /v1/chat/completions が必要です。Ollama 形式のサービスなら、設定で API 形式を Ollama /api/chat に変更してください。",
    ollama403: "Ollama が拡張機能の origin を拒否しました。OLLAMA_ORIGINS=\"chrome-extension://*\" を設定し、Ollama を完全に再起動してください。",
    ollamaFetchFailed: "Ollama に接続できません: {message}。Ollama が起動していること、エンドポイントが http://127.0.0.1:11434/api/chat であること、拡張機能の origin が許可されていることを確認してください。",
    answerLanguagePrompt: "ユーザーが明示的に別の言語を求めない限り、既定では{language}で回答してください。",
    statusFailed: "リクエスト失敗 {status}: {message}"
  },
  "ko-KR": {
    titleFailed: "제목 생성에 실패했습니다.",
    healthFailed: "연결 확인에 실패했습니다.",
    ollamaFailed: "Ollama에 연결할 수 없습니다.",
    requestFailed: "요청 실패. API 설정을 확인하세요.",
    missingEndpointModel: "먼저 설정에서 엔드포인트와 모델 이름을 입력하세요.",
    missingOllamaEndpoint: "먼저 Ollama 엔드포인트를 입력하세요.",
    missingEndpointModelShort: "먼저 엔드포인트와 모델 이름을 입력하세요.",
    ollamaModelMissing: "Ollama에 연결되지만 모델 {model}을 찾을 수 없습니다.",
    modelAvailable: "{model} 사용 가능",
    titlePrompt: "위 대화의 간결한 제목을 생성하세요. 제목만 출력하고 설명하지 마세요. 최대 영어 8단어 또는 중국어 12자.",
    thinkingPrompt: "답변 전 충분히 분석하되, 결론, 필요한 추론 요약, 실행 가능한 제안만 출력하세요. 숨겨진 사고 과정은 출력하지 마세요.",
    nonJson: "API가 JSON을 반환하지 않았습니다: {text}",
    ollamaModelNotFound: "Ollama 모델을 찾을 수 없습니다: {message}. “Ollama 테스트”를 클릭하고 설치된 로컬 모델을 선택한 뒤 저장하세요.",
    custom404: "사용자 지정 API가 404를 반환했습니다. 현재 URL은 채팅 엔드포인트가 아닙니다: {url}. OpenAI 호환 서비스는 보통 /v1/chat/completions가 필요합니다. Ollama 형식 서비스라면 설정에서 API 형식을 Ollama /api/chat으로 바꾸세요.",
    ollama403: "Ollama가 확장 프로그램 origin을 거부했습니다. OLLAMA_ORIGINS=\"chrome-extension://*\" 를 설정하고 Ollama를 완전히 다시 시작하세요.",
    ollamaFetchFailed: "Ollama에 연결할 수 없습니다: {message}. Ollama가 실행 중이고 엔드포인트가 http://127.0.0.1:11434/api/chat 이며 확장 프로그램 origin이 허용되었는지 확인하세요.",
    answerLanguagePrompt: "사용자가 명시적으로 다른 언어를 요청하지 않는 한 기본적으로 {language}로 답변하세요.",
    statusFailed: "요청 실패 {status}: {message}"
  },
  "fr-FR": {
    titleFailed: "La génération du titre a échoué.",
    healthFailed: "La vérification de connexion a échoué.",
    ollamaFailed: "Impossible de se connecter à Ollama.",
    requestFailed: "La requête a échoué. Vérifiez les paramètres API.",
    missingEndpointModel: "Renseignez d’abord le point d’accès et le modèle dans les paramètres.",
    missingOllamaEndpoint: "Renseignez d’abord le point d’accès Ollama.",
    missingEndpointModelShort: "Renseignez d’abord le point d’accès et le modèle.",
    ollamaModelMissing: "Ollama est joignable, mais le modèle {model} est introuvable.",
    modelAvailable: "{model} disponible",
    titlePrompt: "Génère un titre concis pour la conversation ci-dessus. Réponds uniquement par le titre, sans explication. Maximum 8 mots anglais ou 12 caractères chinois.",
    thinkingPrompt: "Analyse soigneusement avant de répondre, mais n’affiche que la conclusion, un résumé de raisonnement nécessaire et des suggestions actionnables. Ne révèle pas la chaîne de pensée cachée.",
    nonJson: "L’API n’a pas renvoyé de JSON : {text}",
    ollamaModelNotFound: "Modèle Ollama introuvable : {message}. Cliquez sur « Tester Ollama », choisissez un modèle local installé, puis enregistrez.",
    custom404: "L’API personnalisée a renvoyé 404. L’URL actuelle n’est pas un point d’accès de chat : {url}. Les services compatibles OpenAI utilisent généralement /v1/chat/completions. Si le service est au format Ollama, changez le format API en Ollama /api/chat dans les paramètres.",
    ollama403: "Ollama a rejeté l’origine de l’extension. Définissez OLLAMA_ORIGINS=\"chrome-extension://*\" puis redémarrez complètement Ollama.",
    ollamaFetchFailed: "Impossible de se connecter à Ollama : {message}. Vérifiez qu’Ollama est lancé, que le point d’accès est http://127.0.0.1:11434/api/chat et que l’origine de l’extension est autorisée.",
    answerLanguagePrompt: "Sauf demande explicite d’une autre langue, réponds par défaut en {language}.",
    statusFailed: "Requête échouée {status} : {message}"
  },
  "es-ES": {
    titleFailed: "Error al generar el título.",
    healthFailed: "Error al comprobar la conexión.",
    ollamaFailed: "No se pudo conectar con Ollama.",
    requestFailed: "La solicitud falló. Revisa los ajustes de API.",
    missingEndpointModel: "Primero completa el endpoint y el modelo en ajustes.",
    missingOllamaEndpoint: "Primero completa el endpoint de Ollama.",
    missingEndpointModelShort: "Primero completa el endpoint y el modelo.",
    ollamaModelMissing: "Ollama responde, pero no se encontró el modelo {model}.",
    modelAvailable: "{model} disponible",
    titlePrompt: "Genera un título breve para la conversación anterior. Devuelve solo el título, sin explicación. Máximo 8 palabras en inglés o 12 caracteres chinos.",
    thinkingPrompt: "Analiza con cuidado antes de responder, pero muestra solo la conclusión, un resumen de razonamiento necesario y sugerencias accionables. No reveles razonamiento oculto.",
    nonJson: "La API no devolvió JSON: {text}",
    ollamaModelNotFound: "Modelo de Ollama no encontrado: {message}. Haz clic en “Probar Ollama”, elige un modelo local instalado y guarda.",
    custom404: "La API personalizada devolvió 404. La URL actual no es un endpoint de chat: {url}. Los servicios compatibles con OpenAI suelen necesitar /v1/chat/completions. Si el servicio usa formato Ollama, cambia el Formato API a Ollama /api/chat en ajustes.",
    ollama403: "Ollama rechazó el origen de la extensión. Configura OLLAMA_ORIGINS=\"chrome-extension://*\" y reinicia Ollama por completo.",
    ollamaFetchFailed: "No se pudo conectar con Ollama: {message}. Comprueba que Ollama esté iniciado, que el endpoint sea http://127.0.0.1:11434/api/chat y que el origen de la extensión esté permitido.",
    answerLanguagePrompt: "A menos que el usuario pida explícitamente otro idioma, responde por defecto en {language}.",
    statusFailed: "Solicitud fallida {status}: {message}"
  },
  "de-DE": {
    titleFailed: "Titelgenerierung fehlgeschlagen.",
    healthFailed: "Verbindungsprüfung fehlgeschlagen.",
    ollamaFailed: "Keine Verbindung zu Ollama möglich.",
    requestFailed: "Anfrage fehlgeschlagen. Bitte API-Einstellungen prüfen.",
    missingEndpointModel: "Bitte zuerst Endpunkt und Modell in den Einstellungen ausfüllen.",
    missingOllamaEndpoint: "Bitte zuerst den Ollama-Endpunkt ausfüllen.",
    missingEndpointModelShort: "Bitte zuerst Endpunkt und Modell ausfüllen.",
    ollamaModelMissing: "Ollama ist erreichbar, aber Modell {model} wurde nicht gefunden.",
    modelAvailable: "{model} verfügbar",
    titlePrompt: "Erzeuge einen kurzen Titel für die obige Unterhaltung. Gib nur den Titel aus, keine Erklärung. Maximal 8 englische Wörter oder 12 chinesische Zeichen.",
    thinkingPrompt: "Analysiere vor der Antwort sorgfältig, gib aber nur Schlussfolgerung, notwendige Begründungszusammenfassung und umsetzbare Vorschläge aus. Keine verborgene Gedankenkette ausgeben.",
    nonJson: "Die API hat kein JSON zurückgegeben: {text}",
    ollamaModelNotFound: "Ollama-Modell nicht gefunden: {message}. Klicke auf „Ollama testen“, wähle ein installiertes lokales Modell und speichere.",
    custom404: "Benutzerdefinierte API gab 404 zurück. Die aktuelle URL ist kein Chat-Endpunkt: {url}. OpenAI-kompatible Dienste benötigen meist /v1/chat/completions. Wenn dein Dienst Ollama-Format nutzt, stelle in den Einstellungen API-Format auf Ollama /api/chat.",
    ollama403: "Ollama hat den Ursprung der Erweiterung abgelehnt. Setze OLLAMA_ORIGINS=\"chrome-extension://*\" und starte Ollama vollständig neu.",
    ollamaFetchFailed: "Keine Verbindung zu Ollama: {message}. Prüfe, ob Ollama läuft, der Endpunkt http://127.0.0.1:11434/api/chat ist und der Ursprung der Erweiterung erlaubt ist.",
    answerLanguagePrompt: "Sofern der Nutzer nicht ausdrücklich eine andere Sprache verlangt, standardmäßig auf {language} antworten.",
    statusFailed: "Anfrage fehlgeschlagen {status}: {message}"
  }
});

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
    language: ["zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR", "fr-FR", "es-ES", "de-DE"].includes(config.language) ? config.language : "zh-CN",
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
    "zh-TW": "繁體中文",
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
