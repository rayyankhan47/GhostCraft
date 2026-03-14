import { loginDiscord, client } from './discord/client';
import { connectRcon } from './minecraft/serverAdmin';
import { registerConversationHandler } from './commands/conversationHandler';
import { log, error } from './utils/logger';

process.on('unhandledRejection', (err) => error('Unhandled rejection:', err));

client.once('clientReady', async () => {
  log(`GhostCraft online: ${client.user?.tag}`);
  await connectRcon();
  log('RCON connected. All systems ready.');
});

// Register the message handler before login so it's ready immediately
registerConversationHandler();

async function main() {
  log('Starting GhostCraft...');
  await loginDiscord();
}

main().catch(err => {
  error('Fatal startup error:', err);
  process.exit(1);
});
