# Chrome Web Store Review Notes

## Product

- Name: lemon cha
- Type: Manifest V3 browser extension
- Primary purpose: Browser AI chat workspace for user-configured LLM APIs and local Ollama models

## Reviewer walkthrough

1. Open the extension action to launch the lemon cha chat page.
2. Open Settings.
3. Configure either:
   - An OpenAI-compatible provider endpoint and API key, or
   - A local Ollama endpoint such as `http://127.0.0.1:11434/api/chat`
4. Save the settings.
5. Send a chat prompt and observe streaming response rendering.

## Local Ollama notes

The extension can test `/api/tags` and chat through `/api/chat`. A local Ollama instance may require its own CORS/origin configuration before extension requests are accepted.

## Data handling

- Settings, API keys, prompt presets, and conversation history are stored locally in extension storage.
- lemon cha does not operate a backend service.
- Requests go directly to the user-configured endpoint.

## Remote code

No remote code is loaded or executed by the extension UI.
