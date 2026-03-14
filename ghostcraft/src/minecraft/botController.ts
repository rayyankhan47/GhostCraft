import { Bot } from 'mineflayer';
import { log } from '../utils/logger';

// Live bot instances — separate from AgentState (which lives in the registry)
const bots = new Map<string, Bot>();

// Reverse lookup: botUsername → agentId
const usernameToAgentId = new Map<string, string>();

export function registerBot(agentId: string, bot: Bot): void {
  bots.set(agentId, bot);
  usernameToAgentId.set(bot.username, agentId);
  log(`[BotController] Registered bot: ${bot.username} (agent: ${agentId})`);
}

export function getBot(agentId: string): Bot | undefined {
  return bots.get(agentId);
}

// Used by botFactory to look up agentId from a username (e.g. on kick)
export function getAgentByBot(username: string): string | undefined {
  return usernameToAgentId.get(username);
}

export function removeBot(agentId: string): void {
  const bot = bots.get(agentId);
  if (bot) usernameToAgentId.delete(bot.username);
  bots.delete(agentId);
}

export function getBotState(agentId: string): {
  location: { x: number; y: number; z: number };
  inventory: string[];
} | null {
  const bot = bots.get(agentId);
  if (!bot || !bot.entity) return null;

  const pos = bot.entity.position;
  const inventory = bot.inventory.items().map(item => `${item.displayName} x${item.count}`);

  return {
    location: {
      x: Math.floor(pos.x),
      y: Math.floor(pos.y),
      z: Math.floor(pos.z),
    },
    inventory,
  };
}
