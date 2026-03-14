import { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { getAllAgents } from '../agents/agentRegistry';
import { ROLE_COLORS, ROLE_EMOJIS } from '../utils/constants';
import { buildProgressBar } from '../utils/progressBar';

export async function handleStatus(interaction: ChatInputCommandInteraction): Promise<void> {
  const agents = getAllAgents();

  if (agents.length === 0) {
    await interaction.reply({ content: 'No agents currently active. Use `/spawn` to deploy one.', ephemeral: true });
    return;
  }

  const lines = agents.map(a => {
    const emoji = ROLE_EMOJIS[a.role];
    const bar = buildProgressBar(a.taskCurrent, a.taskTotal, 8);
    const progress = a.taskTotal > 0 ? `${bar} ${a.taskCurrent}/${a.taskTotal}` : 'Idle';
    return `${emoji} **${a.name}** — ${a.status} — ${progress}`;
  });

  const embed = new EmbedBuilder()
    .setColor(ROLE_COLORS.commander)
    .setTitle('👑 GHOSTCRAFT STATUS')
    .setDescription(
      `**Active Agents: ${agents.length}**\n\n` + lines.join('\n')
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
