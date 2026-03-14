import { v4 as uuidv4 } from 'uuid';
import { Client } from 'discord.js';
import { AgentRole, AgentState } from '../utils/types';
import { VALID_ROLES } from '../utils/constants';
import { registerAgent, removeAgent, getAgent } from './agentRegistry';
import { getRoleConfig, generateBotUsername } from './agentConfig';
import { getAllAgents } from './agentRegistry';
import { createAgentThread, archiveThread } from '../discord/threadManager';
import { buildIdleEmbed } from '../discord/embedBuilder';
import { startUpdateLoop, stopUpdateLoop } from '../discord/embedUpdater';
import { createBot } from '../minecraft/botFactory';
import { registerBot, removeBot } from '../minecraft/botController';
import { giveLoadout } from '../minecraft/serverAdmin';
import { generatePersonalityMessage } from '../llm/personalityPrompt';
import { postToThread } from '../discord/threadManager';
import { log, error } from '../utils/logger';
import { sleep } from '../utils/sleep';

export async function spawnAgent(
  role: AgentRole,
  spawnedByCommander: boolean,
  client: Client,
): Promise<AgentState> {
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Unknown role: "${role}". Valid roles: ${VALID_ROLES.join(', ')}`);
  }

  const agentId = uuidv4();
  const config = getRoleConfig(role);
  const botUsername = generateBotUsername(role, getAllAgents());

  log(`[AgentManager] Spawning ${config.name} (${agentId})`);

  // Step 1 — Create Discord thread
  const { threadId } = await createAgentThread(role, client);

  let statusMessageId = '';
  try {
    // Step 2 — Post initial idle embed and capture its message ID
    const channel = await client.channels.fetch(threadId);
    if (!channel || !channel.isTextBased()) throw new Error('Thread channel not found');
    // @ts-expect-error — channel is a thread, send is available
    const statusMsg = await channel.send({ embeds: [buildIdleEmbed({
      agentId,
      role,
      name: config.name,
      threadId,
      statusMessageId: '',
      botUsername,
      currentTask: 'Idle — awaiting orders',
      taskCurrent: 0,
      taskTotal: 0,
      taskProgress: '0/0',
      status: 'idle',
      location: { x: 0, y: 64, z: 0 },
      inventory: [config.loadout[0]],
      createdAt: new Date(),
      spawnedByCommander,
    })] });
    statusMessageId = statusMsg.id;

    // Step 3 — Spawn the Mineflayer bot and wait for it to load into the world
    const bot = await createBot(botUsername);
    registerBot(agentId, bot);

    // Step 4 — Wait a beat then give the bot its loadout via RCON
    await sleep(1000);
    await giveLoadout(botUsername, config.loadout);

    // Step 5 — Build the final agent state and register it
    const state: AgentState = {
      agentId,
      role,
      name: config.name,
      threadId,
      statusMessageId,
      botUsername,
      currentTask: 'Idle — awaiting orders',
      taskCurrent: 0,
      taskTotal: 0,
      taskProgress: '0/0',
      status: 'idle',
      location: { x: 0, y: 64, z: 0 },
      inventory: [config.loadout[0]],
      createdAt: new Date(),
      spawnedByCommander,
    };
    registerAgent(state);

    // Step 6 — Start the 15-second live embed update loop
    startUpdateLoop(agentId, client);

    // Step 7 — Post personality greeting (non-blocking)
    generatePersonalityMessage(role, 'just joined the server and is ready for orders')
      .then(msg => postToThread(threadId, `${config.emoji} *${msg}*`, client))
      .catch(err => error('[AgentManager] Personality greeting failed:', err));

    log(`[AgentManager] ${config.name} ready (bot: ${botUsername}, thread: ${threadId})`);
    return state;

  } catch (err) {
    // Clean up the thread if anything after thread creation failed
    error(`[AgentManager] Spawn failed for ${config.name}:`, err);
    await archiveThread(threadId, client).catch(() => {});
    throw err;
  }
}

export async function dismissAgent(agentId: string, client: Client): Promise<void> {
  const state = getAgent(agentId);
  if (!state) throw new Error(`No agent found with id: ${agentId}`);

  log(`[AgentManager] Dismissing ${state.name} (${agentId})`);

  // Stop embed loop first to prevent edits on a closing thread
  try { stopUpdateLoop(agentId); } catch (e) { error('[AgentManager] stopUpdateLoop error:', e); }

  // Disconnect the Mineflayer bot
  try {
    const { getBot } = await import('../minecraft/botController');
    const bot = getBot(agentId);
    if (bot) bot.quit('Dismissed by GhostCraft');
    removeBot(agentId);
  } catch (e) { error('[AgentManager] Bot disconnect error:', e); }

  // Archive the Discord thread
  try { await archiveThread(state.threadId, client); } catch (e) { error('[AgentManager] archiveThread error:', e); }

  // Remove from registry
  removeAgent(agentId);
  log(`[AgentManager] ${state.name} dismissed.`);
}
