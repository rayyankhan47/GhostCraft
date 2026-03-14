// Implemented in Step 9.4 after Botpress is configured
import { ChatInputCommandInteraction, Client } from 'discord.js';

export async function handleAuto(
  interaction: ChatInputCommandInteraction,
  _client: Client,
): Promise<void> {
  await interaction.reply({ content: '👑 Commander mode coming soon! Use `/spawn` for manual mode.', ephemeral: true });
}
