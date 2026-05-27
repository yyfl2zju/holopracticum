<div align="center">

# HoloPracticum

**面向中小企业的一站式 AI Agent 协作与工作流编排平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

[在线体验](https://holopracticum.lovable.app) · [问题反馈](../../issues) · [功能请求](../../issues/new)

</div>

---

## 📖 项目简介

**HoloPracticum** 是一个面向中小企业的 AI Agent 协作平台，将「合同审查、内容生产、数据分析、研发辅助、海报生成」等高频企业场景，统一收敛到一个集「自然语言对话 + 可视化工作流编排」的工作台中。

解决企业使用 AI 时**工具碎片化**的痛点——把 ChatGPT 写文案、合同审查工具、数据分析工具……融合成一个可编排、可复用、有记忆的工作流体系。

## ✨ 核心特性

- 🤖 **多智能体协作** — Planner / Executor / Validator 三角色模型，支持任务拆解、执行与校验
- 🔧 **可视化工作流编排** — 基于 React Flow 的拖拽式画布，支持 AI 节点、人工节点、集成节点
- 🧩 **Workflow-as-Skill** — 工作流可被 Agent 自动识别并作为工具调用（基于 `io_schema` 自描述）
- 📄 **本地文档预处理** — 浏览器端 PDF / Word 文本抽取（pdfjs-dist + mammoth），隐私不出域
- 🎨 **原生多模态** — 集成 Gemini 2.5 Flash，支持图文混合输入与海报图像生成
- 🔐 **企业级安全** — Supabase RLS 行级安全 + 独立 user_roles 表，防止权限提升
- 🌓 **现代化 UI** — shadcn/ui + Tailwind，深色 / 浅色模式无缝切换

## 🏗️ 技术架构

```text
┌─────────────────────────────────────────────────┐
│  前端层 (React + Vite + Tailwind + shadcn/ui)   │
│  · 本地文档预处理   · React Flow 工作流画布      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  BaaS 层 (Supabase)                             │
│  · Auth (Email + Google OAuth)                  │
│  · PostgreSQL + RLS  · Storage  · Realtime      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  AI 编排层 (Supabase Edge Functions / Deno)     │
│  · agent-chat   · run-workflow   · run-task     │
│  · review-contract · generate-content · ...     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  AI 模型层 (Lovable AI Gateway)                 │
│  · Gemini 2.5 Flash / Pro   · GPT-5 系列        │
└─────────────────────────────────────────────────┘
```

## 🛠️ 技术栈

| 类别 | 技术选型 |
| --- | --- |
| 前端框架 | React 18 · TypeScript 5 · Vite 5 |
| UI 组件 | Tailwind CSS · shadcn/ui · Radix UI |
| 状态 / 路由 | TanStack Query · React Router |
| 工作流画布 | React Flow |
| 文档处理 | pdfjs-dist · mammoth |
| 后端 / 数据库 | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| AI 模型 | Gemini 2.5 Flash / Pro · GPT-5 (via Lovable AI Gateway) |

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- npm / pnpm / bun
- Supabase 项目（用于后端能力）

### 本地运行

```bash
# 1. 克隆项目
git clone https://github.com/<your-username>/holopracticum.git
cd holopracticum

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 填入 VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_PROJECT_ID

# 4. 启动开发服务器
npm run dev
```

访问 [http://localhost:8080](http://localhost:8080) 即可预览。

### 构建生产版本

```bash
npm run build
npm run preview
```

## 📂 项目结构

```text
holopracticum/
├── src/
│   ├── pages/              # 页面路由（Dashboard / Agent / Workflow / Content ...）
│   ├── components/         # 通用组件与平台组件
│   ├── layouts/            # 布局组件
│   ├── hooks/              # 自定义 Hooks（useAuth ...）
│   ├── lib/                # 工具函数（extractText / seedSampleData ...）
│   └── integrations/       # Supabase 客户端
├── supabase/
│   ├── functions/          # Edge Functions (Deno)
│   │   ├── agent-chat/
│   │   ├── run-workflow/
│   │   ├── review-contract/
│   │   ├── generate-content/
│   │   ├── generate-poster/
│   │   └── ...
│   └── migrations/         # 数据库迁移
└── public/                 # 静态资源
```

## 🎯 核心功能模块

| 模块 | 说明 |
| --- | --- |
| **控制台** | 任务概览、最近活动、快捷入口 |
| **智能体** | 创建可配置的 AI Agent，支持挂载工作流作为工具 |
| **工作流** | 可视化编排多步骤 AI 流程，支持条件分支与人工节点 |
| **合同审查** | 上传合同自动识别风险条款，输出修改建议 |
| **内容生产** | 多平台（小红书 / 公众号 / 抖音）内容批量生成 |
| **海报生成** | 文生图 + 模板化海报输出 |
| **数据分析** | 上传 CSV / Excel，自动生成洞察与图表 |
| **研发辅助** | 需求拆解、技术方案与代码骨架生成 |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📜 License

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Supabase](https://supabase.com/) — 提供完整 BaaS 能力
- [shadcn/ui](https://ui.shadcn.com/) — 优雅的组件库
- [React Flow](https://reactflow.dev/) — 强大的流程图引擎
- [Lovable](https://lovable.dev/) — AI 驱动的开发平台

---

<div align="center">

如果这个项目对你有帮助，欢迎点一个 ⭐ Star 支持！

</div>