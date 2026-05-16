# Permission Justifications

## `storage`

Used to keep user-controlled local settings inside browser extension storage, including:

- Provider configuration
- API keys entered by the user
- Prompt presets
- Theme and language preferences
- Conversation history and folders

## `declarativeNetRequestWithHostAccess`

Used only for local Ollama direct-connect support. The extension applies a narrowly scoped dynamic request-header rule for the configured local Ollama origin so browser extension requests can be accepted by a compatible local Ollama setup.

## Host permissions

### `http://localhost/*`
### `http://127.0.0.1/*`

Used for local model providers, especially Ollama installations or local-compatible API services configured by the user on the same device.

### `https://api.deepseek.com/*`

Used for the built-in DeepSeek provider preset.

### `https://api.openai.com/*`

Used for the built-in OpenAI-compatible provider preset.

### `https://openrouter.ai/*`

Used for the built-in OpenRouter provider preset.

### `https://dashscope.aliyuncs.com/*`

Used for the built-in Qwen / DashScope provider preset.

### `https://api.moonshot.ai/*`

Used for the built-in Kimi / Moonshot provider preset.

### `https://api.siliconflow.cn/*`

Used for the built-in SiliconFlow provider preset.

### `https://api.groq.com/*`

Used for the built-in Groq provider preset.

Reviewers should note that:

- Requests are initiated only when the user tests a configured endpoint or sends a chat message.
- lemon cha does not inject scripts into arbitrary websites.
- lemon cha opens its own extension page and communicates only with local Ollama or the listed model provider endpoints.
- Broad HTTPS host access and `http://0.0.0.0/*` are intentionally not requested in this stable store build.
