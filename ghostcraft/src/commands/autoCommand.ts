import { ChatInputCommandInteraction, Client } from 'discord.js';
import { runCommander } from '../agents/commander';
import { log, error } from '../utils/logger';

export async function handleAuto(
  interaction: ChatInputCommandInteraction,
  client: Client,
): Promise<void> {
  const goal = interaction.options.getString('goal');
  if (!goal) {
    await interaction.reply({ content: '❌ Please provide a goal.', ephemeral: true });
    return;
  }

  await interaction.deferReply();
  log(`[AutoCommand] /auto triggered with goal: "${goal}"`);

  try {
    await runCommander(goal, client);
    await interaction.editReply('👑 Commander deployed. Watch the main channel for updates.');
  } catch (err) {
    error('[AutoCommand] Commander failed:', err);
    await interaction.editReply(`❌ Commander failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
