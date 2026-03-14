import { registerCommands } from '../src/discord/registerCommands';
import { error } from '../src/utils/logger';

registerCommands()
  .then(() => process.exit(0))
  .catch(err => { error('Failed to register commands:', err); process.exit(1); });
