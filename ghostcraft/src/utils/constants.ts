import { AgentRole } from './types';

export const ROLE_EMOJIS: Record<AgentRole, string> = {
  lumberjack: '🪓',
  miner:      '⛏️',
  farmer:     '🌾',
  builder:    '🏗️',
};

export const ROLE_COLORS: Record<AgentRole | 'commander', number> = {
  lumberjack: 0x228B22,   // Forest green
  miner:      0x808080,   // Stone grey
  farmer:     0xF4A460,   // Sandy brown
  builder:    0x4169E1,   // Royal blue
  commander:  0xFFD700,   // Gold
};

export const ROLE_NAMES: Record<AgentRole, string> = {
  lumberjack: 'Lumberjack',
  miner:      'Miner',
  farmer:     'Farmer',
  builder:    'Builder',
};

export const VALID_ROLES: AgentRole[] = ['lumberjack', 'miner', 'farmer', 'builder'];

export const BOT_USERNAME_PREFIX = 'GC_';
export const EMBED_UPDATE_INTERVAL_MS = 15000;
export const COMMANDER_POLL_INTERVAL_MS = 30000;

export const LOADOUTS: Record<AgentRole, string[]> = {
  lumberjack: ['iron_axe 1', 'chest 2', 'bread 8'],
  miner:      ['iron_pickaxe 1', 'chest 2', 'torch 16', 'bread 8'],
  farmer:     ['diamond_hoe 1', 'wheat_seeds 32', 'bone_meal 16', 'bread 8'],
  builder:    ['oak_planks 64', 'cobblestone 64', 'iron_shovel 1', 'bread 8'],
};
