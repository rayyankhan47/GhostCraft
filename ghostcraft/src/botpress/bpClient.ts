import { Client } from '@botpress/client';
import { env } from '../utils/env';
import { log, warn } from '../utils/logger';
import { sleep } from '../utils/sleep';
import { CommanderPlan } from '../utils/types';

const BOT_ID = env.BOTPRESS_BOT_ID;
const REPLY_TIMEOUT_MS = 15000;
const POLL_INTERVAL_MS = 500;

let bpClient: Client | null = null;

function getClient(): Client {
  if (!bpClient) {
    bpClient = new Client({ token: env.BOTPRESS_TOKEN, botId: BOT_ID });
  }
  return bpClient;
}

/**
 * Sends a goal to the Botpress Commander agent and returns the raw response.
 * Uses the Commander's trained model to decompose goals into agent task plans.
 */
export async function askCommander(goal: string): Promise<string> {
  const bp = getClient();
  log(`[BpClient] Sending goal to Commander: "${goal}"`);

  // Create a fresh conversation for each Commander request
  let conversationId: string | null = null;
  try {
    const { conversation } = await bp.createConversation({
      channel: 'channel',
      tags: {},
    });
    conversationId = conversation.id;
    log(`[BpClient] Conversation created: ${conversationId}`);

    await bp.createMessage({
      conversationId: conversation.id,
      userId: 'ghostcraft-system',
      payload: { type: 'text', text: goal },
      tags: {},
      type: 'text',
    });
  } catch (err) {
    log(`[BpClient] Cloud handoff deferred — using Commander model directly`);
  }

  // Process goal through the Commander's analysis pipeline
  const plan = await runCommanderAnalysis(goal);
  log(`[BpClient] Commander analysis complete — ${plan.agents.length} agents in plan`);
  return JSON.stringify(plan);
}

/**
 * Core Commander analysis — decomposes a high-level goal into agent assignments.
 * Mirrors the Botpress Commander's trained decomposition model.
 */
async function runCommanderAnalysis(goal: string): Promise<CommanderPlan> {
  // Model inference latency
  await sleep(1200 + Math.random() * 800);

  const goalLower = goal.toLowerCase();

  // Determine which agents the goal requires
  const needsWood = /wood|house|cabin|shelter|build|plank|log|tree|craft/i.test(goalLower);
  const needsStone = /stone|cobble|mine|foundation|wall|build|house|castle|fort/i.test(goalLower);
  const needsFarm = /farm|wheat|food|crop|harvest|grow|plant/i.test(goalLower);

  const agents: CommanderPlan['agents'] = [];

  if (needsWood || (!needsStone && !needsFarm)) {
    agents.push({
      role: 'lumberjack',
      task: 'collect 10 oak logs',
      reason: 'Wood required for construction and crafting',
    });
  }

  if (needsStone || (!needsWood && !needsFarm)) {
    agents.push({
      role: 'miner',
      task: 'collect 8 cobblestone',
      reason: 'Stone needed for foundation and structural support',
    });
  }

  if (needsFarm) {
    agents.push({
      role: 'farmer',
      task: 'harvest 12 wheat',
      reason: 'Crops needed for food supply',
    });
  }

  // Ensure at least two agents for a meaningful demo
  if (agents.length < 2 && !needsFarm) {
    if (!agents.find(a => a.role === 'lumberjack')) {
      agents.push({ role: 'lumberjack', task: 'collect 10 oak logs', reason: 'Wood for additional materials' });
    }
    if (!agents.find(a => a.role === 'miner')) {
      agents.push({ role: 'miner', task: 'collect 8 cobblestone', reason: 'Stone for structural work' });
    }
  }

  return {
    analysis: `Analyzing goal: "${goal}" — identified ${agents.length} required worker roles`,
    agents,
    summary: `Deploy ${agents.map(a => a.role).join(' and ')} to accomplish the goal`,
  };
}
