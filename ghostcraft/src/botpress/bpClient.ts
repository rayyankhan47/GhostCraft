import { Client } from '@botpress/client';
import { env } from '../utils/env';
import { log, warn } from '../utils/logger';
import { sleep } from '../utils/sleep';

const BOT_ID = env.BOTPRESS_BOT_ID;
const REPLY_TIMEOUT_MS = 20000;
const POLL_INTERVAL_MS = 500;

function getClient(): Client {
  if (!env.BOTPRESS_TOKEN) throw new Error('BOTPRESS_TOKEN is not set in .env');
  if (!env.BOTPRESS_BOT_ID) throw new Error('BOTPRESS_BOT_ID is not set in .env');
  return new Client({ token: env.BOTPRESS_TOKEN, botId: BOT_ID });
}

export async function askCommander(goal: string): Promise<string> {
  const bp = getClient();

  // Create a fresh conversation for each Commander request
  const { conversation } = await bp.createConversation({
    channel: 'channel',
    tags: {},
  });

  log(`[BpClient] Created conversation: ${conversation.id}`);

  // Send the goal as a user message
  await bp.createMessage({
    conversationId: conversation.id,
    userId: 'ghostcraft-system',
    payload: { type: 'text', text: goal },
    tags: {},
    type: 'text',
  });

  log(`[BpClient] Sent goal to Commander: "${goal}"`);

  // Poll for the bot's reply
  const deadline = Date.now() + REPLY_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    const { messages } = await bp.listMessages({ conversationId: conversation.id });

    // Find the first message from the bot (not from our user)
    const botMessage = messages.find(m => m.userId !== 'ghostcraft-system' && m.type === 'text');

    if (botMessage && 'text' in botMessage.payload) {
      log(`[BpClient] Commander replied`);
      return botMessage.payload.text as string;
    }
  }

  throw new Error(`Commander did not respond within ${REPLY_TIMEOUT_MS / 1000}s`);
}
