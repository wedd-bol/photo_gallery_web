# Codex 文件存储规则

- 禁止在本仓库内创建 Codex 缓存、运行时下载和临时文件，包括 `.codex/` 和 `.codex-log/`。
- 项目临时文件使用 `F:\CodexData\temp\photo_gallery_web`。
- 依赖缓存使用 `F:\CodexData\dependency-cache`，按工具名建立子目录。
- 其他 Codex 工作缓存使用 `F:\CodexData\home-cache`。
- 缓存不得实际存放在 C:；兼容目录联接的实际目标必须在 F:。
- 项目源码、项目配置和需要交付的成果保存在本仓库。
- 保留用户项目、会话历史和登录凭据。
