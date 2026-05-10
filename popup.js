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

const DIRECT_OLLAMA_ENDPOINT = "http://127.0.0.1:11434/api/chat";
const LEGACY_OLLAMA_PROXY_ENDPOINT = "http://127.0.0.1:8787/api/chat";

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
    name: "翻译润色",
    nameEn: "Translate & Polish",
    content: "请将以下内容翻译成自然、准确、专业的中文，并在不改变原意的前提下提升表达流畅度。请先给出译文，再列出 3 条关键措辞说明。\n\n内容：\n",
    contentEn: "Translate the following content into natural, accurate, professional English, and improve fluency without changing the meaning. First provide the translation, then list 3 notes on key wording choices.\n\nContent:\n"
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
  language: "zh-CN",
  answerLanguage: "zh-CN",
  translationLanguage: "en-US",
  colorScheme: "llmon",
  theme: "light"
};

const COLOR_SCHEMES = ["llmon", "leaf", "citrus", "blue", "gray"];
const SUPPORTED_LANGUAGES = ["zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR", "fr-FR", "es-ES", "de-DE"];
const LANGUAGE_UI_FALLBACK = {
  "zh-TW": "zh-CN",
  "ja-JP": "en-US",
  "ko-KR": "en-US",
  "fr-FR": "en-US",
  "es-ES": "en-US",
  "de-DE": "en-US"
};

const UI_TEXT = {
  "zh-CN": {
    newChat: "新建对话",
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
    resetGeneralSettings: "重置通用设置",
    resetCurrentModelSettings: "重置当前模型设置",
    resetCurrentPromptTemplate: "重置当前提示词预设",
    clearHistorySettings: "清空对话历史",
    factoryResetSettings: "恢复出厂设置",
    send: "发送",
    stop: "停止",
    promptPlaceholder: "输入问题，Enter 发送，Shift+Enter 换行",
    promptTemplatePlaceholder: "选择 Prompt 预设",
    savePromptTemplate: "保存",
    savePromptTemplateAs: "另存为新预设",
    deletePromptTemplate: "删除模板",
    resetSectionTitle: "分区重置",
    resetSectionHint: "每个重置操作只影响对应区域。",
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
    translationLanguage: "默认翻译目标语言",
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
    colorSchemeLlmon: "llmon cha 默认（日间 / 夜间）",
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
    settingsSaved: "设置已保存。",
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
    resetGeneralSettings: "Reset General Settings",
    resetCurrentModelSettings: "Reset Current Model",
    resetCurrentPromptTemplate: "Reset Current Prompt Preset",
    clearHistorySettings: "Clear Chat History",
    factoryResetSettings: "Factory Reset",
    send: "Send",
    stop: "Stop",
    promptPlaceholder: "Ask a question. Enter to send, Shift+Enter for a new line",
    promptTemplatePlaceholder: "Choose a prompt preset",
    savePromptTemplate: "Save",
    savePromptTemplateAs: "Save as New Preset",
    deletePromptTemplate: "Delete Template",
    resetSectionTitle: "Scoped Reset",
    resetSectionHint: "Each reset action only affects its own area.",
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
    translationLanguage: "Default Translation Target",
    languageChinese: "Simplified Chinese",
    languageTraditionalChinese: "Traditional Chinese",
    languageEnglish: "English",
    languageJapanese: "Japanese",
    languageKorean: "Korean",
    languageFrench: "French",
    languageSpanish: "Spanish",
    languageGerman: "German",
    sidebarHistory: "Conversation History",
    conversationList: "Conversation List",
    modelSettings: "Model Settings",
    modelSettingsTab: "Model Settings",
    generalSettingsTab: "General",
    promptSettingsTab: "Prompt Presets",
    dataSettingsTab: "Data & Reset",
    settingsTabs: "Settings Categories",
    colorSchemeLabel: "Color Scheme",
    colorSchemeLlmon: "llmon cha Default (Light / Dark)",
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
    settingsSaved: "Settings saved.",
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

function toTraditionalChineseCopy(text) {
  const replacements = [
    ["对话", "對話"],
    ["文件夹", "資料夾"],
    ["导出", "匯出"],
    ["导入", "匯入"],
    ["记录", "記錄"],
    ["检查", "檢查"],
    ["检测", "偵測"],
    ["复制", "複製"],
    ["重生成", "重新生成"],
    ["耗时", "耗時"],
    ["本地", "本機"],
    ["约", "約"],
    ["隐藏", "隱藏"],
    ["显示", "顯示"],
    ["侧栏", "側欄"],
    ["间", "間"],
    ["跟随", "跟隨"],
    ["设置", "設定"],
    ["返回", "返回"],
    ["操作", "操作"],
    ["测试", "測試"],
    ["保存", "儲存"],
    ["恢复", "恢復"],
    ["默认", "預設"],
    ["重置", "重設"],
    ["当前", "目前"],
    ["提示词", "提示詞"],
    ["预设", "預設"],
    ["清空", "清除"],
    ["出厂", "出廠"],
    ["输入", "輸入"],
    ["发送", "傳送"],
    ["换行", "換行"],
    ["选择", "選擇"],
    ["模板", "範本"],
    ["新建", "新增"],
    ["另存为", "另存為"],
    ["分区", "分區"],
    ["对应", "對應"],
    ["区域", "區域"],
    ["会", "會"],
    ["配置", "設定"],
    ["服务", "服務"],
    ["自定义", "自訂"],
    ["接口", "介面"],
    ["名称", "名稱"],
    ["系统", "系統"],
    ["启用", "啟用"],
    ["列表", "清單"],
    ["格式", "格式"],
    ["可留空", "可留空"],
    ["最大", "最大"],
    ["上下文", "上下文"],
    ["语言", "語言"],
    ["界面", "介面"],
    ["翻译", "翻譯"],
    ["目标", "目標"],
    ["简体中文", "簡體中文"],
    ["繁體中文", "繁體中文"],
    ["历史", "歷史"],
    ["分类", "分類"],
    ["配色", "配色"],
    ["方案", "方案"],
    ["日间", "日間"],
    ["夜间", "夜間"],
    ["叶绿", "葉綠"],
    ["清新", "清新"],
    ["柑橘", "柑橘"],
    ["暖阳", "暖陽"],
    ["湖蓝", "湖藍"],
    ["清爽", "清爽"],
    ["暖灰", "暖灰"],
    ["简洁", "簡潔"],
    ["开始", "開始"],
    ["或者", "或"],
    ["通义千问", "通義千問"],
    ["内置", "內建"],
    ["条消息", "則訊息"],
    ["个对话", "個對話"],
    ["未分组", "未分組"],
    ["移出", "移出"],
    ["重命名", "重新命名"],
    ["删除", "刪除"],
    ["已", "已"],
    ["无法", "無法"],
    ["连接", "連線"],
    ["成功", "成功"],
    ["发现", "發現"],
    ["模型名", "模型名稱"],
    ["返回内容", "回傳內容"],
    ["停止生成", "停止生成"],
    ["请求", "請求"],
    ["后台", "背景"],
    ["重新加载", "重新載入"],
    ["插件", "外掛"],
    ["这里", "這裡"],
    ["写好", "寫好"],
    ["离开", "離開"],
    ["丢失", "遺失"],
    ["继续", "繼續"],
    ["只能", "只能"],
    ["确定", "確定"],
    ["受到影响", "受到影響"],
    ["再次确认", "再次確認"],
    ["无法撤销", "無法復原"],
    ["所有", "所有"],
    ["新的", "新的"],
    ["移回", "移回"],
    ["缺少", "缺少"],
    ["覆盖", "覆蓋"],
    ["完成", "完成"],
    ["失败", "失敗"],
    ["导入的", "匯入的"],
    ["未命名", "未命名"]
  ];

  return replacements.reduce((result, [source, target]) => result.replaceAll(source, target), text);
}

UI_TEXT["zh-TW"] = Object.fromEntries(
  Object.entries(UI_TEXT["zh-CN"]).map(([key, value]) => [key, toTraditionalChineseCopy(value)])
);

const state = {
  settings: { ...DEFAULT_SETTINGS },
  conversations: [],
  conversationFolders: [],
  promptTemplates: [],
  activeConversationId: "",
  sending: false,
  activePort: null,
  sidebarCollapsed: false,
  settingsPageOpen: false,
  settingsSnapshot: null,
  settingsDirtySections: {
    general: false,
    model: false
  },
  promptTemplateDirty: false,
  lastPromptTemplateManageValue: ""
};

const els = {
  workspace: document.querySelector(".workspace"),
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
  languageInput: document.querySelector("#languageInput"),
  answerLanguageInput: document.querySelector("#answerLanguageInput"),
  translationLanguageInput: document.querySelector("#translationLanguageInput"),
  colorSchemeInput: document.querySelector("#colorSchemeInput"),
  resetGeneralSettings: document.querySelector("#resetGeneralSettings"),
  resetCurrentModelSettings: document.querySelector("#resetCurrentModelSettings"),
  resetCurrentPromptTemplate: document.querySelector("#resetCurrentPromptTemplate"),
  clearHistorySettings: document.querySelector("#clearHistorySettings"),
  factoryResetSettings: document.querySelector("#factoryResetSettings"),
  testOllama: document.querySelector("#testOllama"),
  conversationList: document.querySelector("#conversationList"),
  newChat: document.querySelector("#newChat"),
  clearHistory: document.querySelector("#clearHistory"),
  newFolder: document.querySelector("#newFolder"),
  exportChats: document.querySelector("#exportChats"),
  exportMarkdown: document.querySelector("#exportMarkdown"),
  importChats: document.querySelector("#importChats"),
  importFile: document.querySelector("#importFile"),
  messages: document.querySelector("#messages"),
  chatForm: document.querySelector("#chatForm"),
  promptTemplateSelect: document.querySelector("#promptTemplateSelect"),
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
const GENERAL_SETTINGS_KEYS = ["language", "answerLanguage", "translationLanguage", "colorScheme", "theme"];
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
  const stored = await chrome.storage.local.get(["settings", "messages", "conversations", "conversationFolders", "activeConversationId", "promptTemplates", "sidebarCollapsed"]);
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
  applyTheme();
  applySidebarState(false);
  syncSettingsToForm();
  enhanceSelects();
  render();
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
  await chrome.storage.local.set({ settings: state.settings });
}

async function saveConversations() {
  await chrome.storage.local.set({
    conversations: state.conversations,
    conversationFolders: state.conversationFolders,
    activeConversationId: state.activeConversationId
  });
}

async function savePromptTemplates() {
  await chrome.storage.local.set({ promptTemplates: state.promptTemplates });
}

function createConversation(title = t("newChatTitle"), messages = []) {
  const now = Date.now();
  return {
    id: `${now}-${Math.random().toString(16).slice(2)}`,
    title,
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
    saveConversations();
    return;
  }

  if (!state.conversations.some((conversation) => conversation.id === state.activeConversationId)) {
    state.activeConversationId = state.conversations[0].id;
    saveConversations();
  }
}

function getActiveConversation() {
  ensureActiveConversation();
  return state.conversations.find((conversation) => conversation.id === state.activeConversationId);
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
  els.thinkingToggle.classList.toggle("active", Boolean(state.settings.thinkingEnabled));
  els.thinkingToggle.setAttribute("aria-pressed", String(Boolean(state.settings.thinkingEnabled)));
  els.languageInput.value = normalizeLanguage(state.settings.language);
  els.answerLanguageInput.value = normalizeLanguage(state.settings.answerLanguage);
  els.translationLanguageInput.value = normalizeLanguage(state.settings.translationLanguage);
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
  setTooltip(els.settingsToggle, t("settingsTitle"));
  setIconOnly(els.sidebarToggle, "panelLeft");
  clearTooltip(els.newChat, t("newChat"));
  clearTooltip(els.newFolder, t("newFolder"));
  setTooltip(els.clearHistory, t("clearHistory"));
  setTooltip(els.exportChats, t("exportChats"));
  setTooltip(els.exportMarkdown, t("exportMarkdown"));
  setTooltip(els.importChats, t("importChats"));
  updateThemeButton();
  if (els.testOllama) {
    setButtonContent(els.testOllama, els.testOllama.disabled ? t("testing") : t("testOllama"), "bot");
  }
  setButtonContent(document.querySelector("#saveSettings"), t("saveSettings"), "settings");
  setButtonContent(els.resetGeneralSettings, t("resetGeneralSettings"), "refreshCw");
  setButtonContent(els.resetCurrentModelSettings, t("resetCurrentModelSettings"), "refreshCw");
  setButtonContent(els.resetCurrentPromptTemplate, t("resetCurrentPromptTemplate"), "refreshCw");
  setButtonContent(els.clearHistorySettings, t("clearHistorySettings"), "trash");
  setButtonContent(els.factoryResetSettings, t("factoryResetSettings"), "alertTriangle");
  setButtonContent(els.thinkingToggle, t("thinkingMode"), "brain");
  setButtonContent(els.sendButton, t("send"), "send");
  setButtonContent(els.stopButton, t("stop"), "square");
  els.promptInput.placeholder = t("promptPlaceholder");
  els.promptTemplateSelect.setAttribute("aria-label", t("promptPresetAria"));
  els.toolbarModelSelect.setAttribute("aria-label", t("currentModelAria"));
  setButtonContent(els.savePromptTemplate, t("savePromptTemplate"), "fileText");
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
  setTooltip(els.settingsToggle, t("settingsTitle"));
  setIconOnly(els.sidebarToggle, "panelLeft");
  if (state.sidebarCollapsed) {
    closeSettingsMenu();
  }
  if (persist) {
    chrome.storage.local.set({ sidebarCollapsed: state.sidebarCollapsed });
  }
}

function applyTheme() {
  const isDark = getResolvedThemeMode() === "dark";
  const colorScheme = COLOR_SCHEMES.includes(state.settings.colorScheme)
    ? state.settings.colorScheme
    : DEFAULT_SETTINGS.colorScheme;
  document.body.classList.toggle("dark-mode", isDark);
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
  if (select.id === "languageInput" || select.id === "answerLanguageInput" || select.id === "translationLanguageInput") {
    return "languages";
  }
  if (select.id === "colorSchemeInput") {
    return "sun";
  }
  if (select.id === "promptTemplateSelect" || select.id === "promptTemplateManageSelect" || select.id === "defaultPresetInput") {
    const promptIcons = {
      summarize: "fileText",
      "translate-polish": "languages",
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

  appendPromptTemplateGroup(t("builtInTemplates"), BUILT_IN_PROMPT_TEMPLATES);
  appendPromptTemplateGroup(t("customTemplates"), state.promptTemplates);
  appendPromptTemplateGroup(t("builtInTemplates"), BUILT_IN_PROMPT_TEMPLATES, els.promptTemplateManageSelect);
  appendPromptTemplateGroup(t("customTemplates"), state.promptTemplates, els.promptTemplateManageSelect);
  if (els.defaultPresetInput) {
    appendPromptTemplateGroup(t("builtInTemplates"), BUILT_IN_PROMPT_TEMPLATES, els.defaultPresetInput);
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
  return state.settings.language === "en-US" && template.nameEn ? template.nameEn : template.name;
}

function localizedTemplateContent(template) {
  return state.settings.language === "en-US" && template.contentEn ? template.contentEn : template.content;
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

  for (const folder of state.conversationFolders) {
    const folderConversations = state.conversations.filter((conversation) => conversation.folderId === folder.id);
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
    for (const conversation of folderConversations) {
      items.append(createConversationItem(conversation, { inFolder: true }));
    }
    group.append(items);
    els.conversationList.append(group);
  }

  const ungrouped = state.conversations.filter((conversation) => !conversation.folderId || !state.conversationFolders.some((folder) => folder.id === conversation.folderId));
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
  }

  if (state.conversationFolders.length || ungrouped.length) {
    els.conversationList.append(ungroupedGroup);
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
  icon.append(createIcon("messageCircle", { size: 16 }));

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
    createConversationMenuAction("exportMarkdown", "fileText", t("exportMarkdown"))
  ];
  if (options.inFolder) {
    menuActions.push(createConversationMenuAction("removeFromFolder", "folder", t("removeFromFolder")));
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

function renderMessages() {
  const messages = getActiveMessages();
  const visibleMessages = messages
    .map((message, index) => ({ message, index }))
    .filter((item) => item.message.role !== "system");
  els.messages.innerHTML = "";

  if (!visibleMessages.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = t("emptyState");
    els.messages.append(empty);
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
    els.messages.scrollTop = els.messages.scrollHeight;
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

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      list = null;
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      if (!list) {
        list = document.createElement("ul");
        nodes.push(list);
      }
      const item = document.createElement("li");
      appendInlineMarkdown(item, bullet[1]);
      list.append(item);
      continue;
    }

    list = null;
    const paragraph = document.createElement(trimmed.startsWith("### ") ? "h3" : "p");
    appendInlineMarkdown(paragraph, trimmed.replace(/^###\s+/, ""));
    nodes.push(paragraph);
  }

  return nodes;
}

function appendInlineMarkdown(parent, text) {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
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
    } else {
      const strong = document.createElement("strong");
      strong.textContent = token.slice(2, -2);
      parent.append(strong);
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
    const response = await chrome.runtime.sendMessage({
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
  state.settings.language = normalizeLanguage(els.languageInput.value);
  state.settings.answerLanguage = normalizeLanguage(els.answerLanguageInput.value);
  state.settings.translationLanguage = normalizeLanguage(els.translationLanguageInput.value, "en-US");
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

async function submitPrompt(prompt) {
  const config = getActiveConfig();
  const conversation = getActiveConversation();
  const shouldGenerateTitle = conversation.messages.length === 0 || conversation.title === t("newChatTitle");

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

  const requestMessages = getContextMessages(config);
  await generateAssistantResponse(conversation, config, requestMessages);
  if (shouldGenerateTitle) {
    generateConversationTitle(conversation, config);
  }
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
    const port = chrome.runtime.connect({ name: "llm-stream" });
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
    const response = await chrome.runtime.sendMessage({
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
    }
  } catch (error) {
    // Title generation is opportunistic; chat should stay quiet if it fails.
  }
}

function getContextMessages(config) {
  return serializeContextMessages(getActiveMessages(), config.memoryEnabled ? config.historyLimit : 1);
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

function showToast(content) {
  if (!content) return;
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

async function copyMessage(index) {
  const message = getActiveMessages()[index];
  if (!message) return;
  await navigator.clipboard.writeText(message.content || "");
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
    const response = await chrome.runtime.sendMessage({
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
  await chrome.storage.local.remove("messages");
  await saveConversations();
  render();
  return true;
}

els.settingsToggle.addEventListener("click", () => {
  showSettingsPage(true);
});

els.themeToggle.addEventListener("click", async () => {
  state.settings.theme = getNextThemeMode();
  applyTheme();
  await saveSettings();
});

document.addEventListener("click", (event) => {
  closeCustomSelects();
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

els.languageInput.addEventListener("change", () => {
  setSettingsSectionDirty("general", true);
  state.settings.language = normalizeLanguage(els.languageInput.value);
  render();
});

els.answerLanguageInput.addEventListener("change", () => {
  setSettingsSectionDirty("general", true);
  state.settings.answerLanguage = normalizeLanguage(els.answerLanguageInput.value);
  syncCustomSelects();
});

els.translationLanguageInput.addEventListener("change", () => {
  setSettingsSectionDirty("general", true);
  state.settings.translationLanguage = normalizeLanguage(els.translationLanguageInput.value, "en-US");
  syncCustomSelects();
});

els.colorSchemeInput.addEventListener("change", () => {
  setSettingsSectionDirty("general", true);
  state.settings.colorScheme = COLOR_SCHEMES.includes(els.colorSchemeInput.value) ? els.colorSchemeInput.value : DEFAULT_SETTINGS.colorScheme;
  applyTheme();
  syncCustomSelects();
});

els.promptTemplateSelect.addEventListener("change", () => {
  const template = getPromptTemplate(els.promptTemplateSelect.value);
  if (!template) {
    return;
  }

  const existing = els.promptInput.value.trim();
  const content = localizedTemplateContent(template);
  els.promptInput.value = existing
    ? `${content}\n\n${existing}`
    : content;
  els.promptInput.focus();
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
  state.settings.translationLanguage = DEFAULT_SETTINGS.translationLanguage;
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
  state.promptTemplateDirty = false;
  await chrome.storage.local.remove(["messages"]);
  await saveSettings();
  await saveConversations();
  await savePromptTemplates();
  captureSettingsSnapshot();
  render();
  pushSystemMessage(t("factoryResetDone"));
});

els.newChat.addEventListener("click", async () => {
  closeSettingsMenu();
  if (!requestCloseSettingsPage()) {
    return;
  }
  const conversation = createConversation();
  state.conversations.unshift(conversation);
  state.activeConversationId = conversation.id;
  await saveConversations();
  render();
  els.promptInput.focus();
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
  state.activeConversationId = item.dataset.id;
  await saveConversations();
  render();
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
  els.promptInput.value = "";
  await submitPrompt(prompt);
});

els.promptInput.addEventListener("keydown", (event) => {
  if (event.isComposing || promptInputComposing || event.keyCode === 229) {
    return;
  }

  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    els.chatForm.requestSubmit();
  }
});

els.promptInput.addEventListener("compositionstart", () => {
  promptInputComposing = true;
});

els.promptInput.addEventListener("compositionend", () => {
  promptInputComposing = false;
});

els.thinkingToggle.addEventListener("click", async () => {
  state.settings.thinkingEnabled = !state.settings.thinkingEnabled;
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
  await saveConversations();
  render();
}
