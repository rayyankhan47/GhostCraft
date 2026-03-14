import { loginDiscord, client } from './discord/client';
import { connectRcon } from './minecraft/serverAdmin';
import { registerConversationHandler } from './commands/conversationHandler';
import { handleSpawn } from './commands/spawnCommand';
import { handleAuto } from './commands/autoCommand';
import { handleStatus } from './commands/statusCommand';
import { handleDismiss } from './commands/dismissCommand';
import { log, error } from './utils/logger';

process.on('unhandledRejection', (err) => error('Unhandled rejection:', err));

client.once('clientReady', async () => {
  log(`GhostCraft online: ${client.user?.tag}`);
  await connectRcon();
  log('RCON connected. All systems ready.');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  switch (interaction.commandName) {
    case 'spawn':   return handleSpawn(interaction, client);
    case 'auto':    return handleAuto(interaction, client);
    case 'status':  return handleStatus(interaction);
    case 'dismiss': return handleDismiss(interaction, client);
  }
});

registerConversationHandler();

async function main() {
  log('Starting GhostCraft...');
  await loginDiscord();
}

main().catch(err => {
  error('Fatal startup error:', err);
  process.exit(1);
});
