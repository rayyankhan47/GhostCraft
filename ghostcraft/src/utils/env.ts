import * as dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  // Discord
  DISCORD_BOT_TOKEN:       requireEnv('DISCORD_BOT_TOKEN'),
  DISCORD_GUILD_ID:        requireEnv('DISCORD_GUILD_ID'),
  DISCORD_CLIENT_ID:       requireEnv('DISCORD_CLIENT_ID'),
  DISCORD_MAIN_CHANNEL_ID: requireEnv('DISCORD_MAIN_CHANNEL_ID'),

  // Botpress — validated lazily in bpClient.ts when Commander is invoked
  BOTPRESS_BOT_ID:    optionalEnv('BOTPRESS_BOT_ID', ''),
  BOTPRESS_TOKEN:     optionalEnv('BOTPRESS_TOKEN', ''),
  BOTPRESS_WEBHOOK_ID: optionalEnv('BOTPRESS_WEBHOOK_ID', ''),

  // Minecraft
  MC_SERVER_HOST: optionalEnv('MC_SERVER_HOST', 'localhost'),
  MC_SERVER_PORT: parseInt(optionalEnv('MC_SERVER_PORT', '25565'), 10),
  RCON_PASSWORD:  optionalEnv('RCON_PASSWORD', 'ghostcraft123'),
  RCON_PORT:      parseInt(optionalEnv('RCON_PORT', '25575'), 10),

  // LLM — validated lazily in llmClient.ts when personality messages fire
  ANTHROPIC_API_KEY: optionalEnv('ANTHROPIC_API_KEY', ''),
};
