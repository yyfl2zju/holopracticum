
## 总体目标

1. **AI 内容运营台**：从单主题 → 批量选题 + 真实出图 + 深度多平台适配 + 内容资产库
2. **流程编排**：每个工作流可声明 input/output schema
3. **Agent 聊天台**：新模块，类似 Coze，用户自然语言对话，AI 自动选择并调用已发布工作流

---

## 模块一：AI 内容运营台增强

### 1.1 批量主题/选题生成
- 输入区新增「批量模式」Tab：
  - 多行文本（每行一个主题）
  - 或：输入一个「行业/产品」让 AI 一键生成 5/10/20 个选题
- 后端 `generate-content` 增加 `batch: true` 模式，并发 3 个主题；前端展示批量进度条 + 结果列表
- 每条结果可单独展开、复制、加入资产库

### 1.2 AI 配图/海报实际生成
- 新建边缘函数 `generate-poster`：调用 `google/gemini-2.5-flash-image`（Nano Banana），把 poster prompt 真正出图
- 现有「海报提示词」面板每个方案加 `生成图片` 按钮 → 返回 base64 → 直接预览 + 下载
- 失败处理：429/402 错误明确提示用户

### 1.3 深度多平台适配
- `generate-content` prompt 增强，每个平台输出多增加：
  - `cover_suggestion`（封面图建议）
  - `best_post_time`（最佳发布时间段）
  - `risk_keywords`（平台限流词命中列表）
  - `seo_keywords`（小红书/知乎/公众号 关键词）
- 前端在「多平台改写」面板新增标签页 / 小卡片展示这些字段

### 1.4 内容资产库
- 新表 `content_assets`（topic, style, platforms, result jsonb, created_at, user_id, tags）
- 顶部新增「资产库」按钮 → 抽屉/弹窗显示历史，支持：
  - 搜索（按主题/标签）
  - 一键载入再编辑
  - 删除、复制
- 「生成完成」后自动写入资产库

---

## 模块二：流程编排 input/output schema

### 2.1 工作流元数据增强
- `workflows.graph` 中新增字段 `io_schema`：
  ```json
  {
    "input": [
      { "name": "contract_text", "type": "string", "required": true, "desc": "合同正文" },
      { "name": "party_name", "type": "string", "required": false, "default": "" }
    ],
    "output": [
      { "name": "risk_level", "type": "enum", "values": ["low","mid","high"], "desc": "风险等级" },
      { "name": "summary", "type": "string", "desc": "审查摘要" }
    ]
  }
  ```

### 2.2 编辑器 UI
- 顶部工具栏新增 `Schema` 按钮 → 打开抽屉
- 抽屉内两个分区：**输入参数** / **输出字段**，可增删改（名称、类型、是否必填、默认值、描述）
- 保存时连同 graph 一起写库

### 2.3 运行器适配
- `run-workflow` 支持 `inputs: Record<string, any>`（结构化），同时保留旧的 `input: string` 兼容
- `ctx.__inputs.<name>` 暴露给节点；`text-input` / `form-input` 节点自动读取对应字段
- 末尾根据 `output schema` 从 ctx 抽取字段返回（找不到就用最后一步输出兜底）

### 2.4 发布即视为「可被 Agent 调用」
- 「发布」按钮要求工作流必须有 name + 至少 1 个输入 schema，否则禁用
- 已发布的工作流自动出现在 Agent 聊天台的「可用技能」中

---

## 模块三：Agent 聊天台（Coze 风格）

### 3.1 新页面 `/agent`，侧边栏新增入口
- 左侧：会话列表 + 「可用技能」面板（用户已发布的工作流，可勾选启用/禁用）
- 中间：聊天流（user / assistant / tool_call / tool_result 四种气泡）
- 右侧：当前调用的工作流执行轨迹（节点级 step log，复用 workflow_runs 的 steps 字段）

### 3.2 新表
- `agent_conversations` (id, user_id, title, created_at)
- `agent_messages` (id, conversation_id, user_id, role, content, tool_calls jsonb, tool_results jsonb, created_at)

### 3.3 后端 `agent-chat` Edge Function
- 流式 SSE
- 调用 `google/gemini-2.5-flash`，把已发布工作流转成 OpenAI tools 列表：
  ```json
  {
    "type":"function",
    "function":{
      "name": "wf_<workflowId>",
      "description": "<workflow.description>",
      "parameters": { 由 io_schema.input 自动生成 }
    }
  }
  ```
- 用户启用的工作流才会被注入到 tools
- 模型返回 tool_call → 后端调用 `run-workflow`，把结构化 output 回传模型 → 继续生成最终回答
- 多轮，完整 conversation history 全量回传

### 3.4 体验细节
- 工作流执行中聊天气泡显示「⚙ 正在调用：合同审查闭环」+ loading
- 执行完成展示输出摘要 + 「查看完整轨迹」可跳到右侧节点级日志
- 失败（429/402/节点失败）友好提示

---

## 技术细节速览

| 内容 | 技术点 |
|------|--------|
| 出图 | Nano Banana, base64 直显, 大图存 `task-attachments` bucket |
| Schema 校验 | 后端 zod 校验 input 是否符合 schema |
| 工具调用循环 | tool_choice="auto"，最多 5 轮工具调用防死循环 |
| 流式聊天 | SSE，前端逐 token 渲染（已在指引中） |
| Markdown 渲染 | react-markdown + remark-gfm |
| 实时步骤 | 调用 `run-workflow` 后回填 workflow_runs.id，前端聊天页订阅 |

---

## 数据库改动一览

```text
新表:
  content_assets        (内容资产库)
  agent_conversations   (Agent 会话)
  agent_messages        (Agent 消息 + tool calls)
workflows:
  graph.io_schema       (JSON 内增字段，无需 alter)
```

---

## 不在本次范围
- 真正发布到外部平台（小红书/公众号 OAuth）
- 工作流定时触发 / cron
- 把工作流暴露为外部 HTTP API（你选了「平台内置 Agent」单一形态）

---

## 交付顺序
1. 数据库迁移（content_assets + agent_* 两张表）
2. 内容运营台：批量 → 配图 → 深度字段 → 资产库
3. 工作流 IO Schema：编辑器抽屉 + run-workflow 兼容
4. Agent 聊天台：页面壳 → edge function → 工具循环 → 步骤轨迹
