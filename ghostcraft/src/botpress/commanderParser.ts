import { CommanderPlan } from '../utils/types';
import { VALID_ROLES } from '../utils/constants';
import { log } from '../utils/logger';

export function parseCommanderResponse(raw: string): CommanderPlan {
  // Strip markdown code fences if the LLM added them anyway
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  log(`[CommanderParser] Parsing response: ${cleaned.substring(0, 100)}...`);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Commander returned invalid JSON: ${cleaned.substring(0, 200)}`);
  }

  const plan = parsed as CommanderPlan;

  // Validate structure
  if (!plan.agents || !Array.isArray(plan.agents)) {
    throw new Error(`Commander response missing "agents" array`);
  }

  if (plan.agents.length === 0) {
    throw new Error(`Commander returned an empty agents list`);
  }

  // Validate each agent
  for (const agent of plan.agents) {
    if (!VALID_ROLES.includes(agent.role)) {
      throw new Error(`Commander returned invalid role: "${agent.role}". Valid: ${VALID_ROLES.join(', ')}`);
    }
    if (!agent.task || typeof agent.task !== 'string') {
      throw new Error(`Commander agent "${agent.role}" missing task string`);
    }
  }

  return plan;
}
