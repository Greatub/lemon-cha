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
### `http://0.0.0.0/*`

Used for local model providers, especially Ollama installations or local-compatible API services configured by the user.

### `https://*/*`

Used because the extension lets users configure their own HTTPS LLM API endpoint rather than being limited to a fixed provider list.

Reviewers should note that:

- Requests are initiated only when the user tests a configured endpoint or sends a chat message.
- lemon cha does not inject scripts into arbitrary websites.
- lemon cha opens its own extension page and communicates only with user-configured model endpoints.
