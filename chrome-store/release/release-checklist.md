# Release Checklist

## Version 0.2.7 — November 26, 2026

- Release notes: [0.2.7.md](0.2.7.md).
- No changes to permissions, host permissions, data destinations, or remote-code behavior.
- Chrome submission is pending account reauthentication and upload.

## Previous Chrome Web Store status

- Version 0.2.5 was submitted for review on November 19, 2026.
- The submission includes the v2 store icon, small promotional image, and marquee image, plus the `sidePanel` and `unlimitedStorage` permission justifications.

## Build and package

- [x] `npm run lint:chrome`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build:chrome`
- [x] Load the unpacked extension in an isolated Chrome profile and verify preset and model configuration flows.
- [x] Package `dist/lemon-cha-extension-0.2.7.zip`
- [x] Run `unzip -t dist/lemon-cha-extension-0.2.7.zip`

## Functional smoke test

- [ ] Open the dedicated chat page from the extension action.
- [ ] Click the extension action again and confirm the existing workspace is focused.
- [ ] Open the Chrome side panel from the workspace. Check chat, history, and model settings at narrow width.
- [ ] Make concurrent changes in the workspace and side panel and verify the history is consistent in both views.
- [ ] Configure an OpenAI-compatible API preset.
- [ ] Test granting, denying and revoking access to a custom API host in Chrome.
- [ ] Configure and test a local Ollama model if available.
- [ ] Send a prompt and verify streaming output.
- [x] Verify preset selection, switching, cancellation, instruction preview, multilingual hints, and stable composer height.
- [x] Verify independent service/custom model configuration and model-list deduplication.
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
(cd dist/lemon-cha && zip -r -X ../lemon-cha-extension-0.2.7.zip .)
```
