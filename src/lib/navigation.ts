import type { NavItem, PageMeta } from "@/lib/types";

export const navigationItems: NavItem[] = [
  {
    href: "/",
    label: "控制台",
    shortLabel: "总览",
    description: "平台入口、任务概览与系统状态",
    icon: "dashboard",
    matchPrefixes: ["/"],
  },
  {
    href: "/tasks",
    label: "智能任务中心",
    shortLabel: "任务",
    description: "统一接收自然语言任务与上传输入",
    icon: "tasks",
    matchPrefixes: ["/tasks"],
  },
  {
    href: "/contracts",
    label: "合同与文档",
    shortLabel: "合同",
    description: "风险审查、模板生成与案例参考",
    icon: "contract",
    matchPrefixes: ["/contracts"],
  },
  {
    href: "/development",
    label: "开发辅助",
    shortLabel: "开发",
    description: "需求转代码、测试与 CI 建议",
    icon: "development",
    matchPrefixes: ["/development"],
  },
  {
    href: "/content",
    label: "内容创作",
    shortLabel: "内容",
    description: "文案生产、改写与合规校验",
    icon: "content",
    matchPrefixes: ["/content"],
  },
  {
    href: "/insights",
    label: "数据驾驶舱",
    shortLabel: "数据",
    description: "指标图表、预测与风险预警",
    icon: "insights",
    matchPrefixes: ["/insights"],
  },
  {
    href: "/workflows",
    label: "工作流编排",
    shortLabel: "编排",
    description: "可视化编排 Dify 与 n8n 任务流",
    icon: "workflow",
    matchPrefixes: ["/workflows"],
  },
  {
    href: "/runs/demo-task",
    label: "执行日志",
    shortLabel: "日志",
    description: "查看任务执行轨迹与 Agent 留痕",
    icon: "logs",
    matchPrefixes: ["/runs"],
  },
];

const defaultMeta: PageMeta = {
  eyebrow: "HoloPracticum",
  title: "统一 AI 工作台",
  description: "将任务接入 Dify、n8n 与业务聚合层，保持前端平台感和可演示性。",
};

const pageMetaEntries: Array<{ prefixes: string[]; meta: PageMeta }> = [
  {
    prefixes: ["/"],
    meta: {
      eyebrow: "Platform Overview",
      title: "AI Agent 控制台",
      description: "概览平台状态、最近任务、Agent 协同节奏和推荐工作流模板。",
    },
  },
  {
    prefixes: ["/tasks"],
    meta: {
      eyebrow: "Task Intake",
      title: "智能任务中心",
      description: "统一接收自然语言输入、识别任务类型，并分派到后续 Agent 链路。",
    },
  },
  {
    prefixes: ["/contracts"],
    meta: {
      eyebrow: "Document Studio",
      title: "合同与文档处理",
      description: "聚焦合同审查、风险修改建议和模板文书输出的工作台。",
    },
  },
  {
    prefixes: ["/development"],
    meta: {
      eyebrow: "Engineering Desk",
      title: "开发辅助",
      description: "承接需求分析、代码生成、测试建议和 CI/CD 占位集成。",
    },
  },
  {
    prefixes: ["/content"],
    meta: {
      eyebrow: "Content Ops",
      title: "内容创作",
      description: "面向多平台内容生成、改写和合规检查的运营工作台。",
    },
  },
  {
    prefixes: ["/insights"],
    meta: {
      eyebrow: "BI Workspace",
      title: "数据驾驶舱",
      description: "展示核心指标、趋势预测与经营预警的轻量 BI 页面。",
    },
  },
  {
    prefixes: ["/workflows"],
    meta: {
      eyebrow: "Flow Orchestration",
      title: "工作流编排",
      description: "可视化组织 Dify Agent、审批节点和通知节点的编排面板。",
    },
  },
  {
    prefixes: ["/runs"],
    meta: {
      eyebrow: "Execution Trace",
      title: "任务详情与执行日志",
      description: "追踪 Planner、Executor、Validator 的执行过程和输出留痕。",
    },
  },
];

export function getPageMeta(pathname: string): PageMeta {
  if (pathname === "/") {
    return pageMetaEntries[0].meta;
  }

  const matched = pageMetaEntries.find((entry) =>
    entry.prefixes.some((prefix) => prefix !== "/" && pathname.startsWith(prefix)),
  );

  return matched?.meta ?? defaultMeta;
}
