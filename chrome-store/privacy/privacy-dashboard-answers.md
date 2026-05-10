# Chrome Web Store 隐私字段填写建议

以下内容用于填写 Chrome Web Store Developer Dashboard 的 Privacy practices 页面。

## Single Purpose

llmon cha provides a dedicated browser chat interface for connecting user-configured LLM APIs and local Ollama models.

中文参考：

llmon cha 提供一个独立的浏览器 AI 对话界面，用于连接用户自己配置的 LLM API 和本地 Ollama 模型。

## Permission Justifications

详见 `../release/permission-justifications.md`。

## Data Usage Disclosure

建议选择：

- Authentication information: Yes, if API keys are considered authentication information.
- User content: Yes, because conversation messages are stored locally and sent to the configured model provider when the user sends a chat request.
- Website content: No, unless later增加网页读取/总结功能并主动读取页面内容。
- Personally identifiable information: No, unless the user manually enters such information into chat.

说明：

llmon cha stores API keys, model settings, prompt presets, and conversation history locally in Chrome extension storage. Chat messages are sent only to the model endpoint configured by the user.

## Data Handling Notes

- The extension does not sell user data.
- The extension does not transfer user data to the developer’s own servers.
- The extension does not use user data for advertising.
- The extension does not use user data for creditworthiness or lending purposes.

## Privacy Policy URL

Chrome Web Store 通常需要可公开访问的隐私政策 URL。建议将 `privacy-policy.md` 发布到：

- GitHub Pages
- 产品官网
- Notion/文档站（确保公开可访问）
