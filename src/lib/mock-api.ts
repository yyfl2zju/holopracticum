import {
  dashboardOverviewMock,
  demoTaskRunMock,
  taskCenterMock,
  workflowStudioMock,
} from "@/lib/mock-data";
import type {
  ConnectedMockScenario,
  RunDetailData,
  Task,
  TaskCenterData,
  TaskCenterTemplate,
  TaskType,
  WorkflowStudioData,
} from "@/lib/types";

function inferTaskTypeFromTemplate(title: string, category: string): TaskType {
  if (category.includes("研发") || title.includes("代码") || title.includes("CI")) {
    return "dev";
  }

  if (category.includes("运营") || title.includes("内容")) {
    return "content";
  }

  if (category.includes("数据")) {
    return "data";
  }

  return "contract";
}

function buildLinkedTask(
  baseTask: Task,
  overrides: Partial<Task> = {},
): Task {
  return {
    ...baseTask,
    detailHref: "/runs/demo-task",
    ...overrides,
  };
}

const connectedContractScenario: ConnectedMockScenario = {
  id: "contract-review-linked-scenario",
  taskCenter: {
    hero: taskCenterMock.hero,
    draftInput: taskCenterMock.draftInput,
    promptPresets: taskCenterMock.promptPresets,
    acceptedFileTypes: taskCenterMock.acceptedFileTypes,
    uploads: demoTaskRunMock.inputs,
    recognizedSignals: taskCenterMock.recognizedSignals,
    recommendedFlow: taskCenterMock.recommendedFlow,
  },
  task: {
    ...demoTaskRunMock.task,
    id: "task-20260315-005",
    title: "劳动合同审查与修订建议",
    status: "validating",
    inputSummary: "审查劳动合同并生成创业公司适用的修改建议版本。",
    createdAt: "2026-03-15 10:31",
    updatedAt: "2026-03-15 10:58",
    owner: "智能任务中心",
    progress: 84,
    detailHref: "/runs/demo-task",
  },
  workflow: {
    workflowName: workflowStudioMock.workflowName,
    workflowSubtitle: workflowStudioMock.workflowSubtitle,
    nodeLibrary: workflowStudioMock.nodeLibrary,
    templates: workflowStudioMock.templates,
    defaultTemplateId: workflowStudioMock.defaultTemplateId,
    stateSnapshots: workflowStudioMock.stateSnapshots,
    integrationPoints: workflowStudioMock.integrationPoints,
  },
  run: {
    hero: demoTaskRunMock.hero,
    workflow: {
      ...demoTaskRunMock.workflow,
      trigger: "智能任务中心 / 劳动合同审查与修订建议",
    },
    stateSnapshots: demoTaskRunMock.stateSnapshots,
    relatedLinks: demoTaskRunMock.relatedLinks,
    integrationPoints: demoTaskRunMock.integrationPoints,
  },
};

function buildTaskTemplates(scenario: ConnectedMockScenario): TaskCenterTemplate[] {
  return scenario.workflow.templates.slice(0, 3).map((template) => ({
    id: template.id,
    title: template.title,
    summary: template.summary,
    type: inferTaskTypeFromTemplate(template.title, template.category),
    href: "/workflows",
  }));
}

function buildTaskCenterData(scenario: ConnectedMockScenario): TaskCenterData {
  const fallbackTasks = dashboardOverviewMock.recentTasks
    .filter((task) => task.id !== scenario.task.id)
    .slice(0, 2);
  const createdTask = buildLinkedTask(scenario.task, {
    status: "planning",
    progress: 12,
    updatedAt: "2026-03-15 10:31",
  });
  const loadingTask = buildLinkedTask(scenario.task, {
    status: "planning",
    progress: 28,
    updatedAt: "2026-03-15 10:33",
  });

  return {
    hero: scenario.taskCenter.hero,
    draftInput: scenario.taskCenter.draftInput,
    promptPresets: scenario.taskCenter.promptPresets,
    acceptedFileTypes: scenario.taskCenter.acceptedFileTypes,
    uploads: scenario.taskCenter.uploads,
    recognizedSignals: scenario.taskCenter.recognizedSignals,
    recommendedFlow: scenario.taskCenter.recommendedFlow,
    templates: buildTaskTemplates(scenario),
    serviceHints: dashboardOverviewMock.services.slice(0, 4),
    stateSnapshots: {
      default: {
        ...taskCenterMock.stateSnapshots.default,
        tasks: [buildLinkedTask(scenario.task, { status: "draft", progress: 0 }), ...fallbackTasks],
      },
      loading: {
        ...taskCenterMock.stateSnapshots.loading,
        tasks: [loadingTask, ...fallbackTasks],
      },
      success: {
        ...taskCenterMock.stateSnapshots.success,
        generatedTask: createdTask,
        tasks: [createdTask, ...fallbackTasks],
      },
      empty: {
        ...taskCenterMock.stateSnapshots.empty,
      },
      error: {
        ...taskCenterMock.stateSnapshots.error,
        tasks: [buildLinkedTask(scenario.task, { status: "failed", progress: 28 }), ...fallbackTasks],
      },
    },
    integrationPoints: taskCenterMock.integrationPoints,
  };
}

function buildWorkflowStudioData(
  scenario: ConnectedMockScenario,
): WorkflowStudioData {
  return {
    workflowName: scenario.workflow.workflowName,
    workflowSubtitle: scenario.workflow.workflowSubtitle,
    nodeLibrary: scenario.workflow.nodeLibrary,
    templates: scenario.workflow.templates,
    defaultTemplateId: scenario.workflow.defaultTemplateId,
    stateSnapshots: scenario.workflow.stateSnapshots,
    integrationPoints: scenario.workflow.integrationPoints,
  };
}

function buildRunDetailData(scenario: ConnectedMockScenario): RunDetailData {
  return {
    hero: scenario.run.hero,
    task: scenario.task,
    workflow: scenario.run.workflow,
    inputs: scenario.taskCenter.uploads,
    stateSnapshots: scenario.run.stateSnapshots,
    relatedLinks: scenario.run.relatedLinks,
    integrationPoints: scenario.run.integrationPoints,
  };
}

export const mockApi = {
  scenarios: {
    async getConnectedContractScenario() {
      return connectedContractScenario;
    },
  },
  tasks: {
    async getTaskCenterData() {
      const scenario = await mockApi.scenarios.getConnectedContractScenario();

      return buildTaskCenterData(scenario);
    },
  },
  workflows: {
    async getWorkflowStudioData() {
      const scenario = await mockApi.scenarios.getConnectedContractScenario();

      return buildWorkflowStudioData(scenario);
    },
  },
  runs: {
    async getDemoTaskRunData() {
      const scenario = await mockApi.scenarios.getConnectedContractScenario();

      return buildRunDetailData(scenario);
    },
  },
};

export async function getTaskCenterMockData() {
  return mockApi.tasks.getTaskCenterData();
}

export async function getWorkflowStudioMockData() {
  return mockApi.workflows.getWorkflowStudioData();
}

export async function getDemoTaskRunMockData() {
  return mockApi.runs.getDemoTaskRunData();
}
