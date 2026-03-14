import { ChatInputCommandInteraction, Client } from 'discord.js';
import { getAllAgents } from '../agents/agentRegistry';
import { dismissAgent } from '../agents/agentManager';
import { ROLE_EMOJIS } from '../utils/constants';
import { error } from '../utils/logger';

export async function handleDismiss(
  interaction: ChatInputCommandInteraction,
  client: Client,
): Promise<void> {
  const input = interaction.options.getString('agent', true).toLowerCase();

  // Match by role name or agent name
  const agents = getAllAgents();
  const agent = agents.find(a =>
    a.role === input ||
    a.name.toLowerCase() === input ||
    a.botUsername.toLowerCase().includes(input),
  );

  if (!agent) {
    const activeNames = agents.map(a => a.name).join(', ') || 'none';
    await interaction.reply({ content: `No agent found matching "${input}". Active agents: ${activeNames}`, ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    await dismissAgent(agent.agentId, client);
    await interaction.editReply(`${ROLE_EMOJIS[agent.role]} **${agent.name}** dismissed.`);
  } catch (err) {
    error('[DismissCommand] Failed to dismiss agent:', err);
    await interaction.editReply(`Failed to dismiss agent: ${err instanceof Error ? err.message : String(err)}`);
  }
}
