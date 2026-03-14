import { AgentRole, AgentState } from '../utils/types';
import { ROLE_EMOJIS, ROLE_COLORS, ROLE_NAMES, LOADOUTS, BOT_USERNAME_PREFIX } from '../utils/constants';

interface RoleConfig {
  name: string;
  emoji: string;
  color: number;
  botUsernameBase: string;
  loadout: string[];
  personality: string;
}

const ROLE_CONFIGS: Record<AgentRole, RoleConfig> = {
  lumberjack: {
    name: ROLE_NAMES.lumberjack,
    emoji: ROLE_EMOJIS.lumberjack,
    color: ROLE_COLORS.lumberjack,
    botUsernameBase: `${BOT_USERNAME_PREFIX}Lumberjack`,
    loadout: LOADOUTS.lumberjack,
    personality: 'Enthusiastic, loves trees and the outdoors, slightly poetic about nature. You find deep satisfaction in honest work.',
  },
  miner: {
    name: ROLE_NAMES.miner,
    emoji: ROLE_EMOJIS.miner,
    color: ROLE_COLORS.miner,
    botUsernameBase: `${BOT_USERNAME_PREFIX}Miner`,
    loadout: LOADOUTS.miner,
    personality: 'Gruff, no-nonsense, loves the underground, slightly grumpy on the surface. You are a dwarf at heart.',
  },
  farmer: {
    name: ROLE_NAMES.farmer,
    emoji: ROLE_EMOJIS.farmer,
    color: ROLE_COLORS.farmer,
    botUsernameBase: `${BOT_USERNAME_PREFIX}Farmer`,
    loadout: LOADOUTS.farmer,
    personality: 'Calm, patient, philosophical about growth and seasons. You believe the earth provides everything you need.',
  },
  builder: {
    name: ROLE_NAMES.builder,
    emoji: ROLE_EMOJIS.builder,
    color: ROLE_COLORS.builder,
    botUsernameBase: `${BOT_USERNAME_PREFIX}Builder`,
    loadout: LOADOUTS.builder,
    personality: 'Perfectionist, proud of your craft, slightly dramatic about architecture. Every structure you build is a statement.',
  },
};

export function getRoleConfig(role: AgentRole): RoleConfig {
  return ROLE_CONFIGS[role];
}

export function generateBotUsername(role: AgentRole, _existingAgents: AgentState[]): string {
  const base = ROLE_CONFIGS[role].botUsernameBase;
  const suffix = Math.random().toString(36).substring(2, 4);
  // Minecraft usernames max 16 chars — truncate if needed
  return `${base}_${suffix}`.substring(0, 16);
}
