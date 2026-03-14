import { client } from '../discord/client';
import { getAgentByThreadId, updateAgent } from '../agents/agentRegistry';
import { executeTask } from '../minecraft/taskExecutor';
import { postToThread } from '../discord/threadManager';
import { generatePersonalityMessage } from '../llm/personalityPrompt';
import { getRoleConfig } from '../agents/agentConfig';
import { log, error } from '../utils/logger';

export function registerConversationHandler(): void {
  client.on('messageCreate', async (message) => {
    // Ignore messages from bots (including ourselves)
    if (message.author.bot) return;

    // Check if this message came from a registered agent thread
    const agent = getAgentByThreadId(message.channelId);
    if (!agent) return;

    const content = message.content.trim();
    if (!content) return;

    log(`[ConversationHandler] Agent ${agent.name} received task: "${content}"`);

    // Update state immediately so the embed reflects the new task
    updateAgent(agent.agentId, {
      status: 'working',
      currentTask: content,
      taskCurrent: 0,
      taskTotal: 0,
      taskProgress: '0/0',
    });

    const config = getRoleConfig(agent.role);

    // Post personality task-start message — non-blocking
    generatePersonalityMessage(agent.role, `just received a new task: ${content}`)
      .then(msg => postToThread(agent.threadId, `${config.emoji} *${msg}*`, client))
      .catch(err => error('[ConversationHandler] Personality message failed:', err));

    // Execute the task
    try {
      await executeTask(agent.agentId, content);

      // Refresh agent state after task completes
      const fresh = getAgentByThreadId(message.channelId);
      if (!fresh) return;

      // Post personality completion message — non-blocking
      generatePersonalityMessage(fresh.role, `just finished the task: ${content}`)
        .then(msg => postToThread(fresh.threadId, `${config.emoji} *${msg}*`, client))
        .catch(err => error('[ConversationHandler] Personality completion message failed:', err));

    } catch (err) {
      error(`[ConversationHandler] Task failed for agent ${agent.name}:`, err);
      updateAgent(agent.agentId, {
        status: 'error',
        currentTask: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });

      // Post personality error message — non-blocking
      generatePersonalityMessage(agent.role, 'encountered an error while working')
        .then(msg => postToThread(agent.threadId, `${config.emoji} *${msg}*`, client))
        .catch(e => error('[ConversationHandler] Personality error message failed:', e));
    }
  });

  log('[ConversationHandler] Registered messageCreate listener');
}
