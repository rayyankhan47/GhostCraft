export type AgentRole = 'lumberjack' | 'miner' | 'farmer' | 'builder';
export type AgentStatus = 'idle' | 'working' | 'complete' | 'error';

export interface AgentState {
  agentId: string;
  role: AgentRole;
  name: string;
  threadId: string;
  statusMessageId: string;
  botUsername: string;
  currentTask: string;
  taskCurrent: number;
  taskTotal: number;
  taskProgress: string;        // e.g. "8/32"
  status: AgentStatus;
  location: { x: number; y: number; z: number };
  inventory: string[];
  createdAt: Date;
  spawnedByCommander: boolean;
}

export interface CommanderPlan {
  analysis: string;
  agents: Array<{
    role: AgentRole;
    task: string;
    reason: string;
  }>;
  summary: string;
}

export interface CommanderState {
  goal: string;
  plan: CommanderPlan | null;
  deployedAgentIds: string[];
  status: 'planning' | 'active' | 'complete';
  embedMessageId: string;
}
