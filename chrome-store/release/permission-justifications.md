# Permission Justifications

## `storage`

Used to keep user-controlled local settings inside browser extension storage, including:

- Provider configuration
- API keys entered by the user
- Prompt presets
- Theme and language preferences
- Conversation history and folders

## `unlimitedStorage`

Used to keep long conversation histories and folders in Chrome's local extension storage after they exceed the standard storage quota.

## `sidePanel`

Used to show the same lemon cha workspace in Chrome's native side panel alongside the user's active tab. The panel uses the same local chats and settings as the workspace tab.

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

## Optional host permissions

The manifest declares HTTP and HTTPS sites as eligible for optional access. On an explicit save in Model Settings, lemon cha requests access only to the scheme and hostname of the endpoint entered by the user. This lets users connect their own API gateways and local-network Ollama servers. The endpoint must still accept the connection, including any server-side origin configuration.

Reviewers should note that:

- Requests are initiated only when the user tests a configured endpoint or sends a chat message.
- lemon cha does not inject scripts into arbitrary websites.
- lemon cha uses granted host access for requests to the configured model endpoint.
- The side panel displays only the extension's own chat and settings.
