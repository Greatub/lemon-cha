# Release Checklist

## Build and package

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Load `dist/lemon-cha` in `chrome://extensions/`
- [ ] Package `dist/lemon-cha-extension-0.2.4.zip`
- [ ] Run `unzip -t dist/lemon-cha-extension-0.2.4.zip`

## Functional smoke test

- [ ] Open the dedicated chat page from the extension action.
- [ ] Configure an OpenAI-compatible API preset.
- [ ] Configure and test a local Ollama model if available.
- [ ] Send a prompt and verify streaming output.
- [ ] Apply a prompt preset and verify wildcard selection behavior.
- [ ] Create, rename, move, and delete a conversation.
- [ ] Export a conversation to Markdown.

## Store listing

- [ ] Name and short description reviewed.
- [ ] Full description reviewed.
- [ ] Category selected.
- [ ] Required screenshots uploaded.
- [ ] Small promotional image uploaded.
- [ ] Optional marquee promotional image prepared if desired.

## Privacy and review

- [ ] Privacy practices fields completed.
- [ ] Permission justifications match the current manifest.
- [ ] Public privacy policy URL provided.
- [ ] No API keys or private conversations appear in screenshots.
- [ ] Store listing, privacy policy, and review notes describe the same behavior.

## Packaging command

```bash
npm run build
cd dist
zip -r -X lemon-cha-extension-0.2.4.zip lemon-cha
```
