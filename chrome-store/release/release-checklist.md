# 发布前检查清单

## 代码与构建

- [ ] `manifest.json` 中的 `name`、`description`、`version` 已确认。
- [ ] `npm run lint` 通过。
- [ ] `npm run typecheck` 通过。
- [ ] `npm run build` 通过。
- [ ] 本地加载 `dist/llmon-cha` 测试通过。
- [ ] 测试 DeepSeek 或其他 OpenAI-compatible API 对话。
- [ ] 测试本地 Ollama 对话。
- [ ] 测试无 API Key 或错误配置时的提示。
- [ ] 测试清空历史、恢复出厂设置不会误删非目标数据。

## Chrome Web Store 必填素材

- [x] 128×128 图标：`assets/icon-128.png`
- [ ] 至少 1 张截图，建议 1280×800。
- [ ] 440×280 小宣传图。
- [ ] 详细描述。
- [ ] 分类。
- [ ] 隐私字段。
- [ ] 隐私政策 URL。

## 建议截图

- [ ] 主对话界面。
- [ ] 模型设置。
- [ ] Prompt 预设管理。
- [ ] Ollama 本地模型使用。
- [ ] 深色模式或主题切换。

## 上架前人工确认

- [ ] 没有真实 API Key 写入代码、截图或文档。
- [ ] 截图中没有真实用户对话或隐私信息。
- [ ] 商店描述没有过度堆叠关键词。
- [ ] 权限说明和实际 `manifest.json` 一致。
- [ ] 隐私政策和隐私字段一致。

## 打包命令

```bash
npm run build
cd dist
zip -r llmon-cha-extension-0.1.0.zip llmon-cha
```

上传 ZIP：

`dist/llmon-cha-extension-0.1.0.zip`
