import { Rcon } from 'rcon-client';
import { env } from '../utils/env';
import { log, error } from '../utils/logger';
import { sleep } from '../utils/sleep';

let rcon: Rcon | null = null;

export async function connectRcon(): Promise<void> {
  rcon = new Rcon({
    host: env.MC_SERVER_HOST,
    port: env.RCON_PORT,
    password: env.RCON_PASSWORD,
  });
  await rcon.connect();
  log('[RCON] Connected');
}

export async function runCommand(command: string): Promise<string> {
  if (!rcon) throw new Error('RCON not connected — call connectRcon() first');
  return await rcon.send(command);
}

export async function setBotGamemode(botUsername: string, gamemode: 'survival' | 'creative'): Promise<void> {
  await runCommand(`gamemode ${gamemode} ${botUsername}`);
  log(`[RCON] Set ${botUsername} to ${gamemode}`);
}

export async function giveLoadout(botUsername: string, items: string[]): Promise<void> {
  for (const item of items) {
    const parts = item.split(' ');
    const itemId = parts[0];
    const qty = parts[1] ?? '1';
    await runCommand(`give ${botUsername} ${itemId} ${qty}`);
    await sleep(200); // small delay between /give commands to avoid server dropping them
  }
  log(`[RCON] Gave loadout to ${botUsername}`);
}
