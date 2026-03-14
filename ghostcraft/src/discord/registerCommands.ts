import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { env } from '../utils/env';
import { log } from '../utils/logger';

const commands = [
  new SlashCommandBuilder()
    .setName('spawn')
    .setDescription('Spawn a named agent with a specific role')
    .addStringOption(option =>
      option
        .setName('role')
        .setDescription('The agent role to spawn')
        .setRequired(true)
        .addChoices(
          { name: '🪓 Lumberjack', value: 'lumberjack' },
          { name: '⛏️ Miner',      value: 'miner' },
          { name: '🌾 Farmer',     value: 'farmer' },
          { name: '🏗️ Builder',    value: 'builder' },
        ),
    ),

  new SlashCommandBuilder()
    .setName('auto')
    .setDescription('Commander mode: give a high-level goal and let the AI plan it')
    .addStringOption(option =>
      option
        .setName('goal')
        .setDescription('What do you want to accomplish? (e.g. "build a simple house")')
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('List all active agents and their current states'),

  new SlashCommandBuilder()
    .setName('dismiss')
    .setDescription('Remove an agent and close its thread')
    .addStringOption(option =>
      option
        .setName('agent')
        .setDescription('Name of the agent to dismiss (e.g. "lumberjack")')
        .setRequired(true),
    ),
].map(cmd => cmd.toJSON());

export async function registerCommands(): Promise<void> {
  const rest = new REST().setToken(env.DISCORD_BOT_TOKEN);

  log('Registering slash commands...');
  await rest.put(
    Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
    { body: commands },
  );
  log(`Registered ${commands.length} slash commands to guild ${env.DISCORD_GUILD_ID}`);
}
