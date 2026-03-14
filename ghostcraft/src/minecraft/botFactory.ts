import mineflayer, { Bot } from 'mineflayer';
import { pathfinder } from 'mineflayer-pathfinder';
import { env } from '../utils/env';
import { log, error, warn } from '../utils/logger';
import { updateAgent } from '../agents/agentRegistry';
import { getAgentByBot } from './botController';

const BOT_SPAWN_TIMEOUT_MS = 30000;

export async function createBot(username: string): Promise<Bot> {
  return new Promise((resolve, reject) => {
    log(`[BotFactory] Creating bot: ${username}`);

    const bot = mineflayer.createBot({
      host: env.MC_SERVER_HOST,
      port: env.MC_SERVER_PORT,
      username,
      version: '1.21.1',
      auth: 'offline',
    });

    bot.loadPlugin(pathfinder);

    // Resolve once the bot is fully in the world
    const onSpawn = () => {
      clearTimeout(timeout);
      log(`[BotFactory] Bot spawned in world: ${username} at ${JSON.stringify(bot.entity?.position)}`);
      resolve(bot);
    };

    // Reject if the bot never makes it into the world
    const timeout = setTimeout(() => {
      bot.removeListener('spawn', onSpawn);
      bot.quit('Spawn timeout');
      reject(new Error(`Bot ${username} failed to spawn within ${BOT_SPAWN_TIMEOUT_MS / 1000}s`));
    }, BOT_SPAWN_TIMEOUT_MS);

    bot.once('spawn', onSpawn);

    bot.on('error', (err) => {
      error(`[BotFactory] Bot error (${username}):`, err);
    });

    bot.on('kicked', (reason) => {
      warn(`[BotFactory] Bot kicked (${username}): ${reason}`);
      // Update the agent's status to error if we can find it
      const agentId = getAgentByBot(username);
      if (agentId) updateAgent(agentId, { status: 'error', currentTask: `Kicked: ${reason}` });
    });

    bot.on('end', (reason) => {
      log(`[BotFactory] Bot disconnected (${username}): ${reason}`);
    });
  });
}
