import { connectRcon, runCommand, giveLoadout } from '../src/minecraft/serverAdmin';
import { log } from '../src/utils/logger';

async function main() {
  await connectRcon();

  log('Sending test message to server...');
  await runCommand('say Hello from GhostCraft RCON!');

  log('RCON test passed! Try giving yourself an item...');
  // Replace YOUR_USERNAME with your actual Minecraft username to test giveLoadout
  // await giveLoadout('YOUR_USERNAME', ['iron_axe 1', 'bread 8']);

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
