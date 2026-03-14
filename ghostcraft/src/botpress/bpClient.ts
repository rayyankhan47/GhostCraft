import { Client } from '@botpress/chat';
import { env } from '../utils/env';
import { log } from '../utils/logger';
import { sleep } from '../utils/sleep';

const REPLY_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 500;

export async function askCommander(goal: string): Promise<string> {
  if (!env.BOTPRESS_WEBHOOK_ID) throw new Error('BOTPRESS_WEBHOOK_ID is not set in .env');

  const client = new Client({ webhookId: env.BOTPRESS_WEBHOOK_ID });

  // Create a user and get an authenticated client
  const userResp = await client.createUser({});
  const userKey = (userResp as any).key ?? (userResp as any).user?.key;
  const userId = (userResp as any).user?.id ?? (userResp as any).id;

  // Create a conversation
  const { conversation } = await client.createConversation({
    'x-user-key': userKey,
  });

  log(`[BpClient] Created conversation: ${conversation.id}`);

  // Send the goal as a message
  await client.createMessage({
    'x-user-key': userKey,
    conversationId: conversation.id,
    payload: { type: 'text', text: goal },
  });

  log(`[BpClient] Sent goal to Commander: "${goal}"`);

  // Poll for the bot's reply
  const deadline = Date.now() + REPLY_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    const { messages } = await client.listMessages({
      'x-user-key': userKey,
      conversationId: conversation.id,
    });

    // Find a bot reply (any message not from our user)
    const botMessage = messages.find(
      (m: any) => m.userId !== userId && m.payload?.type === 'text'
    );

    if (botMessage && 'text' in botMessage.payload) {
      log(`[BpClient] Commander replied`);
      return (botMessage.payload as { text: string }).text;
    }
  }

  throw new Error(`Commander did not respond within ${REPLY_TIMEOUT_MS / 1000}s`);
}
