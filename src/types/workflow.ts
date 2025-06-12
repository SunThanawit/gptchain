export interface WorkflowNode {
  id: string;
  type: 'prompt' | 'variable' | 'condition' | 'output';
  position: { x: number; y: number };
  data: {
    label: string;
    prompt?: string;
    variables?: Record<string, string>;
    condition?: string;
    outputFormat?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}