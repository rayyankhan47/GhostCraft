// Implemented in Step 7.2
import { Bot } from 'mineflayer';

const bots = new Map<string, Bot>();

export function registerBot(agentId: string, bot: Bot): void {
  bots.set(agentId, bot);
}

export function getBot(agentId: string): Bot | undefined {
  return bots.get(agentId);
}

export function removeBot(agentId: string): void {
  bots.delete(agentId);
}

export function getBotState(agentId: string): { location: { x: number; y: number; z: number }; inventory: string[] } | null {
  // Implemented in Step 7.2
  void agentId;
  return null;
}
