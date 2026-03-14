// Implemented in Step 6.5
import { EmbedBuilder } from 'discord.js';
import { AgentState, CommanderState } from '../utils/types';

export function buildIdleEmbed(_state: AgentState): EmbedBuilder {
  throw new Error('embedBuilder not yet implemented');
}

export function buildWorkingEmbed(_state: AgentState): EmbedBuilder {
  throw new Error('embedBuilder not yet implemented');
}

export function buildCompleteEmbed(_state: AgentState): EmbedBuilder {
  throw new Error('embedBuilder not yet implemented');
}

export function buildErrorEmbed(_state: AgentState, _errorMsg: string): EmbedBuilder {
  throw new Error('embedBuilder not yet implemented');
}

export function buildCommanderPlanningEmbed(_goal: string): EmbedBuilder {
  throw new Error('embedBuilder not yet implemented');
}

export function buildCommanderActiveEmbed(_state: CommanderState): EmbedBuilder {
  throw new Error('embedBuilder not yet implemented');
}
