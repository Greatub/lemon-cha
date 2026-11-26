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
const workspaceStorage = WorkspaceStorage.create(extensionApi.storage.local, navigator.locks);
const SHARED_WORKSPACE_KEYS = ["settings", "conversations", "conversationFolders", "promptTemplates", "activeConversationId"];
let sharedWorkspaceReady = false;
let sharedWorkspaceRefreshId = 0;
let failedHistoryWrite = false;
let workspaceTab = null;
let isSidePanel = false;
let workspacePanelOpen = false;
let workspacePanelRevision = 0;
let workspacePanelBusy = false;

const DIRECT_OLLAMA_ENDPOINT = "http://127.0.0.1:11434/api/chat";
const LEGACY_OLLAMA_PROXY_ENDPOINT = "http://127.0.0.1:8787/api/chat";
const TRANSLATION_PROMPT_TEMPLATE = "You are a professional translator.\n\nYour goal is to accurately convey the meaning, tone, nuance, and context of the original text while following {defaultTranslationLanguage} grammar, vocabulary, idioms, and cultural conventions.\n\nTranslation style:\n{translationStyle}\n\nRequirements:\n- Translate the text into {defaultTranslationLanguage}.\n- Preserve the original meaning and intent.\n- Adapt wording naturally for {defaultTranslationLanguage}.\n- Do not add explanations, notes, summaries, markdown headings, or commentary.\n- Output only the translated text.\n\nText to translate:\n";

const BUILT_IN_PROMPT_TEMPLATES = [
  {
    id: "summarize",
    name: "总结",
    nameEn: "Summarize",
    hint: "粘贴需要总结的内容",
    hintEn: "Paste the content to summarize",
    content: "提炼核心观点和关键事实，保留重要数字、限制条件与分歧。仅在原文包含行动事项时整理后续行动，不补充未经证实的信息。按内容长度选择简洁的段落或列表。 优先遵循用户要求的输出语言；未指定时使用输入内容的主要语言。",
    contentEn: "Extract the main ideas and key facts, preserving important numbers, constraints, and disagreements. Include next actions only when supported by the source. Do not invent information. Use concise paragraphs or lists suited to the content. Follow the user’s requested output language; otherwise use the main language of the input."
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
    nameEn: "Code review",
    hint: "粘贴代码，可补充用途和关注点",
    hintEn: "Paste code and any context or concerns",
    content: "审查代码中的实际缺陷，优先检查正确性、安全性和边界条件。按严重程度说明问题、触发条件、影响和最小修复建议，并建议针对性测试。区分已确认的问题与待验证的风险；没有发现明确问题时如实说明。 优先遵循用户要求的输出语言；未指定时使用输入内容的主要语言。",
    contentEn: "Review the code for concrete defects, prioritizing correctness, security, and edge cases. Order findings by severity and explain triggers, impact, minimal fixes, and targeted tests. Distinguish confirmed defects from risks requiring verification. Say clearly when no definite issues are found. Follow the user’s requested output language; otherwise use the main language of the input."
  },
  {
    id: "debug",
    name: "问题排查",
    nameEn: "Troubleshoot",
    hint: "描述问题，可补充环境和报错",
    hintEn: "Describe the issue, environment, and any errors",
    content: "根据现象、环境和日志，按可能性整理原因。区分已知事实与假设，提供逐步验证方法、预期结果和对应修复建议。先从低风险检查开始；缺少关键信息时只询问最必要的细节。 优先遵循用户要求的输出语言；未指定时使用输入内容的主要语言。",
    contentEn: "Use the symptoms, environment, and logs to rank likely causes. Separate facts from hypotheses. Give step-by-step checks, expected results, and corresponding fixes, starting with low-risk checks. Ask only for essential missing details. Follow the user’s requested output language; otherwise use the main language of the input."
  },
  {
    id: "writing",
    name: "润色改写",
    nameEn: "Rewrite",
    hint: "粘贴原文，可说明语气和用途",
    hintEn: "Paste your text and optionally describe the tone",
    content: "在保留原意、事实和作者立场的前提下，让表达清晰、自然、简洁。遵循用户指定的语气和用途，不添加没有依据的承诺或信息。先给出可直接使用的改写稿，仅在有帮助时简述主要改动。 优先遵循用户要求的输出语言；未指定时使用输入内容的主要语言。",
    contentEn: "Make the text clear, natural, and concise while preserving its meaning, facts, and author’s intent. Respect the requested tone and purpose. Do not add unsupported claims or promises. Give a ready-to-use revision first; explain key changes only when useful. Follow the user’s requested output language; otherwise use the main language of the input."
  },
  {
    id: "plan",
    name: "制定计划",
    nameEn: "Make a plan",
    hint: "描述目标，可补充时间和限制",
    hintEn: "Describe your goal, timeframe, and constraints",
    content: "将目标拆成可执行步骤，说明优先顺序、依赖关系和完成标准。根据已有信息安排里程碑，标明关键假设、风险和待确认事项。不虚构资源、期限或承诺；信息不足时给出合理的起步方案。 优先遵循用户要求的输出语言；未指定时使用输入内容的主要语言。",
    contentEn: "Break the goal into actionable steps with priorities, dependencies, and completion criteria. Suggest milestones using the available information and identify assumptions, risks, and open questions. Do not invent resources, deadlines, or commitments. Offer a practical starting plan when details are limited. Follow the user’s requested output language; otherwise use the main language of the input."
  }
];

const BUILT_IN_PROMPT_TEMPLATE_LOCALES = {
  "summarize": {
    "zh-TW": {
      "name": "摘要整理",
      "hint": "貼上需要整理的內容",
      "content": "整理核心觀點與關鍵事實，保留重要數字、限制條件及不同意見。僅在原文包含待辦事項時列出後續行動，不補充未經證實的資訊。依內容長度選用精簡段落或清單。 優先遵循使用者指定的輸出語言；未指定時使用輸入內容的主要語言。"
    },
    "ja-JP": {
      "name": "要約",
      "hint": "要約したい内容を貼り付けてください",
      "content": "要点と重要な事実を整理し、数値、制約、意見の相違を残してください。次の行動は原文に根拠がある場合のみ示し、情報を補わないでください。内容に合わせて簡潔な段落や箇条書きを使ってください。 出力言語の指定を優先し、指定がなければ入力内容の主な言語で回答してください。"
    },
    "ko-KR": {
      "name": "요약",
      "hint": "요약할 내용을 붙여 넣으세요",
      "content": "핵심 관점과 주요 사실을 정리하고 중요한 수치, 제약, 의견 차이를 보존해 주세요. 후속 행동은 원문에 근거가 있을 때만 포함하고 정보를 지어내지 마세요. 내용에 맞게 간결한 문단이나 목록을 사용해 주세요. 사용자가 지정한 출력 언어를 따르고, 지정이 없으면 입력 내용의 주된 언어로 답해 주세요."
    },
    "fr-FR": {
      "name": "Résumer",
      "hint": "Collez le contenu à résumer",
      "content": "Dégage les idées principales et les faits clés en conservant les chiffres, contraintes et désaccords importants. N’indique des actions à suivre que si le texte les justifie. N’invente aucune information. Choisis des paragraphes courts ou une liste selon le contenu. Respecte la langue de réponse demandée ; sinon, utilise la langue principale du contenu fourni."
    },
    "es-ES": {
      "name": "Resumir",
      "hint": "Pega el contenido que quieras resumir",
      "content": "Extrae las ideas principales y los hechos clave, conservando cifras, restricciones y desacuerdos importantes. Incluye acciones siguientes solo si el texto las respalda. No inventes información. Usa párrafos breves o listas según el contenido. Respeta el idioma de respuesta solicitado; si no se indica, usa el idioma principal del contenido."
    },
    "de-DE": {
      "name": "Zusammenfassen",
      "hint": "Inhalt zum Zusammenfassen einfügen",
      "content": "Fasse die Kernaussagen und wichtigsten Fakten zusammen. Erhalte wichtige Zahlen, Einschränkungen und abweichende Positionen. Nenne nächste Schritte nur, wenn der Ausgangstext sie begründet. Erfinde keine Informationen. Verwende je nach Inhalt kurze Absätze oder Listen. Beachte die gewünschte Ausgabesprache; verwende sonst die Hauptsprache der Eingabe."
    }
  },
  "code-review": {
    "zh-TW": {
      "name": "程式碼審查",
      "hint": "貼上程式碼，可補充用途與關注重點",
      "content": "檢查程式碼的實際缺陷，優先關注正確性、安全性及邊界條件。依嚴重程度說明問題、觸發條件、影響與最小修正建議，並提出針對性測試。區分已確認問題與待驗證風險；未發現明確問題時請如實說明。 優先遵循使用者指定的輸出語言；未指定時使用輸入內容的主要語言。"
    },
    "ja-JP": {
      "name": "コードレビュー",
      "hint": "コードと、用途や確認したい点を入力してください",
      "content": "コードの具体的な不具合を確認し、正確性、安全性、境界条件を優先してください。深刻度順に発生条件、影響、最小限の修正案、必要なテストを示してください。確認済みの問題と検証が必要なリスクを区別し、明確な問題がなければその旨を伝えてください。 出力言語の指定を優先し、指定がなければ入力内容の主な言語で回答してください。"
    },
    "ko-KR": {
      "name": "코드 리뷰",
      "hint": "코드와 용도, 확인할 사항을 입력하세요",
      "content": "정확성, 보안, 경계 조건을 우선으로 실제 결함을 검토해 주세요. 심각도 순으로 발생 조건, 영향, 최소 수정안과 필요한 테스트를 설명해 주세요. 확인된 결함과 검증이 필요한 위험을 구분하고, 명확한 문제가 없으면 그대로 알려 주세요. 사용자가 지정한 출력 언어를 따르고, 지정이 없으면 입력 내용의 주된 언어로 답해 주세요."
    },
    "fr-FR": {
      "name": "Revue de code",
      "hint": "Collez le code et précisez le contexte si utile",
      "content": "Recherche les défauts concrets du code en privilégiant la correction, la sécurité et les cas limites. Classe les constats par gravité et explique les conditions de déclenchement, les conséquences, les corrections minimales et les tests ciblés. Distingue les défauts confirmés des risques à vérifier. Indique clairement si aucun problème certain n’est trouvé. Respecte la langue de réponse demandée ; sinon, utilise la langue principale du contenu fourni."
    },
    "es-ES": {
      "name": "Revisar código",
      "hint": "Pega el código y añade contexto si lo necesitas",
      "content": "Busca defectos concretos en el código, priorizando corrección, seguridad y casos límite. Ordena los hallazgos por gravedad y explica las condiciones que los activan, su impacto, las correcciones mínimas y las pruebas necesarias. Distingue los defectos confirmados de los riesgos pendientes de verificación. Indica si no encuentras problemas claros. Respeta el idioma de respuesta solicitado; si no se indica, usa el idioma principal del contenido."
    },
    "de-DE": {
      "name": "Code prüfen",
      "hint": "Code und bei Bedarf Kontext einfügen",
      "content": "Prüfe den Code auf konkrete Fehler, insbesondere Korrektheit, Sicherheit und Randfälle. Ordne die Befunde nach Schwere und erläutere Auslöser, Auswirkungen, minimale Korrekturen und gezielte Tests. Trenne bestätigte Fehler von noch zu prüfenden Risiken. Sage ausdrücklich, wenn keine eindeutigen Probleme erkennbar sind. Beachte die gewünschte Ausgabesprache; verwende sonst die Hauptsprache der Eingabe."
    }
  },
  "debug": {
    "zh-TW": {
      "name": "問題排查",
      "hint": "描述問題，可補充環境與錯誤訊息",
      "content": "根據現象、環境與紀錄，依可能性整理原因。區分已知事實與假設，提供逐步驗證方式、預期結果及對應修正建議。先從低風險檢查開始；缺少關鍵資訊時僅詢問必要細節。 優先遵循使用者指定的輸出語言；未指定時使用輸入內容的主要語言。"
    },
    "ja-JP": {
      "name": "問題の切り分け",
      "hint": "症状、環境、エラーを入力してください",
      "content": "症状、環境、ログから原因を可能性の高い順に整理してください。事実と仮説を区別し、確認手順、期待される結果、対応する修正案を示してください。低リスクの確認から始め、情報が足りない場合は必要な点だけ質問してください。 出力言語の指定を優先し、指定がなければ入力内容の主な言語で回答してください。"
    },
    "ko-KR": {
      "name": "문제 진단",
      "hint": "증상, 환경, 오류 메시지를 입력하세요",
      "content": "증상, 환경, 로그를 바탕으로 가능성 높은 원인부터 정리해 주세요. 사실과 가설을 구분하고 단계별 확인 방법, 예상 결과, 해당 수정안을 제시해 주세요. 위험이 낮은 확인부터 시작하고, 정보가 부족하면 꼭 필요한 내용만 질문해 주세요. 사용자가 지정한 출력 언어를 따르고, 지정이 없으면 입력 내용의 주된 언어로 답해 주세요."
    },
    "fr-FR": {
      "name": "Diagnostiquer",
      "hint": "Décrivez le problème, le contexte et les erreurs",
      "content": "Classe les causes probables à partir des symptômes, de l’environnement et des journaux. Distingue les faits des hypothèses. Propose des vérifications progressives, leurs résultats attendus et les corrections associées, en commençant par les vérifications peu risquées. Ne demande que les précisions indispensables. Respecte la langue de réponse demandée ; sinon, utilise la langue principale du contenu fourni."
    },
    "es-ES": {
      "name": "Diagnosticar",
      "hint": "Describe el problema, el entorno y los errores",
      "content": "Ordena las causas probables según los síntomas, el entorno y los registros. Separa los hechos de las hipótesis. Propón comprobaciones paso a paso, resultados esperados y soluciones asociadas, empezando por las de bajo riesgo. Pregunta solo por los datos imprescindibles que falten. Respeta el idioma de respuesta solicitado; si no se indica, usa el idioma principal del contenido."
    },
    "de-DE": {
      "name": "Fehler eingrenzen",
      "hint": "Problem, Umgebung und Fehlermeldungen beschreiben",
      "content": "Ordne mögliche Ursachen anhand der Symptome, Umgebung und Protokolle nach Wahrscheinlichkeit. Trenne Fakten von Annahmen. Nenne schrittweise Prüfungen, erwartete Ergebnisse und passende Lösungen. Beginne mit risikoarmen Prüfungen und frage nur nach unbedingt nötigen fehlenden Angaben. Beachte die gewünschte Ausgabesprache; verwende sonst die Hauptsprache der Eingabe."
    }
  },
  "writing": {
    "zh-TW": {
      "name": "潤飾改寫",
      "hint": "貼上原文，可說明語氣與用途",
      "content": "保留原意、事實與作者立場，讓表達清晰、自然、精簡。遵循使用者指定的語氣與用途，不添加沒有根據的承諾或資訊。先提供可直接使用的改寫稿，有幫助時再簡述主要修改。 優先遵循使用者指定的輸出語言；未指定時使用輸入內容的主要語言。"
    },
    "ja-JP": {
      "name": "文章を整える",
      "hint": "原文と、希望する文体や用途を入力してください",
      "content": "原意、事実、書き手の意図を保ちながら、明確で自然な簡潔な文章に整えてください。指定された文体や用途に合わせ、根拠のない情報や約束を加えないでください。まずそのまま使える修正版を示し、必要に応じて変更点を簡潔に説明してください。 出力言語の指定を優先し、指定がなければ入力内容の主な言語で回答してください。"
    },
    "ko-KR": {
      "name": "글 다듬기",
      "hint": "원문과 원하는 어조나 용도를 입력하세요",
      "content": "원래 의미, 사실, 작성자의 의도를 유지하며 명확하고 자연스럽고 간결하게 다듬어 주세요. 요청한 어조와 용도에 맞추고 근거 없는 주장이나 약속을 추가하지 마세요. 바로 쓸 수 있는 수정본을 먼저 제시하고 필요할 때만 주요 변경점을 설명해 주세요. 사용자가 지정한 출력 언어를 따르고, 지정이 없으면 입력 내용의 주된 언어로 답해 주세요."
    },
    "fr-FR": {
      "name": "Reformuler",
      "hint": "Collez le texte et précisez le ton souhaité",
      "content": "Rends le texte clair, naturel et concis en conservant le sens, les faits et l’intention de l’auteur. Respecte le ton et l’usage demandés. N’ajoute ni affirmation ni promesse sans fondement. Fournis d’abord une version prête à l’emploi et explique les changements seulement si c’est utile. Respecte la langue de réponse demandée ; sinon, utilise la langue principale du contenu fourni."
    },
    "es-ES": {
      "name": "Reescribir",
      "hint": "Pega el texto e indica el tono deseado",
      "content": "Mejora la claridad, naturalidad y concisión del texto conservando el significado, los hechos y la intención del autor. Respeta el tono y el propósito solicitados. No añadas afirmaciones ni promesas sin fundamento. Presenta primero una versión lista para usar y explica los cambios solo si resulta útil. Respeta el idioma de respuesta solicitado; si no se indica, usa el idioma principal del contenido."
    },
    "de-DE": {
      "name": "Text überarbeiten",
      "hint": "Text einfügen und gewünschten Ton angeben",
      "content": "Formuliere den Text klar, natürlich und knapp. Bewahre Bedeutung, Fakten und Absicht des Verfassers. Beachte den gewünschten Ton und Zweck. Ergänze keine unbelegten Aussagen oder Zusagen. Gib zuerst eine direkt nutzbare Fassung aus und erläutere Änderungen nur, wenn es hilfreich ist. Beachte die gewünschte Ausgabesprache; verwende sonst die Hauptsprache der Eingabe."
    }
  },
  "plan": {
    "zh-TW": {
      "name": "擬定計畫",
      "hint": "描述目標，可補充時程與限制",
      "content": "將目標拆解成可執行步驟，說明優先順序、相依關係與完成標準。依現有資訊安排里程碑，標明重要假設、風險及待確認事項。不虛構資源、期限或承諾；資訊不足時提供合理的起步方案。 優先遵循使用者指定的輸出語言；未指定時使用輸入內容的主要語言。"
    },
    "ja-JP": {
      "name": "計画を立てる",
      "hint": "目標、期限、制約を入力してください",
      "content": "目標を実行可能な手順に分け、優先順位、依存関係、完了条件を示してください。既知の情報に基づいて節目を設定し、前提、リスク、確認事項を明記してください。資源や期限、約束を作り出さず、情報が少ない場合は着手できる計画を提案してください。 出力言語の指定を優先し、指定がなければ入力内容の主な言語で回答してください。"
    },
    "ko-KR": {
      "name": "계획 세우기",
      "hint": "목표, 일정, 제약을 입력하세요",
      "content": "목표를 실행 가능한 단계로 나누고 우선순위, 의존 관계, 완료 기준을 제시해 주세요. 주어진 정보로 이정표를 정하고 가정, 위험, 확인할 사항을 밝혀 주세요. 자원, 기한, 약속을 임의로 만들지 말고 정보가 적으면 실행을 시작할 수 있는 계획을 제안해 주세요. 사용자가 지정한 출력 언어를 따르고, 지정이 없으면 입력 내용의 주된 언어로 답해 주세요."
    },
    "fr-FR": {
      "name": "Planifier",
      "hint": "Décrivez l’objectif, les délais et les contraintes",
      "content": "Décompose l’objectif en étapes concrètes avec priorités, dépendances et critères de réussite. Propose des jalons à partir des informations disponibles et précise les hypothèses, risques et points à confirmer. N’invente ni ressources, ni échéances, ni engagements. Si les détails manquent, propose un plan de départ réaliste. Respecte la langue de réponse demandée ; sinon, utilise la langue principale du contenu fourni."
    },
    "es-ES": {
      "name": "Crear un plan",
      "hint": "Describe el objetivo, los plazos y las limitaciones",
      "content": "Divide el objetivo en pasos concretos con prioridades, dependencias y criterios de finalización. Propón hitos con la información disponible e identifica supuestos, riesgos y dudas pendientes. No inventes recursos, fechas ni compromisos. Si faltan detalles, ofrece un plan inicial viable. Respeta el idioma de respuesta solicitado; si no se indica, usa el idioma principal del contenido."
    },
    "de-DE": {
      "name": "Plan erstellen",
      "hint": "Ziel, Zeitrahmen und Einschränkungen beschreiben",
      "content": "Zerlege das Ziel in umsetzbare Schritte mit Prioritäten, Abhängigkeiten und Abschlusskriterien. Schlage Meilensteine anhand der vorhandenen Informationen vor und benenne Annahmen, Risiken und offene Fragen. Erfinde keine Ressourcen, Fristen oder Zusagen. Biete bei wenigen Angaben einen praktikablen Einstiegsplan. Beachte die gewünschte Ausgabesprache; verwende sonst die Hauptsprache der Eingabe."
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
    openWorkspaceTab: "打开工作台",
    workspaceConflict: "对话已在另一窗口中更改，请查看会话列表后重试。",
    workspaceStorageFailed: "无法保存或读取会话记录。",
    endpointInvalid: "请输入有效的 HTTP 或 HTTPS 接口地址。",
    endpointPermissionRequired: "请允许访问该接口域名后再保存。",
    interfaceLanguage: "界面语言",
    answerLanguage: "默认回答语言",
    translationLanguage: "默认翻译目标语言",
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
    cancel: "取消",
    replace: "替换",
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
    openWorkspaceTab: "Open workspace tab",
    workspaceConflict: "This conversation changed in another window. Check your conversation list and try again.",
    workspaceStorageFailed: "Could not save or read conversation history.",
    endpointInvalid: "Enter a valid HTTP or HTTPS endpoint.",
    endpointPermissionRequired: "Allow access to this endpoint’s host before saving.",
    interfaceLanguage: "Interface Language",
    answerLanguage: "Default Answer Language",
    translationLanguage: "Default Translation Language",
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
    cancel: "Cancel",
    replace: "Replace",
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
    openWorkspaceTab: "開啟工作台",
    workspaceConflict: "對話已在另一個視窗中變更，請查看對話清單後再試一次。",
    workspaceStorageFailed: "無法儲存或讀取對話記錄。",
    endpointInvalid: "請輸入有效的 HTTP 或 HTTPS 介面位址。",
    endpointPermissionRequired: "請允許存取此介面網域後再儲存。",
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
    cancel: "取消",
    replace: "替換",
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
    openWorkspaceTab: "ワークスペースを開く",
    workspaceConflict: "別のウィンドウで会話が変更されました。一覧を確認してからやり直してください。",
    workspaceStorageFailed: "会話履歴を保存または読み込めませんでした。",
    endpointInvalid: "有効な HTTP または HTTPS エンドポイントを入力してください。",
    endpointPermissionRequired: "保存するには、このエンドポイントのホストへのアクセスを許可してください。",
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
    cancel: "キャンセル",
    replace: "置き換え",
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
    openWorkspaceTab: "작업 공간 탭 열기",
    workspaceConflict: "다른 창에서 대화가 변경됐습니다. 대화 목록을 확인한 뒤 다시 시도하세요.",
    workspaceStorageFailed: "대화 기록을 저장하거나 읽을 수 없습니다.",
    endpointInvalid: "유효한 HTTP 또는 HTTPS 엔드포인트를 입력하세요.",
    endpointPermissionRequired: "저장하려면 이 엔드포인트의 호스트에 대한 접근을 허용하세요.",
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
    cancel: "취소",
    replace: "바꾸기",
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
    openWorkspaceTab: "Ouvrir l’espace de travail",
    workspaceConflict: "La conversation a changé dans une autre fenêtre. Consultez la liste et réessayez.",
    workspaceStorageFailed: "Impossible d’enregistrer ou de lire l’historique.",
    endpointInvalid: "Saisissez une adresse HTTP ou HTTPS valide.",
    endpointPermissionRequired: "Autorisez l’accès à l’hôte de cette adresse avant d’enregistrer.",
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
    cancel: "Annuler",
    replace: "Remplacer",
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
    openWorkspaceTab: "Abrir espacio de trabajo",
    workspaceConflict: "La conversación cambió en otra ventana. Revisa la lista y vuelve a intentarlo.",
    workspaceStorageFailed: "No se pudo guardar o leer el historial.",
    endpointInvalid: "Introduce una URL HTTP o HTTPS válida.",
    endpointPermissionRequired: "Permite el acceso al host de esta URL antes de guardar.",
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
    cancel: "Cancelar",
    replace: "Reemplazar",
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
    openWorkspaceTab: "Arbeitsbereich öffnen",
    workspaceConflict: "Die Unterhaltung wurde in einem anderen Fenster geändert. Prüfe die Liste und versuche es erneut.",
    workspaceStorageFailed: "Der Chatverlauf konnte nicht gespeichert oder gelesen werden.",
    endpointInvalid: "Gib eine gültige HTTP- oder HTTPS-Adresse ein.",
    endpointPermissionRequired: "Erlaube vor dem Speichern den Zugriff auf den Host dieser Adresse.",
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
    cancel: "Abbrechen",
    replace: "Ersetzen",
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
  inputModeAria: "Eingabemodus",
  targetLanguageAria: "Zielsprache",
  translationStyle: "Stil des Übersetzungswerkzeugs",
  translationStyleBalanced: "Natürlich und genau",
  translationStyleFaithful: "Quelltextnah",
  translationStylePolished: "Flüssig überarbeitet",
  translationStyleProfessional: "Professionell"
});

Object.assign(UI_TEXT["zh-CN"], {
  "viewPresetInstructions": "查看提示词",
  "removePreset": "取消预设",
  "presetInputHint": "输入需要处理的内容"
});
Object.assign(UI_TEXT["zh-TW"], {
  "viewPresetInstructions": "查看提示詞",
  "removePreset": "取消預設",
  "presetInputHint": "輸入需要處理的內容"
});
Object.assign(UI_TEXT["en-US"], {
  "viewPresetInstructions": "View instructions",
  "removePreset": "Remove preset",
  "presetInputHint": "Enter the content to work on"
});
Object.assign(UI_TEXT["ja-JP"], {
  "viewPresetInstructions": "指示を表示",
  "removePreset": "プリセットを解除",
  "presetInputHint": "処理したい内容を入力してください"
});
Object.assign(UI_TEXT["ko-KR"], {
  "viewPresetInstructions": "지침 보기",
  "removePreset": "프리셋 해제",
  "presetInputHint": "처리할 내용을 입력하세요"
});
Object.assign(UI_TEXT["fr-FR"], {
  "viewPresetInstructions": "Voir les consignes",
  "removePreset": "Retirer le préréglage",
  "presetInputHint": "Saisissez le contenu à traiter"
});
Object.assign(UI_TEXT["es-ES"], {
  "viewPresetInstructions": "Ver instrucciones",
  "removePreset": "Quitar preajuste",
  "presetInputHint": "Introduce el contenido que quieras trabajar"
});
Object.assign(UI_TEXT["de-DE"], {
  "viewPresetInstructions": "Anweisungen ansehen",
  "removePreset": "Vorlage entfernen",
  "presetInputHint": "Inhalt zur Bearbeitung eingeben"
});

const state = {
  settings: { ...DEFAULT_SETTINGS },
  conversations: [],
  draftConversation: null,
  conversationFolders: [],
  promptTemplates: [],
  activeConversationId: "",
  sending: false,
  activePort: null,
  streamingMessage: null,
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
  sidebar: document.querySelector(".sidebar"),
  panelSidebarBackdrop: document.querySelector("#panelSidebarBackdrop"),
  workspaceSurfaceToggle: document.querySelector("#workspaceSurfaceToggle"),
  sidebarPromptPresets: document.querySelector("#sidebarPromptPresets"),
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
  presetContext: document.querySelector("#presetContext"),
  presetDetails: document.querySelector("#presetDetails"),
  presetName: document.querySelector("#presetName"),
  presetViewLabel: document.querySelector("#presetViewLabel"),
  presetInstructions: document.querySelector("#presetInstructions"),
  removePreset: document.querySelector("#removePreset"),
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

  for (const button of els.sidebarPromptPresets.querySelectorAll("button")) {
    actions.push([button, button.getAttribute("aria-label")]);
  }

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
  if (extensionApi.sidePanel?.open) {
    workspaceTab = await extensionApi.tabs.getCurrent();
    isSidePanel = !workspaceTab;
    document.body.classList.toggle("side-panel", isSidePanel);
    if (workspaceTab && extensionApi.sidePanel.close) {
      await watchWorkspaceSidePanel();
    }
    els.workspaceSurfaceToggle.classList.remove("hidden");
  }

  const stored = await extensionApi.storage.local.get([...SHARED_WORKSPACE_KEYS, "messages", "sidebarCollapsed"]);
  state.settings = { ...DEFAULT_SETTINGS, ...(stored.settings || {}) };
  state.settings.modelConfigs = { ...(stored.settings?.modelConfigs || {}) };
  state.sidebarCollapsed = isSidePanel || Boolean(stored.sidebarCollapsed);
  state.conversations = readStoredConversations(stored.conversations);
  state.conversationFolders = Array.isArray(stored.conversationFolders) ? stored.conversationFolders : [];
  state.promptTemplates = Array.isArray(stored.promptTemplates) ? stored.promptTemplates : [];
  state.activeConversationId = stored.activeConversationId || "";
  workspaceStorage.accept(Object.fromEntries(SHARED_WORKSPACE_KEYS.map((key) => [key, state[key]])));
  migrateOllamaSettings();
  try {
    await saveSettings();
  } catch {
    pushSystemMessage(t("settingsSaveFailed"));
  }

  if (!stored.conversations?.length && stored.activeConversationId !== ""
      && Array.isArray(stored.messages) && stored.messages.length) {
    const migrated = createConversation(t("importedChat"), stored.messages);
    state.conversations = [migrated];
    state.activeConversationId = migrated.id;
    await saveConversations();
  }

  state.composerMode = getConversationMode(getActiveConversation());
  applyTheme();
  applySidebarState(false);
  syncSettingsToForm();
  enhanceSelects();
  render();
  sharedWorkspaceReady = true;
  refreshSharedWorkspace();
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
}

async function saveSettings() {
  await workspaceStorage.save({ settings: state.settings });
  refreshSharedWorkspace();
}

async function saveConversations({ replaceHistory = false } = {}) {
  const conversations = state.streamingMessage
    ? state.conversations.map((item) => item.messages.includes(state.streamingMessage) ? {
      ...item, messages: item.messages.filter((message) => message !== state.streamingMessage)
    } : item)
    : state.conversations;
  try {
    const values = {
      conversations,
      conversationFolders: state.conversationFolders
    };
    if (state.activeConversationId || replaceHistory || !conversations.length) {
      values.activeConversationId = state.activeConversationId;
    }
    const conflict = await workspaceStorage.save(values, {
      replace: replaceHistory ? ["conversations", "conversationFolders", "activeConversationId"] : []
    });
    failedHistoryWrite = false;
    if (conflict) pushSystemMessage(t("workspaceConflict"));
    await refreshSharedWorkspace();
  } catch {
    failedHistoryWrite = true;
    pushSystemMessage(t("workspaceStorageFailed"));
  }
}

async function savePromptTemplates() {
  await workspaceStorage.save({ promptTemplates: state.promptTemplates });
  refreshSharedWorkspace();
}

async function replaceSharedWorkspace() {
  const values = Object.fromEntries(SHARED_WORKSPACE_KEYS.map((key) => [key, state[key]]));
  await workspaceStorage.save(values, { replace: SHARED_WORKSPACE_KEYS });
  failedHistoryWrite = false;
  await extensionApi.storage.local.remove("messages");
}

async function refreshSharedWorkspace() {
  if (!sharedWorkspaceReady || workspaceStorage.pending || state.sending || failedHistoryWrite) return;
  const refreshId = ++sharedWorkspaceRefreshId;
  const revision = workspaceStorage.revision;
  try {
    const stored = await extensionApi.storage.local.get(SHARED_WORKSPACE_KEYS);
    if (refreshId !== sharedWorkspaceRefreshId || revision !== workspaceStorage.revision
        || workspaceStorage.pending || state.sending || failedHistoryWrite) return;

    const settings = { ...DEFAULT_SETTINGS, ...(stored.settings || {}), modelConfigs: stored.settings?.modelConfigs || {} };
    const templates = Array.isArray(stored.promptTemplates) ? stored.promptTemplates : [];
    const settingsChanged = !state.settingsPageOpen && !WorkspaceStorage.equal(state.settings, settings);
    const templatesChanged = !state.promptTemplateDirty && !WorkspaceStorage.equal(state.promptTemplates, templates);
    if (settingsChanged) {
      state.settings = settings;
      workspaceStorage.accept({ settings });
    }
    if (templatesChanged) {
      state.promptTemplates = templates;
      workspaceStorage.accept({ promptTemplates: templates });
    }

    const conversations = readStoredConversations(stored.conversations);
    const conversationFolders = Array.isArray(stored.conversationFolders) ? stored.conversationFolders : [];
    const previousId = state.activeConversationId;
    const previous = state.conversations.find((item) => item.id === previousId);
    const incoming = conversations.find((item) => item.id === previousId);
    const viewingDraft = !previousId && Boolean(state.draftConversation);
    const activeRemoved = !viewingDraft && !incoming;
    const activeChanged = activeRemoved || (incoming && !WorkspaceStorage.equal(previous, incoming));
    const listChanged = !WorkspaceStorage.equal(state.conversations, conversations)
      || !WorkspaceStorage.equal(state.conversationFolders, conversationFolders);
    // Keep references captured by in-flight title requests and event handlers.
    if (listChanged) {
      const existing = new Map(state.conversations.map((item) => [item.id, item]));
      state.conversations = conversations.map((item) => {
        const previousItem = existing.get(item.id);
        if (!previousItem) return item;
        for (const key of Object.keys(previousItem)) {
          if (!Object.hasOwn(item, key)) delete previousItem[key];
        }
        return Object.assign(previousItem, item);
      });
      state.conversationFolders = conversationFolders;
    }
    if (activeRemoved) {
      state.activeConversationId = stored.activeConversationId || "";
      state.composerMode = getConversationMode(getActiveConversation());
      clearComposerInput();
    }
    if (listChanged || activeRemoved) {
      workspaceStorage.accept({
        conversations,
        conversationFolders,
        activeConversationId: state.activeConversationId || stored.activeConversationId || ""
      });
    }
    if (settingsChanged) {
      render();
    } else {
      if (templatesChanged) {
        renderPromptTemplates();
        syncCustomSelects();
      }
      if (listChanged) renderConversations();
      if (activeChanged) {
        updateChatTitle();
        renderMessages();
        if (activeRemoved) syncComposerMode();
      }
    }
  } catch {
    pushSystemMessage(t("workspaceStorageFailed"));
  }
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

function readStoredConversations(conversations) {
  if (!Array.isArray(conversations)) return [];
  return conversations.filter((conversation) => {
    if (conversation.messages?.length !== 0 || conversation.folderId
        || conversation.createdAt !== conversation.updatedAt) return true;
    // Older versions wrote an untouched placeholder as soon as a blank chat opened.
    return !Object.values(UI_TEXT).some(({ newChatTitle, translateMode }) =>
      conversation.title === newChatTitle || conversation.title === translateMode);
  });
}

function startConversationDraft(mode = "chat") {
  const title = t(mode === "translate" ? "translateMode" : "newChatTitle");
  state.draftConversation = createConversation(title, [], mode);
  state.activeConversationId = "";
  state.composerMode = mode;
  return state.draftConversation;
}

function getActiveConversation() {
  if (!state.activeConversationId && state.draftConversation) return state.draftConversation;
  const active = state.conversations.find((conversation) => conversation.id === state.activeConversationId);
  if (active) return active;
  const latest = state.conversations[0];
  if (!latest) return startConversationDraft();
  state.activeConversationId = latest.id;
  state.composerMode = getConversationMode(latest);
  return latest;
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
    provider: useStateFallback ? state.settings.provider || "custom" : "custom",
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
  const defaults = defaultModelConfigForPreset(presetKey, presetKey === (state.settings.preset || "custom"));
  const saved = configs[presetKey] || {};
  return {
    ...defaults,
    ...saved,
    baseUrl: saved.baseUrl || saved.endpoint || defaults.baseUrl,
    endpoint: saved.endpoint || saved.baseUrl || defaults.endpoint,
    modelName: saved.modelName || saved.model || defaults.modelName,
    model: saved.model || saved.modelName || defaults.model
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
  if (extensionApi.sidePanel?.open) {
    renderWorkspaceSurfaceToggle();
  }
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
  setButtonContent(els.sendButton, t("send"), "send");
  setButtonContent(els.stopButton, t("stop"), "square");
  syncPromptPreset();
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

function renderWorkspaceSurfaceToggle() {
  const button = els.workspaceSurfaceToggle;
  const label = isSidePanel ? "openWorkspaceTab" : workspacePanelOpen ? "hideSidebar" : "showSidebar";
  setIconButtonContent(button, t(label), isSidePanel ? "monitor" : "panelRight");
  if (!isSidePanel) {
    button.setAttribute("aria-description", "Chrome Side Panel");
    if (extensionApi.sidePanel.close) button.setAttribute("aria-expanded", String(workspacePanelOpen));
  }
}

function updateWorkspaceSidePanel(open) {
  workspacePanelRevision += 1;
  workspacePanelOpen = open;
  renderWorkspaceSurfaceToggle();
}

async function refreshWorkspaceSidePanel() {
  const revision = ++workspacePanelRevision;
  const key = `workspaceSidePanel:${workspaceTab.windowId}`;
  try {
    const values = await extensionApi.storage.session.get(key);
    let open = Boolean(values[key]);
    if (open && !extensionApi.sidePanel.onClosed) {
      const contexts = await extensionApi.runtime.getContexts({ contextTypes: ["SIDE_PANEL"] });
      open = contexts.length > 0;
    }
    if (revision === workspacePanelRevision) updateWorkspaceSidePanel(open);
  } catch {
    // A context lookup can race with the tab moving to a different window.
  }
}

function watchWorkspaceSidePanel() {
  const { sidePanel, tabs } = extensionApi;
  tabs.onAttached.addListener((tabId, { newWindowId }) => {
    if (tabId !== workspaceTab.id) return;
    workspaceTab.windowId = newWindowId;
    refreshWorkspaceSidePanel();
  });
  if (!sidePanel.onClosed) window.addEventListener("focus", refreshWorkspaceSidePanel);
  return refreshWorkspaceSidePanel();
}

async function toggleWorkspaceSidePanel() {
  if (workspacePanelBusy) return;
  workspacePanelBusy = true;
  const revision = ++workspacePanelRevision;
  const open = !workspacePanelOpen;
  try {
    // The extension uses a global panel, which Chrome closes by window ID.
    const { sidePanel } = extensionApi;
    const target = { windowId: workspaceTab.windowId };
    if (open) await sidePanel.open(target);
    else {
      await sidePanel.close(target);
      if (!sidePanel.onClosed) await extensionApi.storage.session.remove(`workspaceSidePanel:${target.windowId}`);
    }
    if (sidePanel.close && workspacePanelRevision === revision) updateWorkspaceSidePanel(open);
  } catch {
    pushSystemMessage(t("backendFailed"));
  } finally {
    workspacePanelBusy = false;
  }
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
  const panelDrawerOpen = isSidePanel && !state.sidebarCollapsed;
  els.workspace.inert = panelDrawerOpen;
  els.panelSidebarBackdrop.classList.toggle("hidden", !panelDrawerOpen);
  els.sidebarToggle.setAttribute("aria-expanded", String(!state.sidebarCollapsed));
  setTooltip(els.sidebarToggle, state.sidebarCollapsed ? t("showSidebar") : t("hideSidebar"));
  syncSidebarActionTooltips();
  syncConversationSearchState();
  setIconOnly(els.sidebarToggle, "panelLeft");
  if (state.sidebarCollapsed) {
    closeSettingsMenu();
  }
  if (persist && !isSidePanel) {
    extensionApi.storage.local.set({ sidebarCollapsed: state.sidebarCollapsed });
  }
}

function collapsePanelSidebar({ restoreFocus = false } = {}) {
  if (!isSidePanel || state.sidebarCollapsed) return;
  state.sidebarCollapsed = true;
  applySidebarState(false);
  if (restoreFocus) els.sidebarToggle.focus();
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
  const wasOpen = state.settingsPageOpen;
  if (show && !wasOpen) {
    captureSettingsSnapshot();
  }
  state.settingsPageOpen = show;
  els.settingsPanel.classList.toggle("hidden", !show);
  els.workspace.classList.toggle("settings-open", show);
  document.body.classList.toggle("settings-open", show);
  els.settingsToggle.setAttribute("aria-expanded", String(show));
  if (isSidePanel && show !== wasOpen) {
    els.sidebar.inert = show;
    els.chatForm.inert = show;
    els.messages.inert = show;
    els.workspaceSurfaceToggle.inert = show;
    (show ? els.closeSettings : els.settingsToggle).focus();
  }
}

function requestCloseSettingsPage() {
  if (!confirmDiscardAllSettingsChanges()) {
    return false;
  }
  showSettingsPage(false);
  refreshSharedWorkspace();
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
  syncPromptPreset();
}

function syncPromptPreset() {
  const template = state.composerMode === "translate" ? null : getPromptTemplate(els.promptTemplateSelect.value);
  els.presetContext.classList.toggle("hidden", !template);
  els.promptInput.placeholder = template
    ? BUILT_IN_PROMPT_TEMPLATE_LOCALES[template.id]?.[uiLanguage()]?.hint
      || (uiLanguage() === "en-US" ? template.hintEn : template.hint)
      || t("presetInputHint")
    : t("promptPlaceholder");
  els.presetName.textContent = template ? localizedTemplateName(template) : "";
  els.presetViewLabel.textContent = t("viewPresetInstructions");
  els.presetInstructions.textContent = template
    ? resolvePromptTemplateVariables(localizedTemplateContent(template)) : "";
  setIconButtonContent(els.removePreset, t("removePreset"), "x");
  updateComposerSafeSpace();
}

function selectedPromptPresetSnapshot() {
  if (state.composerMode === "translate") return null;
  const template = getPromptTemplate(els.promptTemplateSelect.value);
  return template ? {
    id: template.id,
    name: localizedTemplateName(template),
    content: resolvePromptTemplateVariables(localizedTemplateContent(template))
  } : null;
}

function composePresetPrompt(content, preset) {
  return preset ? `${preset.content}\n\n${content}` : content;
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
  const settingsPanel = isSidePanel ? custom.shell.closest(".settings-tab-panel") : null;
  if (settingsPanel) {
    custom.menu.style.maxHeight = "";
    custom.button.scrollIntoView({ block: "nearest" });
  }
  const rect = custom.button.getBoundingClientRect();
  const menuHeight = Math.min(custom.menu.scrollHeight || 280, 280);
  const bounds = settingsPanel?.getBoundingClientRect();
  const gap = bounds ? custom.menu.getBoundingClientRect().top - rect.bottom : 12;
  const spaceBelow = (bounds?.bottom ?? window.innerHeight) - rect.bottom;
  const spaceAbove = rect.top - (bounds?.top ?? 0);
  const shouldOpenUp = spaceBelow < menuHeight + gap && spaceAbove > spaceBelow;
  custom.shell.classList.toggle("open-up", shouldOpenUp);
  if (bounds) {
    const availableHeight = (shouldOpenUp ? spaceAbove : spaceBelow) - gap;
    custom.menu.style.maxHeight = `${Math.min(280, Math.max(0, Math.floor(availableHeight)))}px`;
  }
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
  renderSidebarPromptPresets();
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
  syncPromptPreset();
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

function renderSidebarPromptPresets() {
  els.sidebarPromptPresets.replaceChildren();
  for (const template of [...VISIBLE_BUILT_IN_PROMPT_TEMPLATES, ...state.promptTemplates]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sidebar-text-button sidebar-prompt-button";
    const label = localizedTemplateName(template);
    button.setAttribute("aria-label", label);
    const icon = document.createElement("span");
    icon.className = "icon-slot";
    icon.setAttribute("aria-hidden", "true");
    icon.append(createIcon(iconForSelectOption(els.promptTemplateSelect, { value: template.id })));
    const text = document.createElement("span");
    text.className = "menu-label";
    text.textContent = label;
    button.append(icon, text);
    button.addEventListener("click", () => applyPromptPreset(template.id, { fromSidebar: true }));
    els.sidebarPromptPresets.append(button);
  }
  syncSidebarActionTooltips();
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
    renderMessageBody(content, message);

    const meta = createMessageMeta(message);
    const reasoning = createMessageReasoning(message);
    if (reasoning) item.append(reasoning);
    if (message.role === "user" && message.promptPreset) {
      const presetLabel = document.createElement("div");
      presetLabel.className = "message-preset-label";
      presetLabel.textContent = message.promptPreset.name;
      item.append(presetLabel);
    }
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

function renderMessageBody(container, message, streaming = false) {
  container.replaceChildren();
  if (message.pending && !message.content) {
    container.append(createThinkingIndicator(Boolean(message.thinkingEnabled)));
  } else {
    renderMessageContent(container, message.content, message.role, streaming);
  }
}

function createMessageReasoning(message) {
  if (message.role !== "assistant" || typeof message.reasoning !== "string" || !message.reasoning.trim()) return null;

  const details = document.createElement("details");
  details.className = "message-reasoning";
  const summary = document.createElement("summary");
  summary.textContent = t("thinkingMode");
  const text = document.createElement("div");
  text.className = "message-reasoning-text";
  text.textContent = message.reasoning;
  details.append(summary, text);
  return details;
}

function renderStreamingMessage(conversation, message) {
  if (getActiveConversation() !== conversation) return;
  const index = conversation.messages.indexOf(message);
  const item = els.messages.querySelector(`.message.assistant[data-index="${index}"]`);
  if (!item) return;

  const nearBottom = isMessagesNearBottom();
  const content = item.querySelector(".message-content");
  const reasoningText = item.querySelector(".message-reasoning-text");
  if (reasoningText) {
    reasoningText.textContent = message.reasoning;
  } else {
    const reasoning = createMessageReasoning(message);
    if (reasoning) item.prepend(reasoning);
  }
  renderMessageBody(content, message, true);
  if (nearBottom) els.messages.scrollTop = els.messages.scrollHeight;
  updateScrollToBottomButton();
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

function renderMessageContent(container, rawContent, role, streaming = false) {
  if (role !== "assistant") {
    container.textContent = rawContent;
    return;
  }

  const parts = splitMarkdownCodeBlocks(rawContent, streaming);
  for (const part of parts) {
    if (part.type === "code") {
      container.append(createCodeBlock(part.code, part.lang));
    } else {
      container.append(...renderMarkdownText(part.text));
    }
  }
}

function splitMarkdownCodeBlocks(text, streaming = false) {
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

  const trailing = text.slice(lastIndex);
  const openFence = streaming && /^([\s\S]*?)(?:^|\n)```([^\n`]*)\n([\s\S]*)$/.exec(trailing);
  if (openFence) {
    if (openFence[1]) parts.push({ type: "text", text: openFence[1] });
    parts.push({ type: "code", lang: openFence[2].trim(), code: openFence[3] });
  } else if (trailing) {
    parts.push({ type: "text", text: trailing });
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
  const config = getModelConfigForPreset(presetKey);
  state.settings.preset = presetKey;
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
    syncPromptPreset();
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
  const customConfig = ensureModelConfigs().custom;
  const activeCustom = state.settings.preset === "custom";
  const customModel = activeCustom ? currentModel : customConfig?.modelName || customConfig?.model || "";
  const hasCustomConfig = customConfig && customConfig.apiFormat !== "ollama"
    && (customConfig.baseUrl || customConfig.endpoint) && customModel;
  if (activeCustom || hasCustomConfig) {
    const customOption = document.createElement("option");
    customOption.value = "preset:custom";
    customOption.textContent = customModel
      ? `${t("presetCustom")} · ${customModel}`
      : t("presetCustom");
    customOption.selected = customOption.value === currentValue;
    presetGroup.append(customOption);
  }

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
    const presetConfig = key === state.settings.preset ? config : getModelConfigForPreset(key);
    const model = presetConfig.modelName || presetConfig.model || preset.model;
    option.textContent = `${presetLabel(key)} · ${model}`;
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

  if (state.settings.preset === "custom") {
    return "preset:custom";
  }

  if (MODEL_PRESETS[state.settings.preset]) {
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

function configuredEndpointHostPattern() {
  const endpoint = els.endpointInput.value.trim() || DEFAULT_SETTINGS.customEndpoint;
  let url;
  try {
    url = new URL(els.customFormatInput.value === "ollama" ? normalizeOllamaEndpoint(endpoint) : endpoint);
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.hostname.includes("*")) {
    return null;
  }
  return `${url.protocol}//${url.hostname}/*`;
}

async function requestConfiguredEndpointPermission() {
  if (!extensionApi.permissions?.request) return true;
  const origin = configuredEndpointHostPattern();
  if (!origin) {
    pushSystemMessage(t("endpointInvalid"));
    return false;
  }
  try {
    const granted = await extensionApi.permissions.request({ origins: [origin] });
    if (granted && origin === configuredEndpointHostPattern()) return true;
  } catch {
    // Chrome may reject a request if the permission dialog cannot be opened.
  }
  pushSystemMessage(t("endpointPermissionRequired"));
  return false;
}

async function withConversationEdit(edit, { checkMessages = false } = {}) {
  if (state.sending) return;
  const conversation = getActiveConversation();
  const messages = conversation.messages;
  const run = async (lock) => {
    if (lock) {
      await refreshSharedWorkspace();
      if (state.sending) return;
      const current = getActiveConversation();
      if (current.id === conversation.id
          && (!checkMessages || WorkspaceStorage.equal(messages, current.messages))) {
        return edit(current);
      }
    }
    pushSystemMessage(t("workspaceConflict"));
  };
  if (navigator.locks) {
    await navigator.locks.request(`lemon-cha.edit.${conversation.id}`, { ifAvailable: true }, run);
  } else {
    await run(true);
  }
}

async function submitPrompt(conversation, prompt, options = {}) {
  const config = getActiveConfig();
  const shouldGenerateTitle = conversation.messages.length === 0 || conversation.title === t("newChatTitle");
  const requestPrompt = options.requestPrompt || prompt;

  if (!config.endpoint || !config.model) {
    pushSystemMessage(t("missingEndpointModel"));
    return;
  }

  els.promptInput.value = "";
  resizePromptInput();
  conversation.messages.push({
    role: "user", content: prompt,
    ...(options.promptPreset ? { promptPreset: options.promptPreset } : {})
  });
  if (conversation === state.draftConversation) {
    conversation.mode = state.composerMode;
    state.conversations.unshift(conversation);
    state.activeConversationId = conversation.id;
    state.draftConversation = null;
  }
  conversation.title = titleFromPrompt(conversation, prompt);
  conversation.updatedAt = Date.now();
  const requestMessages = getContextMessages(config, requestPrompt);
  state.sending = true;
  await saveConversations();
  render();

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
  state.streamingMessage = assistantMessage;
  conversation.messages.push(assistantMessage);
  render();

  let renderFrame = null;
  try {
    const meta = await requestChatCompletionStream(config, requestMessages, (delta, type) => {
      if (stats.firstTokenMs === null) {
        stats.firstTokenMs = Date.now() - stats.startedAt;
      }
      stats.completionTokens += estimateTokens(delta);
      if (type === "reasoning") {
        if (config.thinkingEnabled) {
          assistantMessage.reasoning = (assistantMessage.reasoning || "") + delta;
        }
      } else {
        assistantMessage.pending = false;
        assistantMessage.content += delta;
      }
      conversation.updatedAt = Date.now();
      if (renderFrame === null) {
        renderFrame = requestAnimationFrame(() => {
          renderFrame = null;
          renderStreamingMessage(conversation, assistantMessage);
        });
      }
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
    if (renderFrame !== null) cancelAnimationFrame(renderFrame);
    assistantMessage.stats.elapsedMs = Date.now() - stats.startedAt;
    conversation.updatedAt = Date.now();
    state.streamingMessage = null;
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
      if (message?.type === "delta" || message?.type === "reasoning") {
        onDelta(message.content || "", message.type);
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
        reject(new Error(t("backendFailed")));
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
    .map(({ role, content, promptPreset }) => ({
      role, content: role === "user" ? composePresetPrompt(content, promptPreset) : content
    }));
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

function clearComposerInput({ focus = false } = {}) {
  els.promptInput.value = "";
  resizePromptInput();
  els.promptTemplateSelect.value = "";
  els.presetDetails.open = false;
  syncPromptPreset();
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

async function deleteMessage(conversation, index) {
  if (!conversation.messages[index]) return;
  conversation.messages.splice(index, 1);
  conversation.updatedAt = Date.now();
  await saveConversations();
  render();
}

async function regenerateFromMessage(conversation, index) {
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

async function continueFromMessage(conversation, index) {
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

  state.conversations = [];
  state.conversationFolders = [];
  startConversationDraft();
  await saveConversations({ replaceHistory: true });
  await extensionApi.storage.local.remove("messages");
  render();
  clearComposerInput({ focus: true });
  return true;
}

els.settingsToggle.addEventListener("click", () => {
  collapsePanelSidebar();
  showSettingsPage(true);
});

els.workspaceSurfaceToggle.addEventListener("click", async () => {
  if (!isSidePanel) {
    await toggleWorkspaceSidePanel();
    return;
  }
  try {
    const result = await extensionApi.runtime.sendMessage({ type: "workspace:open-tab" });
    if (!result?.ok) pushSystemMessage(t("backendFailed"));
  } catch {
    pushSystemMessage(t("backendFailed"));
  }
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
  if (event.key !== "Escape" || event.defaultPrevented) return;
  if (isSidePanel) {
    const openSelect = [...customSelects.values()].find(({ shell }) => shell.classList.contains("open"));
    if (openSelect) {
      closeCustomSelects();
      openSelect.button.focus();
      return;
    }
    if (state.settingsPageOpen) {
      requestCloseSettingsPage();
      return;
    }
  }
  if (isConversationSearchOpen()) {
    closeConversationSearch({ restoreFocus: true });
  } else if (isSidePanel && !state.sidebarCollapsed) {
    collapsePanelSidebar({ restoreFocus: true });
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

els.panelSidebarBackdrop.addEventListener("click", () => {
  collapsePanelSidebar({ restoreFocus: true });
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

  if (kind === "preset" && (value === "custom" || MODEL_PRESETS[value])) {
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
    await withConversationEdit((conversation) => regenerateFromMessage(conversation, index), { checkMessages: true });
  } else if (action === "continue") {
    await withConversationEdit((conversation) => continueFromMessage(conversation, index), { checkMessages: true });
  } else if (action === "delete") {
    await withConversationEdit((conversation) => deleteMessage(conversation, index), { checkMessages: true });
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

function applyPromptPreset(id, { fromSidebar = false } = {}) {
  if (id && !getPromptTemplate(id)) return;
  if (fromSidebar && !requestCloseSettingsPage()) return;
  if (fromSidebar) collapsePanelSidebar();
  els.promptTemplateSelect.value = id;
  els.presetDetails.open = false;
  setComposerMode("chat");
  syncCustomSelects();
  resizePromptInput({ keepCaretVisible: true });
}

els.promptTemplateSelect.addEventListener("change", () => {
  applyPromptPreset(els.promptTemplateSelect.value);
});

els.removePreset.addEventListener("click", () => applyPromptPreset(""));
els.presetDetails.addEventListener("toggle", updateComposerSafeSpace);

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
  if (activeSettingsTab === "model" && !await requestConfiguredEndpointPermission()) {
    restoreSettingsKeys(MODEL_SETTINGS_KEYS);
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
  state.settings = { ...DEFAULT_SETTINGS, modelConfigs: {} };
  state.conversations = [];
  state.conversationFolders = [];
  state.promptTemplates = [];
  startConversationDraft();
  state.promptTemplateDirty = false;
  try {
    await replaceSharedWorkspace();
  } catch {
    pushSystemMessage(t("workspaceStorageFailed"));
    await refreshSharedWorkspace();
    return;
  }
  captureSettingsSnapshot();
  render();
  clearComposerInput({ focus: true });
  pushSystemMessage(t("factoryResetDone"));
});

function openNewConversation(mode) {
  closeSettingsMenu();
  if (!requestCloseSettingsPage()) {
    return;
  }
  state.conversationSearchQuery = "";
  setConversationSearchOpen(false);
  startConversationDraft(mode);
  collapsePanelSidebar();
  render();
  clearComposerInput({ focus: true });
}

els.newChat.addEventListener("click", () => openNewConversation("chat"));
els.sidebarTranslateTool?.addEventListener("click", () => openNewConversation("translate"));

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
  event.preventDefault();
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
    state.conversations = readStoredConversations(imported.conversations);
    state.draftConversation = null;
    state.conversationFolders = Array.isArray(imported.conversationFolders) ? imported.conversationFolders : [];
    state.promptTemplates = Array.isArray(imported.promptTemplates) ? imported.promptTemplates : [];
    state.activeConversationId = imported.activeConversationId || state.conversations[0]?.id || "";
    migrateOllamaSettings();
    state.composerMode = getConversationMode(getActiveConversation());
    await replaceSharedWorkspace();
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
  state.draftConversation = null;
  const conversation = state.conversations.find((entry) => entry.id === state.activeConversationId);
  state.composerMode = getConversationMode(conversation);
  collapsePanelSidebar();
  await saveConversations();
  render();
  if (shouldClearComposer) {
    clearComposerInput({ focus: true });
  } else if (isSidePanel) {
    els.promptInput.focus();
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
  const promptPreset = selectedPromptPresetSnapshot();
  const requestPrompt = state.composerMode === "translate"
    ? buildTranslationRequestPrompt(prompt)
    : composePresetPrompt(prompt, promptPreset);
  await withConversationEdit((conversation) => submitPrompt(conversation, prompt, { requestPrompt, promptPreset }));
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

els.stopButton.addEventListener("click", () => {
  state.activePort?.postMessage({ type: "llm:chat:stop" });
});

systemThemeQuery?.addEventListener("change", () => {
  if (getThemeMode() === "system") {
    applyTheme();
  }
});

extensionApi.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && SHARED_WORKSPACE_KEYS.some((key) => Object.hasOwn(changes, key))) {
    refreshSharedWorkspace();
  } else if (area === "session" && workspaceTab && extensionApi.sidePanel?.close) {
    const visibility = changes[`workspaceSidePanel:${workspaceTab.windowId}`];
    if (visibility) updateWorkspaceSidePanel(Boolean(visibility.newValue));
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
    state.composerMode = getConversationMode(getActiveConversation());
  }
  await saveConversations();
  render();
  if (wasActiveConversation) {
    clearComposerInput({ focus: true });
  }
}
