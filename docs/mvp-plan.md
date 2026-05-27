# HoloPracticum Frontend MVP Development Plan

## 1. MVP scope and sequence

The MVP should be developed in this order to keep the product demonstrable while avoiding backend-heavy work too early:

1. Platform shell
   - Next.js project bootstrap
   - Global layout
   - Sidebar, top header, status tokens, shared cards
   - Mock data layer and page routing scaffold
2. Dashboard
   - Welcome area
   - Quick task entry
   - Capability cards
   - Recent tasks
   - Agent status overview
   - Workflow template recommendations
3. Task center
   - Natural language intake
   - File upload entry
   - Task recognition tags
   - Suggested execution flow
   - History
4. Vertical workbenches
   - Contract and document processing
   - Development assistant
   - Content creation
   - Data cockpit
5. Flow and traceability
   - Workflow orchestration
   - Task detail and execution log
6. Integration pass
   - Replace mock fetchers with FastAPI aggregation calls
   - Add Dify and n8n connection settings
   - Add simple analytics and operation logs

## 2. Design and engineering rules

- Use one unified SaaS shell across all pages.
- Keep all pages driven by mock data first.
- Reserve integration seams through typed data loaders.
- Prefer reusable primitives over large third-party UI kits.
- Keep the codebase split by `layout`, `shared`, `dashboard`, `lib`, and route pages.
- Maintain consistent state vocabulary:
  - `draft`
  - `queued`
  - `planning`
  - `running`
  - `validating`
  - `completed`
  - `failed`

## 3. Suggested project structure

```text
src/
  app/
    page.tsx
    tasks/
    contracts/
    development/
    content/
    insights/
    workflows/
    runs/
  components/
    layout/
    dashboard/
    shared/
  lib/
    navigation.ts
    mock-data.ts
    types.ts
    utils.ts
docs/
  mvp-plan.md
```

## 4. Interface reservation strategy

Use mock loaders first, then replace their internals with real fetches:

- `getDashboardOverview()`
- `getModulePlaceholder()`

Planned API seams:

- `POST /api/tasks/intake`
- `GET /api/tasks/history`
- `POST /api/contracts/review`
- `POST /api/dev/generate`
- `POST /api/content/generate`
- `GET /api/insights/overview`
- `GET /api/workflows/templates`
- `GET /api/tasks/{taskId}`

## 5. Current iteration

Iteration M1 delivers:

- Project bootstrap
- Unified layout and design tokens
- Sidebar and top header
- Dashboard page with mock data
- Placeholder routes for upcoming modules
