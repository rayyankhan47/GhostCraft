import { loginDiscord } from './discord/client';
import { log, error } from './utils/logger';

process.on('unhandledRejection', (err) => error('Unhandled rejection:', err));

async function main() {
  log('Starting GhostCraft...');
  await loginDiscord();
}

main().catch(err => {
  error('Fatal startup error:', err);
  process.exit(1);
});
