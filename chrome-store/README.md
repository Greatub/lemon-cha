# lemon cha Chrome Web Store Package

This directory contains the store-facing materials for publishing **lemon cha**.

## Contents

- `listing/`: Simplified Chinese and English store listing drafts.
- `privacy/`: Privacy policy draft and dashboard disclosure notes.
- `release/`: Review notes, permission justifications, and release checklist.
- `assets/asset-requirements.md`: Required and recommended image assets for submission.

## Current upload artifact

Build the extension and package it from the repository root:

```bash
npm run build
cd dist
zip -r -X -FS lemon-cha-extension-0.1.0.zip lemon-cha
```

Expected upload file:

`dist/lemon-cha-extension-0.1.0.zip`

## Before submitting

1. Confirm the ZIP loads locally in `chrome://extensions/`.
2. Complete the privacy practices fields in the Chrome Web Store Developer Dashboard.
3. Provide a public privacy policy URL.
4. Add the required screenshots and small promotional image described in `assets/asset-requirements.md`.
