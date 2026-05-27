# n8n 接入说明

## 当前结论

- n8n 仓库已克隆到 `vendor/n8n`
- 编辑器模块位于 `vendor/n8n/packages/frontend/editor-ui`
- 该模块是 `Vue 3 + Vite + @vue-flow/*`
- 它不是可直接塞进当前 `Next.js + React` 项目的 React 组件

## 为什么不能直接把源码接进当前前端

- 当前项目是 React
- n8n editor-ui 是 Vue 3 单页应用
- editor-ui 依赖 n8n 自己的前端 monorepo 包：
  - `@n8n/design-system`
  - `@n8n/stores`
  - `@n8n/rest-api-client`
  - `n8n-workflow`
  - 以及大量 Vue 生态依赖
- 直接把这部分源码搬进当前仓库，等于把当前项目改造成混合 Vue/React 微前端，而不是“接一个模块”

## 已做的事情

- 工作流页已支持两种模式：
  - `平台壳`
  - `n8n Editor`
- 当配置 `NEXT_PUBLIC_N8N_EDITOR_URL` 或 `N8N_EDITOR_URL` 时，`/workflows` 可直接嵌入真实 n8n 编辑器
- 未配置时，页面会展示接入说明和阻塞信息

## 当前本机阻塞

- 当前 Node 版本：`22.15.0`
- n8n monorepo 要求：`>=22.16`
- 当前环境没有 `pnpm`

## 推荐接入方式

1. 单独运行 n8n 服务或 editor-ui
2. 将地址写入环境变量：
   - `NEXT_PUBLIC_N8N_EDITOR_URL=http://localhost:5678/workflow/...`
3. 在当前平台的 `/workflows` 页内嵌入
4. 保留我们的任务中心、执行日志、统一 mock/API 层作为平台壳

## 后续可继续做

- 增加 `n8n` 登录态透传
- 增加 iframe 通信桥，联动当前平台的任务 ID / trace ID
- 在任务中心创建任务后，自动跳转到对应 n8n workflow
- 在执行日志页回链到具体 n8n execution
