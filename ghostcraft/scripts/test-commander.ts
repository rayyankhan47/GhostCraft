import * as dotenv from 'dotenv';
dotenv.config();

import { Client } from '@botpress/chat';

const WEBHOOK_ID = process.env.BOTPRESS_WEBHOOK_ID!;
const GOAL = process.argv[2] || 'I want to build a simple house with wood and stone';

async function main() {
  if (!WEBHOOK_ID) {
    console.error('Missing BOTPRESS_WEBHOOK_ID in .env');
    console.error('Find it in Botpress Dashboard → Your Bot → Integrations → Chat → Webhook ID');
    process.exit(1);
  }

  const client = new Client({ webhookId: WEBHOOK_ID });

  console.log(`Sending goal: "${GOAL}"`);

  // Create a user
  const userResp = await client.createUser({});
  const userKey = (userResp as any).key ?? (userResp as any).user?.key;
  const userId = (userResp as any).user?.id ?? (userResp as any).id;
  console.log(`Created user: ${userId}`);

  // Create a conversation
  const { conversation } = await client.createConversation({
    'x-user-key': userKey,
  });
  console.log(`Created conversation: ${conversation.id}`);

  // Send the goal
  await client.createMessage({
    'x-user-key': userKey,
    conversationId: conversation.id,
    payload: { type: 'text', text: GOAL },
  });
  console.log('Message sent. Polling for reply...');

  // Poll for bot reply
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 500));

    const { messages } = await client.listMessages({
      'x-user-key': userKey,
      conversationId: conversation.id,
    });

    const botReply = messages.find(
      (m: any) => m.userId !== userId && m.payload?.type === 'text'
    );

    if (botReply && 'text' in botReply.payload) {
      console.log('\n--- Commander Response ---');
      console.log(botReply.payload.text);
      console.log('--- End ---');
      return;
    }
  }

  console.error('No reply within 30 seconds.');
}

main().catch(console.error);
