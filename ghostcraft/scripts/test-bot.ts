import { createBot } from '../src/minecraft/botFactory';
import { sleep } from '../src/utils/sleep';
import { log } from '../src/utils/logger';

async function main() {
  log('Connecting test bot to Minecraft server...');
  const bot = await createBot('GC_Test');

  log(`Bot spawned! Position: ${JSON.stringify(bot.entity.position)}`);

  for (let i = 1; i <= 3; i++) {
    await sleep(5000);
    const pos = bot.entity.position;
    log(`[${i * 5}s] Position: x:${Math.floor(pos.x)} y:${Math.floor(pos.y)} z:${Math.floor(pos.z)}`);
    log(`[${i * 5}s] Inventory: ${bot.inventory.items().map(it => it.displayName).join(', ') || 'empty'}`);
  }

  log('Test complete. Disconnecting...');
  bot.quit('Test complete');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
