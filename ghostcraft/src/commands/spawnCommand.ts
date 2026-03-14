import { ChatInputCommandInteraction, Client } from 'discord.js';
import { AgentRole } from '../utils/types';
import { VALID_ROLES, ROLE_EMOJIS, ROLE_NAMES } from '../utils/constants';
import { spawnAgent } from '../agents/agentManager';
import { error } from '../utils/logger';

export async function handleSpawn(
  interaction: ChatInputCommandInteraction,
  client: Client,
): Promise<void> {
  const role = interaction.options.getString('role', true) as AgentRole;

  if (!VALID_ROLES.includes(role)) {
    await interaction.reply({ content: `Unknown role: "${role}". Valid roles: ${VALID_ROLES.join(', ')}`, ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const agent = await spawnAgent(role, false, client);
    const emoji = ROLE_EMOJIS[role];
    const name = ROLE_NAMES[role];
    await interaction.editReply(`${emoji} **${name}** deployed! Check the thread.`);
  } catch (err) {
    error('[SpawnCommand] Failed to spawn agent:', err);
    await interaction.editReply(`Failed to spawn agent: ${err instanceof Error ? err.message : String(err)}`);
  }
}
