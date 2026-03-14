import { Client, GatewayIntentBits } from 'discord.js';
import { env } from '../utils/env';
import { log } from '../utils/logger';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

export async function loginDiscord(): Promise<void> {
  client.once('ready', () => {
    log(`Bot online: ${client.user?.tag}`);
  });
  await client.login(env.DISCORD_BOT_TOKEN);
}
