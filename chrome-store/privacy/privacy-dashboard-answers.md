# Chrome Web Store Privacy Practices Draft

Use this document as a drafting aid while filling in the Chrome Web Store Developer Dashboard.

## Single purpose

Provide a browser-based AI chat workspace that lets users connect their own cloud LLM APIs or local Ollama models.

## Data collection disclosure

Recommended disclosure:

- Personally identifiable information: **No**, unless a user voluntarily includes it in a conversation sent to their configured provider.
- Health information: **No**, unless a user voluntarily includes it in a conversation sent to their configured provider.
- Financial and payment information: **No**, unless a user voluntarily includes it in a conversation sent to their configured provider.
- Authentication information: **Yes**, because API keys entered by the user are stored locally for requests to the configured provider.
- Personal communications / user-generated content: **Yes**, because chat prompts and model responses can be stored locally and prompts are transmitted when the user sends them.

## Data handling explanation

- Stored locally: API keys, provider settings, prompts, responses, folders, and prompt presets.
- Sent externally only on user action: chat requests to the user-selected provider or local Ollama endpoint.
- lemon cha does not operate a cloud relay and does not receive a copy of user conversations.

## Limited use certification

The disclosures in the dashboard should match:

- The actual extension behavior
- The public privacy policy
- The store listing privacy summary

## Privacy policy URL

Publish the privacy policy from `privacy/privacy-policy.md` to a stable public URL and paste that URL into the dashboard.
