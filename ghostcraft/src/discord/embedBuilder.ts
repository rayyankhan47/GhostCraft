import { EmbedBuilder } from 'discord.js';
import { AgentState, CommanderState } from '../utils/types';
import { ROLE_COLORS, ROLE_EMOJIS } from '../utils/constants';
import { buildProgressBar } from '../utils/progressBar';

function lastUpdatedText(): string {
  return `Last update: just now`;
}

function formatInventory(inventory: string[]): string {
  return inventory.length > 0 ? inventory.join(', ') : 'Empty';
}

function formatLocation(loc: { x: number; y: number; z: number }): string {
  return `x:${loc.x} y:${loc.y} z:${loc.z}`;
}

function agentStatusCard(state: AgentState, statusEmoji: string, statusText: string): string {
  const bar = buildProgressBar(state.taskCurrent, state.taskTotal);
  const progress = state.taskTotal > 0
    ? `${bar} ${state.taskCurrent}/${state.taskTotal}`
    : `Waiting for task...`;

  return [
    '```',
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Task:      ${state.currentTask}`,
    `Progress:  ${progress}`,
    `Status:    ${statusEmoji} ${statusText}`,
    `Inventory: ${formatInventory(state.inventory)}`,
    `Location:  ${formatLocation(state.location)}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    lastUpdatedText(),
    '```',
  ].join('\n');
}

export function buildIdleEmbed(state: AgentState): EmbedBuilder {
  const emoji = ROLE_EMOJIS[state.role];
  return new EmbedBuilder()
    .setColor(ROLE_COLORS[state.role])
    .setTitle(`${emoji} ${state.name.toUpperCase()} — Active`)
    .setDescription(agentStatusCard(state, '🟢', 'Online'));
}

export function buildWorkingEmbed(state: AgentState): EmbedBuilder {
  const emoji = ROLE_EMOJIS[state.role];
  const statusText = state.role === 'lumberjack' ? 'Harvesting trees'
    : state.role === 'miner' ? 'Mining underground'
    : state.role === 'farmer' ? 'Working the fields'
    : 'Building structure';

  return new EmbedBuilder()
    .setColor(ROLE_COLORS[state.role])
    .setTitle(`${emoji} ${state.name.toUpperCase()} — Active`)
    .setDescription(agentStatusCard(state, '⚙️', statusText));
}

export function buildCompleteEmbed(state: AgentState): EmbedBuilder {
  const emoji = ROLE_EMOJIS[state.role];
  return new EmbedBuilder()
    .setColor(ROLE_COLORS[state.role])
    .setTitle(`${emoji} ${state.name.toUpperCase()} — Complete`)
    .setDescription(agentStatusCard(state, '✅', 'Task complete!'));
}

export function buildErrorEmbed(state: AgentState, errorMsg: string): EmbedBuilder {
  const emoji = ROLE_EMOJIS[state.role];
  return new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle(`${emoji} ${state.name.toUpperCase()} — Error`)
    .setDescription(agentStatusCard(state, '❌', errorMsg));
}

export function buildCommanderPlanningEmbed(goal: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ROLE_COLORS.commander)
    .setTitle('👑 COMMANDER — Planning')
    .setDescription([
      '```',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `Goal:    ${goal}`,
      `Status:  🧠 Analyzing requirements...`,
      `Agents:  None deployed yet`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '```',
    ].join('\n'));
}

export function buildCommanderActiveEmbed(state: CommanderState): EmbedBuilder {
  const agentLines = state.plan?.agents.map(a => {
    const emoji = ROLE_EMOJIS[a.role];
    const name = a.role.charAt(0).toUpperCase() + a.role.slice(1);
    return `  ${emoji} ${name.padEnd(12)} → ${a.task}`;
  }) ?? [];

  const description = [
    '```',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `Goal:    ${state.goal}`,
    `Plan:    ${state.plan?.analysis ?? ''}`,
    '',
    ...agentLines,
    '',
    `Agents:  ${state.deployedAgentIds.length} deployed and working`,
    `Status:  🟢 Workers dispatched`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    lastUpdatedText(),
    '```',
  ].join('\n');

  return new EmbedBuilder()
    .setColor(ROLE_COLORS.commander)
    .setTitle('👑 COMMANDER — Active')
    .setDescription(description);
}
