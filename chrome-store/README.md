# Chrome Web Store 上架资料包

本目录用于整理 **lemon cha** 上架 Chrome Web Store 时需要填写、上传和复核的材料。

## 目录

- `listing/store-listing-zh-CN.md`：简体中文商店页文案。
- `listing/store-listing-en-US.md`：英文商店页文案。
- `privacy/privacy-policy.md`：隐私政策草稿。
- `privacy/privacy-dashboard-answers.md`：Chrome Web Store 隐私字段填写建议。
- `release/permission-justifications.md`：权限用途说明。
- `release/review-notes.md`：提交审核时给 Chrome 审核团队的说明。
- `release/release-checklist.md`：发布前检查清单。
- `assets/`：商店图形素材与截图占位说明。

## 官方要求摘要

- 扩展包 ZIP 必须包含有效 `manifest.json`。
- 商店页不能缺少描述、图标或截图。
- 必需图形素材：128×128 图标、至少 1 张截图、440×280 小宣传图。
- 截图建议尺寸：1280×800，最多 5 张，方角、无留白、展示真实体验。
- 隐私字段必须和实际功能、隐私政策一致。

## 建议上架分类

推荐分类：`Productivity`

## 当前建议状态

本项目已经具备：

- MV3 扩展清单
- 128×128 扩展图标
- 本地构建脚本
- 多语言 UI 和 Prompt 模板
- 本地 Ollama 与 OpenAI-compatible API 两套 provider

还需要人工补齐：

- 实际界面截图，建议 3 到 5 张。
- 上架账号中的开发者信息、支持 URL、隐私政策 URL。
- 如计划公开发布，建议将隐私政策发布到可公开访问的网址。
