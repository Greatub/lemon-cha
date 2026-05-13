# lemon cha Chrome Extension

[简体中文](README.zh-CN.md)

lemon cha is a lightweight Chrome extension that opens a dedicated AI chat tab for two kinds of model providers:

- Custom LLM APIs that use an OpenAI Chat Completions-compatible format.
- Local Ollama models, with `http://127.0.0.1:11434/api/chat` as the default endpoint.
- Requests are sent from the Chrome extension background service worker.
- Local Ollama requests include a direct-connect fallback that normalizes the local origin path.
- The interface supports streaming output, stop generation, Markdown rendering, copyable code blocks, multi-session history, folders, rename/delete actions, Markdown export, and JSON import/export.

## Install locally

1. Open Chrome and visit `chrome://extensions/`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select this repository directory.
5. Click the extension action to open lemon cha in a dedicated browser tab.

## Development checks

lemon cha is a lightweight Manifest V3 extension without a frontend bundler. The repository uses npm scripts for validation and packaging:

```bash
npm run lint
npm run typecheck
npm run build
```

- `npm run lint`: validates required extension files, Manifest V3 setup, HTML asset references, and JavaScript syntax.
- `npm run typecheck`: runs a lightweight syntax-oriented validation pass for this vanilla JavaScript project.
- `npm run build`: copies runtime files into `dist/lemon-cha`.

After building, you can also load `dist/lemon-cha` in `chrome://extensions/`.

## Custom API settings

Choose the custom API workflow and configure:

- Endpoint, for example `https://api.openai.com/v1/chat/completions`
- Model name, for example `gpt-4o-mini`
- API key, if the provider requires one
- API format: OpenAI Chat Completions or Ollama `/api/chat`
- Thinking mode behavior
- Interface language, answer language, and default translation target language

If the API format is OpenAI-compatible and the endpoint only contains the domain or `/v1`, lemon cha completes it to `/v1/chat/completions`. Provider-specific paths can still be entered manually.

Built-in provider presets include DeepSeek, OpenAI, Qwen DashScope, Kimi, SiliconFlow, OpenRouter, Groq, and local Ollama.

## Conversation management

- Create new conversations.
- Switch between saved chats from the sidebar.
- Organize chats inside folders.
- Rename or delete conversations.
- Export the current chat as Markdown.
- Import or export JSON records containing conversations, settings, and custom prompt presets.
- Clear history or restore factory defaults from the data settings area.

## Message actions

Each assistant or user message can expose compact actions such as:

- Copy
- Regenerate
- Continue from here
- Delete

## Connection checks

The connection checker supports:

- Ollama `/api/tags` for model discovery and reachability checks
- OpenAI-compatible lightweight test requests for endpoint, model, and API key verification

## Generation experience

- Streaming model responses
- Stop generation while preserving partial output
- Dynamic waiting state for slower local models
- Generation timing and approximate token metrics
- Automatic first-turn conversation title generation
- Markdown rendering for paragraphs, lists, emphasis, code blocks, and tables
- Copy button inside code blocks
- Persistent bottom composer for long conversations
- Collapsible sidebar for a cleaner reading surface

## Prompt presets

The composer includes reusable prompt presets:

- Summarization
- Translation and polishing
- Code review
- Troubleshooting
- Writing revision
- Task planning

Built-in templates are localized for Simplified Chinese, Traditional Chinese, English, Japanese, Korean, French, Spanish, and German.

When a preset is applied:

- If the composer is empty, lemon cha replaces the input and selects the first `{placeholder}`.
- If the composer already contains text, lemon cha asks before replacing it.
- Translation presets can resolve the default translation target language selected in Settings.

## Ollama setup

Start Ollama and install a local model:

```bash
ollama serve
ollama pull llama3.1
```

Default lemon cha settings:

- Endpoint: `http://127.0.0.1:11434/api/chat`
- Model: `llama3.1`

Connection strategy:

- `localhost` is normalized to `127.0.0.1`.
- `/api/tags` is used for model listing and connectivity tests.
- `/api/chat` is used for multi-turn chat and streaming.
- Local Ollama requests are handled from the extension background service worker.

### Ollama 403 / Origin rejection

If Ollama rejects the Chrome extension origin, restart Ollama with extension-origin allowance.

macOS Ollama app:

```bash
launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"
```

Quit the Ollama menu bar app completely, then open it again.

macOS/Linux command line:

```bash
OLLAMA_ORIGINS="chrome-extension://*" ollama serve
```

Temporary broad debug option:

```bash
OLLAMA_ORIGINS="*" ollama serve
```

Windows PowerShell:

```powershell
$env:OLLAMA_ORIGINS="chrome-extension://*,http://localhost:*,http://127.0.0.1:*"
ollama serve
```

## Repository layout

- `manifest.json`: Chrome Manifest V3 configuration
- `background.js`: background networking and provider calls
- `chat.html`: dedicated chat page
- `styles.css`: visual system and responsive layout
- `popup.js`: state, settings, conversations, and UI flows
- `chrome-store/`: Chrome Web Store listing, privacy, review, and release materials
