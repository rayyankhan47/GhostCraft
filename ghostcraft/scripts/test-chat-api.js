require('dotenv/config');

const BOTPRESS_TOKEN = process.env.BOTPRESS_TOKEN;
const BOT_ID = process.env.BOTPRESS_BOT_ID;
const WEBHOOK_ID = '45bf8aab-c668-44ef-9753-45d6a7953aee';
const CHAT_API = `https://chat.botpress.cloud/${WEBHOOK_ID}`;

async function main() {
  console.log('Testing Commander via Chat Integration API...\n');

  // Step 1: Create user
  const userRes = await fetch(CHAT_API + '/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'ghostcraft-system' })
  });
  const userData = await userRes.json();
  const user = userData.user;
  const key = userData.key;
  console.log('User created:', user.id);

  const authHeaders = { 'Content-Type': 'application/json', 'x-user-key': key };

  // Step 2: Create conversation
  const convoRes = await fetch(CHAT_API + '/conversations', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({})
  });
  const convoData = await convoRes.json();
  const conversation = convoData.conversation;
  console.log('Conversation created:', conversation.id);

  // Step 3: Send message
  const goal = 'I want to build a simple house with wood and stone';
  const msgRes = await fetch(CHAT_API + '/conversations/' + conversation.id + '/messages', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      type: 'text',
      payload: { text: goal }
    })
  });
  console.log('Message sent:', goal);
  console.log('Status:', msgRes.status);

  // Step 4: Poll for bot reply
  console.log('\nPolling for reply...');
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 500));
    const listRes = await fetch(CHAT_API + '/conversations/' + conversation.id + '/messages', {
      headers: authHeaders
    });
    const listData = await listRes.json();
    const botMsg = listData.messages.find(function(m) { return m.userId !== user.id; });
    if (botMsg) {
      console.log('\nBot replied!');
      console.log('Response:', JSON.stringify(botMsg.payload, null, 2));
      return;
    }
    process.stdout.write('.');
  }
  console.log('\nNo reply within 20s');
}

main().catch(console.error);
