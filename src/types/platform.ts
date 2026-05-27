// HoloPracticum Platform Types

export type TaskType = 'contract' | 'dev' | 'content' | 'data' | 'workflow';

export type TaskStatus = 'draft' | 'queued' | 'planning' | 'running' | 'validating' | 'completed' | 'failed';

export type AgentRole = 'planner' | 'executor' | 'validator';

export type AgentStepStatus = 'waiting' | 'running' | 'completed' | 'failed';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  inputSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentStep {
  id: string;
  agent: AgentRole;
  title: string;
  status: AgentStepStatus;
  summary: string;
  timestamp: string;
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'input' | 'upload' | 'agent' | 'kb' | 'condition' | 'approval' | 'sign' | 'notify' | 'end';
  label: string;
  config: Record<string, unknown>;
}

export interface ContractRisk {
  id: string;
  level: 'high' | 'medium' | 'low';
  clause: string;
  issue: string;
  suggestion: string;
}

export interface SystemStatus {
  service: string;
  status: 'online' | 'degraded' | 'offline';
  latency: number;
}

export interface ScenarioCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: TaskType;
  route: string;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  nodeCount: number;
  category: string;
}
