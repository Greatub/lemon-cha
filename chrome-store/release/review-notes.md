# Chrome Web Store 审核说明草稿

Product name: lemon cha

Single purpose:

lemon cha provides a dedicated AI chat interface for users to connect their own LLM API providers and local Ollama models.

Core behavior:

- The extension opens a dedicated chat tab when the toolbar icon is clicked.
- Users configure their own model endpoint and API key.
- Messages are sent only to the configured endpoint when the user sends a chat message.
- Local Ollama support uses `http://127.0.0.1:11434`.
- API keys, settings, prompt presets, and conversation history are stored locally in Chrome extension storage.
- The extension does not inject content scripts into web pages.
- The extension does not collect data on the developer’s own servers.
- The extension does not show ads or modify browsing/search behavior.

Permission explanation:

- `storage` is required to persist local settings, API keys, prompt presets, and conversation history.
- `declarativeNetRequestWithHostAccess` is used for local Ollama connection handling.
- Host permissions are required because users can connect local Ollama and user-configured OpenAI-compatible HTTPS endpoints.

Privacy note:

The extension does not operate a backend service. User messages may be transmitted to third-party model providers only when the user configures and uses those providers.
