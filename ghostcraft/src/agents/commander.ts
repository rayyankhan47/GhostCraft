import { Client, TextChannel } from 'discord.js';
import { askCommander } from '../botpress/bpClient';
import { parseCommanderResponse } from '../botpress/commanderParser';
import { spawnAgent } from './agentManager';
import { executeTask } from '../minecraft/taskExecutor';
import { buildCommanderPlanningEmbed, buildCommanderActiveEmbed } from '../discord/embedBuilder';
import { postToThread } from '../discord/threadManager';
import { updateAgent, getAgent, getAllAgents } from './agentRegistry';
import { CommanderState, CommanderPlan } from '../utils/types';
import { ROLE_EMOJIS } from '../utils/constants';
import { log, error } from '../utils/logger';
import { env } from '../utils/env';

const COMMANDER_POLL_INTERVAL_MS = 30000;

export async function runCommander(goal: string, client: Client): Promise<void> {
  log(`[Commander] Initiating plan for goal: "${goal}"`);

  // Step 1 — Post planning embed to #ghostcraft-main
  const mainChannel = await client.channels.fetch(env.DISCORD_MAIN_CHANNEL_ID) as TextChannel;
  if (!mainChannel) throw new Error('Could not find main channel');

  const planningMsg = await mainChannel.send({ embeds: [buildCommanderPlanningEmbed(goal)] });

  // Step 2 — Ask the Commander (Botpress) for a plan
  const rawResponse = await askCommander(goal);
  const plan = parseCommanderResponse(rawResponse);

  log(`[Commander] Plan received — ${plan.agents.length} agents: ${plan.agents.map(a => a.role).join(', ')}`);

  // Step 3 — Initialize commander state
  const commanderState: CommanderState = {
    goal,
    plan,
    deployedAgentIds: [],
    status: 'active',
    embedMessageId: planningMsg.id,
  };

  // Step 4 — Spawn agents and assign tasks
  for (const agentPlan of plan.agents) {
    try {
      const state = await spawnAgent(agentPlan.role, true, client);
      commanderState.deployedAgentIds.push(state.agentId);

      // Fire-and-forget task execution
      executeTask(state.agentId, agentPlan.task).catch(err => {
        error(`[Commander] Task failed for ${agentPlan.role}:`, err);
      });
    } catch (err) {
      error(`[Commander] Failed to spawn ${agentPlan.role}:`, err);
    }
  }

  // Step 5 — Update the Commander embed to show active plan
  await planningMsg.edit({ embeds: [buildCommanderActiveEmbed(commanderState)] });

  // Step 6 — Post Commander summary to main channel
  const agentList = plan.agents.map(a => `${ROLE_EMOJIS[a.role]} **${a.role}** → ${a.task}`).join('\n');
  await mainChannel.send(`👑 **Commander deployed ${plan.agents.length} agents:**\n${agentList}\n\n*${plan.summary}*`);

  // Step 7 — Start monitoring loop
  startCommanderMonitoring(commanderState, planningMsg, client);
}

function startCommanderMonitoring(
  state: CommanderState,
  planningMsg: { edit: Function },
  client: Client,
): void {
  const interval = setInterval(async () => {
    try {
      const allComplete = state.deployedAgentIds.every(id => {
        const agent = getAgent(id);
        return agent && (agent.status === 'complete' || agent.status === 'error');
      });

      if (allComplete) {
        clearInterval(interval);
        state.status = 'complete';

        const mainChannel = await client.channels.fetch(env.DISCORD_MAIN_CHANNEL_ID) as TextChannel;
        if (mainChannel) {
          const completed = state.deployedAgentIds.filter(id => getAgent(id)?.status === 'complete').length;
          await mainChannel.send(
            `👑 **Commander — Mission complete!** ${completed}/${state.deployedAgentIds.length} agents finished successfully.`
          );
        }
        log('[Commander] All agents finished. Mission complete.');
      }
    } catch (err) {
      error('[Commander] Monitoring error:', err);
    }
  }, COMMANDER_POLL_INTERVAL_MS);
}
