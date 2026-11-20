# Release Checklist

## Chrome Web Store status

- Version 0.2.5 was submitted for review on November 19, 2026.
- The submission includes the v2 store icon, small promotional image, and marquee image, plus the `sidePanel` and `unlimitedStorage` permission justifications.

## Build and package

- [x] `npm run lint:chrome`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build:chrome`
- [ ] Load `dist/lemon-cha` in `chrome://extensions/`
- [x] Package `dist/lemon-cha-extension-0.2.6.zip`
- [x] Run `unzip -t dist/lemon-cha-extension-0.2.6.zip`

## Functional smoke test

- [ ] Open the dedicated chat page from the extension action.
- [ ] Click the extension action again and confirm the existing workspace is focused.
- [ ] Open the Chrome side panel from the workspace. Check chat, history, and model settings at narrow width.
- [ ] Make concurrent changes in the workspace and side panel and verify the history is consistent in both views.
- [ ] Configure an OpenAI-compatible API preset.
- [ ] Test granting, denying and revoking access to a custom API host in Chrome.
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
- [x] Small promotional image uploaded.
- [x] Marquee promotional image uploaded.

## Privacy and review

- [ ] Privacy practices fields completed.
- [ ] Permission justifications match the current manifest.
- [ ] Public privacy policy URL provided.
- [ ] No API keys or private conversations appear in screenshots.
- [ ] Store listing, privacy policy, and review notes describe the same behavior.

## Packaging command

```bash
npm run build:chrome
(cd dist/lemon-cha && zip -r -X ../lemon-cha-extension-0.2.6.zip .)
```
