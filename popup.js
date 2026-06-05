const MODEL_PRESETS = {
  custom: null,
  deepseek: {
    provider: "custom",
    endpoint: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    apiFormat: "openai"
  },
  openai: {
    provider: "custom",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    apiFormat: "openai"
  },
  qwen: {
    provider: "custom",
    endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    model: "qwen-plus",
    apiFormat: "openai"
  },
  kimi: {
    provider: "custom",
    endpoint: "https://api.moonshot.ai/v1/chat/completions",
    model: "kimi-k2-0711-preview",
    apiFormat: "openai"
  },
  siliconflow: {
    provider: "custom",
    endpoint: "https://api.siliconflow.cn/v1/chat/completions",
    model: "deepseek-ai/DeepSeek-V3",
    apiFormat: "openai"
  },
  openrouter: {
    provider: "custom",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "deepseek/deepseek-chat",
    apiFormat: "openai"
  },
  groq: {
    provider: "custom",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    apiFormat: "openai"
  },
  "ollama-proxy": {
    provider: "ollama",
    endpoint: "http://127.0.0.1:11434/api/chat",
    model: "llama3.1",
    apiFormat: "ollama"
  }
};

const extensionApi = globalThis.browser || globalThis.chrome;

const DIRECT_OLLAMA_ENDPOINT = "http://127.0.0.1:11434/api/chat";
const LEGACY_OLLAMA_PROXY_ENDPOINT = "http://127.0.0.1:8787/api/chat";
const TRANSLATION_PROMPT_TEMPLATE = "You are a professional translator.\n\nYour goal is to accurately convey the meaning, tone, nuance, and context of the original text while following {defaultTranslationLanguage} grammar, vocabulary, idioms, and cultural conventions.\n\nTranslation style:\n{translationStyle}\n\nRequirements:\n- Translate the text into {defaultTranslationLanguage}.\n- Preserve the original meaning and intent.\n- Adapt wording naturally for {defaultTranslationLanguage}.\n- Do not add explanations, notes, summaries, markdown headings, or commentary.\n- Output only the translated text.\n\nText to translate:\n";

const BUILT_IN_PROMPT_TEMPLATES = [
  {
    id: "summarize",
    name: "总结提炼",
    nameEn: "Summarize",
    content: "请总结以下内容，提炼关键结论、重要细节和可执行事项。输出结构：\n\n### 关键结论\n- \n\n### 重要细节\n- \n\n### 后续行动\n- \n\n内容：\n",
    contentEn: "Summarize the following content, extracting key conclusions, important details, and actionable next steps. Use this structure:\n\n### Key Conclusions\n- \n\n### Important Details\n- \n\n### Next Actions\n- \n\nContent:\n"
  },
  {
    id: "translate-polish",
    name: "专业翻译",
    nameEn: "Professional Translation",
    content: TRANSLATION_PROMPT_TEMPLATE,
    contentEn: TRANSLATION_PROMPT_TEMPLATE
  },
  {
    id: "code-review",
    name: "代码审查",
    nameEn: "Code Review",
    content: "请以资深工程师视角审查以下代码，优先指出 bug、边界条件、可维护性和测试缺口。输出结构：\n\n### 高优先级问题\n- \n\n### 中低优先级建议\n- \n\n### 测试建议\n- \n\n代码：\n```语言\n\n```",
    contentEn: "Review the following code from a senior engineer's perspective. Prioritize bugs, edge cases, maintainability, and test gaps. Use this structure:\n\n### High Priority Issues\n- \n\n### Medium/Low Priority Suggestions\n- \n\n### Test Suggestions\n- \n\nCode:\n```language\n\n```"
  },
  {
    id: "debug",
    name: "问题排查",
    nameEn: "Troubleshooting",
    content: "请帮助我排查以下问题。请先列出最可能原因，再给出逐步验证方法和修复建议。\n\n现象：\n\n环境：\n\n已尝试：\n\n报错/日志：\n",
    contentEn: "Help me troubleshoot the following issue. First list the most likely causes, then provide step-by-step verification methods and fixes.\n\nSymptoms:\n\nEnvironment:\n\nAlready tried:\n\nErrors/logs:\n"
  },
  {
    id: "writing",
    name: "写作改稿",
    nameEn: "Rewrite",
    content: "请帮我改写以下内容，使其更清晰、有说服力、语气自然。请给出：\n\n1. 改写版本\n2. 主要改动说明\n3. 可选的更简洁版本\n\n原文：\n",
    contentEn: "Rewrite the following content to make it clearer, more persuasive, and natural in tone. Provide:\n\n1. Rewritten version\n2. Main changes explained\n3. Optional shorter version\n\nOriginal:\n"
  },
  {
    id: "plan",
    name: "任务规划",
    nameEn: "Task Planning",
    content: "请把以下目标拆解成可执行计划。输出结构：\n\n### 目标理解\n\n### 里程碑\n- \n\n### 具体任务\n- \n\n### 风险与依赖\n- \n\n目标：\n",
    contentEn: "Break the following goal into an actionable plan. Use this structure:\n\n### Goal Understanding\n\n### Milestones\n- \n\n### Tasks\n- \n\n### Risks and Dependencies\n- \n\nGoal:\n"
  }
];

const BUILT_IN_PROMPT_TEMPLATE_LOCALES = {
  summarize: {
    "zh-TW": {
      name: "總結提煉",
      content: "請整理以下內容，提煉重點結論、關鍵細節與可執行的後續事項。請使用以下結構：\n\n### 重點結論\n- \n\n### 關鍵細節\n- \n\n### 後續行動\n- \n\n內容：\n"
    },
    "ja-JP": {
      name: "要約",
      content: "以下の内容を整理し、重要な結論、押さえるべき詳細、実行に移せる次のアクションを抽出してください。次の構成で出力してください。\n\n### 重要な結論\n- \n\n### 押さえるべき詳細\n- \n\n### 次のアクション\n- \n\n内容：\n"
    },
    "ko-KR": {
      name: "요약 정리",
      content: "다음 내용을 요약하고 핵심 결론, 중요한 세부 사항, 실행 가능한 다음 단계를 추려 주세요. 다음 구조로 출력하세요:\n\n### 핵심 결론\n- \n\n### 중요한 세부 사항\n- \n\n### 다음 행동\n- \n\n내용:\n"
    },
    "fr-FR": {
      name: "Résumer",
      content: "Synthétise le contenu suivant en faisant ressortir les conclusions essentielles, les points importants et les actions concrètes à mener. Utilise cette structure :\n\n### Conclusions essentielles\n- \n\n### Points importants\n- \n\n### Actions à mener\n- \n\nContenu :\n"
    },
    "es-ES": {
      name: "Resumir",
      content: "Sintetiza el siguiente contenido y destaca las conclusiones esenciales, los puntos importantes y las acciones concretas que conviene realizar. Usa esta estructura:\n\n### Conclusiones esenciales\n- \n\n### Puntos importantes\n- \n\n### Acciones siguientes\n- \n\nContenido:\n"
    },
    "de-DE": {
      name: "Zusammenfassen",
      content: "Fasse den folgenden Inhalt zusammen und arbeite die wichtigsten Schlussfolgerungen, relevanten Details und konkreten nächsten Schritte heraus. Nutze diese Struktur:\n\n### Wichtigste Schlussfolgerungen\n- \n\n### Relevante Details\n- \n\n### Nächste Schritte\n- \n\nInhalt:\n"
    }
  },
  "code-review": {
    "zh-TW": {
      name: "程式碼審查",
      content: "請以資深工程師的角度審查以下程式碼，優先指出 bug、邊界條件、可維護性問題與測試缺口。請使用以下結構：\n\n### 高優先級問題\n- \n\n### 中低優先級建議\n- \n\n### 測試建議\n- \n\n程式碼：\n```language\n\n```"
    },
    "ja-JP": {
      name: "コードレビュー",
      content: "シニアエンジニアの視点で以下のコードをレビューしてください。バグ、境界条件、保守性の問題、テスト不足を優先して指摘してください。次の構成で出力してください。\n\n### 優先度の高い問題\n- \n\n### 中〜低優先度の提案\n- \n\n### テストの提案\n- \n\nコード：\n```language\n\n```"
    },
    "ko-KR": {
      name: "코드 리뷰",
      content: "시니어 엔지니어 관점에서 다음 코드를 리뷰해 주세요. 버그, 경계 조건, 유지보수성, 테스트 공백을 우선적으로 지적하세요. 다음 구조로 출력하세요:\n\n### 높은 우선순위 문제\n- \n\n### 중간/낮은 우선순위 제안\n- \n\n### 테스트 제안\n- \n\n코드:\n```language\n\n```"
    },
    "fr-FR": {
      name: "Revue de code",
      content: "Relis le code suivant avec le regard d’un ingénieur senior. Priorise les bugs, les cas limites, les problèmes de maintenabilité et les manques de tests. Utilise cette structure :\n\n### Problèmes prioritaires\n- \n\n### Suggestions de priorité moyenne ou faible\n- \n\n### Suggestions de tests\n- \n\nCode :\n```language\n\n```"
    },
    "es-ES": {
      name: "Revisión de código",
      content: "Revisa el siguiente código desde la perspectiva de un ingeniero senior. Prioriza bugs, casos límite, mantenibilidad y faltas de pruebas. Usa esta estructura:\n\n### Problemas de alta prioridad\n- \n\n### Sugerencias de prioridad media/baja\n- \n\n### Sugerencias de pruebas\n- \n\nCódigo:\n```language\n\n```"
    },
    "de-DE": {
      name: "Code Review",
      content: "Prüfe den folgenden Code aus der Perspektive eines Senior Engineers. Priorisiere Bugs, Randfälle, Wartbarkeitsprobleme und Testlücken. Nutze diese Struktur:\n\n### Probleme mit hoher Priorität\n- \n\n### Vorschläge mit mittlerer oder niedriger Priorität\n- \n\n### Testvorschläge\n- \n\nCode:\n```language\n\n```"
    }
  },
  debug: {
    "zh-TW": {
      name: "問題排查",
      content: "請協助我排查以下問題。請先列出最可能的原因，再提供逐步驗證方法與修復建議。\n\n現象：\n\n環境：\n\n已嘗試：\n\n錯誤 / 日誌：\n"
    },
    "ja-JP": {
      name: "トラブルシューティング",
      content: "以下の問題の切り分けを手伝ってください。まず可能性の高い原因を整理し、その後に段階的な確認方法と修正案を提示してください。\n\n現象：\n\n環境：\n\n試したこと：\n\nエラー / ログ：\n"
    },
    "ko-KR": {
      name: "문제 해결",
      content: "다음 문제를 진단할 수 있도록 도와주세요. 먼저 가장 가능성 높은 원인을 나열하고, 단계별 검증 방법과 수정 제안을 제시해 주세요.\n\n현상:\n\n환경:\n\n이미 시도한 것:\n\n오류 / 로그:\n"
    },
    "fr-FR": {
      name: "Dépannage",
      content: "Aide-moi à diagnostiquer le problème suivant. Commence par lister les causes les plus probables, puis propose une méthode de vérification étape par étape et des pistes de correction.\n\nSymptômes :\n\nEnvironnement :\n\nDéjà essayé :\n\nErreurs / journaux :\n"
    },
    "es-ES": {
      name: "Diagnóstico",
      content: "Ayúdame a diagnosticar el siguiente problema. Primero enumera las causas más probables y luego ofrece métodos de verificación paso a paso y propuestas de solución.\n\nSíntomas:\n\nEntorno:\n\nYa intentado:\n\nErrores / logs:\n"
    },
    "de-DE": {
      name: "Fehlersuche",
      content: "Hilf mir, das folgende Problem zu untersuchen. Liste zuerst die wahrscheinlichsten Ursachen auf und gib danach schrittweise Prüfmethoden und Lösungsvorschläge.\n\nSymptome:\n\nUmgebung:\n\nBereits versucht:\n\nFehler / Logs:\n"
    }
  },
  writing: {
    "zh-TW": {
      name: "寫作改稿",
      content: "請幫我改寫以下內容，讓表達更清晰、更有說服力，語氣也更自然。請提供：\n\n1. 改寫版本\n2. 主要改動說明\n3. 可選的精簡版本\n\n原文：\n"
    },
    "ja-JP": {
      name: "文章の推敲",
      content: "以下の文章を、より明確で説得力があり、自然な語調になるように書き直してください。次を出力してください：\n\n1. 書き直し版\n2. 主な変更点の説明\n3. 任意のより短い版\n\n原文：\n"
    },
    "ko-KR": {
      name: "글 다듬기",
      content: "다음 내용을 더 명확하고 설득력 있으며 자연스러운 톤으로 고쳐 써 주세요. 다음을 제공해 주세요:\n\n1. 수정본\n2. 주요 수정 사항 설명\n3. 선택 가능한 더 간결한 버전\n\n원문:\n"
    },
    "fr-FR": {
      name: "Réécriture",
      content: "Réécris le contenu suivant pour le rendre plus clair, plus convaincant et plus naturel. Fournis :\n\n1. Une version réécrite\n2. Les principaux changements expliqués\n3. Une version plus courte, si utile\n\nTexte original :\n"
    },
    "es-ES": {
      name: "Reescritura",
      content: "Reescribe el siguiente contenido para que resulte más claro, persuasivo y natural. Proporciona:\n\n1. Una versión reescrita\n2. Una explicación de los cambios principales\n3. Una versión más breve, si aporta valor\n\nOriginal:\n"
    },
    "de-DE": {
      name: "Text überarbeiten",
      content: "Überarbeite den folgenden Text, damit er klarer, überzeugender und natürlicher wirkt. Gib Folgendes aus:\n\n1. Überarbeitete Version\n2. Erklärung der wichtigsten Änderungen\n3. Kürzere Fassung, falls sinnvoll\n\nOriginal:\n"
    }
  },
  plan: {
    "zh-TW": {
      name: "任務規劃",
      content: "請將以下目標拆解成可執行的計畫。請使用以下結構：\n\n### 目標理解\n\n### 里程碑\n- \n\n### 具體任務\n- \n\n### 風險與依賴\n- \n\n目標：\n"
    },
    "ja-JP": {
      name: "タスク計画",
      content: "以下の目標を、実行に移せる計画へ分解してください。次の構成で出力してください。\n\n### 目標の理解\n\n### マイルストーン\n- \n\n### 具体的なタスク\n- \n\n### リスクと依存関係\n- \n\n目標：\n"
    },
    "ko-KR": {
      name: "작업 계획",
      content: "다음 목표를 실행 가능한 계획으로 나누어 주세요. 다음 구조로 출력하세요:\n\n### 목표 이해\n\n### 마일스톤\n- \n\n### 구체적 작업\n- \n\n### 위험 및 의존성\n- \n\n목표:\n"
    },
    "fr-FR": {
      name: "Planification",
      content: "Décompose l’objectif suivant en un plan d’action concret. Utilise cette structure :\n\n### Compréhension de l’objectif\n\n### Jalons\n- \n\n### Tâches concrètes\n- \n\n### Risques et dépendances\n- \n\nObjectif :\n"
    },
    "es-ES": {
      name: "Planificación",
      content: "Divide el siguiente objetivo en un plan accionable. Usa esta estructura:\n\n### Comprensión del objetivo\n\n### Hitos\n- \n\n### Tareas concretas\n- \n\n### Riesgos y dependencias\n- \n\nObjetivo:\n"
    },
    "de-DE": {
      name: "Aufgabenplanung",
      content: "Zerlege das folgende Ziel in einen umsetzbaren Plan. Nutze diese Struktur:\n\n### Zielverständnis\n\n### Meilensteine\n- \n\n### Konkrete Aufgaben\n- \n\n### Risiken und Abhängigkeiten\n- \n\nZiel:\n"
    }
  }
};

const SUPPORTED_LANGUAGES = ["zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR", "fr-FR", "es-ES", "de-DE"];
const BROWSER_LANGUAGE_FALLBACKS = {
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE"
};

function normalizeBrowserLanguage(language = "") {
  const normalized = String(language).replace("_", "-");
  const exactMatch = SUPPORTED_LANGUAGES.find((item) => item.toLowerCase() === normalized.toLowerCase());
  if (exactMatch) {
    return exactMatch;
  }

  const [base, region = ""] = normalized.toLowerCase().split("-");
  if (base === "zh") {
    return ["tw", "hk", "mo"].includes(region) ? "zh-TW" : "zh-CN";
  }

  return BROWSER_LANGUAGE_FALLBACKS[base] || "";
}

function defaultInterfaceLanguage() {
  const browserLanguage = extensionApi?.i18n?.getUILanguage?.() || globalThis.navigator?.language || "";
  return normalizeBrowserLanguage(browserLanguage) || "en-US";
}

const DEFAULT_SETTINGS = {
  provider: "custom",
  preset: "deepseek",
  customEndpoint: MODEL_PRESETS.deepseek.endpoint,
  customModel: MODEL_PRESETS.deepseek.model,
  customApiKey: "",
  customFormat: "openai",
  modelConfigs: {},
  ollamaEndpoint: DIRECT_OLLAMA_ENDPOINT,
  ollamaModel: "llama3.1",
  temperature: 0.7,
  maxTokens: 2048,
  historyLimit: 12,
  systemPrompt: "",
  defaultPresetId: "",
  memoryEnabled: true,
  thinkingEnabled: false,
  webAccessEnabled: false,
  language: defaultInterfaceLanguage(),
  answerLanguage: "zh-CN",
  translationLanguage: "en-US",
  translationStyle: "balanced",
  fontSize: "small",
  colorScheme: "llmon",
  theme: "light"
};

const COLOR_SCHEMES = ["llmon", "leaf", "citrus", "blue", "gray"];
const FONT_SIZES = ["small", "large"];
const TRANSLATION_STYLES = ["balanced", "faithful", "polished", "professional"];
const NATIVE_LANGUAGE_NAMES = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  "en-US": "English",
  "ja-JP": "日本語",
  "ko-KR": "한국어",
  "fr-FR": "Français",
  "es-ES": "Español",
  "de-DE": "Deutsch"
};
const DEFAULT_TRANSLATION_LANGUAGE_VARIABLES = [
  "{defaultTranslationLanguage}",
  "{targetLanguage}",
  "{目标语言}"
];
const TRANSLATION_STYLE_VARIABLES = [
  "{translationStyle}",
  "{翻译风格}"
];
const HIDDEN_BUILT_IN_PROMPT_TEMPLATE_IDS = new Set(["translate-polish"]);
const VISIBLE_BUILT_IN_PROMPT_TEMPLATES = BUILT_IN_PROMPT_TEMPLATES.filter(
  (template) => !HIDDEN_BUILT_IN_PROMPT_TEMPLATE_IDS.has(template.id)
);
const LANGUAGE_UI_FALLBACK = {};

const UI_TEXT = {
  "zh-CN": {
    newChat: "新建对话",
    newTranslation: "新建翻译",
    searchConversations: "搜索对话",
    searchConversationsPlaceholder: "搜索标题或内容",
    noSearchResults: "没有匹配的对话",
    newFolder: "新建文件夹",
    exportChats: "导出记录",
    exportMarkdown: "导出 Markdown",
    importChats: "导入记录",
    checkHealth: "检查连接",
    healthUnknown: "未检测",
    healthChecking: "检测中",
    healthOk: "可用",
    healthBad: "不可用",
    copyMessage: "复制",
    regenerateMessage: "重生成",
    continueMessage: "继续",
    deleteMessage: "删除",
    elapsed: "耗时",
    firstToken: "首 token",
    localEval: "本地推理",
    approxTokens: "约 tokens",
    hideSidebar: "隐藏侧栏",
    showSidebar: "显示侧栏",
    todaySection: "今天",
    yesterdaySection: "昨天",
    lastWeekSection: "上周",
    earlierSection: "更早",
    darkMode: "夜间模式",
    lightMode: "日间模式",
    systemMode: "跟随系统",
    generating: "正在生成",
    responding: "模型正在回复",
    settingsTitle: "设置",
    openSettings: "模型设置",
    closeSettings: "返回对话",
    actionsMenu: "操作菜单",
    folderActionsMenu: "文件夹操作菜单",
    testOllama: "测试 Ollama",
    testing: "测试中",
    saveSettings: "保存",
    resetSettings: "恢复默认",
    resetCurrentSettings: "重置",
    resetGeneralSettings: "重置通用设置",
    resetCurrentModelSettings: "重置当前模型设置",
    resetCurrentPromptTemplate: "重置当前提示词预设",
    clearHistorySettings: "清空对话历史",
    factoryResetSettings: "恢复出厂设置",
    send: "发送",
    stop: "停止",
    chatMode: "对话",
    translateMode: "翻译",
    webAccessMode: "联网",
    inputModeAria: "输入模式",
    targetLanguageAria: "目标语言",
    promptPlaceholder: "输入问题，Enter 发送，Shift+Enter 换行",
    promptTemplatePlaceholder: "选择 Prompt 预设",
    savePromptTemplate: "保存",
    savePromptTemplateAs: "另存为新预设",
    deletePromptTemplate: "删除模板",
    resetSectionTitle: "分区重置",
    resetSectionHint: "每个重置操作只影响对应区域。",
    resetGeneralHelp: "仅恢复语言、翻译风格、主题、字体和配色，不影响模型、提示词和对话。",
    resetModelHelp: "仅重置当前选中的模型配置，不影响其他模型。",
    resetPromptHelp: "仅恢复当前提示词预设编辑内容，不影响其他预设。",
    clearHistoryTitle: "对话历史",
    clearHistoryHelp: "清空所有对话历史，并创建一个空白新对话。设置、模型和提示词预设会保留。",
    factoryResetTitle: "恢复出厂设置",
    factoryResetHint: "会清空设置、模型配置、提示词预设和对话历史。",
    modelPreset: "模型服务预设",
    presetCustom: "自定义",
    presetOllamaProxy: "Ollama 本地模型",
    endpoint: "接口地址",
    baseUrl: "接口地址",
    model: "模型",
    modelName: "模型名称",
    maxTokens: "最大输出 Token",
    systemPrompt: "系统提示词",
    defaultPromptPreset: "默认提示词预设",
    noDefaultPreset: "不绑定",
    memoryEnabled: "启用对话记忆",
    localModelList: "本地模型列表",
    testFirst: "先测试连接",
    apiFormat: "接口格式",
    optional: "可留空",
    historyLimit: "最大上下文轮数",
    thinkingMode: "思考",
    interfaceLanguage: "界面语言",
    answerLanguage: "默认回答语言",
    translationStyle: "翻译工具风格",
    translationStyleBalanced: "自然准确",
    translationStyleFaithful: "忠实原文",
    translationStylePolished: "流畅润色",
    translationStyleProfessional: "专业正式",
    fontSizeLabel: "字体大小",
    fontSizeSmall: "小（默认）",
    fontSizeLarge: "大",
    languageChinese: "简体中文",
    languageTraditionalChinese: "繁體中文",
    languageEnglish: "English",
    languageJapanese: "日本語",
    languageKorean: "한국어",
    languageFrench: "Français",
    languageSpanish: "Español",
    languageGerman: "Deutsch",
    sidebarHistory: "对话历史",
    conversationList: "对话列表",
    modelSettings: "模型设置",
    modelSettingsTab: "模型设置",
    generalSettingsTab: "通用设置",
    promptSettingsTab: "提示词预设",
    dataSettingsTab: "数据与重置",
    settingsTabs: "设置分类",
    colorSchemeLabel: "配色方案",
    colorSchemeLlmon: "lemon cha 默认（日间 / 夜间）",
    colorSchemeLeaf: "叶绿清新（日间 / 夜间）",
    colorSchemeCitrus: "柑橘暖阳（日间 / 夜间）",
    colorSchemeBlue: "湖蓝清爽（日间 / 夜间）",
    colorSchemeGray: "暖灰简洁（日间 / 夜间）",
    promptPresetAria: "Prompt 预设",
    currentModelAria: "当前模型",
    promptTemplateManage: "模板",
    newPromptTemplate: "新建预设",
    promptTemplateNameLabel: "模板名称",
    promptTemplateContentLabel: "模板内容",
    emptyState: "开始一个新对话，或在设置中选择 DeepSeek、OpenAI、通义千问、Kimi 等预设接口。",
    thinking: "模型正在思考",
    unconfigured: "未配置",
    selectedModelMissing: "未选择模型",
    customApi: "自定义 API",
    builtInTemplates: "内置模板",
    customTemplates: "自定义模板",
    messagesCount: "{count} 条消息",
    folderMessagesCount: "{count} 个对话",
    ungroupedChats: "未分组",
    foldersLabel: "文件夹",
    removeFromFolder: "移出文件夹",
    rename: "重命名",
    delete: "删除",
    copied: "已复制",
    scrollToBottom: "回到最新消息",
    ollamaConnectionFailed: "无法连接 Ollama。",
    ollamaFoundModels: "Ollama 连接成功，发现 {count} 个模型。",
    noModelsFound: "未发现模型",
    missingEndpointModel: "请先在设置中填写接口地址和模型名。",
    emptyModelReply: "模型没有返回内容。",
    stoppedGeneration: "已停止生成",
    requestFailed: "请求失败，请检查接口配置。",
    backendFailed: "后台请求失败，请重新加载插件后再试。",
    continueFromHere: "请从这里继续。",
    promptTemplateEmpty: "请先在输入框里写好 Prompt，再保存为模板。",
    promptTemplateName: "模板名称",
    promptTemplateSaved: "Prompt 模板已保存。",
    promptTemplateSavedAs: "已另存为新 Prompt 预设。",
    promptTemplateUnsaved: "当前提示词预设有未保存修改，离开后会丢失。继续吗？",
    promptTemplateReset: "当前提示词预设已恢复到已保存内容。",
    customTemplateOnly: "只能删除自定义 Prompt 模板。",
    confirmDeletePromptTemplate: "删除 Prompt 模板“{name}”？",
    promptTemplateDeleted: "Prompt 模板已删除。",
    promptReplaceConfirm: "当前输入框已有内容，是否替换为提示词？",
    cancel: "取消",
    replace: "替换",
    promptTemplateApplied: "提示词预设已应用。",
    settingsSaved: "设置已保存。",
    settingsAutoSaved: "已保存",
    settingsSaveFailed: "保存失败，请重试",
    settingsReset: "设置已恢复默认。",
    generalSettingsReset: "通用设置已重置。",
    modelSettingsReset: "当前模型设置已重置。",
    factoryResetDone: "已恢复出厂设置。",
    confirmResetGeneralSettings: "重置通用设置？模型配置、API Key、提示词和对话历史不会受到影响。",
    confirmResetCurrentModelSettings: "重置当前模型设置？只会影响当前模型配置。",
    confirmResetPromptTemplate: "重置当前提示词预设编辑内容？",
    confirmFactoryResetFirst: "恢复出厂设置会清空所有设置、API Key、提示词预设和对话历史。确定继续吗？",
    confirmFactoryResetSecond: "请再次确认：此操作无法撤销。继续恢复出厂设置吗？",
    settingsUnsaved: "当前设置有未保存修改，离开后会丢失。继续吗？",
    confirmClearHistory: "确定清空所有对话历史吗？",
    folderName: "文件夹名称",
    renameFolder: "输入新的文件夹名称",
    confirmDeleteFolder: "删除文件夹“{name}”？对话会移回未分组。",
    missingConversations: "导入文件缺少 conversations。",
    confirmImportOverwrite: "导入会覆盖当前设置和对话历史，确定继续吗？",
    importDone: "导入完成。",
    importFailed: "导入失败：{message}",
    renameConversation: "输入新的对话名称",
    confirmDeleteConversation: "删除对话“{title}”？",
    importedChat: "导入的对话",
    newChatTitle: "新对话",
    untitledChat: "未命名对话"
  },
  "en-US": {
    newChat: "New Chat",
    newTranslation: "New Translation",
    searchConversations: "Search Chats",
    searchConversationsPlaceholder: "Search titles or messages",
    noSearchResults: "No matching chats",
    newFolder: "New Folder",
    exportChats: "Export",
    importChats: "Import",
    exportMarkdown: "Export Markdown",
    checkHealth: "Check",
    healthUnknown: "Unchecked",
    healthChecking: "Checking",
    healthOk: "Available",
    healthBad: "Unavailable",
    copyMessage: "Copy",
    regenerateMessage: "Regenerate",
    continueMessage: "Continue",
    deleteMessage: "Delete",
    elapsed: "Elapsed",
    firstToken: "First token",
    localEval: "Local eval",
    approxTokens: "Approx tokens",
    hideSidebar: "Hide Sidebar",
    showSidebar: "Show Sidebar",
    todaySection: "Today",
    yesterdaySection: "Yesterday",
    lastWeekSection: "Last 7 Days",
    earlierSection: "Earlier",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    systemMode: "Follow System",
    generating: "Generating",
    responding: "Model is replying",
    settingsTitle: "Settings",
    openSettings: "Model Settings",
    closeSettings: "Back to Chat",
    actionsMenu: "Actions Menu",
    folderActionsMenu: "Folder Actions Menu",
    testOllama: "Test Ollama",
    testing: "Testing",
    saveSettings: "Save",
    resetSettings: "Reset",
    resetCurrentSettings: "Reset",
    resetGeneralSettings: "Reset General Settings",
    resetCurrentModelSettings: "Reset Current Model",
    resetCurrentPromptTemplate: "Reset Current Prompt Preset",
    clearHistorySettings: "Clear Chat History",
    factoryResetSettings: "Factory Reset",
    send: "Send",
    stop: "Stop",
    chatMode: "Chat",
    translateMode: "Translate",
    webAccessMode: "Web",
    inputModeAria: "Input Mode",
    targetLanguageAria: "Target Language",
    promptPlaceholder: "Ask a question. Enter to send, Shift+Enter for a new line",
    promptTemplatePlaceholder: "Choose a prompt preset",
    savePromptTemplate: "Save",
    savePromptTemplateAs: "Save as New Preset",
    deletePromptTemplate: "Delete Template",
    resetSectionTitle: "Scoped Reset",
    resetSectionHint: "Each reset action only affects its own area.",
    resetGeneralHelp: "Only resets language, translation style, theme, font size, and color scheme. Models, prompts, and chats are kept.",
    resetModelHelp: "Only resets the currently selected model configuration. Other models are kept.",
    resetPromptHelp: "Only restores the currently edited prompt preset. Other presets are kept.",
    clearHistoryTitle: "Chat History",
    clearHistoryHelp: "Clears all chat history and creates a blank conversation. Settings, models, and prompt presets are kept.",
    factoryResetTitle: "Factory Reset",
    factoryResetHint: "This clears settings, model configs, prompt presets, and chat history.",
    modelPreset: "Model Preset",
    presetCustom: "Custom",
    presetOllamaProxy: "Ollama Local",
    endpoint: "Endpoint",
    baseUrl: "Base URL",
    model: "Model",
    modelName: "Model Name",
    maxTokens: "Max Output Tokens",
    systemPrompt: "System Prompt",
    defaultPromptPreset: "Default Prompt Preset",
    noDefaultPreset: "No Binding",
    memoryEnabled: "Enable Conversation Memory",
    localModelList: "Local Models",
    testFirst: "Test connection first",
    apiFormat: "API Format",
    optional: "Optional",
    historyLimit: "Context Turns",
    thinkingMode: "Think",
    interfaceLanguage: "Interface Language",
    answerLanguage: "Default Answer Language",
    translationStyle: "Translation Tool Style",
    translationStyleBalanced: "Natural & Accurate",
    translationStyleFaithful: "Faithful",
    translationStylePolished: "Polished",
    translationStyleProfessional: "Professional",
    fontSizeLabel: "Font Size",
    fontSizeSmall: "Small (Default)",
    fontSizeLarge: "Large",
    languageChinese: "简体中文",
    languageTraditionalChinese: "繁體中文",
    languageEnglish: "English",
    languageJapanese: "日本語",
    languageKorean: "한국어",
    languageFrench: "Français",
    languageSpanish: "Español",
    languageGerman: "Deutsch",
    sidebarHistory: "Conversation History",
    conversationList: "Conversation List",
    modelSettings: "Model Settings",
    modelSettingsTab: "Model Settings",
    generalSettingsTab: "General",
    promptSettingsTab: "Prompt Presets",
    dataSettingsTab: "Data & Reset",
    settingsTabs: "Settings Categories",
    colorSchemeLabel: "Color Scheme",
    colorSchemeLlmon: "lemon cha Default (Light / Dark)",
    colorSchemeLeaf: "Fresh Leaf (Light / Dark)",
    colorSchemeCitrus: "Warm Citrus (Light / Dark)",
    colorSchemeBlue: "Clear Blue (Light / Dark)",
    colorSchemeGray: "Warm Gray (Light / Dark)",
    promptPresetAria: "Prompt Presets",
    currentModelAria: "Current Model",
    promptTemplateManage: "Template",
    newPromptTemplate: "New Preset",
    promptTemplateNameLabel: "Template Name",
    promptTemplateContentLabel: "Template Content",
    emptyState: "Start a new chat, or choose a preset such as DeepSeek, OpenAI, Qwen, or Kimi in settings.",
    thinking: "Model is thinking",
    unconfigured: "Not configured",
    selectedModelMissing: "No model selected",
    customApi: "Custom API",
    builtInTemplates: "Built-in Templates",
    customTemplates: "Custom Templates",
    messagesCount: "{count} messages",
    folderMessagesCount: "{count} chats",
    ungroupedChats: "Ungrouped",
    foldersLabel: "Folders",
    removeFromFolder: "Remove from Folder",
    rename: "Rename",
    delete: "Delete",
    copied: "Copied",
    scrollToBottom: "Jump to latest message",
    ollamaConnectionFailed: "Could not connect to Ollama.",
    ollamaFoundModels: "Ollama connected. Found {count} models.",
    noModelsFound: "No models found",
    missingEndpointModel: "Please fill in the endpoint and model in settings first.",
    emptyModelReply: "The model returned no content.",
    stoppedGeneration: "Generation stopped",
    requestFailed: "Request failed. Please check the API settings.",
    backendFailed: "Background request failed. Reload the extension and try again.",
    continueFromHere: "Please continue from here.",
    promptTemplateEmpty: "Write a prompt in the input box before saving it as a template.",
    promptTemplateName: "Template name",
    promptTemplateSaved: "Prompt template saved.",
    promptTemplateSavedAs: "Saved as a new prompt preset.",
    promptTemplateUnsaved: "This prompt preset has unsaved changes. Leave and discard them?",
    promptTemplateReset: "Current prompt preset restored to the saved content.",
    customTemplateOnly: "Only custom prompt templates can be deleted.",
    confirmDeletePromptTemplate: "Delete prompt template \"{name}\"?",
    promptTemplateDeleted: "Prompt template deleted.",
    promptReplaceConfirm: "The input box already has content. Replace it with this prompt?",
    cancel: "Cancel",
    replace: "Replace",
    promptTemplateApplied: "Prompt preset applied.",
    settingsSaved: "Settings saved.",
    settingsAutoSaved: "Saved",
    settingsSaveFailed: "Save failed. Please try again.",
    settingsReset: "Settings reset to defaults.",
    generalSettingsReset: "General settings reset.",
    modelSettingsReset: "Current model settings reset.",
    factoryResetDone: "Factory reset complete.",
    confirmResetGeneralSettings: "Reset general settings? Model configs, API keys, prompts, and chat history will not be affected.",
    confirmResetCurrentModelSettings: "Reset the current model settings? Only the selected model config will be affected.",
    confirmResetPromptTemplate: "Reset the current prompt preset editor content?",
    confirmFactoryResetFirst: "Factory reset will clear all settings, API keys, prompt presets, and chat history. Continue?",
    confirmFactoryResetSecond: "Please confirm again: this cannot be undone. Continue factory reset?",
    settingsUnsaved: "Current settings have unsaved changes. Leave and discard them?",
    confirmClearHistory: "Clear all conversation history?",
    folderName: "Folder name",
    renameFolder: "Enter a new folder name",
    confirmDeleteFolder: "Delete folder \"{name}\"? Chats will move back to Ungrouped.",
    missingConversations: "The imported file is missing conversations.",
    confirmImportOverwrite: "Importing will overwrite current settings and chat history. Continue?",
    importDone: "Import complete.",
    importFailed: "Import failed: {message}",
    renameConversation: "Enter a new conversation name",
    confirmDeleteConversation: "Delete conversation \"{title}\"?",
    importedChat: "Imported Chat",
    newChatTitle: "New Chat",
    untitledChat: "Untitled Chat"
  }
};

Object.assign(UI_TEXT, {
  "zh-TW": {
    newChat: "新增對話",
    newTranslation: "新增翻譯",
    searchConversations: "搜尋對話",
    searchConversationsPlaceholder: "搜尋標題或內容",
    noSearchResults: "沒有符合的對話",
    newFolder: "新增資料夾",
    exportChats: "匯出記錄",
    exportMarkdown: "匯出 Markdown",
    importChats: "匯入記錄",
    checkHealth: "檢查連線",
    healthUnknown: "尚未檢查",
    healthChecking: "檢查中",
    healthOk: "可用",
    healthBad: "不可用",
    copyMessage: "複製",
    regenerateMessage: "重新生成",
    continueMessage: "繼續",
    deleteMessage: "刪除",
    elapsed: "耗時",
    firstToken: "首個 token",
    localEval: "本機推理",
    approxTokens: "約 tokens",
    hideSidebar: "隱藏側欄",
    showSidebar: "顯示側欄",
    todaySection: "今天",
    yesterdaySection: "昨天",
    lastWeekSection: "最近 7 天",
    earlierSection: "更早",
    darkMode: "深色模式",
    lightMode: "淺色模式",
    systemMode: "跟隨系統",
    generating: "正在生成",
    responding: "模型正在回覆",
    settingsTitle: "設定",
    openSettings: "模型設定",
    closeSettings: "返回對話",
    actionsMenu: "操作選單",
    folderActionsMenu: "資料夾操作選單",
    testOllama: "測試 Ollama",
    testing: "測試中",
    saveSettings: "儲存",
    resetSettings: "恢復預設",
    resetCurrentSettings: "重設",
    resetGeneralSettings: "重設通用設定",
    resetCurrentModelSettings: "重設目前模型設定",
    resetCurrentPromptTemplate: "重設目前提示詞預設",
    clearHistorySettings: "清空對話歷史",
    factoryResetSettings: "恢復出廠設定",
    send: "傳送",
    stop: "停止",
    promptPlaceholder: "輸入問題，Enter 傳送，Shift+Enter 換行",
    promptTemplatePlaceholder: "選擇 Prompt 預設",
    savePromptTemplate: "儲存",
    savePromptTemplateAs: "另存為新預設",
    deletePromptTemplate: "刪除範本",
    resetSectionTitle: "分區重設",
    resetSectionHint: "每個重設操作只會影響對應區域。",
    resetGeneralHelp: "只恢復語言、主題、字體與配色，不影響模型、提示詞和對話。",
    resetModelHelp: "只重設目前選取的模型配置，不影響其他模型。",
    resetPromptHelp: "只還原目前提示詞預設的編輯內容，不影響其他預設。",
    clearHistoryTitle: "對話歷史",
    clearHistoryHelp: "清空所有對話歷史，並建立一個空白新對話。設定、模型和提示詞預設會保留。",
    factoryResetTitle: "恢復出廠設定",
    factoryResetHint: "會清空設定、模型配置、提示詞預設和對話歷史。",
    modelPreset: "模型服務預設",
    presetCustom: "自訂",
    presetOllamaProxy: "Ollama 本機模型",
    endpoint: "介面位址",
    baseUrl: "介面位址",
    model: "模型",
    modelName: "模型名稱",
    maxTokens: "最大輸出 Token",
    systemPrompt: "系統提示詞",
    defaultPromptPreset: "預設提示詞預設",
    noDefaultPreset: "不綁定",
    memoryEnabled: "啟用對話記憶",
    localModelList: "本機模型清單",
    testFirst: "請先測試連線",
    apiFormat: "介面格式",
    optional: "可留空",
    historyLimit: "最大上下文輪數",
    thinkingMode: "思考",
    interfaceLanguage: "介面語言",
    answerLanguage: "預設回答語言",
    translationLanguage: "預設翻譯目標語言",
    fontSizeLabel: "字體大小",
    fontSizeSmall: "小（預設）",
    fontSizeLarge: "大",
    languageChinese: "简体中文",
    languageTraditionalChinese: "繁體中文",
    languageEnglish: "English",
    languageJapanese: "日本語",
    languageKorean: "한국어",
    languageFrench: "Français",
    languageSpanish: "Español",
    languageGerman: "Deutsch",
    sidebarHistory: "對話歷史",
    conversationList: "對話列表",
    modelSettings: "模型設定",
    modelSettingsTab: "模型設定",
    generalSettingsTab: "通用設定",
    promptSettingsTab: "提示詞預設",
    dataSettingsTab: "資料與重設",
    settingsTabs: "設定分類",
    colorSchemeLabel: "配色方案",
    colorSchemeLlmon: "lemon cha 預設（淺色 / 深色）",
    colorSchemeLeaf: "葉綠清新（淺色 / 深色）",
    colorSchemeCitrus: "柑橘暖陽（淺色 / 深色）",
    colorSchemeBlue: "湖藍清爽（淺色 / 深色）",
    colorSchemeGray: "暖灰簡潔（淺色 / 深色）",
    promptPresetAria: "Prompt 預設",
    currentModelAria: "目前模型",
    promptTemplateManage: "範本",
    newPromptTemplate: "新增預設",
    promptTemplateNameLabel: "範本名稱",
    promptTemplateContentLabel: "範本內容",
    emptyState: "開始新的對話，或在設定中選擇 DeepSeek、OpenAI、通義千問、Kimi 等預設介面。",
    thinking: "模型正在思考",
    unconfigured: "尚未配置",
    selectedModelMissing: "尚未選擇模型",
    customApi: "自訂 API",
    builtInTemplates: "內建範本",
    customTemplates: "自訂範本",
    messagesCount: "{count} 則訊息",
    folderMessagesCount: "{count} 個對話",
    ungroupedChats: "未分組",
    foldersLabel: "資料夾",
    removeFromFolder: "移出資料夾",
    rename: "重新命名",
    delete: "刪除",
    copied: "已複製",
    scrollToBottom: "回到最新訊息",
    ollamaConnectionFailed: "無法連線 Ollama。",
    ollamaFoundModels: "Ollama 連線成功，找到 {count} 個模型。",
    noModelsFound: "未找到模型",
    missingEndpointModel: "請先在設定中填寫介面位址和模型名稱。",
    emptyModelReply: "模型沒有回傳內容。",
    stoppedGeneration: "已停止生成",
    requestFailed: "請求失敗，請檢查介面設定。",
    backendFailed: "背景請求失敗，請重新載入擴充功能後再試。",
    continueFromHere: "請從這裡繼續。",
    promptTemplateEmpty: "請先在輸入框寫好 Prompt，再儲存為範本。",
    promptTemplateName: "範本名稱",
    promptTemplateSaved: "Prompt 範本已儲存。",
    promptTemplateSavedAs: "已另存為新的 Prompt 預設。",
    promptTemplateUnsaved: "目前提示詞預設有未儲存修改，離開後會遺失。要繼續嗎？",
    promptTemplateReset: "目前提示詞預設已恢復為已儲存內容。",
    customTemplateOnly: "只能刪除自訂 Prompt 範本。",
    confirmDeletePromptTemplate: "刪除 Prompt 範本「{name}」？",
    promptTemplateDeleted: "Prompt 範本已刪除。",
    promptReplaceConfirm: "目前輸入框已有內容，是否替換為提示詞？",
    cancel: "取消",
    replace: "替換",
    promptTemplateApplied: "提示詞預設已套用。",
    settingsSaved: "設定已儲存。",
    settingsAutoSaved: "已儲存",
    settingsSaveFailed: "儲存失敗，請重試",
    settingsReset: "設定已恢復預設。",
    generalSettingsReset: "通用設定已重設。",
    modelSettingsReset: "目前模型設定已重設。",
    factoryResetDone: "已恢復出廠設定。",
    confirmResetGeneralSettings: "重設通用設定？模型配置、API Key、提示詞和對話歷史不會受到影響。",
    confirmResetCurrentModelSettings: "重設目前模型設定？只會影響目前模型配置。",
    confirmResetPromptTemplate: "重設目前提示詞預設編輯內容？",
    confirmFactoryResetFirst: "恢復出廠設定會清空所有設定、API Key、提示詞預設和對話歷史。確定要繼續嗎？",
    confirmFactoryResetSecond: "請再次確認：此操作無法復原。繼續恢復出廠設定嗎？",
    settingsUnsaved: "目前設定有未儲存修改，離開後會遺失。要繼續嗎？",
    confirmClearHistory: "確定清空所有對話歷史嗎？",
    folderName: "資料夾名稱",
    renameFolder: "輸入新的資料夾名稱",
    confirmDeleteFolder: "刪除資料夾「{name}」？對話會移回未分組。",
    missingConversations: "匯入檔案缺少 conversations。",
    confirmImportOverwrite: "匯入會覆蓋目前設定和對話歷史，確定要繼續嗎？",
    importDone: "匯入完成。",
    importFailed: "匯入失敗：{message}",
    renameConversation: "輸入新的對話名稱",
    confirmDeleteConversation: "刪除對話「{title}」？",
    importedChat: "匯入的對話",
    newChatTitle: "新對話",
    untitledChat: "未命名對話"
  },
  "ja-JP": {
    newChat: "新規チャット",
    newTranslation: "新規翻訳",
    searchConversations: "チャットを検索",
    searchConversationsPlaceholder: "タイトルまたは内容を検索",
    noSearchResults: "一致するチャットはありません",
    newFolder: "新規フォルダー",
    exportChats: "履歴をエクスポート",
    exportMarkdown: "Markdown をエクスポート",
    importChats: "履歴をインポート",
    checkHealth: "接続を確認",
    healthUnknown: "未確認",
    healthChecking: "確認中",
    healthOk: "利用可能",
    healthBad: "利用不可",
    copyMessage: "コピー",
    regenerateMessage: "再生成",
    continueMessage: "続ける",
    deleteMessage: "削除",
    elapsed: "経過時間",
    firstToken: "初回 token",
    localEval: "ローカル推論",
    approxTokens: "約 tokens",
    hideSidebar: "サイドバーを隠す",
    showSidebar: "サイドバーを表示",
    todaySection: "今日",
    yesterdaySection: "昨日",
    lastWeekSection: "過去 7 日",
    earlierSection: "以前",
    darkMode: "ダークモード",
    lightMode: "ライトモード",
    systemMode: "システムに合わせる",
    generating: "生成中",
    responding: "モデルが返信中",
    settingsTitle: "設定",
    openSettings: "モデル設定",
    closeSettings: "チャットに戻る",
    actionsMenu: "操作メニュー",
    folderActionsMenu: "フォルダーメニュー",
    testOllama: "Ollama をテスト",
    testing: "テスト中",
    saveSettings: "保存",
    resetSettings: "初期値に戻す",
    resetCurrentSettings: "リセット",
    resetGeneralSettings: "一般設定をリセット",
    resetCurrentModelSettings: "現在のモデル設定をリセット",
    resetCurrentPromptTemplate: "現在のプロンプトプリセットをリセット",
    clearHistorySettings: "チャット履歴を消去",
    factoryResetSettings: "出荷時設定に戻す",
    send: "送信",
    stop: "停止",
    promptPlaceholder: "質問を入力。Enter で送信、Shift+Enter で改行",
    promptTemplatePlaceholder: "Prompt プリセットを選択",
    savePromptTemplate: "保存",
    savePromptTemplateAs: "新しいプリセットとして保存",
    deletePromptTemplate: "テンプレートを削除",
    resetSectionTitle: "範囲別リセット",
    resetSectionHint: "各リセット操作は該当する範囲だけに影響します。",
    resetGeneralHelp: "言語、テーマ、文字サイズ、配色のみをリセットします。モデル、プロンプト、チャットには影響しません。",
    resetModelHelp: "現在選択中のモデル設定のみをリセットします。他のモデルには影響しません。",
    resetPromptHelp: "現在編集中のプロンプトプリセットのみを復元します。他のプリセットには影響しません。",
    clearHistoryTitle: "チャット履歴",
    clearHistoryHelp: "すべてのチャット履歴を消去し、空の新しい会話を作成します。設定、モデル、プロンプトプリセットは保持されます。",
    factoryResetTitle: "出荷時設定に戻す",
    factoryResetHint: "設定、モデル構成、プロンプトプリセット、チャット履歴を消去します。",
    modelPreset: "モデルサービスプリセット",
    presetCustom: "カスタム",
    presetOllamaProxy: "Ollama ローカルモデル",
    endpoint: "エンドポイント",
    baseUrl: "Base URL",
    model: "モデル",
    modelName: "モデル名",
    maxTokens: "最大出力 Token",
    systemPrompt: "システムプロンプト",
    defaultPromptPreset: "既定のプロンプトプリセット",
    noDefaultPreset: "未設定",
    memoryEnabled: "会話メモリを有効化",
    localModelList: "ローカルモデル一覧",
    testFirst: "先に接続をテスト",
    apiFormat: "API 形式",
    optional: "任意",
    historyLimit: "コンテキストターン数",
    thinkingMode: "思考",
    interfaceLanguage: "画面言語",
    answerLanguage: "既定の回答言語",
    translationLanguage: "既定の翻訳先言語",
    fontSizeLabel: "文字サイズ",
    fontSizeSmall: "小（既定）",
    fontSizeLarge: "大",
    languageChinese: "简体中文",
    languageTraditionalChinese: "繁體中文",
    languageEnglish: "English",
    languageJapanese: "日本語",
    languageKorean: "한국어",
    languageFrench: "Français",
    languageSpanish: "Español",
    languageGerman: "Deutsch",
    sidebarHistory: "チャット履歴",
    conversationList: "チャット一覧",
    modelSettings: "モデル設定",
    modelSettingsTab: "モデル設定",
    generalSettingsTab: "一般設定",
    promptSettingsTab: "プロンプトプリセット",
    dataSettingsTab: "データとリセット",
    settingsTabs: "設定カテゴリ",
    colorSchemeLabel: "配色",
    colorSchemeLlmon: "lemon cha 既定（ライト / ダーク）",
    colorSchemeLeaf: "フレッシュリーフ（ライト / ダーク）",
    colorSchemeCitrus: "ウォームシトラス（ライト / ダーク）",
    colorSchemeBlue: "クリアブルー（ライト / ダーク）",
    colorSchemeGray: "ウォームグレー（ライト / ダーク）",
    promptPresetAria: "Prompt プリセット",
    currentModelAria: "現在のモデル",
    promptTemplateManage: "テンプレート",
    newPromptTemplate: "新規プリセット",
    promptTemplateNameLabel: "テンプレート名",
    promptTemplateContentLabel: "テンプレート内容",
    emptyState: "新しいチャットを始めるか、設定で DeepSeek、OpenAI、Qwen、Kimi などのプリセットを選択してください。",
    thinking: "モデルが思考中",
    unconfigured: "未設定",
    selectedModelMissing: "モデル未選択",
    customApi: "カスタム API",
    builtInTemplates: "組み込みテンプレート",
    customTemplates: "カスタムテンプレート",
    messagesCount: "{count} 件のメッセージ",
    folderMessagesCount: "{count} 件のチャット",
    ungroupedChats: "未分類",
    foldersLabel: "フォルダー",
    removeFromFolder: "フォルダーから移動",
    rename: "名前を変更",
    delete: "削除",
    copied: "コピーしました",
    scrollToBottom: "最新メッセージへ移動",
    ollamaConnectionFailed: "Ollama に接続できません。",
    ollamaFoundModels: "Ollama に接続しました。{count} 個のモデルが見つかりました。",
    noModelsFound: "モデルが見つかりません",
    missingEndpointModel: "先に設定でエンドポイントとモデル名を入力してください。",
    emptyModelReply: "モデルから内容が返されませんでした。",
    stoppedGeneration: "生成を停止しました",
    requestFailed: "リクエストに失敗しました。API 設定を確認してください。",
    backendFailed: "バックグラウンドリクエストに失敗しました。拡張機能を再読み込みして再試行してください。",
    continueFromHere: "ここから続けてください。",
    promptTemplateEmpty: "テンプレートとして保存する前に、入力欄に Prompt を書いてください。",
    promptTemplateName: "テンプレート名",
    promptTemplateSaved: "Prompt テンプレートを保存しました。",
    promptTemplateSavedAs: "新しい Prompt プリセットとして保存しました。",
    promptTemplateUnsaved: "このプロンプトプリセットには未保存の変更があります。破棄して離れますか？",
    promptTemplateReset: "現在のプロンプトプリセットを保存済み内容に戻しました。",
    customTemplateOnly: "削除できるのはカスタム Prompt テンプレートだけです。",
    confirmDeletePromptTemplate: "Prompt テンプレート「{name}」を削除しますか？",
    promptTemplateDeleted: "Prompt テンプレートを削除しました。",
    promptReplaceConfirm: "入力欄にはすでに内容があります。このプロンプトに置き換えますか？",
    cancel: "キャンセル",
    replace: "置き換え",
    promptTemplateApplied: "プロンプトプリセットを適用しました。",
    settingsSaved: "設定を保存しました。",
    settingsAutoSaved: "保存しました",
    settingsSaveFailed: "保存に失敗しました。もう一度お試しください。",
    settingsReset: "設定を初期値に戻しました。",
    generalSettingsReset: "一般設定をリセットしました。",
    modelSettingsReset: "現在のモデル設定をリセットしました。",
    factoryResetDone: "出荷時設定に戻しました。",
    confirmResetGeneralSettings: "一般設定をリセットしますか？モデル構成、API Key、プロンプト、チャット履歴には影響しません。",
    confirmResetCurrentModelSettings: "現在のモデル設定をリセットしますか？選択中のモデル構成だけに影響します。",
    confirmResetPromptTemplate: "現在のプロンプトプリセット編集内容をリセットしますか？",
    confirmFactoryResetFirst: "出荷時設定に戻すと、すべての設定、API Key、プロンプトプリセット、チャット履歴が消去されます。続けますか？",
    confirmFactoryResetSecond: "もう一度確認してください。この操作は元に戻せません。続けますか？",
    settingsUnsaved: "現在の設定には未保存の変更があります。破棄して離れますか？",
    confirmClearHistory: "すべてのチャット履歴を消去しますか？",
    folderName: "フォルダー名",
    renameFolder: "新しいフォルダー名を入力",
    confirmDeleteFolder: "フォルダー「{name}」を削除しますか？チャットは未分類に戻ります。",
    missingConversations: "インポートファイルに conversations がありません。",
    confirmImportOverwrite: "インポートすると現在の設定とチャット履歴が上書きされます。続けますか？",
    importDone: "インポートが完了しました。",
    importFailed: "インポートに失敗しました: {message}",
    renameConversation: "新しいチャット名を入力",
    confirmDeleteConversation: "チャット「{title}」を削除しますか？",
    importedChat: "インポートしたチャット",
    newChatTitle: "新規チャット",
    untitledChat: "無題のチャット"
  },
  "ko-KR": {
    newChat: "새 대화",
    newTranslation: "새 번역",
    searchConversations: "대화 검색",
    searchConversationsPlaceholder: "제목 또는 내용 검색",
    noSearchResults: "일치하는 대화가 없습니다",
    newFolder: "새 폴더",
    exportChats: "기록 내보내기",
    exportMarkdown: "Markdown 내보내기",
    importChats: "기록 가져오기",
    checkHealth: "연결 확인",
    healthUnknown: "확인 안 됨",
    healthChecking: "확인 중",
    healthOk: "사용 가능",
    healthBad: "사용 불가",
    copyMessage: "복사",
    regenerateMessage: "다시 생성",
    continueMessage: "계속",
    deleteMessage: "삭제",
    elapsed: "소요 시간",
    firstToken: "첫 token",
    localEval: "로컬 추론",
    approxTokens: "약 tokens",
    hideSidebar: "사이드바 숨기기",
    showSidebar: "사이드바 표시",
    todaySection: "오늘",
    yesterdaySection: "어제",
    lastWeekSection: "최근 7일",
    earlierSection: "이전",
    darkMode: "다크 모드",
    lightMode: "라이트 모드",
    systemMode: "시스템 설정 따르기",
    generating: "생성 중",
    responding: "모델이 응답 중",
    settingsTitle: "설정",
    openSettings: "모델 설정",
    closeSettings: "대화로 돌아가기",
    actionsMenu: "작업 메뉴",
    folderActionsMenu: "폴더 작업 메뉴",
    testOllama: "Ollama 테스트",
    testing: "테스트 중",
    saveSettings: "저장",
    resetSettings: "기본값 복원",
    resetCurrentSettings: "초기화",
    resetGeneralSettings: "일반 설정 초기화",
    resetCurrentModelSettings: "현재 모델 설정 초기화",
    resetCurrentPromptTemplate: "현재 프롬프트 프리셋 초기화",
    clearHistorySettings: "대화 기록 비우기",
    factoryResetSettings: "공장 초기화",
    send: "보내기",
    stop: "중지",
    promptPlaceholder: "질문을 입력하세요. Enter 전송, Shift+Enter 줄바꿈",
    promptTemplatePlaceholder: "Prompt 프리셋 선택",
    savePromptTemplate: "저장",
    savePromptTemplateAs: "새 프리셋으로 저장",
    deletePromptTemplate: "템플릿 삭제",
    resetSectionTitle: "영역별 초기화",
    resetSectionHint: "각 초기화 작업은 해당 영역에만 영향을 줍니다.",
    resetGeneralHelp: "언어, 테마, 글자 크기, 색상만 초기화합니다. 모델, 프롬프트, 대화는 유지됩니다.",
    resetModelHelp: "현재 선택한 모델 설정만 초기화합니다. 다른 모델은 유지됩니다.",
    resetPromptHelp: "현재 편집 중인 프롬프트 프리셋만 복원합니다. 다른 프리셋은 유지됩니다.",
    clearHistoryTitle: "대화 기록",
    clearHistoryHelp: "모든 대화 기록을 비우고 빈 새 대화를 만듭니다. 설정, 모델, 프롬프트 프리셋은 유지됩니다.",
    factoryResetTitle: "공장 초기화",
    factoryResetHint: "설정, 모델 구성, 프롬프트 프리셋, 대화 기록을 모두 삭제합니다.",
    modelPreset: "모델 서비스 프리셋",
    presetCustom: "사용자 지정",
    presetOllamaProxy: "Ollama 로컬 모델",
    endpoint: "엔드포인트",
    baseUrl: "Base URL",
    model: "모델",
    modelName: "모델 이름",
    maxTokens: "최대 출력 Token",
    systemPrompt: "시스템 프롬프트",
    defaultPromptPreset: "기본 프롬프트 프리셋",
    noDefaultPreset: "연결 안 함",
    memoryEnabled: "대화 메모리 사용",
    localModelList: "로컬 모델 목록",
    testFirst: "먼저 연결 테스트",
    apiFormat: "API 형식",
    optional: "선택 사항",
    historyLimit: "컨텍스트 턴 수",
    thinkingMode: "생각",
    interfaceLanguage: "인터페이스 언어",
    answerLanguage: "기본 답변 언어",
    translationLanguage: "기본 번역 대상 언어",
    fontSizeLabel: "글자 크기",
    fontSizeSmall: "작게(기본)",
    fontSizeLarge: "크게",
    languageChinese: "简体中文",
    languageTraditionalChinese: "繁體中文",
    languageEnglish: "English",
    languageJapanese: "日本語",
    languageKorean: "한국어",
    languageFrench: "Français",
    languageSpanish: "Español",
    languageGerman: "Deutsch",
    sidebarHistory: "대화 기록",
    conversationList: "대화 목록",
    modelSettings: "모델 설정",
    modelSettingsTab: "모델 설정",
    generalSettingsTab: "일반 설정",
    promptSettingsTab: "프롬프트 프리셋",
    dataSettingsTab: "데이터 및 초기화",
    settingsTabs: "설정 분류",
    colorSchemeLabel: "색상 테마",
    colorSchemeLlmon: "lemon cha 기본 (라이트 / 다크)",
    colorSchemeLeaf: "프레시 리프 (라이트 / 다크)",
    colorSchemeCitrus: "웜 시트러스 (라이트 / 다크)",
    colorSchemeBlue: "클리어 블루 (라이트 / 다크)",
    colorSchemeGray: "웜 그레이 (라이트 / 다크)",
    promptPresetAria: "Prompt 프리셋",
    currentModelAria: "현재 모델",
    promptTemplateManage: "템플릿",
    newPromptTemplate: "새 프리셋",
    promptTemplateNameLabel: "템플릿 이름",
    promptTemplateContentLabel: "템플릿 내용",
    emptyState: "새 대화를 시작하거나 설정에서 DeepSeek, OpenAI, Qwen, Kimi 등의 프리셋을 선택하세요.",
    thinking: "모델이 생각 중",
    unconfigured: "미설정",
    selectedModelMissing: "선택한 모델 없음",
    customApi: "사용자 지정 API",
    builtInTemplates: "기본 템플릿",
    customTemplates: "사용자 템플릿",
    messagesCount: "메시지 {count}개",
    folderMessagesCount: "대화 {count}개",
    ungroupedChats: "미분류",
    foldersLabel: "폴더",
    removeFromFolder: "폴더에서 제거",
    rename: "이름 변경",
    delete: "삭제",
    copied: "복사됨",
    scrollToBottom: "최신 메시지로 이동",
    ollamaConnectionFailed: "Ollama에 연결할 수 없습니다.",
    ollamaFoundModels: "Ollama 연결 성공. 모델 {count}개를 찾았습니다.",
    noModelsFound: "모델을 찾을 수 없음",
    missingEndpointModel: "먼저 설정에서 엔드포인트와 모델 이름을 입력하세요.",
    emptyModelReply: "모델이 내용을 반환하지 않았습니다.",
    stoppedGeneration: "생성을 중지했습니다",
    requestFailed: "요청 실패. API 설정을 확인하세요.",
    backendFailed: "백그라운드 요청 실패. 확장 프로그램을 다시 로드한 뒤 시도하세요.",
    continueFromHere: "여기서부터 계속해 주세요.",
    promptTemplateEmpty: "템플릿으로 저장하기 전에 입력창에 Prompt를 작성하세요.",
    promptTemplateName: "템플릿 이름",
    promptTemplateSaved: "Prompt 템플릿을 저장했습니다.",
    promptTemplateSavedAs: "새 Prompt 프리셋으로 저장했습니다.",
    promptTemplateUnsaved: "이 프롬프트 프리셋에 저장하지 않은 변경사항이 있습니다. 버리고 나가시겠습니까?",
    promptTemplateReset: "현재 프롬프트 프리셋을 저장된 내용으로 복원했습니다.",
    customTemplateOnly: "사용자 지정 Prompt 템플릿만 삭제할 수 있습니다.",
    confirmDeletePromptTemplate: "Prompt 템플릿 “{name}”을 삭제할까요?",
    promptTemplateDeleted: "Prompt 템플릿을 삭제했습니다.",
    promptReplaceConfirm: "입력창에 이미 내용이 있습니다. 이 프롬프트로 바꿀까요?",
    cancel: "취소",
    replace: "바꾸기",
    promptTemplateApplied: "프롬프트 프리셋을 적용했습니다.",
    settingsSaved: "설정을 저장했습니다.",
    settingsAutoSaved: "저장됨",
    settingsSaveFailed: "저장에 실패했습니다. 다시 시도하세요.",
    settingsReset: "설정을 기본값으로 복원했습니다.",
    generalSettingsReset: "일반 설정을 초기화했습니다.",
    modelSettingsReset: "현재 모델 설정을 초기화했습니다.",
    factoryResetDone: "공장 초기화를 완료했습니다.",
    confirmResetGeneralSettings: "일반 설정을 초기화할까요? 모델 구성, API Key, 프롬프트, 대화 기록은 영향을 받지 않습니다.",
    confirmResetCurrentModelSettings: "현재 모델 설정을 초기화할까요? 선택한 모델 구성에만 영향을 줍니다.",
    confirmResetPromptTemplate: "현재 프롬프트 프리셋 편집 내용을 초기화할까요?",
    confirmFactoryResetFirst: "공장 초기화는 모든 설정, API Key, 프롬프트 프리셋, 대화 기록을 삭제합니다. 계속할까요?",
    confirmFactoryResetSecond: "다시 확인합니다. 이 작업은 되돌릴 수 없습니다. 계속할까요?",
    settingsUnsaved: "현재 설정에 저장하지 않은 변경사항이 있습니다. 버리고 나가시겠습니까?",
    confirmClearHistory: "모든 대화 기록을 비울까요?",
    folderName: "폴더 이름",
    renameFolder: "새 폴더 이름 입력",
    confirmDeleteFolder: "폴더 “{name}”을 삭제할까요? 대화는 미분류로 이동합니다.",
    missingConversations: "가져온 파일에 conversations가 없습니다.",
    confirmImportOverwrite: "가져오기는 현재 설정과 대화 기록을 덮어씁니다. 계속할까요?",
    importDone: "가져오기가 완료되었습니다.",
    importFailed: "가져오기 실패: {message}",
    renameConversation: "새 대화 이름 입력",
    confirmDeleteConversation: "대화 “{title}”을 삭제할까요?",
    importedChat: "가져온 대화",
    newChatTitle: "새 대화",
    untitledChat: "제목 없는 대화"
  },
  "fr-FR": {
    newChat: "Nouvelle conversation",
    newTranslation: "Nouvelle traduction",
    searchConversations: "Rechercher",
    searchConversationsPlaceholder: "Rechercher titres ou messages",
    noSearchResults: "Aucune conversation trouvée",
    newFolder: "Nouveau dossier",
    exportChats: "Exporter l’historique",
    exportMarkdown: "Exporter en Markdown",
    importChats: "Importer l’historique",
    checkHealth: "Vérifier la connexion",
    healthUnknown: "Non vérifié",
    healthChecking: "Vérification",
    healthOk: "Disponible",
    healthBad: "Indisponible",
    copyMessage: "Copier",
    regenerateMessage: "Régénérer",
    continueMessage: "Continuer",
    deleteMessage: "Supprimer",
    elapsed: "Durée",
    firstToken: "Premier token",
    localEval: "Inférence locale",
    approxTokens: "Tokens env.",
    hideSidebar: "Masquer la barre latérale",
    showSidebar: "Afficher la barre latérale",
    todaySection: "Aujourd’hui",
    yesterdaySection: "Hier",
    lastWeekSection: "7 derniers jours",
    earlierSection: "Plus ancien",
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    systemMode: "Suivre le système",
    generating: "Génération",
    responding: "Le modèle répond",
    settingsTitle: "Paramètres",
    openSettings: "Paramètres du modèle",
    closeSettings: "Retour à la conversation",
    actionsMenu: "Menu d’actions",
    folderActionsMenu: "Menu du dossier",
    testOllama: "Tester Ollama",
    testing: "Test en cours",
    saveSettings: "Enregistrer",
    resetSettings: "Réinitialiser",
    resetCurrentSettings: "Réinitialiser",
    resetGeneralSettings: "Réinitialiser les paramètres généraux",
    resetCurrentModelSettings: "Réinitialiser le modèle actuel",
    resetCurrentPromptTemplate: "Réinitialiser le prompt actuel",
    clearHistorySettings: "Effacer l’historique",
    factoryResetSettings: "Restauration d’usine",
    send: "Envoyer",
    stop: "Arrêter",
    promptPlaceholder: "Posez une question. Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne",
    promptTemplatePlaceholder: "Choisir un preset Prompt",
    savePromptTemplate: "Enregistrer",
    savePromptTemplateAs: "Enregistrer comme nouveau preset",
    deletePromptTemplate: "Supprimer le modèle",
    resetSectionTitle: "Réinitialisation ciblée",
    resetSectionHint: "Chaque action de réinitialisation ne touche que sa zone.",
    resetGeneralHelp: "Réinitialise uniquement la langue, le thème, la taille du texte et les couleurs. Les modèles, prompts et conversations sont conservés.",
    resetModelHelp: "Réinitialise uniquement la configuration du modèle sélectionné. Les autres modèles sont conservés.",
    resetPromptHelp: "Restaure uniquement le preset de prompt en cours d’édition. Les autres presets sont conservés.",
    clearHistoryTitle: "Historique",
    clearHistoryHelp: "Efface tout l’historique et crée une conversation vide. Les paramètres, modèles et presets de prompts sont conservés.",
    factoryResetTitle: "Restauration d’usine",
    factoryResetHint: "Efface les paramètres, configurations de modèles, presets de prompts et l’historique.",
    modelPreset: "Preset de service modèle",
    presetCustom: "Personnalisé",
    presetOllamaProxy: "Modèle local Ollama",
    endpoint: "Point d’accès",
    baseUrl: "Base URL",
    model: "Modèle",
    modelName: "Nom du modèle",
    maxTokens: "Tokens de sortie max.",
    systemPrompt: "Prompt système",
    defaultPromptPreset: "Preset Prompt par défaut",
    noDefaultPreset: "Aucun lien",
    memoryEnabled: "Activer la mémoire de conversation",
    localModelList: "Modèles locaux",
    testFirst: "Tester d’abord la connexion",
    apiFormat: "Format API",
    optional: "Facultatif",
    historyLimit: "Tours de contexte",
    thinkingMode: "Réflexion",
    interfaceLanguage: "Langue de l’interface",
    answerLanguage: "Langue de réponse par défaut",
    translationLanguage: "Langue cible de traduction",
    fontSizeLabel: "Taille du texte",
    fontSizeSmall: "Petite (par défaut)",
    fontSizeLarge: "Grande",
    languageChinese: "简体中文",
    languageTraditionalChinese: "繁體中文",
    languageEnglish: "English",
    languageJapanese: "日本語",
    languageKorean: "한국어",
    languageFrench: "Français",
    languageSpanish: "Español",
    languageGerman: "Deutsch",
    sidebarHistory: "Historique des conversations",
    conversationList: "Liste des conversations",
    modelSettings: "Paramètres du modèle",
    modelSettingsTab: "Modèle",
    generalSettingsTab: "Général",
    promptSettingsTab: "Presets de prompts",
    dataSettingsTab: "Données et réinitialisation",
    settingsTabs: "Catégories",
    colorSchemeLabel: "Thème de couleur",
    colorSchemeLlmon: "lemon cha par défaut (clair / sombre)",
    colorSchemeLeaf: "Feuille fraîche (clair / sombre)",
    colorSchemeCitrus: "Agrumes doux (clair / sombre)",
    colorSchemeBlue: "Bleu clair (clair / sombre)",
    colorSchemeGray: "Gris chaud (clair / sombre)",
    promptPresetAria: "Presets Prompt",
    currentModelAria: "Modèle actuel",
    promptTemplateManage: "Modèle",
    newPromptTemplate: "Nouveau preset",
    promptTemplateNameLabel: "Nom du modèle",
    promptTemplateContentLabel: "Contenu du modèle",
    emptyState: "Lancez une conversation ou choisissez un preset comme DeepSeek, OpenAI, Qwen ou Kimi dans les paramètres.",
    thinking: "Le modèle réfléchit",
    unconfigured: "Non configuré",
    selectedModelMissing: "Aucun modèle sélectionné",
    customApi: "API personnalisée",
    builtInTemplates: "Modèles intégrés",
    customTemplates: "Modèles personnalisés",
    messagesCount: "{count} messages",
    folderMessagesCount: "{count} conversations",
    ungroupedChats: "Non groupé",
    foldersLabel: "Dossiers",
    removeFromFolder: "Retirer du dossier",
    rename: "Renommer",
    delete: "Supprimer",
    copied: "Copié",
    scrollToBottom: "Aller au dernier message",
    ollamaConnectionFailed: "Impossible de se connecter à Ollama.",
    ollamaFoundModels: "Ollama connecté. {count} modèles trouvés.",
    noModelsFound: "Aucun modèle trouvé",
    missingEndpointModel: "Renseignez d’abord le point d’accès et le modèle dans les paramètres.",
    emptyModelReply: "Le modèle n’a renvoyé aucun contenu.",
    stoppedGeneration: "Génération arrêtée",
    requestFailed: "La requête a échoué. Vérifiez les paramètres API.",
    backendFailed: "La requête en arrière-plan a échoué. Rechargez l’extension puis réessayez.",
    continueFromHere: "Veuillez continuer à partir d’ici.",
    promptTemplateEmpty: "Écrivez un Prompt dans la zone de saisie avant de l’enregistrer comme modèle.",
    promptTemplateName: "Nom du modèle",
    promptTemplateSaved: "Modèle Prompt enregistré.",
    promptTemplateSavedAs: "Enregistré comme nouveau preset Prompt.",
    promptTemplateUnsaved: "Ce preset de prompt contient des modifications non enregistrées. Quitter et les perdre ?",
    promptTemplateReset: "Le preset de prompt actuel a été restauré depuis la version enregistrée.",
    customTemplateOnly: "Seuls les modèles Prompt personnalisés peuvent être supprimés.",
    confirmDeletePromptTemplate: "Supprimer le modèle Prompt « {name} » ?",
    promptTemplateDeleted: "Modèle Prompt supprimé.",
    promptReplaceConfirm: "La zone de saisie contient déjà du texte. La remplacer par ce prompt ?",
    cancel: "Annuler",
    replace: "Remplacer",
    promptTemplateApplied: "Preset de prompt appliqué.",
    settingsSaved: "Paramètres enregistrés.",
    settingsAutoSaved: "Enregistré",
    settingsSaveFailed: "Échec de l’enregistrement. Réessayez.",
    settingsReset: "Paramètres réinitialisés.",
    generalSettingsReset: "Paramètres généraux réinitialisés.",
    modelSettingsReset: "Paramètres du modèle actuel réinitialisés.",
    factoryResetDone: "Restauration d’usine terminée.",
    confirmResetGeneralSettings: "Réinitialiser les paramètres généraux ? Les modèles, API Key, prompts et l’historique ne seront pas affectés.",
    confirmResetCurrentModelSettings: "Réinitialiser le modèle actuel ? Seule la configuration du modèle sélectionné sera affectée.",
    confirmResetPromptTemplate: "Réinitialiser le contenu d’édition du preset actuel ?",
    confirmFactoryResetFirst: "La restauration d’usine effacera tous les paramètres, API Key, presets de prompts et l’historique. Continuer ?",
    confirmFactoryResetSecond: "Confirmez à nouveau : cette action est irréversible. Continuer ?",
    settingsUnsaved: "Les paramètres actuels contiennent des modifications non enregistrées. Quitter et les perdre ?",
    confirmClearHistory: "Effacer tout l’historique des conversations ?",
    folderName: "Nom du dossier",
    renameFolder: "Saisir un nouveau nom de dossier",
    confirmDeleteFolder: "Supprimer le dossier « {name} » ? Les conversations reviendront dans Non groupé.",
    missingConversations: "Le fichier importé ne contient pas conversations.",
    confirmImportOverwrite: "L’import remplacera les paramètres actuels et l’historique. Continuer ?",
    importDone: "Import terminé.",
    importFailed: "Échec de l’import : {message}",
    renameConversation: "Saisir un nouveau nom de conversation",
    confirmDeleteConversation: "Supprimer la conversation « {title} » ?",
    importedChat: "Conversation importée",
    newChatTitle: "Nouvelle conversation",
    untitledChat: "Conversation sans titre"
  },
  "es-ES": {
    newChat: "Nuevo chat",
    newTranslation: "Nueva traducción",
    searchConversations: "Buscar chats",
    searchConversationsPlaceholder: "Buscar títulos o mensajes",
    noSearchResults: "No hay chats coincidentes",
    newFolder: "Nueva carpeta",
    exportChats: "Exportar historial",
    exportMarkdown: "Exportar Markdown",
    importChats: "Importar historial",
    checkHealth: "Comprobar conexión",
    healthUnknown: "Sin comprobar",
    healthChecking: "Comprobando",
    healthOk: "Disponible",
    healthBad: "No disponible",
    copyMessage: "Copiar",
    regenerateMessage: "Regenerar",
    continueMessage: "Continuar",
    deleteMessage: "Eliminar",
    elapsed: "Tiempo",
    firstToken: "Primer token",
    localEval: "Inferencia local",
    approxTokens: "Tokens aprox.",
    hideSidebar: "Ocultar barra lateral",
    showSidebar: "Mostrar barra lateral",
    todaySection: "Hoy",
    yesterdaySection: "Ayer",
    lastWeekSection: "Últimos 7 días",
    earlierSection: "Anterior",
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    systemMode: "Seguir sistema",
    generating: "Generando",
    responding: "El modelo está respondiendo",
    settingsTitle: "Ajustes",
    openSettings: "Ajustes del modelo",
    closeSettings: "Volver al chat",
    actionsMenu: "Menú de acciones",
    folderActionsMenu: "Menú de carpeta",
    testOllama: "Probar Ollama",
    testing: "Probando",
    saveSettings: "Guardar",
    resetSettings: "Restablecer",
    resetCurrentSettings: "Restablecer",
    resetGeneralSettings: "Restablecer ajustes generales",
    resetCurrentModelSettings: "Restablecer modelo actual",
    resetCurrentPromptTemplate: "Restablecer preset de prompt actual",
    clearHistorySettings: "Borrar historial",
    factoryResetSettings: "Restablecer de fábrica",
    send: "Enviar",
    stop: "Detener",
    promptPlaceholder: "Escribe una pregunta. Enter para enviar, Shift+Enter para nueva línea",
    promptTemplatePlaceholder: "Elegir preset de Prompt",
    savePromptTemplate: "Guardar",
    savePromptTemplateAs: "Guardar como nuevo preset",
    deletePromptTemplate: "Eliminar plantilla",
    resetSectionTitle: "Restablecimiento por área",
    resetSectionHint: "Cada acción de restablecimiento solo afecta a su área.",
    resetGeneralHelp: "Solo restablece idioma, tema, tamaño de texto y colores. Modelos, prompts y conversaciones se conservan.",
    resetModelHelp: "Solo restablece la configuración del modelo seleccionado. Los demás modelos se conservan.",
    resetPromptHelp: "Solo restaura el preset de prompt que estás editando. Los demás presets se conservan.",
    clearHistoryTitle: "Historial",
    clearHistoryHelp: "Borra todo el historial y crea una conversación vacía. Se conservan ajustes, modelos y presets de prompts.",
    factoryResetTitle: "Restablecer de fábrica",
    factoryResetHint: "Borra ajustes, configuraciones de modelos, presets de prompts e historial.",
    modelPreset: "Preset de servicio de modelo",
    presetCustom: "Personalizado",
    presetOllamaProxy: "Modelo local Ollama",
    endpoint: "Endpoint",
    baseUrl: "Base URL",
    model: "Modelo",
    modelName: "Nombre del modelo",
    maxTokens: "Tokens máximos de salida",
    systemPrompt: "Prompt del sistema",
    defaultPromptPreset: "Preset de prompt predeterminado",
    noDefaultPreset: "Sin vincular",
    memoryEnabled: "Activar memoria de conversación",
    localModelList: "Modelos locales",
    testFirst: "Probar conexión primero",
    apiFormat: "Formato API",
    optional: "Opcional",
    historyLimit: "Turnos de contexto",
    thinkingMode: "Pensar",
    interfaceLanguage: "Idioma de interfaz",
    answerLanguage: "Idioma de respuesta predeterminado",
    translationLanguage: "Idioma destino de traducción",
    fontSizeLabel: "Tamaño de texto",
    fontSizeSmall: "Pequeño (predeterminado)",
    fontSizeLarge: "Grande",
    languageChinese: "简体中文",
    languageTraditionalChinese: "繁體中文",
    languageEnglish: "English",
    languageJapanese: "日本語",
    languageKorean: "한국어",
    languageFrench: "Français",
    languageSpanish: "Español",
    languageGerman: "Deutsch",
    sidebarHistory: "Historial de conversaciones",
    conversationList: "Lista de conversaciones",
    modelSettings: "Ajustes del modelo",
    modelSettingsTab: "Modelo",
    generalSettingsTab: "General",
    promptSettingsTab: "Presets de prompts",
    dataSettingsTab: "Datos y restablecimiento",
    settingsTabs: "Categorías",
    colorSchemeLabel: "Tema de color",
    colorSchemeLlmon: "lemon cha predeterminado (claro / oscuro)",
    colorSchemeLeaf: "Hoja fresca (claro / oscuro)",
    colorSchemeCitrus: "Cítrico cálido (claro / oscuro)",
    colorSchemeBlue: "Azul claro (claro / oscuro)",
    colorSchemeGray: "Gris cálido (claro / oscuro)",
    promptPresetAria: "Presets de Prompt",
    currentModelAria: "Modelo actual",
    promptTemplateManage: "Plantilla",
    newPromptTemplate: "Nuevo preset",
    promptTemplateNameLabel: "Nombre de plantilla",
    promptTemplateContentLabel: "Contenido de plantilla",
    emptyState: "Inicia un chat nuevo o elige un preset como DeepSeek, OpenAI, Qwen o Kimi en ajustes.",
    thinking: "El modelo está pensando",
    unconfigured: "Sin configurar",
    selectedModelMissing: "Ningún modelo seleccionado",
    customApi: "API personalizada",
    builtInTemplates: "Plantillas incluidas",
    customTemplates: "Plantillas personalizadas",
    messagesCount: "{count} mensajes",
    folderMessagesCount: "{count} chats",
    ungroupedChats: "Sin agrupar",
    foldersLabel: "Carpetas",
    removeFromFolder: "Sacar de la carpeta",
    rename: "Renombrar",
    delete: "Eliminar",
    copied: "Copiado",
    scrollToBottom: "Ir al mensaje más reciente",
    ollamaConnectionFailed: "No se pudo conectar con Ollama.",
    ollamaFoundModels: "Ollama conectado. Se encontraron {count} modelos.",
    noModelsFound: "No se encontraron modelos",
    missingEndpointModel: "Primero completa el endpoint y el modelo en ajustes.",
    emptyModelReply: "El modelo no devolvió contenido.",
    stoppedGeneration: "Generación detenida",
    requestFailed: "La solicitud falló. Revisa los ajustes de API.",
    backendFailed: "Falló la solicitud en segundo plano. Recarga la extensión e inténtalo de nuevo.",
    continueFromHere: "Continúa desde aquí.",
    promptTemplateEmpty: "Escribe un Prompt en el cuadro de entrada antes de guardarlo como plantilla.",
    promptTemplateName: "Nombre de plantilla",
    promptTemplateSaved: "Plantilla Prompt guardada.",
    promptTemplateSavedAs: "Guardado como nuevo preset de Prompt.",
    promptTemplateUnsaved: "Este preset de prompt tiene cambios sin guardar. ¿Salir y descartarlos?",
    promptTemplateReset: "El preset de prompt actual se restauró al contenido guardado.",
    customTemplateOnly: "Solo se pueden eliminar plantillas Prompt personalizadas.",
    confirmDeletePromptTemplate: "¿Eliminar la plantilla Prompt “{name}”?",
    promptTemplateDeleted: "Plantilla Prompt eliminada.",
    promptReplaceConfirm: "El cuadro de entrada ya tiene contenido. ¿Reemplazarlo por este prompt?",
    cancel: "Cancelar",
    replace: "Reemplazar",
    promptTemplateApplied: "Preset de prompt aplicado.",
    settingsSaved: "Ajustes guardados.",
    settingsAutoSaved: "Guardado",
    settingsSaveFailed: "No se pudo guardar. Inténtalo de nuevo.",
    settingsReset: "Ajustes restablecidos.",
    generalSettingsReset: "Ajustes generales restablecidos.",
    modelSettingsReset: "Ajustes del modelo actual restablecidos.",
    factoryResetDone: "Restablecimiento de fábrica completado.",
    confirmResetGeneralSettings: "¿Restablecer ajustes generales? Las configuraciones de modelos, API Key, prompts e historial no se verán afectados.",
    confirmResetCurrentModelSettings: "¿Restablecer el modelo actual? Solo afectará a la configuración del modelo seleccionado.",
    confirmResetPromptTemplate: "¿Restablecer el contenido del preset de prompt actual?",
    confirmFactoryResetFirst: "El restablecimiento de fábrica borrará todos los ajustes, API Key, presets de prompts e historial. ¿Continuar?",
    confirmFactoryResetSecond: "Confirma de nuevo: esta acción no se puede deshacer. ¿Continuar?",
    settingsUnsaved: "Los ajustes actuales tienen cambios sin guardar. ¿Salir y descartarlos?",
    confirmClearHistory: "¿Borrar todo el historial de conversaciones?",
    folderName: "Nombre de carpeta",
    renameFolder: "Introduce un nuevo nombre de carpeta",
    confirmDeleteFolder: "¿Eliminar la carpeta “{name}”? Los chats volverán a Sin agrupar.",
    missingConversations: "Al archivo importado le falta conversations.",
    confirmImportOverwrite: "La importación sobrescribirá los ajustes actuales y el historial. ¿Continuar?",
    importDone: "Importación completada.",
    importFailed: "Error al importar: {message}",
    renameConversation: "Introduce un nuevo nombre de conversación",
    confirmDeleteConversation: "¿Eliminar la conversación “{title}”?",
    importedChat: "Chat importado",
    newChatTitle: "Nuevo chat",
    untitledChat: "Chat sin título"
  },
  "de-DE": {
    newChat: "Neuer Chat",
    newTranslation: "Neue Übersetzung",
    searchConversations: "Chats suchen",
    searchConversationsPlaceholder: "Titel oder Nachrichten suchen",
    noSearchResults: "Keine passenden Chats",
    newFolder: "Neuer Ordner",
    exportChats: "Verlauf exportieren",
    exportMarkdown: "Markdown exportieren",
    importChats: "Verlauf importieren",
    checkHealth: "Verbindung prüfen",
    healthUnknown: "Nicht geprüft",
    healthChecking: "Prüfung läuft",
    healthOk: "Verfügbar",
    healthBad: "Nicht verfügbar",
    copyMessage: "Kopieren",
    regenerateMessage: "Neu generieren",
    continueMessage: "Fortfahren",
    deleteMessage: "Löschen",
    elapsed: "Dauer",
    firstToken: "Erstes token",
    localEval: "Lokale Inferenz",
    approxTokens: "Ca. tokens",
    hideSidebar: "Seitenleiste ausblenden",
    showSidebar: "Seitenleiste anzeigen",
    todaySection: "Heute",
    yesterdaySection: "Gestern",
    lastWeekSection: "Letzte 7 Tage",
    earlierSection: "Früher",
    darkMode: "Dunkelmodus",
    lightMode: "Hellmodus",
    systemMode: "System folgen",
    generating: "Wird generiert",
    responding: "Modell antwortet",
    settingsTitle: "Einstellungen",
    openSettings: "Modelleinstellungen",
    closeSettings: "Zurück zum Chat",
    actionsMenu: "Aktionsmenü",
    folderActionsMenu: "Ordnermenü",
    testOllama: "Ollama testen",
    testing: "Test läuft",
    saveSettings: "Speichern",
    resetSettings: "Zurücksetzen",
    resetCurrentSettings: "Zurücksetzen",
    resetGeneralSettings: "Allgemeine Einstellungen zurücksetzen",
    resetCurrentModelSettings: "Aktuelles Modell zurücksetzen",
    resetCurrentPromptTemplate: "Aktuelles Prompt-Preset zurücksetzen",
    clearHistorySettings: "Chatverlauf löschen",
    factoryResetSettings: "Werkseinstellungen",
    send: "Senden",
    stop: "Stoppen",
    promptPlaceholder: "Frage eingeben. Enter zum Senden, Shift+Enter für neue Zeile",
    promptTemplatePlaceholder: "Prompt-Preset wählen",
    savePromptTemplate: "Speichern",
    savePromptTemplateAs: "Als neues Preset speichern",
    deletePromptTemplate: "Vorlage löschen",
    resetSectionTitle: "Gezieltes Zurücksetzen",
    resetSectionHint: "Jede Zurücksetzen-Aktion betrifft nur den jeweiligen Bereich.",
    resetGeneralHelp: "Setzt nur Sprache, Design, Textgröße und Farbschema zurück. Modelle, Prompts und Chats bleiben erhalten.",
    resetModelHelp: "Setzt nur die aktuell ausgewählte Modellkonfiguration zurück. Andere Modelle bleiben erhalten.",
    resetPromptHelp: "Stellt nur das aktuell bearbeitete Prompt-Preset wieder her. Andere Presets bleiben erhalten.",
    clearHistoryTitle: "Chatverlauf",
    clearHistoryHelp: "Löscht den gesamten Chatverlauf und erstellt eine leere neue Unterhaltung. Einstellungen, Modelle und Prompt-Presets bleiben erhalten.",
    factoryResetTitle: "Werkseinstellungen",
    factoryResetHint: "Löscht Einstellungen, Modellkonfigurationen, Prompt-Presets und Chatverlauf.",
    modelPreset: "Modellservice-Preset",
    presetCustom: "Benutzerdefiniert",
    presetOllamaProxy: "Lokales Ollama-Modell",
    endpoint: "Endpunkt",
    baseUrl: "Base URL",
    model: "Modell",
    modelName: "Modellname",
    maxTokens: "Max. Ausgabe-Token",
    systemPrompt: "System-Prompt",
    defaultPromptPreset: "Standard-Prompt-Preset",
    noDefaultPreset: "Keine Bindung",
    memoryEnabled: "Gesprächsspeicher aktivieren",
    localModelList: "Lokale Modelle",
    testFirst: "Verbindung zuerst testen",
    apiFormat: "API-Format",
    optional: "Optional",
    historyLimit: "Kontext-Runden",
    thinkingMode: "Denken",
    interfaceLanguage: "Oberflächensprache",
    answerLanguage: "Standard-Antwortsprache",
    translationLanguage: "Standard-Zielsprache",
    fontSizeLabel: "Textgröße",
    fontSizeSmall: "Klein (Standard)",
    fontSizeLarge: "Groß",
    languageChinese: "简体中文",
    languageTraditionalChinese: "繁體中文",
    languageEnglish: "English",
    languageJapanese: "日本語",
    languageKorean: "한국어",
    languageFrench: "Français",
    languageSpanish: "Español",
    languageGerman: "Deutsch",
    sidebarHistory: "Chatverlauf",
    conversationList: "Chatliste",
    modelSettings: "Modelleinstellungen",
    modelSettingsTab: "Modell",
    generalSettingsTab: "Allgemein",
    promptSettingsTab: "Prompt-Presets",
    dataSettingsTab: "Daten & Zurücksetzen",
    settingsTabs: "Einstellungskategorien",
    colorSchemeLabel: "Farbschema",
    colorSchemeLlmon: "lemon cha Standard (Hell / Dunkel)",
    colorSchemeLeaf: "Frisches Blatt (Hell / Dunkel)",
    colorSchemeCitrus: "Warme Zitrusfarbe (Hell / Dunkel)",
    colorSchemeBlue: "Klares Blau (Hell / Dunkel)",
    colorSchemeGray: "Warmes Grau (Hell / Dunkel)",
    promptPresetAria: "Prompt-Presets",
    currentModelAria: "Aktuelles Modell",
    promptTemplateManage: "Vorlage",
    newPromptTemplate: "Neues Preset",
    promptTemplateNameLabel: "Vorlagenname",
    promptTemplateContentLabel: "Vorlageninhalt",
    emptyState: "Starte einen neuen Chat oder wähle in den Einstellungen ein Preset wie DeepSeek, OpenAI, Qwen oder Kimi.",
    thinking: "Modell denkt",
    unconfigured: "Nicht konfiguriert",
    selectedModelMissing: "Kein Modell ausgewählt",
    customApi: "Benutzerdefinierte API",
    builtInTemplates: "Integrierte Vorlagen",
    customTemplates: "Benutzerdefinierte Vorlagen",
    messagesCount: "{count} Nachrichten",
    folderMessagesCount: "{count} Chats",
    ungroupedChats: "Nicht gruppiert",
    foldersLabel: "Ordner",
    removeFromFolder: "Aus Ordner entfernen",
    rename: "Umbenennen",
    delete: "Löschen",
    copied: "Kopiert",
    scrollToBottom: "Zur neuesten Nachricht",
    ollamaConnectionFailed: "Keine Verbindung zu Ollama möglich.",
    ollamaFoundModels: "Ollama verbunden. {count} Modelle gefunden.",
    noModelsFound: "Keine Modelle gefunden",
    missingEndpointModel: "Bitte zuerst Endpunkt und Modell in den Einstellungen ausfüllen.",
    emptyModelReply: "Das Modell hat keinen Inhalt zurückgegeben.",
    stoppedGeneration: "Generierung gestoppt",
    requestFailed: "Anfrage fehlgeschlagen. Bitte API-Einstellungen prüfen.",
    backendFailed: "Hintergrundanfrage fehlgeschlagen. Erweiterung neu laden und erneut versuchen.",
    continueFromHere: "Bitte von hier aus fortfahren.",
    promptTemplateEmpty: "Schreibe zuerst einen Prompt in das Eingabefeld, bevor du ihn als Vorlage speicherst.",
    promptTemplateName: "Vorlagenname",
    promptTemplateSaved: "Prompt-Vorlage gespeichert.",
    promptTemplateSavedAs: "Als neues Prompt-Preset gespeichert.",
    promptTemplateUnsaved: "Dieses Prompt-Preset hat ungespeicherte Änderungen. Verwerfen und verlassen?",
    promptTemplateReset: "Aktuelles Prompt-Preset auf gespeicherten Inhalt zurückgesetzt.",
    customTemplateOnly: "Nur benutzerdefinierte Prompt-Vorlagen können gelöscht werden.",
    confirmDeletePromptTemplate: "Prompt-Vorlage „{name}“ löschen?",
    promptTemplateDeleted: "Prompt-Vorlage gelöscht.",
    promptReplaceConfirm: "Im Eingabefeld steht bereits Inhalt. Durch diesen Prompt ersetzen?",
    cancel: "Abbrechen",
    replace: "Ersetzen",
    promptTemplateApplied: "Prompt-Preset angewendet.",
    settingsSaved: "Einstellungen gespeichert.",
    settingsAutoSaved: "Gespeichert",
    settingsSaveFailed: "Speichern fehlgeschlagen. Bitte erneut versuchen.",
    settingsReset: "Einstellungen zurückgesetzt.",
    generalSettingsReset: "Allgemeine Einstellungen zurückgesetzt.",
    modelSettingsReset: "Aktuelle Modelleinstellungen zurückgesetzt.",
    factoryResetDone: "Werkseinstellungen wiederhergestellt.",
    confirmResetGeneralSettings: "Allgemeine Einstellungen zurücksetzen? Modellkonfigurationen, API Key, Prompts und Chatverlauf bleiben unverändert.",
    confirmResetCurrentModelSettings: "Aktuelle Modelleinstellungen zurücksetzen? Nur die ausgewählte Modellkonfiguration ist betroffen.",
    confirmResetPromptTemplate: "Bearbeitungsinhalt des aktuellen Prompt-Presets zurücksetzen?",
    confirmFactoryResetFirst: "Werkseinstellungen löschen alle Einstellungen, API Key, Prompt-Presets und den Chatverlauf. Fortfahren?",
    confirmFactoryResetSecond: "Bitte erneut bestätigen: Diese Aktion kann nicht rückgängig gemacht werden. Fortfahren?",
    settingsUnsaved: "Aktuelle Einstellungen haben ungespeicherte Änderungen. Verwerfen und verlassen?",
    confirmClearHistory: "Gesamten Chatverlauf löschen?",
    folderName: "Ordnername",
    renameFolder: "Neuen Ordnernamen eingeben",
    confirmDeleteFolder: "Ordner „{name}“ löschen? Chats werden zurück nach Nicht gruppiert verschoben.",
    missingConversations: "Der importierten Datei fehlt conversations.",
    confirmImportOverwrite: "Der Import überschreibt aktuelle Einstellungen und Chatverlauf. Fortfahren?",
    importDone: "Import abgeschlossen.",
    importFailed: "Import fehlgeschlagen: {message}",
    renameConversation: "Neuen Chatnamen eingeben",
    confirmDeleteConversation: "Chat „{title}“ löschen?",
    importedChat: "Importierter Chat",
    newChatTitle: "Neuer Chat",
    untitledChat: "Unbenannter Chat"
  }
});

Object.assign(UI_TEXT["zh-TW"], {
  chatMode: "對話",
  translateMode: "翻譯",
  webAccessMode: "連網",
  inputModeAria: "輸入模式",
  targetLanguageAria: "目標語言",
  translationStyle: "翻譯工具風格",
  translationStyleBalanced: "自然準確",
  translationStyleFaithful: "忠於原文",
  translationStylePolished: "流暢潤飾",
  translationStyleProfessional: "專業正式"
});

Object.assign(UI_TEXT["ja-JP"], {
  chatMode: "チャット",
  translateMode: "翻訳",
  webAccessMode: "Web",
  inputModeAria: "入力モード",
  targetLanguageAria: "翻訳先言語",
  translationStyle: "翻訳ツールのスタイル",
  translationStyleBalanced: "自然で正確",
  translationStyleFaithful: "原文に忠実",
  translationStylePolished: "読みやすく推敲",
  translationStyleProfessional: "専門的でフォーマル"
});

Object.assign(UI_TEXT["ko-KR"], {
  chatMode: "대화",
  translateMode: "번역",
  webAccessMode: "웹",
  inputModeAria: "입력 모드",
  targetLanguageAria: "대상 언어",
  translationStyle: "번역 도구 스타일",
  translationStyleBalanced: "자연스럽고 정확하게",
  translationStyleFaithful: "원문에 충실하게",
  translationStylePolished: "매끄럽게 다듬기",
  translationStyleProfessional: "전문적이고 격식 있게"
});

Object.assign(UI_TEXT["fr-FR"], {
  chatMode: "Discussion",
  translateMode: "Traduction",
  webAccessMode: "Web",
  inputModeAria: "Mode de saisie",
  targetLanguageAria: "Langue cible",
  translationStyle: "Style de l’outil de traduction",
  translationStyleBalanced: "Naturel et précis",
  translationStyleFaithful: "Fidèle au texte",
  translationStylePolished: "Fluide et révisé",
  translationStyleProfessional: "Professionnel"
});

Object.assign(UI_TEXT["es-ES"], {
  chatMode: "Chat",
  translateMode: "Traducir",
  webAccessMode: "Web",
  inputModeAria: "Modo de entrada",
  targetLanguageAria: "Idioma de destino",
  translationStyle: "Estilo de la herramienta de traducción",
  translationStyleBalanced: "Natural y preciso",
  translationStyleFaithful: "Fiel al original",
  translationStylePolished: "Fluido y pulido",
  translationStyleProfessional: "Profesional"
});

Object.assign(UI_TEXT["de-DE"], {
  chatMode: "Chat",
  translateMode: "Übersetzen",
  webAccessMode: "Web",
  inputModeAria: "Eingabemodus",
  targetLanguageAria: "Zielsprache",
  translationStyle: "Stil des Übersetzungswerkzeugs",
  translationStyleBalanced: "Natürlich und genau",
  translationStyleFaithful: "Quelltextnah",
  translationStylePolished: "Flüssig überarbeitet",
  translationStyleProfessional: "Professionell"
});

const state = {
  settings: { ...DEFAULT_SETTINGS },
  conversations: [],
  conversationFolders: [],
  promptTemplates: [],
  activeConversationId: "",
  sending: false,
  activePort: null,
  sidebarCollapsed: false,
  conversationSearchOpen: false,
  conversationSearchQuery: "",
  settingsPageOpen: false,
  settingsSnapshot: null,
  settingsDirtySections: {
    general: false,
    model: false
  },
  promptTemplateDirty: false,
  lastPromptTemplateManageValue: "",
  composerMode: "chat"
};

const els = {
  workspace: document.querySelector(".workspace"),
  chatTitle: document.querySelector("#chatTitle"),
  toolbarModelSelect: document.querySelector("#toolbarModelSelect"),
  healthStatus: document.querySelector("#healthStatus"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  themeToggle: document.querySelector("#themeToggle"),
  settingsToggle: document.querySelector("#settingsToggle"),
  openSettings: document.querySelector("#openSettings"),
  closeSettings: document.querySelector("#closeSettings"),
  settingsTabs: document.querySelector(".settings-tabs"),
  settingsTabButtons: [...document.querySelectorAll(".settings-tab")],
  settingsTabPanels: [...document.querySelectorAll(".settings-tab-panel")],
  settingsFooterActions: document.querySelector(".settings-footer-actions"),
  settingsPanel: document.querySelector("#settingsPanel"),
  toast: document.querySelector("#toast"),
  settingsForm: document.querySelector("#settingsForm"),
  presetField: document.querySelector("#presetField"),
  presetInput: document.querySelector("#presetInput"),
  endpointInput: document.querySelector("#endpointInput"),
  modelInput: document.querySelector("#modelInput"),
  ollamaModelField: document.querySelector("#ollamaModelField"),
  ollamaModelSelect: document.querySelector("#ollamaModelSelect"),
  customFormatField: document.querySelector("#customFormatField"),
  customFormatInput: document.querySelector("#customFormatInput"),
  apiKeyField: document.querySelector("#apiKeyField"),
  apiKeyInput: document.querySelector("#apiKeyInput"),
  temperatureInput: document.querySelector("#temperatureInput"),
  maxTokensInput: document.querySelector("#maxTokensInput"),
  historyLimitInput: document.querySelector("#historyLimitInput"),
  systemPromptInput: document.querySelector("#systemPromptInput"),
  defaultPresetInput: document.querySelector("#defaultPresetInput"),
  memoryEnabledInput: document.querySelector("#memoryEnabledInput"),
  thinkingToggle: document.querySelector("#thinkingToggle"),
  webAccessToggle: document.querySelector("#webAccessToggle"),
  languageInput: document.querySelector("#languageInput"),
  answerLanguageInput: document.querySelector("#answerLanguageInput"),
  translationStyleInput: document.querySelector("#translationStyleInput"),
  fontSizeInput: document.querySelector("#fontSizeInput"),
  colorSchemeInput: document.querySelector("#colorSchemeInput"),
  resetGeneralSettings: document.querySelector("#resetGeneralSettings"),
  resetCurrentModelSettings: document.querySelector("#resetCurrentModelSettings"),
  resetCurrentPromptTemplate: document.querySelector("#resetCurrentPromptTemplate"),
  clearHistorySettings: document.querySelector("#clearHistorySettings"),
  factoryResetSettings: document.querySelector("#factoryResetSettings"),
  testOllama: document.querySelector("#testOllama"),
  conversationList: document.querySelector("#conversationList"),
  newChat: document.querySelector("#newChat"),
  sidebarTranslateTool: document.querySelector("#sidebarTranslateTool"),
  conversationSearchToggle: document.querySelector("#conversationSearchToggle"),
  conversationSearchPanel: document.querySelector("#conversationSearchPanel"),
  conversationSearchInput: document.querySelector("#conversationSearchInput"),
  clearHistory: document.querySelector("#clearHistory"),
  newFolder: document.querySelector("#newFolder"),
  exportChats: document.querySelector("#exportChats"),
  exportMarkdown: document.querySelector("#exportMarkdown"),
  importChats: document.querySelector("#importChats"),
  importFile: document.querySelector("#importFile"),
  messages: document.querySelector("#messages"),
  chatForm: document.querySelector("#chatForm"),
  scrollToBottom: document.querySelector("#scrollToBottom"),
  composerModeToggle: document.querySelector("#composerModeToggle"),
  promptTemplateSelect: document.querySelector("#promptTemplateSelect"),
  translationTargetSelect: document.querySelector("#translationTargetSelect"),
  promptTemplateManageSelect: document.querySelector("#promptTemplateManageSelect"),
  promptTemplateNameInput: document.querySelector("#promptTemplateNameInput"),
  promptTemplateContentInput: document.querySelector("#promptTemplateContentInput"),
  savePromptTemplate: document.querySelector("#savePromptTemplate"),
  savePromptTemplateAs: document.querySelector("#savePromptTemplateAs"),
  deletePromptTemplate: document.querySelector("#deletePromptTemplate"),
  promptInput: document.querySelector("#promptInput"),
  sendButton: document.querySelector("#sendButton"),
  stopButton: document.querySelector("#stopButton")
};

let toastTimer = null;
let promptInputComposing = false;
const customSelects = new Map();
const systemThemeQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
const THEME_MODES = ["light", "dark", "system"];
const GENERAL_SETTINGS_KEYS = ["language", "answerLanguage", "translationStyle", "fontSize", "colorScheme", "theme"];
const MODEL_SETTINGS_KEYS = [
  "provider",
  "preset",
  "customEndpoint",
  "customModel",
  "customApiKey",
  "customFormat",
  "modelConfigs",
  "ollamaEndpoint",
  "ollamaModel",
  "temperature",
  "maxTokens",
  "historyLimit",
  "systemPrompt",
  "defaultPresetId",
  "memoryEnabled"
];
const MESSAGE_BOTTOM_THRESHOLD = 160;

const ACTION_ICON_MAP = {
  copy: "copy",
  regenerate: "refreshCw",
  continue: "route",
  delete: "trash"
};

function createIcon(name, options = {}) {
  if (window.AppIcon?.create) {
    return window.AppIcon.create(name, options);
  }
  const fallback = document.createElement("span");
  fallback.className = "app-icon";
  fallback.setAttribute("aria-hidden", "true");
  return fallback;
}

function mountIconSlot(slot, iconName = slot?.dataset.icon) {
  if (!slot || !iconName) return;
  slot.textContent = "";
  slot.append(createIcon(iconName, { size: Number(slot.dataset.size) || undefined }));
}

function mountStaticIcons(root = document) {
  for (const slot of root.querySelectorAll(".icon-slot[data-icon]")) {
    mountIconSlot(slot);
  }
}

function setIconOnly(button, iconName) {
  const slot = button?.querySelector(".icon-slot");
  if (!slot) return;
  slot.dataset.icon = iconName;
  mountIconSlot(slot, iconName);
}

function setTooltip(node, label) {
  if (!node || !label) return;
  node.removeAttribute("title");
  node.dataset.tooltip = label;
  node.setAttribute("aria-label", label);
}

function clearTooltip(node, label = "") {
  if (!node) return;
  node.removeAttribute("title");
  delete node.dataset.tooltip;
  if (label) {
    node.setAttribute("aria-label", label);
  }
}

function syncSidebarActionTooltips() {
  const actions = [
    [els.newChat, t("newChat")],
    [els.sidebarTranslateTool, t("newTranslation")],
    [els.conversationSearchToggle, t("searchConversations")],
    [els.settingsToggle, t("settingsTitle")]
  ];

  for (const [button, label] of actions) {
    if (state.sidebarCollapsed) {
      setTooltip(button, label);
    } else {
      clearTooltip(button, label);
    }
  }
}

function setButtonContent(button, label, iconName = "") {
  if (!button) return;
  button.textContent = "";
  if (iconName) {
    button.append(createIcon(iconName));
  }
  const text = document.createElement("span");
  text.className = "button-label";
  text.textContent = label;
  button.append(text);
}

function setIconButtonContent(button, label, iconName) {
  if (!button) return;
  button.textContent = "";
  button.append(createIcon(iconName));
  const text = document.createElement("span");
  text.className = "visually-hidden";
  text.textContent = label;
  button.append(text);
  setTooltip(button, label);
}

function setIconContent(node, iconName, label = "") {
  if (!node) return;
  node.textContent = "";
  node.append(createIcon(iconName, { size: 16 }));
  if (label) {
    setTooltip(node, label);
    const text = document.createElement("span");
    text.className = "visually-hidden";
    text.textContent = label;
    node.append(text);
  }
}

async function loadState() {
  const stored = await extensionApi.storage.local.get(["settings", "messages", "conversations", "conversationFolders", "activeConversationId", "promptTemplates", "sidebarCollapsed"]);
  state.settings = { ...DEFAULT_SETTINGS, ...(stored.settings || {}) };
  state.settings.modelConfigs = { ...(stored.settings?.modelConfigs || {}) };
  state.sidebarCollapsed = Boolean(stored.sidebarCollapsed);
  migrateOllamaSettings();
  state.conversations = Array.isArray(stored.conversations) ? stored.conversations : [];
  state.conversationFolders = Array.isArray(stored.conversationFolders) ? stored.conversationFolders : [];
  state.promptTemplates = Array.isArray(stored.promptTemplates) ? stored.promptTemplates : [];
  state.activeConversationId = stored.activeConversationId || "";

  if (!state.conversations.length && Array.isArray(stored.messages) && stored.messages.length) {
    const migrated = createConversation(t("importedChat"), stored.messages);
    state.conversations = [migrated];
    state.activeConversationId = migrated.id;
    await saveConversations();
  }

  ensureActiveConversation();
  state.composerMode = getConversationMode(getActiveConversation());
  applyTheme();
  applySidebarState(false);
  syncSettingsToForm();
  enhanceSelects();
  render();
  requestAnimationFrame(() => {
    resizePromptInput({ keepCaretVisible: true });
    updateComposerSafeSpace();
  });
  maybeAutoCheckLocalModel();
}

function migrateOllamaSettings() {
  if (state.settings.ollamaEndpoint === LEGACY_OLLAMA_PROXY_ENDPOINT) {
    state.settings.ollamaEndpoint = DIRECT_OLLAMA_ENDPOINT;
  }

  if (state.settings.provider === "ollama") {
    state.settings.provider = "custom";
    state.settings.customEndpoint = state.settings.ollamaEndpoint || DEFAULT_SETTINGS.ollamaEndpoint;
    state.settings.customModel = state.settings.ollamaModel || DEFAULT_SETTINGS.ollamaModel;
    state.settings.customFormat = "ollama";
  }

  if (state.settings.preset === "ollama-proxy" || state.settings.customFormat === "ollama") {
    state.settings.preset = "ollama-proxy";
    if (state.settings.customEndpoint === LEGACY_OLLAMA_PROXY_ENDPOINT) {
      state.settings.customEndpoint = DIRECT_OLLAMA_ENDPOINT;
    }
  }

  saveSettings();
}

async function saveSettings() {
  await extensionApi.storage.local.set({ settings: state.settings });
}

async function saveConversations() {
  await extensionApi.storage.local.set({
    conversations: state.conversations,
    conversationFolders: state.conversationFolders,
    activeConversationId: state.activeConversationId
  });
}

async function savePromptTemplates() {
  await extensionApi.storage.local.set({ promptTemplates: state.promptTemplates });
}

function normalizeConversationMode(mode) {
  return mode === "translate" ? "translate" : "chat";
}

function createConversation(title = t("newChatTitle"), messages = [], mode = "chat") {
  const now = Date.now();
  return {
    id: `${now}-${Math.random().toString(16).slice(2)}`,
    title,
    mode: normalizeConversationMode(mode),
    messages,
    createdAt: now,
    updatedAt: now
  };
}

function createConversationFolder(name = t("folderName")) {
  const now = Date.now();
  return {
    id: `folder-${now}-${Math.random().toString(16).slice(2)}`,
    name,
    createdAt: now,
    updatedAt: now
  };
}

function ensureActiveConversation() {
  if (!state.conversations.length) {
    const conversation = createConversation();
    state.conversations = [conversation];
    state.activeConversationId = conversation.id;
    state.composerMode = getConversationMode(conversation);
    saveConversations();
    return;
  }

  if (!state.conversations.some((conversation) => conversation.id === state.activeConversationId)) {
    state.activeConversationId = state.conversations[0].id;
    state.composerMode = getConversationMode(state.conversations[0]);
    saveConversations();
  }
}

function getActiveConversation() {
  ensureActiveConversation();
  return state.conversations.find((conversation) => conversation.id === state.activeConversationId);
}

function getConversationMode(conversation) {
  return normalizeConversationMode(conversation?.mode);
}

function getActiveMessages() {
  return getActiveConversation()?.messages || [];
}

function getActiveConfig() {
  const config = getModelConfigForPreset(state.settings.preset || "custom");
  return {
    provider: config.provider || "custom",
    endpoint: config.baseUrl || config.endpoint || state.settings.customEndpoint,
    baseUrl: config.baseUrl || config.endpoint || state.settings.customEndpoint,
    model: config.modelName || config.model || state.settings.customModel,
    modelName: config.modelName || config.model || state.settings.customModel,
    apiKey: config.apiKey || "",
    apiFormat: config.apiFormat === "ollama" ? "ollama" : "openai",
    temperature: clamp(Number(config.temperature), 0, 2, DEFAULT_SETTINGS.temperature),
    maxTokens: Math.max(1, Math.floor(Number(config.maxTokens) || DEFAULT_SETTINGS.maxTokens)),
    historyLimit: Number(state.settings.historyLimit) || DEFAULT_SETTINGS.historyLimit,
    systemPrompt: config.systemPrompt || "",
    defaultPresetId: config.defaultPresetId || "",
    memoryEnabled: config.memoryEnabled !== false,
    thinkingEnabled: Boolean(state.settings.thinkingEnabled),
    webAccessEnabled: Boolean(state.settings.webAccessEnabled),
    language: normalizeLanguage(state.settings.language),
    answerLanguage: normalizeLanguage(state.settings.answerLanguage),
    translationLanguage: normalizeLanguage(state.settings.translationLanguage)
  };
}

function ensureModelConfigs() {
  if (!state.settings.modelConfigs || typeof state.settings.modelConfigs !== "object") {
    state.settings.modelConfigs = {};
  }
  return state.settings.modelConfigs;
}

function defaultModelConfigForPreset(presetKey, useStateFallback = true) {
  const preset = MODEL_PRESETS[presetKey];
  const base = {
    provider: "custom",
    apiKey: "",
    temperature: DEFAULT_SETTINGS.temperature,
    maxTokens: DEFAULT_SETTINGS.maxTokens,
    systemPrompt: "",
    defaultPresetId: "",
    memoryEnabled: true,
    apiFormat: DEFAULT_SETTINGS.customFormat
  };

  if (preset) {
    return {
      ...base,
      provider: preset.provider,
      baseUrl: preset.endpoint,
      endpoint: preset.endpoint,
      modelName: preset.model,
      model: preset.model,
      apiFormat: preset.apiFormat
    };
  }

  return {
    ...base,
    provider: state.settings.provider || "custom",
    baseUrl: useStateFallback ? state.settings.customEndpoint || DEFAULT_SETTINGS.customEndpoint : DEFAULT_SETTINGS.customEndpoint,
    endpoint: useStateFallback ? state.settings.customEndpoint || DEFAULT_SETTINGS.customEndpoint : DEFAULT_SETTINGS.customEndpoint,
    modelName: useStateFallback ? state.settings.customModel || DEFAULT_SETTINGS.customModel : DEFAULT_SETTINGS.customModel,
    model: useStateFallback ? state.settings.customModel || DEFAULT_SETTINGS.customModel : DEFAULT_SETTINGS.customModel,
    apiKey: useStateFallback ? state.settings.customApiKey || "" : "",
    apiFormat: useStateFallback ? state.settings.customFormat || DEFAULT_SETTINGS.customFormat : DEFAULT_SETTINGS.customFormat,
    temperature: useStateFallback ? Number(state.settings.temperature) || DEFAULT_SETTINGS.temperature : DEFAULT_SETTINGS.temperature,
    maxTokens: useStateFallback ? Number(state.settings.maxTokens) || DEFAULT_SETTINGS.maxTokens : DEFAULT_SETTINGS.maxTokens,
    systemPrompt: useStateFallback ? state.settings.systemPrompt || "" : "",
    defaultPresetId: useStateFallback ? state.settings.defaultPresetId || "" : "",
    memoryEnabled: useStateFallback ? state.settings.memoryEnabled !== false : true
  };
}

function getModelConfigForPreset(presetKey) {
  const configs = ensureModelConfigs();
  return {
    ...defaultModelConfigForPreset(presetKey),
    ...(configs[presetKey] || {})
  };
}

function saveCurrentModelConfig(presetKey = state.settings.preset || "custom") {
  const configs = ensureModelConfigs();
  const apiFormat = els.customFormatInput.value === "ollama" ? "ollama" : "openai";
  const baseUrl = apiFormat === "ollama"
    ? normalizeOllamaEndpoint(els.endpointInput.value.trim() || DEFAULT_SETTINGS.ollamaEndpoint)
    : normalizeOpenAiEndpoint(els.endpointInput.value.trim() || DEFAULT_SETTINGS.customEndpoint);
  const modelName = els.modelInput.value.trim();
  configs[presetKey] = {
    provider: apiFormat === "ollama" ? "ollama" : "custom",
    baseUrl,
    endpoint: baseUrl,
    modelName,
    model: modelName,
    apiKey: els.apiKeyInput.value.trim(),
    apiFormat,
    temperature: clamp(Number(els.temperatureInput.value), 0, 2, DEFAULT_SETTINGS.temperature),
    maxTokens: Math.max(1, Math.floor(Number(els.maxTokensInput.value) || DEFAULT_SETTINGS.maxTokens)),
    systemPrompt: els.systemPromptInput.value.trim(),
    defaultPresetId: els.defaultPresetInput.value || "",
    memoryEnabled: Boolean(els.memoryEnabledInput.checked)
  };
}

function applyModelConfigToSettings(config) {
  state.settings.customEndpoint = config.baseUrl || config.endpoint;
  state.settings.customModel = config.modelName || config.model;
  state.settings.customApiKey = config.apiKey;
  state.settings.customFormat = config.apiFormat;
  state.settings.temperature = config.temperature;
  state.settings.maxTokens = config.maxTokens;
  state.settings.systemPrompt = config.systemPrompt || "";
  state.settings.defaultPresetId = config.defaultPresetId || "";
  state.settings.memoryEnabled = config.memoryEnabled !== false;
}

function syncSettingsToForm() {
  const config = getActiveConfig();
  els.endpointInput.value = config.endpoint;
  els.modelInput.value = config.model;
  els.presetInput.value = state.settings.preset || "custom";
  els.customFormatInput.value = config.apiFormat;
  els.apiKeyInput.value = config.apiKey;
  els.temperatureInput.value = config.temperature;
  els.maxTokensInput.value = config.maxTokens;
  els.historyLimitInput.value = config.historyLimit;
  els.systemPromptInput.value = config.systemPrompt;
  els.defaultPresetInput.value = config.defaultPresetId || "";
  els.memoryEnabledInput.checked = config.memoryEnabled;
  syncThinkingToggle();
  syncWebAccessToggle();
  els.languageInput.value = normalizeLanguage(state.settings.language);
  els.answerLanguageInput.value = normalizeLanguage(state.settings.answerLanguage);
  els.translationStyleInput.value = TRANSLATION_STYLES.includes(state.settings.translationStyle)
    ? state.settings.translationStyle
    : DEFAULT_SETTINGS.translationStyle;
  if (els.translationTargetSelect) {
    els.translationTargetSelect.value = normalizeLanguage(state.settings.translationLanguage, DEFAULT_SETTINGS.translationLanguage);
  }
  els.fontSizeInput.value = FONT_SIZES.includes(state.settings.fontSize) ? state.settings.fontSize : DEFAULT_SETTINGS.fontSize;
  els.colorSchemeInput.value = state.settings.colorScheme || DEFAULT_SETTINGS.colorScheme;
  els.ollamaModelField.classList.toggle("hidden", config.apiFormat !== "ollama");
  els.testOllama?.classList.toggle("hidden", true);
  renderToolbarModelOptions(config);
}

function presetLabel(preset) {
  const selected = els.presetInput?.querySelector(`option[value="${preset}"]`);
  return selected?.textContent || t("customApi");
}

function normalizeLanguage(language, fallback = DEFAULT_SETTINGS.language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : fallback;
}

function uiLanguage(language = state.settings.language) {
  const normalized = normalizeLanguage(language);
  return UI_TEXT[normalized] ? normalized : LANGUAGE_UI_FALLBACK[normalized] || DEFAULT_SETTINGS.language;
}

function t(key, replacements = {}) {
  const lang = uiLanguage();
  const template = UI_TEXT[lang]?.[key] || UI_TEXT["zh-CN"][key] || key;
  return Object.entries(replacements).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

function applyLanguage() {
  document.documentElement.lang = state.settings.language || DEFAULT_SETTINGS.language;
  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of document.querySelectorAll("[data-i18n-placeholder]")) {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  }
  setMenuLabel(els.newChat, t("newChat"));
  setMenuLabel(els.sidebarTranslateTool, t("newTranslation"));
  setMenuLabel(els.conversationSearchToggle, t("searchConversations"));
  setMenuLabel(els.settingsToggle, t("settingsTitle"));
  setIconOnly(els.settingsToggle, "settings");
  setMenuLabel(els.newFolder, t("newFolder"));
  setMenuLabel(els.clearHistory, t("clearHistory"));
  setMenuLabel(els.exportChats, t("exportChats"));
  setMenuLabel(els.exportMarkdown, t("exportMarkdown"));
  setMenuLabel(els.importChats, t("importChats"));
  setMenuLabel(els.openSettings, t("openSettings"));
  if (els.closeSettings) {
    els.closeSettings.textContent = t("closeSettings");
    setButtonContent(els.closeSettings, t("closeSettings"), "chevronLeft");
  }
  setTooltip(els.sidebarToggle, state.sidebarCollapsed ? t("showSidebar") : t("hideSidebar"));
  setIconOnly(els.sidebarToggle, "panelLeft");
  syncSidebarActionTooltips();
  els.conversationSearchInput.placeholder = t("searchConversationsPlaceholder");
  els.conversationSearchInput.setAttribute("aria-label", t("searchConversations"));
  syncConversationSearchState();
  clearTooltip(els.newFolder, t("newFolder"));
  setTooltip(els.clearHistory, t("clearHistory"));
  setTooltip(els.exportChats, t("exportChats"));
  setTooltip(els.exportMarkdown, t("exportMarkdown"));
  setTooltip(els.importChats, t("importChats"));
  updateThemeButton();
  if (els.testOllama) {
    setButtonContent(els.testOllama, els.testOllama.disabled ? t("testing") : t("testOllama"), "bot");
  }
  setButtonContent(document.querySelector("#saveSettings"), t("saveSettings"), "save");
  setButtonContent(els.resetGeneralSettings, t("resetCurrentSettings"), "refreshCw");
  setButtonContent(els.resetCurrentModelSettings, t("resetCurrentSettings"), "refreshCw");
  setButtonContent(els.resetCurrentPromptTemplate, t("resetCurrentSettings"), "refreshCw");
  setButtonContent(els.clearHistorySettings, t("clearHistorySettings"), "trash");
  setButtonContent(els.factoryResetSettings, t("factoryResetSettings"), "alertTriangle");
  syncComposerMode();
  syncThinkingToggle();
  syncWebAccessToggle();
  setButtonContent(els.sendButton, t("send"), "send");
  setButtonContent(els.stopButton, t("stop"), "square");
  els.promptInput.placeholder = t("promptPlaceholder");
  els.promptTemplateSelect?.setAttribute("aria-label", t("promptPresetAria"));
  els.translationTargetSelect?.setAttribute("aria-label", t("targetLanguageAria"));
  els.toolbarModelSelect?.setAttribute("aria-label", t("currentModelAria"));
  setTooltip(els.scrollToBottom, t("scrollToBottom"));
  setButtonContent(els.savePromptTemplate, t("savePromptTemplate"), "save");
  setButtonContent(els.savePromptTemplateAs, t("savePromptTemplateAs"), "copyPlus");
  setButtonContent(els.deletePromptTemplate, t("deletePromptTemplate"), "trash");
  document.querySelector(".sidebar")?.setAttribute("aria-label", t("sidebarHistory"));
  els.conversationList.setAttribute("aria-label", t("conversationList"));
  els.settingsPanel.setAttribute("aria-label", t("modelSettings"));
  els.settingsTabs.setAttribute("aria-label", t("settingsTabs"));
  els.settingsToggle.setAttribute("aria-expanded", String(state.settingsPageOpen));
  if (els.healthStatus) {
    if (els.healthStatus.classList.contains("unknown")) {
      updateHealthLabel(t("healthUnknown"));
    } else if (els.healthStatus.classList.contains("checking")) {
      updateHealthLabel(t("healthChecking"));
    }
  }
  syncComposerMode();
  mountStaticIcons();
}

function setMenuLabel(button, label) {
  if (!button) return;
  const labelNode = button.querySelector(".menu-label");
  if (labelNode) {
    labelNode.textContent = label;
  } else {
    button.textContent = label;
  }
}

function applySidebarState(persist = true) {
  document.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed);
  setTooltip(els.sidebarToggle, state.sidebarCollapsed ? t("showSidebar") : t("hideSidebar"));
  syncSidebarActionTooltips();
  syncConversationSearchState();
  setIconOnly(els.sidebarToggle, "panelLeft");
  if (state.sidebarCollapsed) {
    closeSettingsMenu();
  }
  if (persist) {
    extensionApi.storage.local.set({ sidebarCollapsed: state.sidebarCollapsed });
  }
}

function syncConversationSearchState({ focus = false } = {}) {
  const isOpen = state.conversationSearchOpen && !state.sidebarCollapsed;
  els.conversationSearchToggle.classList.toggle("hidden", isOpen);
  els.conversationSearchPanel.classList.toggle("hidden", !isOpen);
  els.conversationSearchToggle.classList.toggle("active", Boolean(state.conversationSearchQuery.trim()));
  els.conversationSearchToggle.setAttribute("aria-expanded", String(isOpen));
  els.conversationSearchInput.value = state.conversationSearchQuery;
  if (focus && isOpen) {
    requestAnimationFrame(() => els.conversationSearchInput.focus());
  }
}

function setConversationSearchOpen(open, options = {}) {
  state.conversationSearchOpen = Boolean(open);
  syncConversationSearchState(options);
}

function isConversationSearchOpen() {
  return state.conversationSearchOpen || !els.conversationSearchPanel.classList.contains("hidden");
}

function closeConversationSearch({ restoreFocus = false } = {}) {
  if (!isConversationSearchOpen() && !state.conversationSearchQuery) {
    return;
  }
  state.conversationSearchQuery = "";
  setConversationSearchOpen(false);
  renderConversations();
  if (restoreFocus) {
    els.conversationSearchToggle.focus();
  } else {
    els.conversationSearchInput.blur();
  }
}

function normalizeSearchText(value = "") {
  return value.toLocaleLowerCase().trim();
}

function conversationMatchesSearch(conversation, query) {
  if (!query) return true;
  const title = conversation.title || t("newChatTitle");
  const messages = Array.isArray(conversation.messages)
    ? conversation.messages.map((message) => message.content || "").join(" ")
    : "";
  return normalizeSearchText(`${title} ${messages}`).includes(query);
}

function applyTheme() {
  const isDark = getResolvedThemeMode() === "dark";
  const colorScheme = COLOR_SCHEMES.includes(state.settings.colorScheme)
    ? state.settings.colorScheme
    : DEFAULT_SETTINGS.colorScheme;
  document.body.classList.toggle("dark-mode", isDark);
  document.documentElement.dataset.fontSize = FONT_SIZES.includes(state.settings.fontSize)
    ? state.settings.fontSize
    : DEFAULT_SETTINGS.fontSize;
  document.body.dataset.themeMode = getThemeMode();
  document.body.dataset.colorScheme = colorScheme;
  updateThemeButton();
}

function updateThemeButton() {
  if (!els.themeToggle) return;
  const mode = getThemeMode();
  const label = mode === "system"
    ? t("systemMode")
    : mode === "dark"
      ? t("darkMode")
      : t("lightMode");
  const icon = mode === "system" ? "monitor" : mode === "dark" ? "moon" : "sun";
  setTooltip(els.themeToggle, label);
  els.themeToggle.setAttribute("aria-pressed", mode === "system" ? "mixed" : String(mode === "dark"));
  setIconOnly(els.themeToggle, icon);
}

function getThemeMode() {
  return THEME_MODES.includes(state.settings.theme) ? state.settings.theme : DEFAULT_SETTINGS.theme;
}

function getResolvedThemeMode() {
  const mode = getThemeMode();
  if (mode !== "system") return mode;
  return systemThemeQuery?.matches ? "dark" : "light";
}

function getNextThemeMode() {
  const index = THEME_MODES.indexOf(getThemeMode());
  return THEME_MODES[(index + 1) % THEME_MODES.length];
}

function closeSettingsMenu() {
  els.settingsToggle.setAttribute("aria-expanded", "false");
}

function showSettingsPage(show) {
  if (show && !state.settingsPageOpen) {
    captureSettingsSnapshot();
  }
  state.settingsPageOpen = show;
  els.settingsPanel.classList.toggle("hidden", !show);
  els.workspace.classList.toggle("settings-open", show);
  document.body.classList.toggle("settings-open", show);
  els.settingsToggle.setAttribute("aria-expanded", String(show));
}

function requestCloseSettingsPage() {
  if (!confirmDiscardAllSettingsChanges()) {
    return false;
  }
  showSettingsPage(false);
  return true;
}

function activateSettingsTab(tabName) {
  els.settingsPanel.dataset.activeTab = tabName;
  for (const button of els.settingsTabButtons) {
    const active = button.dataset.tab === tabName;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  }

  for (const panel of els.settingsTabPanels) {
    const active = panel.id === `${tabName}SettingsPanel`;
    panel.classList.toggle("active", active);
    panel.classList.toggle("hidden", !active);
  }
  els.settingsFooterActions?.classList.toggle("hidden", tabName === "general" || tabName === "data");
}

function setHealthStatus(status, detail = "") {
  if (!els.healthStatus) return;
  els.healthStatus.className = `health-status ${status}`;
  if (status === "checking") {
    updateHealthLabel(t("healthChecking"));
  } else if (status === "ok") {
    updateHealthLabel(detail || t("healthOk"));
  } else if (status === "bad") {
    updateHealthLabel(detail || t("healthBad"));
  } else {
    updateHealthLabel(t("healthUnknown"));
  }
}

function updateHealthLabel(label) {
  if (!els.healthStatus) return;
  els.healthStatus.removeAttribute("title");
  els.healthStatus.setAttribute("aria-label", label);
}

function maybeAutoCheckLocalModel() {
  const config = getActiveConfig();
  if (config.apiFormat !== "ollama" || !config.endpoint || !config.model) {
    setHealthStatus("unknown");
    return;
  }
  checkModelHealth();
}

function render() {
  applyTheme();
  applyLanguage();
  showSettingsPage(state.settingsPageOpen);
  updateChatTitle();
  renderPromptTemplates();
  syncSettingsToForm();
  renderConversations();
  renderMessages();
  syncCustomSelects();
  els.sendButton.disabled = state.sending;
  els.promptInput.disabled = state.sending;
  els.sendButton.classList.toggle("hidden", state.sending);
  els.stopButton.classList.toggle("hidden", !state.sending);
}

function updateChatTitle() {
  if (!els.chatTitle) return;
  const conversation = getActiveConversation();
  const title = conversation?.title || t("newChatTitle");
  els.chatTitle.textContent = title;
  els.chatTitle.title = title;
}

function setComposerMode(mode) {
  state.composerMode = mode === "translate" ? "translate" : "chat";
  syncComposerMode();
  els.promptInput.focus();
}

function toggleComposerMode() {
  setComposerMode(state.composerMode === "translate" ? "chat" : "translate");
}

function syncComposerMode() {
  const mode = state.composerMode === "translate" ? "translate" : "chat";
  if (els.composerModeToggle) {
    const label = mode === "translate" ? t("translateMode") : t("chatMode");
    const icon = mode === "translate" ? "languages" : "messageCircle";
    els.composerModeToggle.classList.toggle("active", mode === "translate");
    els.composerModeToggle.setAttribute("aria-pressed", String(mode === "translate"));
    setIconButtonContent(els.composerModeToggle, label, icon);
  }

  const promptShell = els.promptTemplateSelect ? customSelects.get(els.promptTemplateSelect)?.shell : null;
  const targetShell = els.translationTargetSelect ? customSelects.get(els.translationTargetSelect)?.shell : null;
  promptShell?.classList.toggle("hidden", mode !== "chat");
  targetShell?.classList.toggle("hidden", mode !== "translate");
  els.promptTemplateSelect?.classList.toggle("hidden", mode !== "chat");
  els.translationTargetSelect?.classList.toggle("hidden", mode !== "translate");
  closeCustomSelects();
}

function syncWebAccessToggle() {
  if (!els.webAccessToggle) return;
  const enabled = Boolean(state.settings.webAccessEnabled);
  els.webAccessToggle.classList.toggle("active", enabled);
  els.webAccessToggle.setAttribute("aria-pressed", String(enabled));
  setIconButtonContent(els.webAccessToggle, t("webAccessMode"), "globe");
}

function syncThinkingToggle() {
  if (!els.thinkingToggle) return;
  const enabled = Boolean(state.settings.thinkingEnabled);
  els.thinkingToggle.classList.toggle("active", enabled);
  els.thinkingToggle.setAttribute("aria-pressed", String(enabled));
  setIconButtonContent(els.thinkingToggle, t("thinkingMode"), "brain");
}

function enhanceSelects() {
  for (const select of document.querySelectorAll("select")) {
    if (customSelects.has(select)) continue;

    const shell = document.createElement("div");
    shell.className = "custom-select";
    select.parentNode.insertBefore(shell, select);
    shell.append(select);
    select.classList.add("native-select");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "custom-select-button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");

    const menu = document.createElement("div");
    menu.className = "custom-select-menu hidden";
    menu.setAttribute("role", "listbox");

    shell.append(button, menu);
    customSelects.set(select, { shell, button, menu });

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleCustomSelect(select);
    });

    select.addEventListener("change", () => {
      rebuildCustomSelect(select);
    });
  }
  syncCustomSelects();
}

function syncCustomSelects() {
  for (const select of customSelects.keys()) {
    rebuildCustomSelect(select);
  }
}

function toggleCustomSelect(select) {
  const custom = customSelects.get(select);
  if (!custom) return;
  const willOpen = custom.menu.classList.contains("hidden");
  closeCustomSelects(select);
  custom.menu.classList.toggle("hidden", !willOpen);
  custom.shell.classList.toggle("open", willOpen);
  custom.button.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) {
    positionCustomSelectMenu(custom);
  } else {
    custom.shell.classList.remove("open-up");
  }
}

function closeCustomSelects(except = null) {
  for (const [select, custom] of customSelects.entries()) {
    if (select === except) continue;
    custom.menu.classList.add("hidden");
    custom.shell.classList.remove("open");
    custom.shell.classList.remove("open-up");
    custom.button.setAttribute("aria-expanded", "false");
  }
}

function positionCustomSelectMenu(custom) {
  custom.shell.classList.remove("open-up");
  const rect = custom.button.getBoundingClientRect();
  const menuHeight = Math.min(custom.menu.scrollHeight || 280, 280);
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const shouldOpenUp = spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;
  custom.shell.classList.toggle("open-up", shouldOpenUp);
}

function rebuildCustomSelect(select) {
  const custom = customSelects.get(select);
  if (!custom) return;
  const selected = select.selectedOptions[0] || select.options[0];
  setButtonContent(custom.button, selected?.textContent || "", iconForSelectOption(select, selected));
  custom.button.disabled = select.disabled;
  custom.menu.innerHTML = "";
  for (const child of select.children) {
    appendCustomSelectItems(select, custom.menu, child);
  }
}

function iconForSelectOption(select, option) {
  if (!select || !option) return "";
  if (select.id === "toolbarModelSelect" || select.id === "presetInput" || select.id === "ollamaModelSelect") {
    return "bot";
  }
  if (select.id === "customFormatInput") {
    return option.value === "ollama" ? "bot" : "messageCircle";
  }
  if (select.id === "languageInput" || select.id === "answerLanguageInput" || select.id === "translationTargetSelect") {
    return "languages";
  }
  if (select.id === "translationStyleInput") {
    return "edit";
  }
  if (select.id === "fontSizeInput") {
    return "text";
  }
  if (select.id === "colorSchemeInput") {
    return "sun";
  }
  if (select.id === "promptTemplateSelect" || select.id === "promptTemplateManageSelect" || select.id === "defaultPresetInput") {
    const promptIcons = {
      summarize: "fileText",
      "code-review": "bot",
      debug: "refreshCw",
      writing: "edit",
      plan: "route"
    };
    return promptIcons[option.value] || "messageCircle";
  }
  return "";
}

function appendCustomSelectItems(select, menu, node) {
  if (node.tagName === "OPTGROUP") {
    const label = document.createElement("div");
    label.className = "custom-select-group";
    label.textContent = node.label;
    menu.append(label);
    for (const option of node.children) {
      appendCustomSelectItems(select, menu, option);
    }
    return;
  }

  if (node.tagName !== "OPTION") return;
  const item = document.createElement("button");
  item.type = "button";
  item.className = "custom-select-option";
  item.dataset.value = node.value;
  item.setAttribute("role", "option");
  item.setAttribute("aria-selected", String(select.value === node.value));
  item.disabled = node.disabled;
  setButtonContent(item, node.textContent, iconForSelectOption(select, node));
  item.addEventListener("click", () => {
    select.value = node.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    closeCustomSelects();
  });
  menu.append(item);
}

function renderPromptTemplates() {
  const currentValue = els.promptTemplateSelect.value;
  const currentManageValue = els.promptTemplateManageSelect.value;
  const currentDefaultValue = els.defaultPresetInput?.value || "";
  els.promptTemplateSelect.innerHTML = "";
  els.promptTemplateManageSelect.innerHTML = "";
  if (els.defaultPresetInput) {
    els.defaultPresetInput.innerHTML = "";
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("promptTemplatePlaceholder");
  els.promptTemplateSelect.append(placeholder);

  const managePlaceholder = document.createElement("option");
  managePlaceholder.value = "";
  managePlaceholder.textContent = t("newPromptTemplate");
  els.promptTemplateManageSelect.append(managePlaceholder);

  if (els.defaultPresetInput) {
    const defaultPlaceholder = document.createElement("option");
    defaultPlaceholder.value = "";
    defaultPlaceholder.textContent = t("noDefaultPreset");
    els.defaultPresetInput.append(defaultPlaceholder);
  }

  appendPromptTemplateGroup(t("builtInTemplates"), VISIBLE_BUILT_IN_PROMPT_TEMPLATES);
  appendPromptTemplateGroup(t("customTemplates"), state.promptTemplates);
  appendPromptTemplateGroup(t("builtInTemplates"), VISIBLE_BUILT_IN_PROMPT_TEMPLATES, els.promptTemplateManageSelect);
  appendPromptTemplateGroup(t("customTemplates"), state.promptTemplates, els.promptTemplateManageSelect);
  if (els.defaultPresetInput) {
    appendPromptTemplateGroup(t("builtInTemplates"), VISIBLE_BUILT_IN_PROMPT_TEMPLATES, els.defaultPresetInput);
    appendPromptTemplateGroup(t("customTemplates"), state.promptTemplates, els.defaultPresetInput);
  }

  els.promptTemplateSelect.value = currentValue;
  if (!els.promptTemplateSelect.value) {
    els.promptTemplateSelect.value = "";
  }
  els.promptTemplateManageSelect.value = currentManageValue;
  if (!els.promptTemplateManageSelect.value) {
    els.promptTemplateManageSelect.value = "";
  }
  if (els.defaultPresetInput) {
    els.defaultPresetInput.value = currentDefaultValue;
    if (!els.defaultPresetInput.value) {
      els.defaultPresetInput.value = "";
    }
  }
}

function appendPromptTemplateGroup(label, templates, select = els.promptTemplateSelect) {
  if (!templates.length) {
    return;
  }

  const group = document.createElement("optgroup");
  group.label = label;

  for (const template of templates) {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = localizedTemplateName(template);
    option.dataset.custom = template.custom ? "true" : "false";
    group.append(option);
  }

  select.append(group);
}

function getPromptTemplate(id) {
  return [...BUILT_IN_PROMPT_TEMPLATES, ...state.promptTemplates].find((template) => template.id === id);
}

function countVisibleMessages(messages) {
  return messages.filter((message) => message.role !== "system").length;
}

function localizedTemplateName(template) {
  const language = uiLanguage();
  return BUILT_IN_PROMPT_TEMPLATE_LOCALES[template.id]?.[language]?.name
    || (language === "en-US" && template.nameEn ? template.nameEn : template.name);
}

function localizedTemplateContent(template) {
  const language = uiLanguage();
  return BUILT_IN_PROMPT_TEMPLATE_LOCALES[template.id]?.[language]?.content
    || (language === "en-US" && template.contentEn ? template.contentEn : template.content);
}

function defaultTranslationLanguageName() {
  const language = normalizeLanguage(state.settings.translationLanguage, DEFAULT_SETTINGS.translationLanguage);
  return NATIVE_LANGUAGE_NAMES[language] || NATIVE_LANGUAGE_NAMES[DEFAULT_SETTINGS.translationLanguage];
}

function resolvePromptTemplateVariables(content) {
  const withLanguage = DEFAULT_TRANSLATION_LANGUAGE_VARIABLES.reduce(
    (resolved, variable) => resolved.split(variable).join(defaultTranslationLanguageName()),
    content
  );
  return TRANSLATION_STYLE_VARIABLES.reduce(
    (resolved, variable) => resolved.split(variable).join(translationStyleInstruction()),
    withLanguage
  );
}

function translationStyleInstruction() {
  const style = TRANSLATION_STYLES.includes(state.settings.translationStyle)
    ? state.settings.translationStyle
    : DEFAULT_SETTINGS.translationStyle;
  const instructions = {
    balanced: "Natural and accurate, balancing source meaning with target-language fluency.",
    faithful: "Faithful to the source, preserving structure, terminology, tone, and nuance where possible.",
    polished: "Polished and fluent, improving readability and flow without changing meaning.",
    professional: "Professional and formal, suitable for business, academic, research, or other formal contexts."
  };

  return instructions[style] || instructions.balanced;
}

function fillPromptTemplateEditor(template = null) {
  els.promptTemplateNameInput.value = template ? localizedTemplateName(template) : "";
  els.promptTemplateContentInput.value = template ? localizedTemplateContent(template) : "";
  state.lastPromptTemplateManageValue = template?.id || "";
  setPromptTemplateDirty(false);
}

function setPromptTemplateDirty(dirty) {
  state.promptTemplateDirty = Boolean(dirty);
  els.promptTemplateContentInput?.classList.toggle("dirty", state.promptTemplateDirty);
  els.promptTemplateNameInput?.classList.toggle("dirty", state.promptTemplateDirty);
}

function cloneSettings(settings) {
  if (settings === undefined) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(settings || {}));
}

function captureSettingsSnapshot({ resetPrompt = true } = {}) {
  state.settingsSnapshot = cloneSettings(state.settings);
  setSettingsSectionDirty("general", false);
  setSettingsSectionDirty("model", false);
  if (resetPrompt) {
    setPromptTemplateDirty(false);
  }
}

function setSettingsSectionDirty(section, dirty) {
  if (section === "prompt") {
    setPromptTemplateDirty(dirty);
    return;
  }
  state.settingsDirtySections[section] = Boolean(dirty);
  document.querySelector(`#${section}SettingsPanel`)?.classList.toggle("dirty", Boolean(dirty));
}

function isSettingsSectionDirty(section) {
  return section === "prompt" ? state.promptTemplateDirty : Boolean(state.settingsDirtySections[section]);
}

function restoreSettingsKeys(keys) {
  if (!state.settingsSnapshot) return;
  for (const key of keys) {
    if (key === "modelConfigs") {
      state.settings.modelConfigs = cloneSettings(state.settingsSnapshot.modelConfigs || {});
    } else {
      state.settings[key] = cloneSettings(state.settingsSnapshot[key]);
    }
  }
}

function updateSettingsSnapshotKeys(keys) {
  if (!state.settingsSnapshot) {
    state.settingsSnapshot = cloneSettings(state.settings);
    return;
  }
  for (const key of keys) {
    state.settingsSnapshot[key] = cloneSettings(state.settings[key]);
  }
}

function discardSettingsSection(section) {
  if (section === "general") {
    restoreSettingsKeys(GENERAL_SETTINGS_KEYS);
    applyTheme();
    render();
  } else if (section === "model") {
    restoreSettingsKeys(MODEL_SETTINGS_KEYS);
    syncSettingsToForm();
    renderToolbarModelOptions(getActiveConfig());
    maybeAutoCheckLocalModel();
    syncCustomSelects();
  } else if (section === "prompt") {
    fillPromptTemplateEditor(getPromptTemplate(els.promptTemplateManageSelect.value));
  }
  setSettingsSectionDirty(section, false);
}

async function autoSaveGeneralSettings(applyChange, afterChange = () => {}) {
  const previousSettings = cloneSettings(state.settings);
  try {
    applyChange();
    afterChange();
    await saveSettings();
    updateSettingsSnapshotKeys(GENERAL_SETTINGS_KEYS);
    setSettingsSectionDirty("general", false);
    pushSystemMessage(t("settingsAutoSaved"));
  } catch (error) {
    state.settings = previousSettings;
    syncSettingsToForm();
    applyTheme();
    render();
    syncCustomSelects();
    pushSystemMessage(t("settingsSaveFailed"));
  }
}

function confirmDiscardSettingsSection(section) {
  if (!isSettingsSectionDirty(section)) {
    return true;
  }

  const shouldDiscard = confirm(section === "prompt" ? t("promptTemplateUnsaved") : t("settingsUnsaved"));
  if (shouldDiscard) {
    discardSettingsSection(section);
  }
  return shouldDiscard;
}

function confirmDiscardAllSettingsChanges() {
  for (const section of ["general", "model", "prompt"]) {
    if (!confirmDiscardSettingsSection(section)) {
      return false;
    }
  }
  return true;
}

function confirmDiscardPromptTemplateChanges() {
  return confirmDiscardSettingsSection("prompt");
}

function currentPromptTemplateDraft() {
  return {
    name: els.promptTemplateNameInput.value.trim(),
    content: els.promptTemplateContentInput.value.trim()
  };
}

function makePromptTemplateId() {
  return `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function savePromptTemplateDraft({ forceNew = false } = {}) {
  const { name, content } = currentPromptTemplateDraft();
  if (!content) {
    pushSystemMessage(t("promptTemplateEmpty"));
    return "";
  }

  if (!name) {
    pushSystemMessage(t("promptTemplateName"));
    return "";
  }

  const selected = !forceNew
    ? state.promptTemplates.find((item) => item.id === els.promptTemplateManageSelect.value)
    : null;
  let savedId = selected?.id || makePromptTemplateId();
  if (selected) {
    selected.name = name.slice(0, 40);
    selected.content = content;
  } else {
    state.promptTemplates.push({
      id: savedId,
      name: name.slice(0, 40),
      content,
      custom: true
    });
  }

  await savePromptTemplates();
  renderPromptTemplates();
  els.promptTemplateManageSelect.value = savedId;
  state.lastPromptTemplateManageValue = savedId;
  setPromptTemplateDirty(false);
  syncCustomSelects();
  return savedId;
}

function renderConversations() {
  els.conversationList.innerHTML = "";
  const searchQuery = normalizeSearchText(state.conversationSearchQuery);
  let renderedCount = 0;

  for (const folder of state.conversationFolders) {
    const folderConversations = state.conversations.filter((conversation) => conversation.folderId === folder.id);
    const visibleFolderConversations = folderConversations.filter((conversation) => conversationMatchesSearch(conversation, searchQuery));
    if (searchQuery && !visibleFolderConversations.length) {
      continue;
    }
    const group = document.createElement("section");
    group.className = "conversation-folder";
    group.dataset.folderId = folder.id;

    const header = document.createElement("div");
    header.className = "conversation-folder-header";
    header.dataset.folderId = folder.id;

    const icon = document.createElement("span");
    icon.className = "conversation-icon";
    icon.append(createIcon("folder", { size: 16 }));

    const title = document.createElement("span");
    title.className = "conversation-title";
    title.textContent = folder.name || t("folderName");

    const meta = document.createElement("span");
    meta.className = "conversation-meta";
    meta.textContent = t("folderMessagesCount", { count: folderConversations.length });

    const actions = document.createElement("span");
    actions.className = "folder-actions";

    const menuToggle = document.createElement("span");
    menuToggle.className = "conversation-menu-toggle";
    menuToggle.dataset.action = "folder-menu";
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", t("folderActionsMenu"));
    menuToggle.append(createIcon("moreHorizontal", { size: 16 }));

    const menu = document.createElement("span");
    menu.className = "conversation-action-menu hidden";
    menu.append(
      createConversationMenuAction("rename-folder", "edit", t("rename")),
      createConversationMenuAction("delete-folder", "trash", t("delete"), "danger")
    );

    actions.append(menuToggle, menu);
    header.append(icon, title, meta, actions);
    group.append(header);

    const items = document.createElement("div");
    items.className = "conversation-folder-items";
    for (const conversation of visibleFolderConversations) {
      items.append(createConversationItem(conversation, { inFolder: true }));
      renderedCount += 1;
    }
    group.append(items);
    els.conversationList.append(group);
  }

  const ungrouped = state.conversations
    .filter((conversation) => !conversation.folderId || !state.conversationFolders.some((folder) => folder.id === conversation.folderId))
    .filter((conversation) => conversationMatchesSearch(conversation, searchQuery));
  const ungroupedGroup = document.createElement("section");
  ungroupedGroup.className = "conversation-ungrouped";
  ungroupedGroup.setAttribute("aria-label", t("ungroupedChats"));

  let currentSection = "";
  for (const conversation of ungrouped) {
    const section = conversationSectionLabel(conversation.updatedAt || conversation.createdAt || Date.now());
    if (section !== currentSection) {
      currentSection = section;
      const header = document.createElement("div");
      header.className = "conversation-section";
      header.textContent = section;
      ungroupedGroup.append(header);
    }

    ungroupedGroup.append(createConversationItem(conversation));
    renderedCount += 1;
  }

  if ((!searchQuery && state.conversationFolders.length) || ungrouped.length) {
    els.conversationList.append(ungroupedGroup);
  }

  if (searchQuery && renderedCount === 0) {
    const empty = document.createElement("div");
    empty.className = "conversation-empty";
    empty.textContent = t("noSearchResults");
    els.conversationList.append(empty);
  }
}

function createConversationItem(conversation, options = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `conversation-item ${conversation.id === state.activeConversationId ? "active" : ""}`;
  button.dataset.id = conversation.id;
  button.draggable = true;

  const icon = document.createElement("span");
  icon.className = "conversation-icon";
  icon.append(createIcon(getConversationMode(conversation) === "translate" ? "languages" : "messageCircle", { size: 16 }));

  const title = document.createElement("span");
  title.className = "conversation-title";
  title.textContent = conversation.title || t("newChatTitle");

  const meta = document.createElement("span");
  meta.className = "conversation-meta";
  meta.textContent = t("messagesCount", { count: countVisibleMessages(conversation.messages) });

  const actions = document.createElement("span");
  actions.className = "conversation-actions";

  const menuToggle = document.createElement("span");
  menuToggle.className = "conversation-menu-toggle";
  menuToggle.dataset.action = "menu";
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", t("actionsMenu"));
  menuToggle.append(createIcon("moreHorizontal", { size: 16 }));

  const menu = document.createElement("span");
  menu.className = "conversation-action-menu hidden";
  const menuActions = [
    createConversationMenuAction("rename", "edit", t("rename")),
    createConversationMenuAction("exportMarkdown", "fileDown", t("exportMarkdown"))
  ];
  if (options.inFolder) {
    menuActions.push(createConversationMenuAction("removeFromFolder", "folderOutput", t("removeFromFolder")));
  }
  menuActions.push(createConversationMenuAction("delete", "trash", t("delete"), "danger"));
  menu.append(...menuActions);

  actions.append(menuToggle, menu);
  button.append(icon, title, meta, actions);
  return button;
}

function createConversationMenuAction(action, iconName, label, extraClass = "") {
  const item = document.createElement("span");
  item.className = `conversation-action ${extraClass}`.trim();
  item.dataset.action = action;
  setIconContent(item, iconName, label);
  return item;
}

function closeConversationMenus(exceptMenu = null) {
  for (const menu of els.conversationList.querySelectorAll(".conversation-action-menu")) {
    if (menu !== exceptMenu) {
      menu.classList.add("hidden");
      menu.parentElement?.classList.remove("menu-open");
      menu.closest(".conversation-item, .conversation-folder-header")?.classList.remove("menu-open");
    }
  }

  for (const toggle of els.conversationList.querySelectorAll(".conversation-menu-toggle")) {
    const menu = toggle.parentElement?.querySelector(".conversation-action-menu");
    toggle.setAttribute("aria-expanded", menu && !menu.classList.contains("hidden") ? "true" : "false");
  }
}

function conversationSectionLabel(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOfLastWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;
  const time = date.getTime();

  if (time >= startOfToday) return t("todaySection");
  if (time >= startOfYesterday) return t("yesterdaySection");
  if (time >= startOfLastWeek) return t("lastWeekSection");
  return t("earlierSection");
}

function getMessagesBottomDistance() {
  if (!els.messages) return 0;
  return els.messages.scrollHeight - els.messages.scrollTop - els.messages.clientHeight;
}

function isMessagesNearBottom(threshold = MESSAGE_BOTTOM_THRESHOLD) {
  return getMessagesBottomDistance() <= threshold;
}

function updateScrollToBottomButton() {
  if (!els.scrollToBottom || !els.messages) return;
  const showButton = getMessagesBottomDistance() > MESSAGE_BOTTOM_THRESHOLD;
  els.scrollToBottom.classList.toggle("hidden", !showButton);
  els.scrollToBottom.setAttribute("aria-hidden", String(!showButton));
}

function scrollMessagesToBottom({ smooth = false } = {}) {
  if (!els.messages) return;

  const jumpToBottom = () => {
    if (smooth) {
      els.messages.scrollTo({ top: els.messages.scrollHeight, behavior: "smooth" });
    } else {
      els.messages.scrollTop = els.messages.scrollHeight;
    }
  };

  jumpToBottom();
  updateScrollToBottomButton();
  if (!smooth) {
    requestAnimationFrame(() => {
      jumpToBottom();
      updateScrollToBottomButton();
      requestAnimationFrame(() => {
        jumpToBottom();
        updateScrollToBottomButton();
      });
    });
  }
}

function renderMessages() {
  const messages = getActiveMessages();
  const visibleMessages = messages
    .map((message, index) => ({ message, index }))
    .filter((item) => item.message.role !== "system");
  const shouldStickToBottom = isMessagesNearBottom();
  const previousBottomDistance = getMessagesBottomDistance();
  els.messages.innerHTML = "";

  if (!visibleMessages.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("emptyState");
    els.messages.append(empty);
    updateScrollToBottomButton();
    return;
  }

  for (const { message, index } of visibleMessages) {
    const row = document.createElement("div");
    row.className = `message-row ${message.role}`;

    const item = document.createElement("article");
    item.className = `message ${message.role}`;
    item.dataset.index = String(index);

    const actions = createMessageActions(index, message);
    const content = document.createElement("div");
    content.className = "message-content";
    if (message.pending && !message.content) {
      content.append(createThinkingIndicator(Boolean(message.thinkingEnabled)));
    } else {
      renderMessageContent(content, message.content, message.role);
    }

    const meta = createMessageMeta(message);
    item.append(content);
    if (meta) {
      item.append(meta);
    }
    item.append(actions);

    row.append(item);
    els.messages.append(row);
  }

  requestAnimationFrame(() => {
    if (shouldStickToBottom) {
      scrollMessagesToBottom();
    } else {
      els.messages.scrollTop = Math.max(0, els.messages.scrollHeight - els.messages.clientHeight - previousBottomDistance);
      updateScrollToBottomButton();
    }
  });
}

function createMessageMeta(message) {
  if (message.role !== "assistant" || !message.stats) {
    return null;
  }

  const meta = document.createElement("div");
  meta.className = "message-meta";
  const parts = [];
  if (Number.isFinite(message.stats.elapsedMs)) {
    parts.push(`${t("elapsed")} ${formatDuration(message.stats.elapsedMs)}`);
  }
  if (Number.isFinite(message.stats.firstTokenMs)) {
    parts.push(`${t("firstToken")} ${formatDuration(message.stats.firstTokenMs)}`);
  }
  if (Number.isFinite(message.stats.evalDurationMs)) {
    parts.push(`${t("localEval")} ${formatDuration(message.stats.evalDurationMs)}`);
  }
  const totalTokens = (message.stats.promptTokens || 0) + (message.stats.completionTokens || 0);
  if (totalTokens) {
    parts.push(`${t("approxTokens")} ${totalTokens}`);
  }
  meta.textContent = parts.join(" · ");
  return parts.length ? meta : null;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)}s`;
}

function createMessageActions(index, message) {
  const actions = document.createElement("div");
  actions.className = "message-actions";

  const copy = createMessageAction(t("copyMessage"), "copy", index);
  const regenerate = createMessageAction(t("regenerateMessage"), "regenerate", index);
  const continueFrom = createMessageAction(t("continueMessage"), "continue", index);
  const remove = createMessageAction(t("deleteMessage"), "delete", index);

  actions.append(copy);
  if (message.role !== "system") {
    actions.append(regenerate, continueFrom);
  }
  actions.append(remove);
  return actions;
}

function createMessageAction(label, action, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "message-action";
  button.dataset.action = action;
  button.dataset.index = String(index);
  setTooltip(button, label);
  button.append(createIcon(ACTION_ICON_MAP[action], { size: 14 }));
  return button;
}

function roleLabel(role) {
  if (role === "user") return "You";
  if (role === "assistant") return "Assistant";
  return "System";
}

function createThinkingIndicator(thinkingEnabled = false) {
  const indicator = document.createElement("div");
  indicator.className = "thinking";

  const text = document.createElement("span");
  text.textContent = thinkingEnabled ? t("thinking") : t("responding");

  const dots = document.createElement("span");
  dots.className = "typing-dots";
  dots.append(document.createElement("span"), document.createElement("span"), document.createElement("span"));

  indicator.append(text, dots);
  return indicator;
}

function renderMessageContent(container, rawContent, role) {
  if (role !== "assistant") {
    container.textContent = rawContent;
    return;
  }

  const parts = splitMarkdownCodeBlocks(rawContent);
  for (const part of parts) {
    if (part.type === "code") {
      container.append(createCodeBlock(part.code, part.lang));
    } else {
      container.append(...renderMarkdownText(part.text));
    }
  }
}

function splitMarkdownCodeBlocks(text) {
  const parts = [];
  const pattern = /```([^\n`]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", lang: match[1].trim(), code: match[2] });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", text: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: "text", text }];
}

function createCodeBlock(code, lang) {
  const wrapper = document.createElement("div");
  wrapper.className = "code-block";

  const header = document.createElement("div");
  header.className = "code-header";

  const label = document.createElement("span");
  label.textContent = lang || "code";

  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "copy-code";
  setTooltip(copy, t("copyMessage"));
  copy.append(createIcon("copy", { size: 14 }));
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(code);
    setTooltip(copy, t("copied"));
    setTimeout(() => {
      setTooltip(copy, t("copyMessage"));
    }, 1200);
  });

  const pre = document.createElement("pre");
  const codeEl = document.createElement("code");
  codeEl.textContent = code;
  pre.append(codeEl);
  header.append(label, copy);
  wrapper.append(header, pre);
  return wrapper;
}

function renderMarkdownText(text) {
  const nodes = [];
  const lines = text.split("\n");
  let list = null;
  let listType = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) {
      list = null;
      listType = "";
      continue;
    }

    if (isMarkdownTableStart(lines, index)) {
      list = null;
      listType = "";
      const tableLines = [lines[index], lines[index + 1]];
      index += 2;
      while (index < lines.length && isMarkdownTableRow(lines[index])) {
        tableLines.push(lines[index]);
        index += 1;
      }
      index -= 1;
      nodes.push(createMarkdownTable(tableLines));
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    const listMatch = bullet || ordered;
    const nextListType = ordered ? "ol" : "ul";
    if (listMatch) {
      if (!list || listType !== nextListType) {
        list = document.createElement(nextListType);
        listType = nextListType;
        nodes.push(list);
      }
      const item = document.createElement("li");
      appendInlineMarkdown(item, listMatch[1]);
      list.append(item);
      continue;
    }

    list = null;
    listType = "";
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    const paragraph = document.createElement(heading ? `h${heading[1].length}` : "p");
    appendInlineMarkdown(paragraph, heading ? heading[2] : trimmed);
    nodes.push(paragraph);
  }

  return nodes;
}

function isMarkdownTableStart(lines, index) {
  return isMarkdownTableRow(lines[index])
    && isMarkdownTableSeparator(lines[index + 1] || "");
}

function isMarkdownTableRow(line) {
  const trimmed = line.trim();
  return trimmed.includes("|") && splitMarkdownTableRow(trimmed).length > 1;
}

function isMarkdownTableSeparator(line) {
  const cells = splitMarkdownTableRow(line.trim());
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function splitMarkdownTableRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function createMarkdownTable(lines) {
  const wrapper = document.createElement("div");
  wrapper.className = "markdown-table-wrap";

  const scroller = document.createElement("div");
  scroller.className = "markdown-table-scroll";

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headers = splitMarkdownTableRow(lines[0]);
  const alignments = splitMarkdownTableRow(lines[1]).map((cell) => {
    const trimmed = cell.trim();
    if (trimmed.startsWith(":") && trimmed.endsWith(":")) return "center";
    if (trimmed.endsWith(":")) return "right";
    return "";
  });

  const headerRow = document.createElement("tr");
  headers.forEach((header, cellIndex) => {
    const th = document.createElement("th");
    if (alignments[cellIndex]) th.style.textAlign = alignments[cellIndex];
    appendInlineMarkdown(th, header);
    headerRow.append(th);
  });
  thead.append(headerRow);

  for (const rowLine of lines.slice(2)) {
    const row = document.createElement("tr");
    const cells = splitMarkdownTableRow(rowLine);
    headers.forEach((_, cellIndex) => {
      const td = document.createElement("td");
      if (alignments[cellIndex]) td.style.textAlign = alignments[cellIndex];
      appendInlineMarkdown(td, cells[cellIndex] || "");
      row.append(td);
    });
    tbody.append(row);
  }

  table.append(thead, tbody);
  scroller.append(table);
  wrapper.append(scroller);
  return wrapper;
}

function appendInlineMarkdown(parent, text) {
  const pattern = /(`[^`]+`|\*\*.+?\*\*|__.+?__|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parent.append(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const token = match[0];
    if (token.startsWith("`")) {
      const code = document.createElement("code");
      code.textContent = token.slice(1, -1);
      parent.append(code);
    } else if (token.startsWith("**") || token.startsWith("__")) {
      const strong = document.createElement("strong");
      appendInlineMarkdown(strong, token.slice(2, -2));
      parent.append(strong);
    } else {
      const link = document.createElement("a");
      link.href = match[3];
      link.target = "_blank";
      link.rel = "noreferrer";
      appendInlineMarkdown(link, match[2]);
      parent.append(link);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parent.append(document.createTextNode(text.slice(lastIndex)));
  }
}

function applyPreset(presetKey) {
  saveCurrentModelConfig();
  const preset = MODEL_PRESETS[presetKey];
  state.settings.preset = presetKey;
  const config = getModelConfigForPreset(presetKey);
  applyModelConfigToSettings(config);
  applyDefaultPromptSelection(config);

  if (!preset) {
    syncSettingsToForm();
    return;
  }

  state.settings.provider = config.provider || "custom";
  syncSettingsToForm();
}

function applyDefaultPromptSelection(config) {
  const presetId = config.defaultPresetId || "";
  if (presetId && getPromptTemplate(presetId)) {
    els.promptTemplateSelect.value = presetId;
  }
}

async function loadOllamaModels() {
  persistCurrentProviderFields();
  const config = getActiveConfig();

  try {
    if (els.testOllama) {
      els.testOllama.disabled = true;
      setButtonContent(els.testOllama, t("testing"), "bot");
    }
    const response = await extensionApi.runtime.sendMessage({
      type: "ollama:tags",
      payload: {
        endpoint: config.endpoint,
        language: state.settings.language || DEFAULT_SETTINGS.language
      }
    });

    if (!response?.ok) {
      throw new Error(response?.error || t("ollamaConnectionFailed"));
    }

    renderOllamaModelOptions(response.models || []);
    setHealthStatus("ok", t("healthOk"));
    persistCurrentProviderFields();
    setSettingsSectionDirty("model", true);
    pushSystemMessage(t("ollamaFoundModels", { count: response.models.length }));
  } catch (error) {
    renderOllamaModelOptions([]);
    setHealthStatus("bad", error.message || t("ollamaConnectionFailed"));
    pushSystemMessage(`${error.message || t("ollamaConnectionFailed")} (${config.endpoint})`);
  } finally {
    if (els.testOllama) {
      els.testOllama.disabled = false;
      setButtonContent(els.testOllama, t("testOllama"), "bot");
    }
  }
}

function renderOllamaModelOptions(models) {
  els.ollamaModelSelect.innerHTML = "";

  if (!models.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = t("noModelsFound");
    els.ollamaModelSelect.append(option);
    return;
  }

  for (const model of models) {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    option.selected = model === els.modelInput.value.trim();
    els.ollamaModelSelect.append(option);
  }

  if (!models.includes(els.modelInput.value.trim())) {
    els.ollamaModelSelect.value = models[0];
    els.modelInput.value = models[0];
  }

  state.settings.customModel = els.modelInput.value.trim();
  state.settings.customFormat = "ollama";
  renderToolbarModelOptions(getActiveConfig());
  syncCustomSelects();
}

function renderToolbarModelOptions(config = getActiveConfig()) {
  const currentModel = config.model || "";
  const ollamaModels = [...els.ollamaModelSelect.options]
    .map((option) => option.value)
    .filter(Boolean);

  els.toolbarModelSelect.innerHTML = "";

  const currentValue = toolbarModelValueFor(config);
  const presetGroup = document.createElement("optgroup");
  presetGroup.label = t("modelPreset");
  if (!currentValue && currentModel) {
    const option = document.createElement("option");
    option.value = `current:${currentModel}`;
    option.textContent = `${t("customApi")} · ${currentModel}`;
    option.selected = true;
    presetGroup.append(option);
  }
  for (const [key, preset] of Object.entries(MODEL_PRESETS)) {
    if (!preset) {
      continue;
    }
    const option = document.createElement("option");
    option.value = `preset:${key}`;
    option.textContent = `${presetLabel(key)} · ${preset.model}`;
    option.selected = option.value === currentValue;
    presetGroup.append(option);
  }
  els.toolbarModelSelect.append(presetGroup);

  const localGroup = document.createElement("optgroup");
  localGroup.label = t("presetOllamaProxy");
  const localModels = new Set(ollamaModels);
  if (config.apiFormat === "ollama" && currentModel) {
    localModels.add(currentModel);
  }
  if (!localModels.size) {
    localModels.add(DEFAULT_SETTINGS.ollamaModel);
  }
  for (const model of localModels) {
    const option = document.createElement("option");
    option.value = `model:${model}`;
    option.textContent = model;
    option.selected = option.value === currentValue;
    localGroup.append(option);
  }
  els.toolbarModelSelect.append(localGroup);

  if (!els.toolbarModelSelect.value) {
    els.toolbarModelSelect.value = currentValue || (currentModel ? `current:${currentModel}` : "");
  }
}

function toolbarModelValueFor(config) {
  if (config.apiFormat === "ollama") {
    return config.model ? `model:${config.model}` : `preset:ollama-proxy`;
  }

  const preset = MODEL_PRESETS[state.settings.preset];
  if (preset && preset.model === config.model && preset.apiFormat === config.apiFormat) {
    return `preset:${state.settings.preset}`;
  }

  return "";
}

function persistCurrentProviderFields() {
  state.settings.customEndpoint = els.endpointInput.value.trim() || DEFAULT_SETTINGS.customEndpoint;
  state.settings.customModel = els.modelInput.value.trim();
  state.settings.customApiKey = els.apiKeyInput.value.trim();
  state.settings.customFormat = els.customFormatInput.value === "ollama" ? "ollama" : "openai";
  state.settings.provider = state.settings.customFormat === "ollama" ? "ollama" : "custom";
  if (state.settings.customFormat === "openai") {
    state.settings.customEndpoint = normalizeOpenAiEndpoint(state.settings.customEndpoint);
  }

  if (state.settings.customFormat === "ollama") {
    state.settings.preset = "ollama-proxy";
    state.settings.customEndpoint = normalizeOllamaEndpoint(state.settings.customEndpoint);
    state.settings.ollamaEndpoint = state.settings.customEndpoint;
    state.settings.ollamaModel = state.settings.customModel || state.settings.ollamaModel;
    els.presetInput.value = state.settings.preset;
  }
  els.endpointInput.value = state.settings.customEndpoint;
  els.modelInput.value = state.settings.customModel;
  els.apiKeyInput.value = state.settings.customApiKey;
  els.customFormatInput.value = state.settings.customFormat;
  saveCurrentModelConfig();
  state.settings.temperature = clamp(Number(els.temperatureInput.value), 0, 2, DEFAULT_SETTINGS.temperature);
  state.settings.maxTokens = Math.max(1, Math.floor(Number(els.maxTokensInput.value) || DEFAULT_SETTINGS.maxTokens));
  state.settings.historyLimit = Math.max(1, Math.floor(Number(els.historyLimitInput.value) || DEFAULT_SETTINGS.historyLimit));
  state.settings.systemPrompt = els.systemPromptInput.value.trim();
  state.settings.defaultPresetId = els.defaultPresetInput.value || "";
  state.settings.memoryEnabled = Boolean(els.memoryEnabledInput.checked);
  state.settings.thinkingEnabled = Boolean(state.settings.thinkingEnabled);
  state.settings.webAccessEnabled = Boolean(state.settings.webAccessEnabled);
  state.settings.language = normalizeLanguage(els.languageInput.value);
  state.settings.answerLanguage = normalizeLanguage(els.answerLanguageInput.value);
  state.settings.translationStyle = TRANSLATION_STYLES.includes(els.translationStyleInput.value)
    ? els.translationStyleInput.value
    : DEFAULT_SETTINGS.translationStyle;
  state.settings.fontSize = FONT_SIZES.includes(els.fontSizeInput.value) ? els.fontSizeInput.value : DEFAULT_SETTINGS.fontSize;
  state.settings.colorScheme = COLOR_SCHEMES.includes(els.colorSchemeInput.value) ? els.colorSchemeInput.value : DEFAULT_SETTINGS.colorScheme;
  applyTheme();
}

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function preferredOllamaEndpoint() {
  if (state.settings.customFormat === "ollama" && state.settings.customEndpoint) {
    return state.settings.customEndpoint;
  }
  return state.settings.ollamaEndpoint || DEFAULT_SETTINGS.ollamaEndpoint;
}

function normalizeOpenAiEndpoint(endpoint) {
  try {
    const url = new URL(endpoint);
    const path = url.pathname.replace(/\/+$/, "");
    if (!path || path === "/") {
      url.pathname = "/v1/chat/completions";
    } else if (path === "/v1") {
      url.pathname = "/v1/chat/completions";
    }
    return url.toString();
  } catch (error) {
    return endpoint;
  }
}

function normalizeOllamaEndpoint(endpoint) {
  try {
    const url = new URL(endpoint);
    if (url.protocol === "http:" && url.hostname === "localhost") {
      url.hostname = "127.0.0.1";
    }
    if (url.protocol === "http:" && url.hostname === "127.0.0.1" && !url.port) {
      url.port = "11434";
    }
    url.pathname = "/api/chat";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch (error) {
    return endpoint;
  }
}

async function submitPrompt(prompt, options = {}) {
  const config = getActiveConfig();
  const conversation = getActiveConversation();
  const shouldGenerateTitle = conversation.messages.length === 0 || conversation.title === t("newChatTitle");
  const requestPrompt = options.requestPrompt || prompt;

  if (!config.endpoint || !config.model) {
    pushSystemMessage(t("missingEndpointModel"));
    return;
  }

  conversation.messages.push({ role: "user", content: prompt });
  conversation.title = titleFromPrompt(conversation, prompt);
  conversation.updatedAt = Date.now();
  state.sending = true;
  await saveConversations();
  render();

  const requestMessages = getContextMessages(config, requestPrompt);
  await generateAssistantResponse(conversation, config, requestMessages);
  if (shouldGenerateTitle) {
    generateConversationTitle(conversation, config);
  }
}

function buildTranslationRequestPrompt(input) {
  const template = getPromptTemplate("translate-polish");
  const templateContent = template
    ? localizedTemplateContent(template)
    : TRANSLATION_PROMPT_TEMPLATE;
  return `${resolvePromptTemplateVariables(templateContent)}${input}`;
}

async function generateAssistantResponse(conversation, config, requestMessages) {
  const stats = {
    startedAt: Date.now(),
    firstTokenMs: null,
    elapsedMs: null,
    promptTokens: estimateTokens(requestMessages.map((message) => message.content).join("\n")),
    completionTokens: 0,
    evalDurationMs: null
  };
  const assistantMessage = {
    role: "assistant",
    content: "",
    pending: true,
    thinkingEnabled: Boolean(config.thinkingEnabled),
    stats
  };
  conversation.messages.push(assistantMessage);
  render();

  try {
    const meta = await requestChatCompletionStream(config, requestMessages, (delta) => {
      assistantMessage.pending = false;
      if (stats.firstTokenMs === null) {
        stats.firstTokenMs = Date.now() - stats.startedAt;
      }
      stats.completionTokens += estimateTokens(delta);
      assistantMessage.content += delta;
      conversation.updatedAt = Date.now();
      renderMessages();
    });

    assistantMessage.pending = false;
    applyResponseMeta(assistantMessage, meta);
    if (!assistantMessage.content) {
      assistantMessage.content = t("emptyModelReply");
    }
  } catch (error) {
    if (error.name === "AbortError") {
      assistantMessage.pending = false;
      assistantMessage.content = assistantMessage.content
        ? `${assistantMessage.content}\n\n[${t("stoppedGeneration")}]`
        : `[${t("stoppedGeneration")}]`;
    } else {
      console.error("[lemon cha] chat request failed", {
        message: error.message || t("requestFailed"),
        provider: config.provider,
        apiFormat: config.apiFormat,
        endpoint: config.endpoint,
        model: config.model,
        requestMessageCount: requestMessages.length
      });
      conversation.messages = conversation.messages.filter((message) => message !== assistantMessage);
      pushSystemMessage(error.message || t("requestFailed"), false);
    }
  } finally {
    assistantMessage.stats.elapsedMs = Date.now() - stats.startedAt;
    conversation.updatedAt = Date.now();
    state.sending = false;
    await saveConversations();
    render();
  }
}

function titleFromPrompt(conversation, prompt) {
  if (conversation.messages.length > 1 && conversation.title !== t("newChatTitle")) {
    return conversation.title;
  }
  return prompt.slice(0, 24) || t("newChatTitle");
}

function requestChatCompletionStream(config, messages, onDelta) {
  return new Promise((resolve, reject) => {
    const port = extensionApi.runtime.connect({ name: "llm-stream" });
    state.activePort = port;

    port.onMessage.addListener((message) => {
      if (message?.type === "delta") {
        onDelta(message.content || "");
        return;
      }

      if (message?.type === "done") {
        state.activePort = null;
        port.disconnect();
        resolve(message.meta || null);
        return;
      }

      if (message?.type === "aborted") {
        state.activePort = null;
        port.disconnect();
        reject(new DOMException(t("stoppedGeneration"), "AbortError"));
        return;
      }

      if (message?.type === "error") {
        state.activePort = null;
        port.disconnect();
        reject(new Error(message.error || t("backendFailed")));
      }
    });

    port.onDisconnect.addListener(() => {
      if (state.activePort === port) {
        state.activePort = null;
      }
    });

    port.postMessage({
      type: "llm:chat:stream",
      payload: {
        config,
        messages
      }
    });
  });
}

function applyResponseMeta(message, meta) {
  if (!meta || !message.stats) return;
  message.stats.promptTokens = meta.promptTokens ?? message.stats.promptTokens;
  message.stats.completionTokens = meta.completionTokens ?? message.stats.completionTokens;
  message.stats.evalDurationMs = meta.evalDurationMs ?? message.stats.evalDurationMs;
  message.stats.localTotalMs = meta.totalDurationMs ?? null;
  message.stats.loadDurationMs = meta.loadDurationMs ?? null;
}

function estimateTokens(text) {
  const value = String(text || "").trim();
  if (!value) return 0;
  const cjk = (value.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (value.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9_]+/g) || []).length;
  return Math.max(1, Math.ceil(cjk * 0.6 + words * 1.3));
}

async function generateConversationTitle(conversation, config) {
  const titleMessages = serializeContextMessages(conversation.messages, 4);
  try {
    const response = await extensionApi.runtime.sendMessage({
      type: "llm:title",
      payload: {
        config,
        messages: titleMessages
      }
    });

    if (response?.ok && response.title) {
      conversation.title = response.title;
      conversation.updatedAt = Date.now();
      await saveConversations();
      renderConversations();
      updateChatTitle();
    }
  } catch (error) {
    // Title generation is opportunistic; chat should stay quiet if it fails.
  }
}

function getContextMessages(config, latestUserContent = null) {
  const messages = serializeContextMessages(getActiveMessages(), config.memoryEnabled ? config.historyLimit : 1);
  if (latestUserContent === null) {
    return messages;
  }

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (lastUserMessage) {
    lastUserMessage.content = latestUserContent;
  }
  return messages;
}

function serializeContextMessages(messages, limit) {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-limit)
    .map(({ role, content }) => ({ role, content }));
}

function pushSystemMessage(content) {
  showToast(content);
}

function ensureToastRoot() {
  let root = document.querySelector("#toastRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "toastRoot";
    root.className = "toast-root";
    root.setAttribute("aria-live", "polite");
    document.body.append(root);
  }

  if (els.toast && els.toast.parentElement !== root) {
    root.append(els.toast);
  }

  return root;
}

function showToast(content) {
  if (!content) return;
  ensureToastRoot();
  clearTimeout(toastTimer);
  els.toast.textContent = content;
  els.toast.classList.remove("hidden", "toast-out");
  els.toast.classList.add("toast-in");
  toastTimer = setTimeout(() => {
    els.toast.classList.remove("toast-in");
    els.toast.classList.add("toast-out");
  }, 2600);
}

els.toast?.addEventListener("animationend", () => {
  if (els.toast.classList.contains("toast-out")) {
    els.toast.classList.add("hidden");
    els.toast.classList.remove("toast-out");
  }
});

function confirmPromptReplacement() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "prompt-confirm-overlay";
    overlay.setAttribute("role", "presentation");

    const dialog = document.createElement("div");
    dialog.className = "prompt-confirm-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");

    const message = document.createElement("p");
    message.textContent = t("promptReplaceConfirm");

    const actions = document.createElement("div");
    actions.className = "prompt-confirm-actions";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "secondary";
    cancel.textContent = t("cancel");

    const replace = document.createElement("button");
    replace.type = "button";
    replace.textContent = t("replace");

    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      resolve(value);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        finish(false);
      }
    };

    cancel.addEventListener("click", () => finish(false));
    replace.addEventListener("click", () => finish(true));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        finish(false);
      }
    });
    document.addEventListener("keydown", onKeyDown);

    actions.append(cancel, replace);
    dialog.append(message, actions);
    overlay.append(dialog);
    document.body.append(overlay);
    cancel.focus();
  });
}

function focusPromptPlaceholder() {
  const input = els.promptInput;
  const value = input.value || "";
  const match = /\{[^{}]+\}/.exec(value);
  input.focus();

  if (match) {
    input.setSelectionRange(match.index, match.index + match[0].length);
    return;
  }

  input.setSelectionRange(value.length, value.length);
}

function keepPromptCaretVisible() {
  const input = els.promptInput;
  if (!input) return;

  const selectionStart = input.selectionStart;
  const selectionEnd = input.selectionEnd;
  input.setSelectionRange(selectionStart, selectionEnd);

  if (selectionEnd >= input.value.length) {
    input.scrollTop = input.scrollHeight;
  }
}

function updateComposerSafeSpace() {
  const composerHeight = els.chatForm?.offsetHeight || 0;
  const safeSpace = Math.max(148, composerHeight + 24);
  document.documentElement.style.setProperty("--composer-safe-space", `${safeSpace}px`);
}

function resizePromptInput({ keepCaretVisible = false } = {}) {
  const input = els.promptInput;
  if (!input) return;

  const styles = window.getComputedStyle(input);
  const minHeight = Number.parseFloat(styles.minHeight) || 0;
  const maxHeight = Number.parseFloat(styles.maxHeight) || input.scrollHeight;

  input.style.height = "auto";
  const nextHeight = Math.min(Math.max(input.scrollHeight, minHeight), maxHeight);
  input.style.height = `${nextHeight}px`;
  input.style.overflowY = input.scrollHeight > maxHeight ? "auto" : "hidden";
  updateComposerSafeSpace();

  if (keepCaretVisible) {
    requestAnimationFrame(keepPromptCaretVisible);
  }
}

function applyPromptTemplateToInput(content) {
  els.promptInput.value = content;
  resizePromptInput({ keepCaretVisible: true });
  requestAnimationFrame(() => {
    focusPromptPlaceholder();
    resizePromptInput({ keepCaretVisible: true });
  });
}

function clearComposerInput({ focus = false } = {}) {
  els.promptInput.value = "";
  resizePromptInput();
  els.promptTemplateSelect.value = "";
  syncCustomSelects();

  if (focus) {
    requestAnimationFrame(() => {
      els.promptInput.focus();
      els.promptInput.setSelectionRange(0, 0);
      resizePromptInput({ keepCaretVisible: true });
    });
  }
}

async function copyMessage(index) {
  const message = getActiveMessages()[index];
  if (!message) return;
  await navigator.clipboard.writeText(message.content || "");
  pushSystemMessage(t("copied"));
}

async function deleteMessage(index) {
  const conversation = getActiveConversation();
  if (!conversation.messages[index]) return;
  conversation.messages.splice(index, 1);
  conversation.updatedAt = Date.now();
  await saveConversations();
  render();
}

async function regenerateFromMessage(index) {
  if (state.sending) return;
  const conversation = getActiveConversation();
  const message = conversation.messages[index];
  if (!message || message.role === "system") return;

  const config = getActiveConfig();
  const requestSource = message.role === "assistant"
    ? conversation.messages.slice(0, index)
    : conversation.messages.slice(0, index + 1);
  const requestMessages = serializeContextMessages(requestSource, config.memoryEnabled ? config.historyLimit : 1);

  conversation.messages = message.role === "assistant"
    ? conversation.messages.slice(0, index)
    : conversation.messages.slice(0, index + 1);
  conversation.updatedAt = Date.now();
  state.sending = true;
  await saveConversations();
  render();
  await generateAssistantResponse(conversation, config, requestMessages);
}

async function continueFromMessage(index) {
  if (state.sending) return;
  const conversation = getActiveConversation();
  const message = conversation.messages[index];
  if (!message || message.role === "system") return;

  const config = getActiveConfig();
  conversation.messages = conversation.messages.slice(0, index + 1);
  if (message.role === "assistant") {
    conversation.messages.push({ role: "user", content: t("continueFromHere") });
  }
  const requestMessages = serializeContextMessages(conversation.messages, config.memoryEnabled ? config.historyLimit : 1);
  conversation.updatedAt = Date.now();
  state.sending = true;
  await saveConversations();
  render();
  await generateAssistantResponse(conversation, config, requestMessages);
}

async function checkModelHealth() {
  persistCurrentProviderFields();
  const config = getActiveConfig();
  setHealthStatus("checking");

  try {
    const response = await extensionApi.runtime.sendMessage({
      type: "llm:health",
      payload: { config }
    });

    if (!response?.ok) {
      throw new Error(response?.error || t("healthBad"));
    }
    setHealthStatus("ok", response.detail || t("healthOk"));
  } catch (error) {
    setHealthStatus("bad", error.message || t("healthBad"));
  }
}

function conversationToMarkdown(conversation) {
  const lines = [
    `# ${conversation.title || t("untitledChat")}`,
    "",
    `- Exported: ${new Date().toISOString()}`,
    `- Messages: ${countVisibleMessages(conversation.messages)}`,
    ""
  ];

  for (const message of conversation.messages.filter((item) => item.role !== "system")) {
    lines.push(`## ${roleLabel(message.role)}`, "");
    lines.push(message.content || "");
    lines.push("");
  }

  return lines.join("\n");
}

function exportConversationMarkdown(conversation) {
  if (!conversation) return;
  const markdown = conversationToMarkdown(conversation);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName(conversation.title || t("untitledChat"))}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

function safeFileName(name) {
  return name
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "chat";
}

async function clearConversationHistory() {
  if (!confirm(t("confirmClearHistory"))) {
    return false;
  }

  const conversation = createConversation();
  state.conversations = [conversation];
  state.conversationFolders = [];
  state.activeConversationId = conversation.id;
  state.composerMode = getConversationMode(conversation);
  await extensionApi.storage.local.remove("messages");
  await saveConversations();
  render();
  clearComposerInput({ focus: true });
  return true;
}

els.settingsToggle.addEventListener("click", () => {
  showSettingsPage(true);
});

els.themeToggle.addEventListener("click", async () => {
  autoSaveGeneralSettings(
    () => {
      state.settings.theme = getNextThemeMode();
    },
    applyTheme
  );
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isConversationSearchOpen()) {
    closeConversationSearch({ restoreFocus: true });
  }
});

document.addEventListener("click", (event) => {
  closeCustomSelects();
  if (
    isConversationSearchOpen() &&
    !event.target.closest("#conversationSearchPanel") &&
    !event.target.closest("#conversationSearchToggle")
  ) {
    closeConversationSearch();
  }
  if (!event.target.closest(".conversation-actions") && !event.target.closest(".folder-actions")) {
    closeConversationMenus();
  }
});

els.openSettings?.addEventListener("click", () => {
  showSettingsPage(true);
});

els.closeSettings?.addEventListener("click", () => {
  requestCloseSettingsPage();
});

els.settingsPanel.addEventListener("click", (event) => {
  if (event.target === els.settingsPanel) {
    requestCloseSettingsPage();
  }
});

for (const button of els.settingsTabButtons) {
  button.addEventListener("click", () => {
    const activeTab = els.settingsPanel.dataset.activeTab || "general";
    if (activeTab !== button.dataset.tab && !confirmDiscardSettingsSection(activeTab)) {
      return;
    }
    activateSettingsTab(button.dataset.tab);
  });
}

els.sidebarToggle.addEventListener("click", () => {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  applySidebarState();
});

els.presetInput.addEventListener("change", async () => {
  applyPreset(els.presetInput.value);
  setSettingsSectionDirty("model", true);
  if (els.presetInput.value === "ollama-proxy") {
    await loadOllamaModels();
  }
});

els.toolbarModelSelect.addEventListener("change", async () => {
  if (!els.toolbarModelSelect.value) return;
  const [kind, value] = els.toolbarModelSelect.value.split(/:(.*)/s);

  if (kind === "current") {
    return;
  }

  if (kind === "preset" && MODEL_PRESETS[value]) {
    applyPreset(value);
    if (value === "ollama-proxy") {
      await loadOllamaModels();
      return;
    }
  } else if (kind === "model" && value) {
    const endpoint = normalizeOllamaEndpoint(preferredOllamaEndpoint());
    els.endpointInput.value = endpoint;
    els.customFormatInput.value = "ollama";
    els.modelInput.value = value;
    state.settings.customEndpoint = endpoint;
    state.settings.ollamaEndpoint = endpoint;
    if (els.ollamaModelSelect.querySelector(`option[value="${CSS.escape(value)}"]`)) {
      els.ollamaModelSelect.value = value;
    }
  }

  persistCurrentProviderFields();
  await saveSettings();
  syncSettingsToForm();
  syncCustomSelects();
  maybeAutoCheckLocalModel();
});

els.ollamaModelSelect.addEventListener("change", async () => {
  if (els.ollamaModelSelect.value) {
    els.modelInput.value = els.ollamaModelSelect.value;
    persistCurrentProviderFields();
    setSettingsSectionDirty("model", true);
    renderToolbarModelOptions(getActiveConfig());
    syncCustomSelects();
    maybeAutoCheckLocalModel();
  }
});

els.testOllama?.addEventListener("click", loadOllamaModels);

for (const control of [
  els.endpointInput,
  els.modelInput,
  els.customFormatInput,
  els.apiKeyInput,
  els.temperatureInput,
  els.maxTokensInput,
  els.historyLimitInput,
  els.systemPromptInput,
  els.defaultPresetInput,
  els.memoryEnabledInput
]) {
  control?.addEventListener("input", () => setSettingsSectionDirty("model", true));
  control?.addEventListener("change", () => {
    setSettingsSectionDirty("model", true);
    if (control === els.customFormatInput) {
      state.settings.customFormat = els.customFormatInput.value === "ollama" ? "ollama" : "openai";
      els.ollamaModelField.classList.toggle("hidden", state.settings.customFormat !== "ollama");
      syncCustomSelects();
    }
  });
}

els.messages.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;
  if (!Number.isInteger(index)) return;

  if (action === "copy") {
    await copyMessage(index);
  } else if (action === "regenerate") {
    await regenerateFromMessage(index);
  } else if (action === "continue") {
    await continueFromMessage(index);
  } else if (action === "delete") {
    await deleteMessage(index);
  }
});

els.messages.addEventListener("scroll", updateScrollToBottomButton, { passive: true });

function handleScrollToBottomRequest(event) {
  event.preventDefault();
  event.stopPropagation();
  els.scrollToBottom?.blur();
  scrollMessagesToBottom({ smooth: true });
}

els.scrollToBottom?.addEventListener("pointerdown", handleScrollToBottomRequest);

els.scrollToBottom?.addEventListener("click", (event) => {
  if (event.detail !== 0) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  handleScrollToBottomRequest(event);
});

els.languageInput.addEventListener("change", () => {
  autoSaveGeneralSettings(
    () => {
      state.settings.language = normalizeLanguage(els.languageInput.value);
    },
    () => {
      render();
    }
  );
});

els.answerLanguageInput.addEventListener("change", () => {
  autoSaveGeneralSettings(
    () => {
      state.settings.answerLanguage = normalizeLanguage(els.answerLanguageInput.value);
    },
    syncCustomSelects
  );
});

els.translationStyleInput.addEventListener("change", () => {
  autoSaveGeneralSettings(
    () => {
      state.settings.translationStyle = TRANSLATION_STYLES.includes(els.translationStyleInput.value)
        ? els.translationStyleInput.value
        : DEFAULT_SETTINGS.translationStyle;
    },
    syncCustomSelects
  );
});

els.fontSizeInput.addEventListener("change", () => {
  autoSaveGeneralSettings(
    () => {
      state.settings.fontSize = FONT_SIZES.includes(els.fontSizeInput.value) ? els.fontSizeInput.value : DEFAULT_SETTINGS.fontSize;
    },
    () => {
      applyTheme();
      syncCustomSelects();
    }
  );
});

els.colorSchemeInput.addEventListener("change", () => {
  autoSaveGeneralSettings(
    () => {
      state.settings.colorScheme = COLOR_SCHEMES.includes(els.colorSchemeInput.value) ? els.colorSchemeInput.value : DEFAULT_SETTINGS.colorScheme;
    },
    () => {
      applyTheme();
      syncCustomSelects();
    }
  );
});

els.promptTemplateSelect.addEventListener("change", async () => {
  const template = getPromptTemplate(els.promptTemplateSelect.value);
  if (!template) {
    return;
  }

  const content = resolvePromptTemplateVariables(localizedTemplateContent(template));
  if (els.promptInput.value.trim()) {
    const shouldReplace = await confirmPromptReplacement();
    if (!shouldReplace) {
      els.promptTemplateSelect.value = "";
      syncCustomSelects();
      return;
    }
  }

  applyPromptTemplateToInput(content);
  pushSystemMessage(t("promptTemplateApplied"));
});

els.translationTargetSelect?.addEventListener("change", async () => {
  state.settings.translationLanguage = normalizeLanguage(els.translationTargetSelect.value, DEFAULT_SETTINGS.translationLanguage);
  await saveSettings();
  syncCustomSelects();
});

els.promptTemplateManageSelect.addEventListener("change", () => {
  const nextValue = els.promptTemplateManageSelect.value;
  if (!confirmDiscardPromptTemplateChanges()) {
    els.promptTemplateManageSelect.value = state.lastPromptTemplateManageValue || "";
    syncCustomSelects();
    return;
  }
  fillPromptTemplateEditor(getPromptTemplate(nextValue));
});

els.promptTemplateNameInput.addEventListener("input", () => setPromptTemplateDirty(true));
els.promptTemplateContentInput.addEventListener("input", () => setPromptTemplateDirty(true));

els.savePromptTemplate.addEventListener("click", async () => {
  const savedId = await savePromptTemplateDraft();
  if (savedId) {
    pushSystemMessage(t("promptTemplateSaved"));
  }
});

els.savePromptTemplateAs.addEventListener("click", async () => {
  const savedId = await savePromptTemplateDraft({ forceNew: true });
  if (savedId) {
    pushSystemMessage(t("promptTemplateSavedAs"));
  }
});

els.deletePromptTemplate.addEventListener("click", async () => {
  const template = state.promptTemplates.find((item) => item.id === els.promptTemplateManageSelect.value);
  if (!template) {
    pushSystemMessage(t("customTemplateOnly"));
    return;
  }

  if (!confirm(t("confirmDeletePromptTemplate", { name: template.name }))) {
    return;
  }

  state.promptTemplates = state.promptTemplates.filter((item) => item.id !== template.id);
  for (const config of Object.values(ensureModelConfigs())) {
    if (config.defaultPresetId === template.id) {
      config.defaultPresetId = "";
    }
  }
  els.promptTemplateManageSelect.value = "";
  await savePromptTemplates();
  await saveSettings();
  renderPromptTemplates();
  fillPromptTemplateEditor();
  pushSystemMessage(t("promptTemplateDeleted"));
});

els.settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const activeSettingsTab = els.settingsPanel.dataset.activeTab || "general";
  if (activeSettingsTab === "general" || activeSettingsTab === "data") {
    return;
  }
  persistCurrentProviderFields();
  await saveSettings();
  captureSettingsSnapshot({ resetPrompt: false });
  syncSettingsToForm();
  pushSystemMessage(t("settingsSaved"));
  maybeAutoCheckLocalModel();
});

els.resetGeneralSettings.addEventListener("click", async () => {
  if (!confirm(t("confirmResetGeneralSettings"))) {
    return;
  }
  state.settings.language = DEFAULT_SETTINGS.language;
  state.settings.answerLanguage = DEFAULT_SETTINGS.answerLanguage;
  state.settings.translationStyle = DEFAULT_SETTINGS.translationStyle;
  state.settings.fontSize = DEFAULT_SETTINGS.fontSize;
  state.settings.colorScheme = DEFAULT_SETTINGS.colorScheme;
  state.settings.theme = DEFAULT_SETTINGS.theme;
  await saveSettings();
  captureSettingsSnapshot({ resetPrompt: false });
  render();
  pushSystemMessage(t("generalSettingsReset"));
});

els.resetCurrentModelSettings.addEventListener("click", async () => {
  if (!confirm(t("confirmResetCurrentModelSettings"))) {
    return;
  }
  const presetKey = state.settings.preset || "custom";
  const configs = ensureModelConfigs();
  delete configs[presetKey];
  applyModelConfigToSettings(defaultModelConfigForPreset(presetKey, false));
  await saveSettings();
  captureSettingsSnapshot({ resetPrompt: false });
  syncSettingsToForm();
  syncCustomSelects();
  pushSystemMessage(t("modelSettingsReset"));
});

els.resetCurrentPromptTemplate.addEventListener("click", () => {
  if (!confirm(t("confirmResetPromptTemplate"))) {
    return;
  }
  fillPromptTemplateEditor(getPromptTemplate(els.promptTemplateManageSelect.value));
  pushSystemMessage(t("promptTemplateReset"));
});

els.clearHistorySettings.addEventListener("click", async () => {
  await clearConversationHistory();
});

els.factoryResetSettings.addEventListener("click", async () => {
  if (!confirm(t("confirmFactoryResetFirst")) || !confirm(t("confirmFactoryResetSecond"))) {
    return;
  }
  const conversation = createConversation();
  state.settings = { ...DEFAULT_SETTINGS, modelConfigs: {} };
  state.conversations = [conversation];
  state.conversationFolders = [];
  state.promptTemplates = [];
  state.activeConversationId = conversation.id;
  state.composerMode = getConversationMode(conversation);
  state.promptTemplateDirty = false;
  await extensionApi.storage.local.remove(["messages"]);
  await saveSettings();
  await saveConversations();
  await savePromptTemplates();
  captureSettingsSnapshot();
  render();
  clearComposerInput({ focus: true });
  pushSystemMessage(t("factoryResetDone"));
});

els.newChat.addEventListener("click", async () => {
  closeSettingsMenu();
  if (!requestCloseSettingsPage()) {
    return;
  }
  state.conversationSearchQuery = "";
  setConversationSearchOpen(false);
  const conversation = createConversation(t("newChatTitle"), [], "chat");
  state.conversations.unshift(conversation);
  state.activeConversationId = conversation.id;
  state.composerMode = "chat";
  await saveConversations();
  render();
  clearComposerInput({ focus: true });
});

els.sidebarTranslateTool?.addEventListener("click", async () => {
  closeSettingsMenu();
  if (!requestCloseSettingsPage()) {
    return;
  }
  state.conversationSearchQuery = "";
  setConversationSearchOpen(false);
  const conversation = createConversation(t("translateMode"), [], "translate");
  state.conversations.unshift(conversation);
  state.activeConversationId = conversation.id;
  state.composerMode = getConversationMode(conversation);
  await saveConversations();
  render();
  clearComposerInput({ focus: true });
});

els.conversationSearchToggle?.addEventListener("click", () => {
  closeSettingsMenu();
  if (state.sidebarCollapsed) {
    state.sidebarCollapsed = false;
    applySidebarState();
    setConversationSearchOpen(true, { focus: true });
    return;
  }

  const shouldOpen = !state.conversationSearchOpen;
  if (!shouldOpen) {
    closeConversationSearch({ restoreFocus: true });
    return;
  }
  setConversationSearchOpen(shouldOpen, { focus: shouldOpen });
});

els.conversationSearchInput?.addEventListener("input", () => {
  state.conversationSearchQuery = els.conversationSearchInput.value;
  syncConversationSearchState();
  renderConversations();
});

els.conversationSearchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeConversationSearch({ restoreFocus: true });
});

els.newFolder?.addEventListener("click", async () => {
  closeSettingsMenu();
  if (!requestCloseSettingsPage()) {
    return;
  }
  const name = prompt(t("folderName"), t("folderName"));
  if (!name?.trim()) {
    return;
  }

  state.conversationFolders.unshift(createConversationFolder(name.trim().slice(0, 48)));
  await saveConversations();
  renderConversations();
});

els.clearHistory?.addEventListener("click", async () => {
  closeSettingsMenu();
  await clearConversationHistory();
});

els.exportChats?.addEventListener("click", () => {
  closeSettingsMenu();
  const payload = {
    exportedAt: new Date().toISOString(),
    settings: state.settings,
    conversations: state.conversations,
    conversationFolders: state.conversationFolders,
    promptTemplates: state.promptTemplates,
    activeConversationId: state.activeConversationId
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `local-llm-chat-${date}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

els.exportMarkdown?.addEventListener("click", () => {
  closeSettingsMenu();
  exportConversationMarkdown(getActiveConversation());
});

els.importChats?.addEventListener("click", () => {
  closeSettingsMenu();
  els.importFile?.click();
});

els.importFile?.addEventListener("change", async () => {
  const file = els.importFile.files?.[0];
  els.importFile.value = "";
  if (!file) {
    return;
  }

  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported.conversations)) {
      throw new Error(t("missingConversations"));
    }

    if (!confirm(t("confirmImportOverwrite"))) {
      return;
    }

    state.settings = { ...DEFAULT_SETTINGS, ...(imported.settings || {}) };
    state.conversations = imported.conversations;
    state.conversationFolders = Array.isArray(imported.conversationFolders) ? imported.conversationFolders : [];
    state.promptTemplates = Array.isArray(imported.promptTemplates) ? imported.promptTemplates : [];
    state.activeConversationId = imported.activeConversationId || state.conversations[0]?.id || "";
    migrateOllamaSettings();
    ensureActiveConversation();
    state.composerMode = getConversationMode(getActiveConversation());
    await saveSettings();
    await saveConversations();
    await savePromptTemplates();
    render();
    pushSystemMessage(t("importDone"));
  } catch (error) {
    pushSystemMessage(t("importFailed", { message: error.message }));
  }
});

els.conversationList.addEventListener("click", async (event) => {
  const actionTarget = event.target.closest("[data-action]");
  const item = actionTarget?.closest(".conversation-item") || event.target.closest(".conversation-item");
  const folder = event.target.closest(".conversation-folder");

  const action = actionTarget?.dataset.action;
  if (action) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (action === "menu") {
    if (!item) return;
    const menu = item.querySelector(".conversation-action-menu");
    const willOpen = menu?.classList.contains("hidden");
    closeConversationMenus(menu);
    menu?.classList.toggle("hidden", !willOpen);
    menu?.parentElement?.classList.toggle("menu-open", Boolean(willOpen));
    item.classList.toggle("menu-open", Boolean(willOpen));
    actionTarget.setAttribute("aria-expanded", willOpen ? "true" : "false");
    return;
  }

  if (action === "folder-menu") {
    if (!folder) return;
    const menu = folder.querySelector(".conversation-folder-header .conversation-action-menu");
    const willOpen = menu?.classList.contains("hidden");
    closeConversationMenus(menu);
    menu?.classList.toggle("hidden", !willOpen);
    menu?.parentElement?.classList.toggle("menu-open", Boolean(willOpen));
    folder.querySelector(".conversation-folder-header")?.classList.toggle("menu-open", Boolean(willOpen));
    actionTarget.setAttribute("aria-expanded", willOpen ? "true" : "false");
    return;
  }

  if (action === "rename-folder") {
    closeConversationMenus();
    await renameConversationFolder(folder?.dataset.folderId);
    return;
  }

  if (action === "delete-folder") {
    closeConversationMenus();
    await deleteConversationFolder(folder?.dataset.folderId);
    return;
  }

  if (action === "rename") {
    if (!item) return;
    closeConversationMenus();
    await renameConversation(item.dataset.id);
    return;
  }

  if (action === "exportMarkdown") {
    if (!item) return;
    closeConversationMenus();
    const conversation = state.conversations.find((entry) => entry.id === item.dataset.id);
    exportConversationMarkdown(conversation);
    return;
  }

  if (action === "removeFromFolder") {
    if (!item) return;
    closeConversationMenus();
    await removeConversationFromFolder(item.dataset.id);
    return;
  }

  if (action === "delete") {
    if (!item) return;
    closeConversationMenus();
    await deleteConversation(item.dataset.id);
    return;
  }

  if (!item) {
    return;
  }

  closeConversationMenus();
  if (!requestCloseSettingsPage()) {
    return;
  }
  const shouldClearComposer = item.dataset.id !== state.activeConversationId;
  state.activeConversationId = item.dataset.id;
  const conversation = state.conversations.find((entry) => entry.id === state.activeConversationId);
  state.composerMode = getConversationMode(conversation);
  await saveConversations();
  render();
  if (shouldClearComposer) {
    clearComposerInput({ focus: true });
  }
});

els.conversationList.addEventListener("dragstart", (event) => {
  const item = event.target.closest(".conversation-item");
  if (!item) return;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", item.dataset.id);
  item.classList.add("dragging");
});

els.conversationList.addEventListener("dragend", () => {
  els.conversationList.querySelector(".conversation-item.dragging")?.classList.remove("dragging");
  for (const target of els.conversationList.querySelectorAll(".drag-over")) {
    target.classList.remove("drag-over");
  }
});

els.conversationList.addEventListener("dragover", (event) => {
  const folder = event.target.closest(".conversation-folder");
  const ungrouped = event.target.closest(".conversation-ungrouped");
  if (!folder && !ungrouped) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  folder?.classList.add("drag-over");
  if (!folder) {
    ungrouped.classList.add("drag-over");
  }
});

els.conversationList.addEventListener("dragleave", (event) => {
  const folder = event.target.closest(".conversation-folder");
  const ungrouped = event.target.closest(".conversation-ungrouped");
  if (folder) {
    if (folder.contains(event.relatedTarget)) return;
    folder.classList.remove("drag-over");
    return;
  }

  if (!ungrouped || ungrouped.contains(event.relatedTarget)) return;
  ungrouped.classList.remove("drag-over");
});

els.conversationList.addEventListener("drop", async (event) => {
  const folder = event.target.closest(".conversation-folder");
  const ungrouped = event.target.closest(".conversation-ungrouped");
  if (!folder && !ungrouped) return;
  event.preventDefault();
  folder?.classList.remove("drag-over");
  ungrouped?.classList.remove("drag-over");
  const conversationId = event.dataTransfer.getData("text/plain");
  if (folder) {
    await moveConversationToFolder(conversationId, folder.dataset.folderId);
    return;
  }

  await removeConversationFromFolder(conversationId);
});

els.chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const prompt = els.promptInput.value.trim();
  if (!prompt || state.sending) return;
  const requestPrompt = state.composerMode === "translate"
    ? buildTranslationRequestPrompt(prompt)
    : prompt;
  els.promptInput.value = "";
  resizePromptInput();
  await submitPrompt(prompt, { requestPrompt });
});

els.composerModeToggle?.addEventListener("click", toggleComposerMode);

els.promptInput.addEventListener("keydown", (event) => {
  if (event.isComposing || promptInputComposing || event.keyCode === 229) {
    return;
  }

  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    els.chatForm.requestSubmit();
  }
});

els.promptInput.addEventListener("input", () => {
  resizePromptInput({ keepCaretVisible: true });
});

els.promptInput.addEventListener("compositionstart", () => {
  promptInputComposing = true;
});

els.promptInput.addEventListener("compositionend", () => {
  promptInputComposing = false;
  resizePromptInput({ keepCaretVisible: true });
});

els.thinkingToggle.addEventListener("click", async () => {
  state.settings.thinkingEnabled = !state.settings.thinkingEnabled;
  await saveSettings();
  render();
  els.promptInput.focus();
});

els.webAccessToggle?.addEventListener("click", async () => {
  state.settings.webAccessEnabled = !state.settings.webAccessEnabled;
  await saveSettings();
  render();
  els.promptInput.focus();
});

els.stopButton.addEventListener("click", () => {
  state.activePort?.postMessage({ type: "llm:chat:stop" });
});

systemThemeQuery?.addEventListener("change", () => {
  if (getThemeMode() === "system") {
    applyTheme();
  }
});

loadState();

async function renameConversation(id) {
  const conversation = state.conversations.find((item) => item.id === id);
  if (!conversation) {
    return;
  }

  const title = prompt(t("renameConversation"), conversation.title || t("newChatTitle"));
  if (!title) {
    return;
  }

  conversation.title = title.trim().slice(0, 60) || conversation.title;
  conversation.updatedAt = Date.now();
  await saveConversations();
  render();
}

async function renameConversationFolder(id) {
  const folder = state.conversationFolders.find((item) => item.id === id);
  if (!folder) {
    return;
  }

  const name = prompt(t("renameFolder"), folder.name || t("folderName"));
  if (!name) {
    return;
  }

  folder.name = name.trim().slice(0, 48) || folder.name;
  folder.updatedAt = Date.now();
  await saveConversations();
  renderConversations();
}

async function deleteConversationFolder(id) {
  const folder = state.conversationFolders.find((item) => item.id === id);
  if (!folder) {
    return;
  }

  if (!confirm(t("confirmDeleteFolder", { name: folder.name || t("folderName") }))) {
    return;
  }

  state.conversationFolders = state.conversationFolders.filter((item) => item.id !== id);
  for (const conversation of state.conversations) {
    if (conversation.folderId === id) {
      delete conversation.folderId;
    }
  }
  await saveConversations();
  renderConversations();
}

async function moveConversationToFolder(conversationId, folderId) {
  const conversation = state.conversations.find((item) => item.id === conversationId);
  const folder = state.conversationFolders.find((item) => item.id === folderId);
  if (!conversation || !folder || conversation.folderId === folder.id) {
    renderConversations();
    return;
  }

  conversation.folderId = folder.id;
  conversation.updatedAt = Date.now();
  folder.updatedAt = Date.now();
  await saveConversations();
  renderConversations();
}

async function removeConversationFromFolder(conversationId) {
  const conversation = state.conversations.find((item) => item.id === conversationId);
  if (!conversation?.folderId) {
    renderConversations();
    return;
  }

  delete conversation.folderId;
  conversation.updatedAt = Date.now();
  await saveConversations();
  renderConversations();
}

async function deleteConversation(id) {
  const conversation = state.conversations.find((item) => item.id === id);
  if (!conversation) {
    return;
  }

  if (!confirm(t("confirmDeleteConversation", { title: conversation.title || t("newChatTitle") }))) {
    return;
  }

  const wasActiveConversation = state.activeConversationId === id;
  state.conversations = state.conversations.filter((item) => item.id !== id);
  if (wasActiveConversation) {
    state.activeConversationId = state.conversations[0]?.id || "";
  }
  ensureActiveConversation();
  state.composerMode = getConversationMode(getActiveConversation());
  await saveConversations();
  render();
  if (wasActiveConversation) {
    clearComposerInput({ focus: true });
  }
}
