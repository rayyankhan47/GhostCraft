import { Bot } from 'mineflayer';
import { goals, Movements } from 'mineflayer-pathfinder';
import { getBot } from './botController';
import { updateAgent } from '../agents/agentRegistry';
import { log, warn, error } from '../utils/logger';

const { GoalBlock } = goals;

// Maps natural language resource names to Minecraft block names
const RESOURCE_MAP: Record<string, string> = {
  'oak log': 'oak_log',
  'oak logs': 'oak_log',
  'wood': 'oak_log',
  'oak wood': 'oak_log',
  'cobblestone': 'cobblestone',
  'stone': 'stone',
  'coal': 'coal_ore',
  'deepslate coal': 'deepslate_coal_ore',
  'iron': 'iron_ore',
  'wheat': 'wheat',
  'dirt': 'dirt',
  'sand': 'sand',
  'gravel': 'gravel',
};

function normalizeResource(input: string): string | null {
  const lower = input.toLowerCase().trim();
  // Direct match
  if (RESOURCE_MAP[lower]) return RESOURCE_MAP[lower];
  // Partial match
  for (const [key, value] of Object.entries(RESOURCE_MAP)) {
    if (lower.includes(key)) return value;
  }
  return null;
}

async function collectResource(
  agentId: string,
  bot: Bot,
  blockName: string,
  count: number,
): Promise<void> {
  const mcData = require('minecraft-data')(bot.version);
  const blockData = mcData.blocksByName[blockName];

  if (!blockData) {
    throw new Error(`Unknown block: ${blockName}`);
  }

  const movements = new Movements(bot);
  movements.allowSprinting = true;
  bot.pathfinder.setMovements(movements);

  let collected = 0;
  const STUCK_TIMEOUT_MS = 60000;

  updateAgent(agentId, { taskTotal: count, taskCurrent: 0, taskProgress: `0/${count}` });

  while (collected < count) {
    // Find the nearest matching block within 64 blocks
    const block = bot.findBlock({
      matching: blockData.id,
      maxDistance: 64,
    });

    if (!block) {
      warn(`[TaskExecutor] No ${blockName} found within 64 blocks for agent ${agentId}`);
      // Wait a moment and try again — bot may need to move first
      await new Promise(r => setTimeout(r, 2000));
      continue;
    }

    // Navigate to the block
    await new Promise<void>((resolve, reject) => {
      const stuckTimer = setTimeout(() => {
        bot.pathfinder.setGoal(null);
        reject(new Error(`Stuck navigating to ${blockName} — timed out after ${STUCK_TIMEOUT_MS / 1000}s`));
      }, STUCK_TIMEOUT_MS);

      bot.pathfinder.setGoal(new GoalBlock(block.position.x, block.position.y, block.position.z));

      bot.once('goal_reached', () => {
        clearTimeout(stuckTimer);
        resolve();
      });
    });

    // Dig the block
    try {
      await bot.dig(block);
      collected++;
      updateAgent(agentId, {
        taskCurrent: collected,
        taskProgress: `${collected}/${count}`,
      });
      log(`[TaskExecutor] Agent ${agentId} collected ${collected}/${count} ${blockName}`);
    } catch (digErr) {
      warn(`[TaskExecutor] Failed to dig block: ${digErr}`);
    }
  }
}

async function returnToSpawn(agentId: string, bot: Bot): Promise<void> {
  const movements = new Movements(bot);
  bot.pathfinder.setMovements(movements);

  await new Promise<void>((resolve) => {
    bot.pathfinder.setGoal(new GoalBlock(0, 64, 0));
    bot.once('goal_reached', () => resolve());
    // Resolve after 30s regardless
    setTimeout(resolve, 30000);
  });

  updateAgent(agentId, { status: 'idle', currentTask: 'Idle — awaiting orders' });
  log(`[TaskExecutor] Agent ${agentId} returned to spawn`);
}

export async function executeTask(agentId: string, taskString: string): Promise<void> {
  const bot = getBot(agentId);
  if (!bot) throw new Error(`No bot found for agent ${agentId}`);

  const task = taskString.trim();
  log(`[TaskExecutor] Agent ${agentId} executing: "${task}"`);

  // Pattern: "collect/mine/chop/harvest N <resource>"
  const collectMatch = task.match(/(?:collect|mine|chop|harvest|get|gather)\s+(\d+)\s+(.+)/i);
  if (collectMatch) {
    const count = parseInt(collectMatch[1], 10);
    const rawResource = collectMatch[2].trim();
    const blockName = normalizeResource(rawResource);

    if (!blockName) {
      updateAgent(agentId, { status: 'error', currentTask: `Unknown resource: ${rawResource}` });
      throw new Error(`Don't know how to collect "${rawResource}"`);
    }

    updateAgent(agentId, { status: 'working', currentTask: task });
    await collectResource(agentId, bot, blockName, count);
    updateAgent(agentId, { status: 'complete' });
    return;
  }

  // Pattern: "come back" / "return to spawn"
  if (/come back|return|go to spawn/i.test(task)) {
    await returnToSpawn(agentId, bot);
    return;
  }

  // Pattern: "stop" / "cancel" / "halt"
  if (/stop|cancel|halt/i.test(task)) {
    bot.pathfinder.setGoal(null);
    updateAgent(agentId, { status: 'idle', currentTask: 'Idle — awaiting orders' });
    log(`[TaskExecutor] Agent ${agentId} stopped`);
    return;
  }

  // Unknown task
  updateAgent(agentId, { status: 'error', currentTask: `Unknown task: ${task}` });
  throw new Error(`Could not parse task: "${task}"`);
}
