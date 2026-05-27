export type IconName =
  | "dashboard"
  | "tasks"
  | "contract"
  | "development"
  | "content"
  | "insights"
  | "workflow"
  | "logs"
  | "spark"
  | "shield"
  | "code"
  | "document"
  | "trend"
  | "agent"
  | "play"
  | "plug"
  | "search"
  | "upload"
  | "sun"
  | "moon"
  | "chevronLeft"
  | "chevronRight";

export type TaskType = "contract" | "dev" | "content" | "data" | "workflow";

export type TaskStatus =
  | "draft"
  | "queued"
  | "planning"
  | "running"
  | "validating"
  | "completed"
  | "failed";

export type AgentRole = "planner" | "executor" | "validator";

export type TaskCenterViewState =
  | "default"
  | "loading"
  | "success"
  | "empty"
  | "error";

export type AgentStepStatus =
  | "waiting"
  | "running"
  | "completed"
  | "failed"
  | "idle";

export type ServiceStatus = "healthy" | "degraded" | "offline";

export type TrendDirection = "up" | "down";

export type Task = {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  inputSummary: string;
  createdAt: string;
  updatedAt: string;
  owner?: string;
  progress?: number;
  detailHref?: string;
};

export type AgentStep = {
  id: string;
  agent: AgentRole;
  title: string;
  status: "waiting" | "running" | "completed" | "failed";
  summary: string;
  timestamp: string;
};

export type WorkflowNode = {
  id: string;
  type:
    | "start"
    | "input"
    | "upload"
    | "agent"
    | "kb"
    | "condition"
    | "approval"
    | "sign"
    | "notify"
    | "end";
  label: string;
  config: Record<string, unknown>;
};

export type ContractRisk = {
  id: string;
  level: "high" | "medium" | "low";
  clause: string;
  issue: string;
  suggestion: string;
};

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: IconName;
  matchPrefixes: string[];
};

export type PageMeta = {
  eyebrow: string;
  title: string;
  description: string;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  direction: TrendDirection;
  description: string;
};

export type QuickAction = {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  ctaLabel: string;
  href: string;
  inputHint: string;
  icon: IconName;
};

export type CapabilityCard = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  stats: string;
  hint: string;
};

export type AgentStatusCardData = {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStepStatus;
  currentAction: string;
  outputSummary: string;
  timestamp: string;
  latency: string;
  queueDepth: number;
};

export type WorkflowTemplate = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  successRate: string;
  lastRun: string;
  href: string;
};

export type PlatformService = {
  id: string;
  name: string;
  status: ServiceStatus;
  description: string;
  latency: string;
};

export type DashboardOverview = {
  spotlight: {
    title: string;
    description: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
      href: string;
    };
  };
  metrics: DashboardMetric[];
  quickActions: QuickAction[];
  capabilities: CapabilityCard[];
  recentTasks: Task[];
  agents: AgentStatusCardData[];
  workflowTemplates: WorkflowTemplate[];
  services: PlatformService[];
};

export type ModulePlaceholderData = {
  title: string;
  description: string;
  checklist: string[];
  integrationPoints: string[];
};

export type UploadFileStatus = "parsed" | "uploading" | "failed";

export type UploadFileItem = {
  id: string;
  name: string;
  size: string;
  kind: "contract" | "requirements" | "spreadsheet" | "brief";
  status: UploadFileStatus;
};

export type TaskIntentSignal = {
  id: string;
  label: string;
  type: TaskType;
  confidence: number;
  reason: string;
  priority: "high" | "medium" | "low";
};

export type TaskFlowStep = {
  id: string;
  title: string;
  agent: AgentRole;
  description: string;
  status: "ready" | "active" | "pending";
  icon: IconName;
};

export type TaskCenterTemplate = {
  id: string;
  title: string;
  summary: string;
  type: TaskType;
  href: string;
};

export type TaskCenterSnapshot = {
  title: string;
  summary: string;
  actionLabel: string;
  notice: string;
  noticeTone: "neutral" | "success" | "warning" | "danger";
  tasks: Task[];
  generatedTask?: Task;
};

export type TaskCenterData = {
  hero: {
    title: string;
    description: string;
  };
  draftInput: string;
  promptPresets: string[];
  acceptedFileTypes: string[];
  uploads: UploadFileItem[];
  recognizedSignals: TaskIntentSignal[];
  recommendedFlow: TaskFlowStep[];
  templates: TaskCenterTemplate[];
  serviceHints: PlatformService[];
  stateSnapshots: Record<TaskCenterViewState, TaskCenterSnapshot>;
  integrationPoints: string[];
};

export type ContractTypeOption =
  | "labor"
  | "procurement"
  | "nda"
  | "service"
  | "custom";

export type ContractTemplate = {
  id: string;
  title: string;
  description: string;
  category: string;
  href: string;
};

export type ContractCaseReference = {
  id: string;
  title: string;
  summary: string;
  riskLevel: "high" | "medium" | "low";
  source: string;
};

export type ContractExportOption = {
  id: string;
  label: string;
  description: string;
};

export type ContractReviewSnapshot = {
  title: string;
  summary: string;
  status: TaskStatus;
  notice: string;
  noticeTone: "neutral" | "success" | "warning" | "danger";
  riskCountLabel: string;
  risks: ContractRisk[];
  suggestions: string[];
};

export type ContractReviewData = {
  hero: {
    title: string;
    description: string;
  };
  contractTypes: Array<{
    id: ContractTypeOption;
    label: string;
    description: string;
  }>;
  defaultType: ContractTypeOption;
  uploads: UploadFileItem[];
  templates: ContractTemplate[];
  cases: ContractCaseReference[];
  exportOptions: ContractExportOption[];
  stateSnapshots: Record<TaskCenterViewState, ContractReviewSnapshot>;
  integrationPoints: string[];
};

export type DevelopmentStackId =
  | "next-fastapi"
  | "react-node"
  | "vue-go"
  | "python-automation";

export type DevelopmentStackOption = {
  id: DevelopmentStackId;
  label: string;
  description: string;
  tags: string[];
};

export type CodeArtifact = {
  id: string;
  title: string;
  filename: string;
  language: string;
  summary: string;
  content: string;
};

export type ApiSuggestion = {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  payload: string[];
};

export type TestSuggestion = {
  id: string;
  title: string;
  level: "critical" | "important" | "nice";
  description: string;
};

export type PipelineSuggestion = {
  id: string;
  stage: string;
  tool: string;
  description: string;
};

export type IntegrationPlaceholder = {
  id: string;
  name: string;
  status: "ready" | "planned" | "blocked";
  description: string;
};

export type DevelopmentSnapshot = {
  title: string;
  summary: string;
  status: TaskStatus;
  notice: string;
  noticeTone: "neutral" | "success" | "warning" | "danger";
  actionLabel: string;
  codeArtifacts: CodeArtifact[];
  apiSuggestions: ApiSuggestion[];
  testSuggestions: TestSuggestion[];
  pipelineSuggestions: PipelineSuggestion[];
};

export type DevelopmentAssistantData = {
  hero: {
    title: string;
    description: string;
  };
  requirementInput: string;
  presets: string[];
  stackOptions: DevelopmentStackOption[];
  defaultStack: DevelopmentStackId;
  integrations: IntegrationPlaceholder[];
  stateSnapshots: Record<TaskCenterViewState, DevelopmentSnapshot>;
  integrationPoints: string[];
};

export type ContentStyleId =
  | "professional"
  | "warm"
  | "direct"
  | "launch";

export type ContentPlatformId =
  | "website"
  | "wechat"
  | "xiaohongshu"
  | "douyin"
  | "linkedin";

export type ContentStyleOption = {
  id: ContentStyleId;
  label: string;
  description: string;
};

export type ContentPlatformOption = {
  id: ContentPlatformId;
  label: string;
  description: string;
};

export type GeneratedTitle = {
  id: string;
  title: string;
  tone: string;
};

export type GeneratedCopyBlock = {
  id: string;
  heading: string;
  summary: string;
  content: string;
};

export type PlatformRewrite = {
  id: string;
  platform: ContentPlatformId;
  title: string;
  description: string;
  content: string;
};

export type PosterPrompt = {
  id: string;
  title: string;
  prompt: string;
};

export type ComplianceIssue = {
  id: string;
  level: "high" | "medium" | "low";
  title: string;
  detail: string;
  suggestion: string;
};

export type ContentGenerationSnapshot = {
  title: string;
  summary: string;
  status: TaskStatus;
  notice: string;
  noticeTone: "neutral" | "success" | "warning" | "danger";
  actionLabel: string;
  generatedTitles: GeneratedTitle[];
  copyBlocks: GeneratedCopyBlock[];
  rewrites: PlatformRewrite[];
  posterPrompts: PosterPrompt[];
  complianceIssues: ComplianceIssue[];
};

export type ContentStudioData = {
  hero: {
    title: string;
    description: string;
  };
  topicInput: string;
  presets: string[];
  styleOptions: ContentStyleOption[];
  defaultStyle: ContentStyleId;
  platformOptions: ContentPlatformOption[];
  defaultPlatforms: ContentPlatformId[];
  stateSnapshots: Record<TaskCenterViewState, ContentGenerationSnapshot>;
  integrationPoints: string[];
};

export type InsightRangeId = "7d" | "30d" | "90d" | "12m";

export type InsightRangeOption = {
  id: InsightRangeId;
  label: string;
  description: string;
};

export type InsightSeriesPoint = {
  label: string;
  revenue: number;
  cost: number;
  cashflow: number;
};

export type InsightForecastPoint = {
  label: string;
  actual: number;
  forecast: number;
};

export type InsightAlert = {
  id: string;
  level: "high" | "medium" | "low";
  title: string;
  summary: string;
  action: string;
};

export type InsightRecommendation = {
  id: string;
  title: string;
  detail: string;
};

export type InsightUploadSource = {
  id: string;
  name: string;
  size: string;
  updatedAt: string;
  status: UploadFileStatus;
};

export type InsightRangeDataset = {
  metrics: DashboardMetric[];
  trendSeries: InsightSeriesPoint[];
  forecastSeries: InsightForecastPoint[];
  summary: string;
};

export type InsightSnapshot = {
  title: string;
  summary: string;
  status: TaskStatus;
  notice: string;
  noticeTone: "neutral" | "success" | "warning" | "danger";
  actionLabel: string;
  datasets: Record<InsightRangeId, InsightRangeDataset>;
  alerts: InsightAlert[];
  recommendations: InsightRecommendation[];
};

export type InsightStudioData = {
  hero: {
    title: string;
    description: string;
  };
  rangeOptions: InsightRangeOption[];
  defaultRange: InsightRangeId;
  uploads: InsightUploadSource[];
  stateSnapshots: Record<TaskCenterViewState, InsightSnapshot>;
  integrationPoints: string[];
};

export type WorkflowTab = "editor" | "executions";

export type WorkflowLibraryGroup = "trigger" | "input" | "ai" | "logic" | "human" | "output";

export type WorkflowNodeKind = "card" | "resource";

export type WorkflowNodeVisualState =
  | "idle"
  | "active"
  | "success"
  | "warning"
  | "error";

export type WorkflowPortSide = "top" | "right" | "bottom" | "left";

export type WorkflowNodeField = {
  label: string;
  value: string;
};

export type WorkflowNodeCard = WorkflowNode & {
  title: string;
  subtitle: string;
  icon: IconName;
  kind: WorkflowNodeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  state: WorkflowNodeVisualState;
  badges?: string[];
  fields: WorkflowNodeField[];
  notes?: string[];
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceSide: WorkflowPortSide;
  targetSide: WorkflowPortSide;
  style: "solid" | "dashed";
  label?: string;
};

export type WorkflowLibraryItem = {
  id: string;
  group: WorkflowLibraryGroup;
  label: string;
  description: string;
  icon: IconName;
  type: WorkflowNode["type"];
};

export type WorkflowExecutionLog = {
  id: string;
  nodeId: string;
  title: string;
  status: TaskStatus;
  startedAt: string;
  duration: string;
  detail: string;
};

export type WorkflowExecutionRun = {
  id: string;
  status: TaskStatus;
  startedAt: string;
  duration: string;
  trigger: string;
  summary: string;
};

export type WorkflowTemplateScenario = {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  nodeCount: number;
  integrations: string[];
  defaultSelectedNodeId: string;
  nodes: WorkflowNodeCard[];
  edges: WorkflowEdge[];
};

export type WorkflowSnapshot = {
  title: string;
  summary: string;
  status: TaskStatus;
  notice: string;
  noticeTone: "neutral" | "success" | "warning" | "danger";
  actionLabel: string;
  savedAt: string;
  executionLogs: WorkflowExecutionLog[];
  recentRuns: WorkflowExecutionRun[];
};

export type WorkflowStudioData = {
  workflowName: string;
  workflowSubtitle: string;
  nodeLibrary: WorkflowLibraryItem[];
  templates: WorkflowTemplateScenario[];
  defaultTemplateId: string;
  stateSnapshots: Record<TaskCenterViewState, WorkflowSnapshot>;
  integrationPoints: string[];
};

export type RunArtifactStatus = "ready" | "pending" | "failed";

export type RunArtifact = {
  id: string;
  label: string;
  kind: "report" | "document" | "dataset" | "link";
  format: string;
  status: RunArtifactStatus;
  summary: string;
};

export type RunTimelineStep = {
  id: string;
  stage: AgentRole | "system";
  title: string;
  owner: string;
  status: TaskStatus;
  startedAt: string;
  duration: string;
  detail: string;
  output?: string;
  nodeLabel?: string;
};

export type RunRelatedLink = {
  id: string;
  label: string;
  href: string;
  hint: string;
};

export type RunDetailSnapshot = {
  title: string;
  summary: string;
  status: TaskStatus;
  notice: string;
  noticeTone: "neutral" | "success" | "warning" | "danger";
  actionLabel: string;
  progressLabel: string;
  agentCards: AgentStatusCardData[];
  timeline: RunTimelineStep[];
  artifacts: RunArtifact[];
  risks: ContractRisk[];
};

export type RunDetailData = {
  hero: {
    title: string;
    description: string;
  };
  task: Task;
  workflow: {
    title: string;
    runId: string;
    traceId: string;
    trigger: string;
    duration: string;
    lastUpdated: string;
    templateHref: string;
  };
  inputs: UploadFileItem[];
  stateSnapshots: Record<TaskCenterViewState, RunDetailSnapshot>;
  relatedLinks: RunRelatedLink[];
  integrationPoints: string[];
};

export type ConnectedMockScenario = {
  id: string;
  taskCenter: {
    hero: TaskCenterData["hero"];
    draftInput: string;
    promptPresets: string[];
    acceptedFileTypes: string[];
    uploads: UploadFileItem[];
    recognizedSignals: TaskIntentSignal[];
    recommendedFlow: TaskFlowStep[];
  };
  task: Task;
  workflow: {
    workflowName: string;
    workflowSubtitle: string;
    nodeLibrary: WorkflowLibraryItem[];
    templates: WorkflowTemplateScenario[];
    defaultTemplateId: string;
    stateSnapshots: Record<TaskCenterViewState, WorkflowSnapshot>;
    integrationPoints: string[];
  };
  run: {
    hero: RunDetailData["hero"];
    workflow: RunDetailData["workflow"];
    stateSnapshots: Record<TaskCenterViewState, RunDetailSnapshot>;
    relatedLinks: RunRelatedLink[];
    integrationPoints: string[];
  };
};
