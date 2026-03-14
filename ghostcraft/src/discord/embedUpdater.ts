import { Client, TextBasedChannel } from 'discord.js';
import { getAgent, updateAgent } from '../agents/agentRegistry';
import { getBotState } from '../minecraft/botController';
import { buildIdleEmbed, buildWorkingEmbed, buildCompleteEmbed, buildErrorEmbed } from './embedBuilder';
import { EMBED_UPDATE_INTERVAL_MS } from '../utils/constants';
import { log, warn, error } from '../utils/logger';

const activeLoops = new Map<string, NodeJS.Timeout>();

export function startUpdateLoop(agentId: string, client: Client): void {
  if (activeLoops.has(agentId)) {
    warn(`[EmbedUpdater] Loop already running for agent ${agentId}`);
    return;
  }

  const interval = setInterval(async () => {
    try {
      const state = getAgent(agentId);
      if (!state) {
        stopUpdateLoop(agentId);
        return;
      }

      // Pull fresh location + inventory from the live bot
      const botState = getBotState(agentId);
      if (botState) {
        updateAgent(agentId, {
          location: botState.location,
          inventory: botState.inventory,
        });
      }

      // Fetch the current state after the update
      const fresh = getAgent(agentId)!;

      // Build the right embed for the current status
      let embed;
      switch (fresh.status) {
        case 'idle':     embed = buildIdleEmbed(fresh); break;
        case 'working':  embed = buildWorkingEmbed(fresh); break;
        case 'complete': embed = buildCompleteEmbed(fresh); break;
        case 'error':    embed = buildErrorEmbed(fresh, 'An error occurred'); break;
        default:         embed = buildIdleEmbed(fresh);
      }

      // Fetch and edit the pinned status message
      const channel = await client.channels.fetch(fresh.threadId) as TextBasedChannel | null;
      if (!channel || !channel.isTextBased()) return;

      const message = await (channel as any).messages.fetch(fresh.statusMessageId);
      await message.edit({ embeds: [embed] });

    } catch (err) {
      // Never crash the process over a failed embed update
      error(`[EmbedUpdater] Failed to update embed for agent ${agentId}:`, err);
    }
  }, EMBED_UPDATE_INTERVAL_MS);

  activeLoops.set(agentId, interval);
  log(`[EmbedUpdater] Started update loop for agent ${agentId}`);
}

export function stopUpdateLoop(agentId: string): void {
  const interval = activeLoops.get(agentId);
  if (interval) {
    clearInterval(interval);
    activeLoops.delete(agentId);
    log(`[EmbedUpdater] Stopped update loop for agent ${agentId}`);
  }
}
