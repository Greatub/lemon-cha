# 权限说明

当前 `manifest.json` 使用以下权限。

## `storage`

用途：

保存用户的本地设置、模型配置、API Key、Prompt 预设、会话历史、界面语言、主题和侧栏状态。

说明：

这些数据保存在 Chrome 扩展本地存储中，用于让用户下次打开插件时继续使用原有配置和对话。

## `declarativeNetRequestWithHostAccess`

用途：

用于本地 Ollama 连接场景下的跨源请求兜底处理，帮助扩展与用户本机 Ollama 服务通信。

说明：

该权限只服务于用户主动配置的本地模型连接，不用于广告、追踪或修改任意网页内容。

## `host_permissions`

当前声明：

- `http://localhost/*`
- `http://127.0.0.1/*`
- `http://0.0.0.0/*`
- `https://*/*`

用途：

- 本地地址用于连接 Ollama 或用户本机自托管模型服务。
- HTTPS 地址用于连接用户配置的 OpenAI-compatible API 服务，例如 DeepSeek、OpenAI、通义千问、Kimi、SiliconFlow、OpenRouter、Groq 或其他兼容服务。

审核风险：

`https://*/*` 范围较宽，Chrome Web Store 审核可能要求解释为什么不能列出固定域名。当前产品支持用户自定义 API 地址，因此需要允许用户连接任意 HTTPS LLM endpoint。

可选降权方案：

如果上架审核被权限范围卡住，可以考虑：

- 首版只保留内置 provider 域名和本地 Ollama 地址。
- 把自定义任意 HTTPS endpoint 作为后续版本能力。
- 或改为在运行时引导用户开启可选 host permissions。
