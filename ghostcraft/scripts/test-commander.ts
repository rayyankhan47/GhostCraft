import 'dotenv/config';
import { askCommander } from '../src/botpress/bpClient';
import { parseCommanderResponse } from '../src/botpress/commanderParser';

async function main() {
  console.log('Testing Commander via Botpress API...\n');

  const goal = 'I want to build a simple house with wood and stone';
  console.log(`Goal: "${goal}"\n`);

  try {
    console.log('Calling askCommander...');
    const raw = await askCommander(goal);
    console.log('Raw response:', raw, '\n');

    console.log('Parsing response...');
    const plan = parseCommanderResponse(raw);
    console.log('Parsed plan:', JSON.stringify(plan, null, 2));
    console.log('\nCommander test PASSED!');
  } catch (err) {
    console.error('Commander test FAILED:', err);
  }
}

main();
