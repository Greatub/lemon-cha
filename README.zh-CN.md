# lemon cha Browser Extension

[English](README.md)

一个轻量的 Chrome / Firefox 浏览器插件，用独立标签页聊天界面连接两类模型服务：

- 自定义 LLM API：默认使用 OpenAI Chat Completions 兼容格式。
- Ollama 本地模型：默认直连 `http://127.0.0.1:11434/api/chat`。
- 请求由浏览器扩展后台上下文发出，并对本地 Ollama 请求提供直连兜底处理。
- 支持流式输出、停止生成、Markdown 展示、代码块复制、多会话保存、文件夹管理、会话重命名、删除单条对话、Markdown 导出，以及 JSON 导入/导出。

## 在 Chrome 本地安装

1. 打开 Chrome，进入 `chrome://extensions/`。
2. 开启右上角的“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 运行 `npm run build:chrome` 后选择 `dist/lemon-cha`。
5. 点击浏览器工具栏里的扩展图标，插件会打开一个独立标签页开始使用。

## 在 Firefox 本地安装

1. 运行 `npm run build:firefox`。
2. 打开 Firefox，进入 `about:debugging#/runtime/this-firefox`。
3. 点击“Load Temporary Add-on...”或“临时载入附加组件”。
4. 选择 `dist/lemon-cha-firefox/manifest.json`。
5. 点击浏览器工具栏里的扩展图标，插件会打开一个独立标签页开始使用。

## 开发验证

本项目不引入前端框架和打包器，使用轻量 npm 脚本做基础校验和构建：

```bash
npm run lint
npm run typecheck
npm run build
```

- `npm run lint`：检查扩展必要文件、Chrome 和 Firefox Manifest V3 配置、HTML 静态资源引用和 JavaScript 语法。
- `npm run typecheck`：当前项目是原生 JavaScript，没有 TypeScript 类型检查；此命令会执行 JavaScript 语法检查，作为轻量替代。
- `npm run build`：复制扩展运行所需文件到 Chrome 产物 `dist/lemon-cha` 和 Firefox 产物 `dist/lemon-cha-firefox`。
- `npm run build:chrome`：只构建 Chrome 版本。
- `npm run build:firefox`：只构建 Firefox 版本。

Firefox 使用同一套运行时代码，但构建时会生成 Firefox 专用 manifest：将 Chrome 的 `background.service_worker` 换成 Firefox 的 `background.scripts`，并补充 Gecko 扩展设置。

## 自定义 API 配置

设置为“自定义 API”后填写：

- 接口地址，例如 `https://api.openai.com/v1/chat/completions`
- 模型名，例如 `gpt-4o-mini`
- API Key，如果服务端不需要鉴权可以留空
- 接口格式：OpenAI Chat Completions 或 Ollama `/api/chat`
- 思考模式相关设置
- 界面语言、默认回答语言和默认翻译目标语言

如果接口格式选择 OpenAI Chat Completions，并且你只填写了域名或 `/v1`，插件会自动补全到 `/v1/chat/completions`。如果服务商使用自己的路径，请填写完整聊天接口地址。

内置预设包括 DeepSeek、OpenAI、通义千问 DashScope、Kimi、SiliconFlow、OpenRouter、Groq 和 Ollama 本地模型。

## 对话管理

- 创建新对话。
- 从侧栏切换历史会话。
- 使用文件夹组织聊天记录。
- 重命名或删除会话。
- 将当前对话导出为 Markdown。
- 使用 JSON 导入/导出设置、历史和自定义 Prompt 预设。
- 在数据设置中清空历史或恢复出厂设置。

## 消息操作

每条消息可使用紧凑操作：

- 复制
- 重新生成
- 从这里继续
- 删除

## 连接检查

- Ollama 使用 `/api/tags` 检查连接并获取模型列表。
- OpenAI-compatible API 会执行轻量测试请求，验证接口、模型和 Key 是否可用。

## 生成体验

- 发送后流式显示模型回复。
- 生成中可停止请求并保留已生成内容。
- 本地模型响应较慢时会展示动态等待状态。
- 显示本轮耗时、首 token 时间和近似 token 数。
- 第一轮对话完成后自动生成更准确的会话标题。
- 回复支持 Markdown 段落、列表、加粗、代码块和表格。
- 代码块支持一键复制。
- 输入框固定在页面底部。
- 侧栏支持折叠，便于专注阅读。

## Prompt 模板

输入框提供可复用 Prompt 预设：

- 总结提炼
- 翻译润色
- 代码审查
- 问题排查
- 写作改稿
- 任务规划

内置模板已适配简体中文、繁體中文、English、日本語、한국어、Français、Español 和 Deutsch。

应用模板时：

- 输入框为空时，模板会直接替换输入框内容，并自动选中第一个 `{通配词}`。
- 输入框已有内容时，会先提示是否替换。
- 翻译类模板会自动关联设置中的默认翻译目标语言。

## Ollama 配置

先确认 Ollama 已启动，并已下载模型：

```bash
ollama serve
ollama pull llama3.1
```

默认配置：

- 接口地址：`http://127.0.0.1:11434/api/chat`
- 模型名：`llama3.1`

连接策略：

- `localhost` 会自动规范为 `127.0.0.1`。
- 插件使用 `/api/tags` 获取模型列表和检查连接。
- 插件使用 `/api/chat` 进行多轮对话和流式输出。
- 本地 Ollama 请求由扩展后台上下文发起。

### 浏览器插件请求 Ollama 返回 403

如果 Ollama 拒绝浏览器扩展来源，需要重启 Ollama 并允许扩展 origin。

macOS Ollama App：

```bash
launchctl setenv OLLAMA_ORIGINS "chrome-extension://*,moz-extension://*"
```

然后从菜单栏完全退出 Ollama，再重新打开。

macOS/Linux 命令行启动：

```bash
OLLAMA_ORIGINS="chrome-extension://*,moz-extension://*" ollama serve
```

调试阶段也可以临时放开所有来源：

```bash
OLLAMA_ORIGINS="*" ollama serve
```

Windows PowerShell：

```powershell
$env:OLLAMA_ORIGINS="chrome-extension://*,moz-extension://*,http://localhost:*,http://127.0.0.1:*"
ollama serve
```

## 文件结构

- `manifest.json`：源 Chrome Manifest V3 配置。
- `scripts/build-extension.js`：Chrome 和 Firefox 扩展产物构建脚本。
- `background.js`：后台网络与模型请求逻辑。
- `chat.html`：独立标签页聊天界面。
- `styles.css`：视觉系统与响应式布局。
- `popup.js`：状态、设置、会话与界面逻辑。
- `chrome-store/`：Chrome 商店文案、隐私、审核和发布资料。
