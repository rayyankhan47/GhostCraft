// Implemented in Step 6.4
import { Client } from 'discord.js';
import { AgentRole } from '../utils/types';

export async function createAgentThread(_role: AgentRole, _client: Client): Promise<{ threadId: string }> {
  throw new Error('threadManager not yet implemented');
}

export async function archiveThread(_threadId: string, _client: Client): Promise<void> {
  throw new Error('threadManager not yet implemented');
}

export async function postToThread(_threadId: string, _content: string, _client: Client): Promise<void> {
  throw new Error('threadManager not yet implemented');
}
