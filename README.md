# llmon cha Chrome Extension

一个零构建步骤的 Chrome 插件，用弹出式聊天窗口连接两类模型服务：

- 自定义 LLM API：默认使用 OpenAI Chat Completions 兼容格式。
- Ollama 本地模型：默认直连 `http://127.0.0.1:11434/api/chat`。
- 请求由 Chrome extension background service worker 发出，并对本地 Ollama 请求自动修正 Origin。
- 支持流式输出、停止生成、Markdown 展示、代码块复制、多会话保存、会话重命名、删除单条对话、导入/导出记录、清空全部历史。

## 安装

1. 打开 Chrome，进入 `chrome://extensions/`。
2. 开启右上角的“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择这个目录：`/Users/georgehuang/Documents/New project`。
5. 点击浏览器工具栏里的扩展图标，插件会打开一个独立标签页开始使用。

## 开发验证

本项目不引入前端框架和打包器，使用轻量 npm 脚本做基础校验和构建：

```bash
npm run lint
npm run typecheck
npm run build
```

- `npm run lint`：检查扩展必要文件、Manifest V3 配置、HTML 静态资源引用和 JavaScript 语法。
- `npm run typecheck`：当前项目是原生 JavaScript，没有 TypeScript 类型检查；此命令会执行 JavaScript 语法检查，作为轻量替代。
- `npm run build`：复制扩展运行所需文件到 `dist/llmon-cha`。

构建后也可以在 `chrome://extensions/` 中加载 `dist/llmon-cha` 进行验证。

## 自定义 API 配置

设置为“自定义 API”后填写：

- 接口地址，例如 `https://api.openai.com/v1/chat/completions`
- 模型名，例如 `gpt-4o-mini`
- API Key，如果服务端不需要鉴权可以留空
- 接口格式：OpenAI Chat Completions 或 Ollama `/api/chat`
- 思考模式：Ollama 格式会发送 `think` 参数；OpenAI 兼容格式会追加一个保守 system 提示，引导模型充分分析但不输出完整隐藏思维过程。
- 界面语言：支持简体中文、繁體中文和 English。

如果接口格式选择 OpenAI Chat Completions，并且你只填写了域名或 `/v1`，插件会自动补全到 `/v1/chat/completions`。如果服务商使用自己的路径，请填写完整聊天接口地址。

所有模型服务都在“自定义 API”设置里配置。Ollama 通过“接口格式：Ollama /api/chat”和“Ollama 本地模型”预设接入，不再需要单独的服务商标签。

内置预设包括 DeepSeek、OpenAI、通义千问 DashScope、Kimi、SiliconFlow、OpenRouter、Groq 和 Ollama 本地模型。DeepSeek 预设使用官方 HTTP 示例路径：

```text
https://api.deepseek.com/chat/completions
```

## 对话管理

- 点击“新建对话”创建一个新的会话。
- 点击左侧对话项切换历史会话。
- 对话项右侧的 `✎` 可以重命名。
- 对话项右侧的 `×` 可以删除单条对话。
- “清空当前”只清空当前会话内容。
- “清空历史”会删除所有会话并创建一个空白新会话。
- “导出记录”会下载包含设置和全部对话的 JSON 文件。
- “导出 Markdown”会把当前对话导出为 `.md` 文件。
- “导入记录”会用 JSON 文件覆盖当前设置和对话历史。
- 导出/导入也会包含自定义 Prompt 模板。

## 消息操作

每条消息右上角提供操作：

- 复制：复制单条消息内容。
- 重生成：从该消息对应上下文重新生成后续回复。
- 继续：截断该消息之后的历史，并从这里继续生成。
- 删除：删除单条消息。

## 模型健康状态

顶部状态栏提供“检查连接”：

- Ollama 格式会检查 `/api/tags` 并确认当前模型是否存在。
- OpenAI 兼容格式会发送一次轻量 ping 请求，确认接口、模型和 Key 是否可用。

## 生成体验

- 发送后会流式显示模型回复。
- 生成过程中“发送”按钮会切换成“停止”，点击后会中止当前请求并保留已生成内容。
- 本地模型响应较慢时，会先显示“模型正在思考”的动态反馈，顶部也会显示生成状态。
- Assistant 消息底部会显示本轮耗时、首 token 时间、近似 token 数；Ollama 会尽量显示本地推理耗时。
- 第一轮对话完成后，会自动请求模型生成更准确的会话标题；失败时静默保留原标题。
- Assistant 回复会渲染基础 Markdown，包括段落、列表、加粗、行内代码和代码块。
- 代码块右上角有“复制”按钮。
- 输入框固定在页面底部，长对话滚动时不会离开视野。
- 顶部“隐藏侧栏 / 显示侧栏”可以收起或展开左侧历史面板。

## Prompt 模板

输入框上方提供 Prompt 预设：

- 内置模板包括总结提炼、翻译润色、代码审查、问题排查、写作改稿、任务规划。
- 选择模板会把模板内容填入输入框；如果输入框已有内容，会把模板追加到现有内容前面。
- “保存为模板”会把当前输入框内容保存为自定义模板。
- “删除模板”只会删除自定义模板，不会删除内置模板。

请求体格式：

```json
{
  "model": "模型名",
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ],
  "temperature": 0.7
}
```

## Ollama 配置

先确认 Ollama 已启动，并已下载模型：

```bash
ollama serve
ollama pull llama3.1
```

插件默认优先直连 Ollama：

- 接口地址：`http://127.0.0.1:11434/api/chat`
- 模型名：`llama3.1`

`11434` 是 Ollama 默认端口。插件不会再依赖额外的 Node 本地代理进程；如果直连失败，需要修正 Ollama 的启动配置或扩展来源权限。

连接策略：

- 默认地址为 `http://127.0.0.1:11434/api/chat`。
- 设置里可以自定义 Ollama URL。
- 输入 `localhost` 会自动规范为 `127.0.0.1`。
- 插件使用 `/api/tags` 获取模型列表和检查连接。
- 插件使用 `/api/chat` 进行多轮对话和流式输出。
- 对 `127.0.0.1` / `localhost` 的本地 Ollama 请求，background 会自动把请求头 `Origin` 修正为本地 Ollama 的 origin，作为 CORS/Origin 兜底。

### Chrome 插件请求 Ollama 返回 403

如果聊天窗口显示 `请求失败 403：Forbidden`，通常是 Ollama 拒绝了 Chrome 扩展的来源。重启 Ollama 时允许扩展来源即可。

处理方式是允许扩展来源。

macOS Ollama App：

```bash
launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"
```

然后从菜单栏完全退出 Ollama，再重新打开 Ollama App。只在终端里运行 `OLLAMA_ORIGINS=... ollama serve` 不会影响已经由 macOS App 启动的 Ollama。

macOS/Linux 命令行启动：

```bash
OLLAMA_ORIGINS="chrome-extension://*" ollama serve
```

调试阶段也可以临时放开所有来源：

```bash
OLLAMA_ORIGINS="*" ollama serve
```

Windows PowerShell：

```powershell
$env:OLLAMA_ORIGINS="chrome-extension://*,http://localhost:*,http://127.0.0.1:*"
ollama serve
```

## 文件结构

- `manifest.json`：Chrome Manifest V3 配置。
- `background.js`：后台请求代理，负责调用自定义 API 和 Ollama。
- `chat.html`：独立标签页聊天界面。
- `styles.css`：界面样式。
- `popup.js`：配置保存、对话上下文和请求逻辑。
