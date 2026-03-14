import { AgentState } from '../utils/types';

const registry = new Map<string, AgentState>();

export function registerAgent(state: AgentState): void {
  registry.set(state.agentId, state);
}

export function getAgent(agentId: string): AgentState | undefined {
  return registry.get(agentId);
}

// Critical — used to route Discord thread messages to the right bot
export function getAgentByThreadId(threadId: string): AgentState | undefined {
  for (const state of registry.values()) {
    if (state.threadId === threadId) return state;
  }
  return undefined;
}

export function updateAgent(agentId: string, updates: Partial<AgentState>): void {
  const existing = registry.get(agentId);
  if (!existing) return;
  registry.set(agentId, { ...existing, ...updates });
}

export function removeAgent(agentId: string): void {
  registry.delete(agentId);
}

export function getAllAgents(): AgentState[] {
  return Array.from(registry.values());
}
