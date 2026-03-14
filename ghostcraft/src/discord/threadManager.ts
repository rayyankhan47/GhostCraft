import { Client, TextChannel, ThreadAutoArchiveDuration } from 'discord.js';
import { AgentRole } from '../utils/types';
import { ROLE_EMOJIS, ROLE_NAMES } from '../utils/constants';
import { env } from '../utils/env';
import { log } from '../utils/logger';

export async function createAgentThread(
  role: AgentRole,
  client: Client,
): Promise<{ threadId: string }> {
  const channel = await client.channels.fetch(env.DISCORD_MAIN_CHANNEL_ID);
  if (!channel || !(channel instanceof TextChannel)) {
    throw new Error(`#ghostcraft-main channel not found (id: ${env.DISCORD_MAIN_CHANNEL_ID})`);
  }

  const name = `${ROLE_EMOJIS[role]} ${ROLE_NAMES[role]} — Active`;
  const thread = await channel.threads.create({
    name,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
    reason: 'GhostCraft agent spawned',
  });

  log(`[ThreadManager] Created thread: "${name}" (${thread.id})`);
  return { threadId: thread.id };
}

export async function archiveThread(threadId: string, client: Client): Promise<void> {
  try {
    const channel = await client.channels.fetch(threadId);
    if (!channel || !channel.isThread()) return;
    await channel.setArchived(true, 'GhostCraft agent dismissed');
    log(`[ThreadManager] Archived thread ${threadId}`);
  } catch (err) {
    // Non-fatal — thread may already be archived or deleted
    log(`[ThreadManager] Could not archive thread ${threadId}: ${err}`);
  }
}

export async function postToThread(
  threadId: string,
  content: string,
  client: Client,
): Promise<void> {
  const channel = await client.channels.fetch(threadId);
  if (!channel || !channel.isTextBased()) {
    throw new Error(`Thread ${threadId} not found or not text-based`);
  }
  // @ts-expect-error — thread channels are text-based and have send()
  await channel.send(content);
}
