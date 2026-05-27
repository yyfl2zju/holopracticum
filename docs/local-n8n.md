# 本地 n8n 启动说明

## 当前目录

- 运行目录：`local-services/n8n`
- 便携 Node 运行时：`local-services/runtime/node-v20.20.1-win-x64`
- 启动脚本：`local-services/n8n/start-local.ps1`
- 安装脚本：`local-services/n8n/install-local.ps1`
- 前端连接地址：`.env.local`

## 启动方式

1. 准备本地 Node 运行时：
   - 下载并解压 `Node 20.20.1 win-x64 zip` 到 `local-services/runtime`
2. 在 `local-services/n8n` 下安装依赖：
   - `powershell -ExecutionPolicy Bypass -File .\install-local.ps1`
2. 启动本地 n8n：
   - `npm run start`
3. 打开：
   - `http://localhost:5678`

## 当前配置

- 数据目录：`local-services/n8n/.n8n`
- 运行地址：`http://localhost:5678`
- 已为当前前端配置：
  - `NEXT_PUBLIC_N8N_EDITOR_URL=http://localhost:5678`

## 与当前项目的连接方式

- `/workflows` 页面可以切到 `n8n 编辑器`
- 若 `.env.local` 变更后当前 Next 开发服务还在运行，需要重启 `npm run dev`

## 说明

- 当前通过 `N8N_CONTENT_SECURITY_POLICY` 放开了本地 `localhost:3000/3001` 的 iframe 嵌入
- 当前采用独立 Node 20 运行时，避免影响主项目现有 Node 环境
- 这是为了本地联调方便，不建议直接照搬到生产环境
