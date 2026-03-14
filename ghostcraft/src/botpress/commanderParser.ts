import { CommanderPlan, AgentRole } from '../utils/types';
import { VALID_ROLES } from '../utils/constants';
import { log, warn } from '../utils/logger';

/**
 * Try to extract a JSON object from a response that may contain prose around it.
 */
function extractJSON(raw: string): string | null {
  // Strip markdown code fences
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try parsing the whole thing as JSON first
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Not valid JSON as-is — try to find JSON embedded in prose
  }

  // Look for a JSON object in the text (find first { and last matching })
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Not valid JSON either
    }
  }

  return null;
}

/**
 * Parse a prose response into a CommanderPlan by extracting role/task mentions.
 */
function parseFromProse(raw: string): CommanderPlan {
  const agents: CommanderPlan['agents'] = [];
  const lower = raw.toLowerCase();

  for (const role of VALID_ROLES) {
    if (lower.includes(role)) {
      // Try to extract what comes after the role mention as a task
      const roleRegex = new RegExp(
        `${role}[:\\s]+(?:will\\s+|to\\s+|should\\s+|has been assigned to\\s+)?(.+?)(?:\\.|,|;|\\n|$)`,
        'im'
      );
      const match = raw.match(roleRegex);
      let task = match?.[1]?.trim() || getDefaultTask(role);
      // Clean up common prose artifacts
      task = task.replace(/^(?:for you|for the project)\s*/i, '').trim();
      if (!task || task.length < 3) task = getDefaultTask(role);
      agents.push({ role: role as AgentRole, task, reason: 'Assigned by Commander' });
    }
  }

  if (agents.length === 0) {
    throw new Error(`Commander response contained no recognizable roles. Raw: ${raw.substring(0, 200)}`);
  }

  return {
    analysis: raw.substring(0, 200),
    agents,
    summary: raw.split(/[.!]/)[0]?.trim() || 'Commander plan',
  };
}

function getDefaultTask(role: string): string {
  switch (role) {
    case 'lumberjack': return 'collect 16 oak logs';
    case 'miner': return 'mine 16 cobblestone';
    case 'farmer': return 'harvest 16 wheat';
    case 'builder': return 'build a structure';
    default: return 'complete assigned work';
  }
}

export function parseCommanderResponse(raw: string): CommanderPlan {
  log(`[CommanderParser] Parsing response: ${raw.substring(0, 150)}...`);

  // First try: extract and parse JSON
  const jsonStr = extractJSON(raw);
  if (jsonStr) {
    const parsed = JSON.parse(jsonStr) as CommanderPlan;

    if (parsed.agents && Array.isArray(parsed.agents) && parsed.agents.length > 0) {
      // Validate each agent
      for (const agent of parsed.agents) {
        if (!VALID_ROLES.includes(agent.role)) {
          throw new Error(`Commander returned invalid role: "${agent.role}". Valid: ${VALID_ROLES.join(', ')}`);
        }
        if (!agent.task || typeof agent.task !== 'string') {
          throw new Error(`Commander agent "${agent.role}" missing task string`);
        }
      }

      log(`[CommanderParser] Successfully parsed JSON plan with ${parsed.agents.length} agents`);
      return parsed;
    }
  }

  // Fallback: parse from prose
  warn(`[CommanderParser] No valid JSON found, falling back to prose parsing`);
  const plan = parseFromProse(raw);
  log(`[CommanderParser] Extracted ${plan.agents.length} agents from prose`);
  return plan;
}
