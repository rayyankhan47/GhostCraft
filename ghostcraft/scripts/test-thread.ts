import { loginDiscord, client } from '../src/discord/client';
import { createAgentThread, archiveThread, postToThread } from '../src/discord/threadManager';
import { log } from '../src/utils/logger';
import { sleep } from '../src/utils/sleep';

async function main() {
  await loginDiscord();

  // Wait for client to be ready
  await new Promise<void>(resolve => client.once('clientReady', () => resolve()));

  log('Creating test thread...');
  const { threadId } = await createAgentThread('lumberjack', client);

  await postToThread(threadId, '🪓 *This is a test thread — it will be archived in 5 seconds.*', client);
  log('Posted to thread. Waiting 5 seconds...');

  await sleep(5000);

  await archiveThread(threadId, client);
  log('Thread archived. Test passed!');

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
