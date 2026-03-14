# GhostCraft — Step-by-Step Build Plan
### BPHacks 2026 | discord.js + Botpress ADK + Mineflayer + PaperMC

> **How to use this document:** Work through each task in order. Check off `[ ]` boxes as you complete them. Each numbered item is independently testable — never move to the next step until the current one is verified working.

---

## Legend
- `[ ]` — Not started
- `[x]` — Complete
- `[~]` — In progress / partially done
- `[!]` — Blocked / needs attention

---

## Architecture Overview

```
User types /auto in Discord
        │
        ▼
  discord.js bot        ← handles all Discord UI: slash commands,
  (runs locally)          threads, live embeds, message routing
        │
        │  sends goal as a message
        ▼
  Botpress Agent        ← the Commander brain: receives the goal,
  (hosted on            uses its LLM to decompose it into a JSON plan,
   Botpress Cloud)      sends the plan back
        │
        │  returns structured JSON plan
        ▼
  Agent Manager         ← reads the plan, spawns Mineflayer bots,
  (runs locally)          assigns tasks, updates Discord embeds
        │
        ▼
  Mineflayer Bots       ← actual players inside the Minecraft server
  (run locally)
        │
        ▼
  PaperMC Server        ← the Minecraft world (runs locally)
  (localhost:25565)
```

**Why Botpress here?**
Botpress is the Commander's brain. Instead of calling an LLM API directly, you send the user's goal to your Botpress agent (which has the Commander system prompt configured inside Botpress's workspace). Botpress manages the conversation context, the LLM call, and returns the response. This means the most complex AI reasoning in the system — goal decomposition and workforce planning — runs through Botpress.

---

## Step 1 — Repository & Project Scaffolding

### 1.1 Initialize the repository
- [x] **1.1.1** Inside `bphacks2026/`, create the project folder: `mkdir ghostcraft && cd ghostcraft`
- [x] **1.1.2** Initialize git: `git init`
- [x] **1.1.3** Initialize npm: `npm init -y`
- [x] **1.1.4** Create a `.gitignore` with entries for: `node_modules/`, `.env`, `dist/`, `*.jar`, `minecraft-server/logs/`, `minecraft-server/world/`

### 1.2 Configure TypeScript
- [x] **1.2.1** Install TypeScript and ts-node: `npm install -D typescript ts-node @types/node`
- [x] **1.2.2** Generate tsconfig: `npx tsc --init`
- [x] **1.2.3** Edit `tsconfig.json` — set `"target": "ES2020"`, `"module": "commonjs"`, `"rootDir": "./src"`, `"outDir": "./dist"`, `"strict": true`, `"esModuleInterop": true`, `"resolveJsonModule": true`
- [x] **1.2.4** Add to `package.json` scripts: `"build": "tsc"`, `"dev": "ts-node src/index.ts"`, `"start": "node dist/index.js"`

### 1.3 Create the directory structure
- [x] **1.3.1** Create all source directories:
  ```
  mkdir -p src/{commands,agents,minecraft,discord,botpress,llm,utils} scripts
  ```
- [x] **1.3.2** Create a placeholder `index.ts` in each `src/` subdirectory (`export {};`) so TypeScript doesn't complain about empty dirs
- [x] **1.3.3** Create `src/index.ts` as the main entry point (empty for now)
- [x] **1.3.4** Verify final structure:
  ```
  ghostcraft/
  ├── src/
  │   ├── index.ts
  │   ├── commands/       ← slash command handlers
  │   ├── agents/         ← registry, manager, state
  │   ├── minecraft/      ← mineflayer bots, RCON, task execution
  │   ├── discord/        ← threads, embeds, live updates
  │   ├── botpress/       ← Botpress client + Commander integration
  │   ├── llm/            ← personality messages (direct Claude/Gemini)
  │   └── utils/          ← types, constants, logger, helpers
  ├── scripts/            ← one-off test scripts
  ├── .env
  └── .env.example
  ```

### 1.4 Set up environment variables
- [x] **1.4.1** Create `.env.example` with all variables listed:
  ```
  # Discord
  DISCORD_BOT_TOKEN=
  DISCORD_GUILD_ID=
  DISCORD_CLIENT_ID=
  DISCORD_MAIN_CHANNEL_ID=

  # Botpress
  BOTPRESS_BOT_ID=
  BOTPRESS_TOKEN=

  # Minecraft
  MC_SERVER_HOST=localhost
  MC_SERVER_PORT=25565
  RCON_PASSWORD=ghostcraft123
  RCON_PORT=25575

  # LLM (for personality messages — use one)
  ANTHROPIC_API_KEY=
  ```
- [x] **1.4.2** Copy to `.env`: `cp .env.example .env`
- [x] **1.4.3** Install dotenv: `npm install dotenv`
- [x] **1.4.4** Create `src/utils/env.ts` — loads and exports all env vars with types. Throw a clear error at startup if any required variable is missing so you know immediately what's wrong.

### 1.5 Install all dependencies
- [x] **1.5.1** Install runtime dependencies:
  ```
  npm install mineflayer mineflayer-pathfinder discord.js @botpress/client @anthropic-ai/sdk rcon-client uuid dotenv
  ```
- [x] **1.5.2** Install dev dependencies:
  ```
  npm install -D @types/uuid
  ```
- [x] **1.5.3** Confirm `package.json` lists all of the above and `node_modules/` exists
- [x] **1.5.4** Run `npx tsc --noEmit` — should produce zero errors on empty files

---

## Step 2 — Botpress Workspace Setup *(non-code — do this in the browser)*

> This step has nothing to do with writing code. You're configuring the Botpress cloud workspace that will act as the Commander's brain. Take your time here — getting this right means the Commander will work correctly when you call it from code later.

### 2.1 Create your Botpress workspace bot
- [ ] **2.1.1** Go to [https://app.botpress.cloud](https://app.botpress.cloud) and log into your workspace
- [ ] **2.1.2** Click **"Create Bot"** — name it `GhostCraft Commander`
- [ ] **2.1.3** Once created, click into the bot — you'll land on the **Studio** (the visual editor). You won't use the visual editor much — the important parts are in Settings.

### 2.2 Configure the Commander agent's personality and instructions
- [ ] **2.2.1** In the Studio, find the **"Agent"** section or **"AI Task"** node (the exact label depends on the Botpress version — look for where you set the bot's system prompt / persona instructions)
- [ ] **2.2.2** Set the bot's **system prompt** to the following:
  ```
  You are Commander, an AI orchestrator for a team of Minecraft worker bots.
  Your job is to analyze a high-level goal and decompose it into specific tasks
  for your available workers.

  Available workers and their capabilities:
  - lumberjack: collects wood, chops trees, harvests logs
  - miner: mines stone, cobblestone, coal, iron ore
  - farmer: harvests crops, plants seeds, collects food
  - builder: places blocks, constructs structures (basic)

  When given a goal, respond with ONLY valid JSON — no markdown, no explanation,
  no code fences. Just the raw JSON object in this exact format:
  {
    "analysis": "Brief explanation of what's needed",
    "agents": [
      {
        "role": "lumberjack",
        "task": "collect 32 oak logs",
        "reason": "Need wood for walls and roof"
      }
    ],
    "summary": "One sentence describing the overall plan"
  }

  Only use these role values: lumberjack, miner, farmer, builder.
  Never include any text outside the JSON object.
  ```
- [ ] **2.2.3** Save the system prompt

### 2.3 Get your Botpress credentials
- [ ] **2.3.1** In the Botpress workspace, go to **Settings → Developer** (or look for **"API"** or **"Integrations"** in the sidebar)
- [ ] **2.3.2** Find and copy your **Bot ID** — it looks like a UUID or slug (e.g. `ghostcraft-commander-abc123`). Save this as `BOTPRESS_BOT_ID` in your `.env`
- [ ] **2.3.3** Generate a **Personal Access Token** (PAT) — this is what your code uses to authenticate API calls to Botpress. Copy it immediately (it's only shown once). Save as `BOTPRESS_TOKEN` in your `.env`
- [ ] **2.3.4** Note the **Botpress API base URL** — usually `https://api.botpress.cloud`. You'll use this in `src/botpress/client.ts`

### 2.4 Test the Botpress bot manually
- [ ] **2.4.1** In the Studio, find the **"Emulator"** or **"Webchat"** preview panel (bottom of screen or right sidebar)
- [ ] **2.4.2** Type a test goal: `I want to build a simple house with wood and stone`
- [ ] **2.4.3** Confirm the bot responds with valid JSON containing at least two agents (lumberjack + miner)
- [ ] **2.4.4** If the bot responds with prose instead of JSON, go back to 2.2.2 and strengthen the system prompt — add `"IMPORTANT: Output ONLY the JSON object. Do not include any other text."` at the top
- [ ] **2.4.5** Try a farming goal: `I want to grow and harvest wheat` — confirm the bot returns a farmer agent in the plan
- [ ] **2.4.6** The bot is working when every test input produces clean parseable JSON with valid role names. **Do not move on until this is true.**

---

## Step 3 — PaperMC Minecraft Server Setup

### 3.1 Download and initialize PaperMC
- [ ] **3.1.1** Create `ghostcraft/minecraft-server/` directory
- [ ] **3.1.2** Download the latest PaperMC 1.20.1 jar from [https://papermc.io/downloads](https://papermc.io/downloads) — save as `minecraft-server/paper.jar`
  - Use **1.20.1 specifically** — this has the best Mineflayer compatibility
- [ ] **3.1.3** First run to generate config files: `cd minecraft-server && java -jar paper.jar nogui`
  - It will stop by itself after generating files — that's expected
- [ ] **3.1.4** Accept the EULA: open `minecraft-server/eula.txt`, change `eula=false` to `eula=true`

### 3.2 Configure server.properties
- [ ] **3.2.1** Open `minecraft-server/server.properties` and set:
  ```
  online-mode=false
  enable-rcon=true
  rcon.password=ghostcraft123
  rcon.port=25575
  max-players=20
  spawn-protection=0
  gamemode=creative
  difficulty=peaceful
  view-distance=6
  simulation-distance=6
  motd=GhostCraft Demo Server
  ```
- [ ] **3.2.2** Save and close the file

### 3.3 Start and verify the server
- [x] **3.3.1** Start the server: `java -jar paper.jar nogui` (run this in its own terminal tab — leave it running)
- [x] **3.3.2** Wait for `Done! For help, type "help"` in the server console
- [x] **3.3.3** Open Minecraft, add server `localhost:25565`, join — confirm you can connect
- [x] **3.3.4** In the Minecraft chat, run `/gamemode creative` — confirm it works (you should already be in creative per server.properties but verify)

### 3.4 Write and test the RCON connection
- [x] **3.4.1** Create `src/minecraft/serverAdmin.ts` with:
  - `connectRcon(): Promise<void>` — connects using env vars
  - `runCommand(command: string): Promise<string>` — sends a raw command
  - `giveLoadout(botUsername: string, items: string[]): Promise<void>` — loops through items and runs `/give` for each
- [x] **3.4.2** Create `scripts/test-rcon.ts` — connects RCON, runs `say RCON connected!`, disconnects
- [x] **3.4.3** Run it: `npx ts-node scripts/test-rcon.ts` — confirm the message appears in the Minecraft server console
- [x] **3.4.4** Extend the test to give yourself (your Minecraft username) an iron axe via `/give <yourname> iron_axe 1` — confirm it appears in your in-game inventory

### 3.5 Design and prepare the demo world
- [ ] **3.5.1** Join the server in Minecraft as a regular player
- [ ] **3.5.2** Build the demo area within 30 blocks of spawn:
  - **North of spawn:** Plant or place 10-15 oak trees in a cluster (use bone meal if needed)
  - **East of spawn:** Expose a large flat stone deposit (dig down 1-2 layers to expose stone)
  - **Spawn area:** Clear flat ground, no obstacles, well-lit with torches
- [ ] **3.5.3** Note the coordinates of the tree cluster and stone deposit — write them in a comment in `src/utils/constants.ts` for reference
- [ ] **3.5.4** Run `save-all` in the server console to save the world
- [ ] **3.5.5** Test manually: stand near spawn and confirm you can clearly see both the tree cluster and the stone area

---

## Step 4 — Core Utilities & Type Definitions

### 4.1 Define shared types
- [x] **4.1.1** Create `src/utils/types.ts` and define:
  ```typescript
  export type AgentRole = 'lumberjack' | 'miner' | 'farmer' | 'builder';
  export type AgentStatus = 'idle' | 'working' | 'complete' | 'error';

  export interface AgentState {
    agentId: string;
    role: AgentRole;
    name: string;
    threadId: string;
    statusMessageId: string;
    botUsername: string;
    currentTask: string;
    taskCurrent: number;
    taskTotal: number;
    taskProgress: string;        // e.g. "8/32"
    status: AgentStatus;
    location: { x: number; y: number; z: number };
    inventory: string[];
    createdAt: Date;
    spawnedByCommander: boolean;
  }

  export interface CommanderPlan {
    analysis: string;
    agents: Array<{
      role: AgentRole;
      task: string;
      reason: string;
    }>;
    summary: string;
  }

  export interface CommanderState {
    goal: string;
    plan: CommanderPlan | null;
    deployedAgentIds: string[];
    status: 'planning' | 'active' | 'complete';
    embedMessageId: string;
  }
  ```
- [x] **4.1.2** Export all types — they'll be imported everywhere

### 4.2 Define constants
- [x] **4.2.1** Create `src/utils/constants.ts` with:
  ```typescript
  import { AgentRole } from './types';

  export const ROLE_EMOJIS: Record<AgentRole, string> = {
    lumberjack: '🪓',
    miner: '⛏️',
    farmer: '🌾',
    builder: '🏗️',
  };

  export const ROLE_COLORS: Record<AgentRole | 'commander', number> = {
    lumberjack: 0x228B22,
    miner: 0x808080,
    farmer: 0xF4A460,
    builder: 0x4169E1,
    commander: 0xFFD700,
  };

  export const ROLE_NAMES: Record<AgentRole, string> = {
    lumberjack: 'Lumberjack',
    miner: 'Miner',
    farmer: 'Farmer',
    builder: 'Builder',
  };

  export const VALID_ROLES: AgentRole[] = ['lumberjack', 'miner', 'farmer', 'builder'];

  export const BOT_USERNAME_PREFIX = 'GC_';
  export const EMBED_UPDATE_INTERVAL_MS = 15000;
  export const COMMANDER_POLL_INTERVAL_MS = 30000;

  export const LOADOUTS: Record<AgentRole, string[]> = {
    lumberjack: ['iron_axe 1', 'chest 2', 'bread 8'],
    miner:      ['iron_pickaxe 1', 'chest 2', 'torch 16', 'bread 8'],
    farmer:     ['diamond_hoe 1', 'wheat_seeds 32', 'bone_meal 16', 'bread 8'],
    builder:    ['oak_planks 64', 'cobblestone 64', 'iron_shovel 1', 'bread 8'],
  };
  ```

### 4.3 Create helper utilities
- [x] **4.3.1** Create `src/utils/logger.ts` — simple wrapper with `[INFO]`, `[WARN]`, `[ERROR]` prefixes and timestamps. Export `log`, `warn`, `error` functions. Use these everywhere instead of `console.log`.
- [x] **4.3.2** Create `src/utils/progressBar.ts`:
  ```typescript
  export function buildProgressBar(current: number, total: number, length = 12): string {
    if (total === 0) return '░'.repeat(length);
    const filled = Math.round((current / total) * length);
    return '█'.repeat(filled) + '░'.repeat(length - filled);
  }
  ```
- [x] **4.3.3** Create `src/utils/sleep.ts`: `export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));` — you'll need this for RCON delays

---

## Step 5 — Agent Registry & Manager

### 5.1 Build the Agent Registry
- [x] **5.1.1** Create `src/agents/agentRegistry.ts` — an in-memory `Map<string, AgentState>` with these exports:
  - `registerAgent(state: AgentState): void`
  - `getAgent(agentId: string): AgentState | undefined`
  - `getAgentByThreadId(threadId: string): AgentState | undefined` — linear scan comparing `state.threadId`
  - `updateAgent(agentId: string, updates: Partial<AgentState>): void`
  - `removeAgent(agentId: string): void`
  - `getAllAgents(): AgentState[]`
- [x] **5.1.2** `getAgentByThreadId` is the most important function — it's how messages from Discord thread users get routed to the right bot. Implement it carefully.
- [x] **5.1.3** `updateAgent` should merge the partial update into the existing state using object spread: `map.set(id, { ...existing, ...updates })`

### 5.2 Build the Agent Config
- [x] **5.2.1** Create `src/agents/agentConfig.ts` — exports `getRoleConfig(role: AgentRole)` returning the role's name, emoji, color, personality description, and default loadout
- [x] **5.2.2** Include personality descriptions for all four roles exactly as in the spec (enthusiastic lumberjack, gruff miner, calm farmer, perfectionist builder)
- [x] **5.2.3** Export `generateBotUsername(role: AgentRole, existing: AgentState[]): string` — returns `GC_Lumberjack`, and if one already exists in the registry, returns `GC_Lumberjack_2`, etc.

### 5.3 Build the Agent Manager
- [x] **5.3.1** Create `src/agents/agentManager.ts` — exports two functions:
  - `spawnAgent(role, spawnedByCommander, client): Promise<AgentState>`
  - `dismissAgent(agentId, client): Promise<void>`
- [x] **5.3.2** `spawnAgent` orchestrates these steps **in order**:
  1. Validate role is in `VALID_ROLES`
  2. Generate `agentId` (use `uuid`)
  3. Get role config
  4. Generate bot username
  5. Create Discord thread → get `threadId`
  6. Post initial idle embed → save `statusMessageId`
  7. Create Mineflayer bot → wait for it to fully spawn in the world
  8. Wait 1000ms (RCON needs a moment after bot joins)
  9. Give loadout via RCON
  10. Register agent in registry
  11. Start embed update loop
  12. Post personality greeting to thread (non-blocking — don't `await`)
  13. Return the full `AgentState`
- [x] **5.3.3** `dismissAgent` does: cancel bot task → disconnect bot → stop embed loop → archive thread → remove from registry. Each step in a try/catch so one failure doesn't block the others.
- [x] **5.3.4** If `spawnAgent` fails at any step after the thread has been created, delete the thread and re-throw so the user sees a clean error in Discord.

---

## Step 6 — Discord Integration

### 6.1 Set up the Discord bot application *(non-code — do this in the browser)*
- [x] **6.1.1** Go to [https://discord.com/developers/applications](https://discord.com/developers/applications) and click **"New Application"** — name it `GhostCraft`
- [x] **6.1.2** Go to **Bot** tab → click **"Add Bot"** → confirm
- [x] **6.1.3** Under **Bot**, click **"Reset Token"**, copy the token → save as `DISCORD_BOT_TOKEN` in `.env`
- [x] **6.1.4** Under **Bot → Privileged Gateway Intents**, enable: **Message Content Intent** and **Server Members Intent**
- [x] **6.1.5** Go to **OAuth2 → URL Generator**:
  - Scopes: `bot`, `applications.commands`
  - Bot Permissions: `Send Messages`, `Create Public Threads`, `Manage Threads`, `Embed Links`, `Read Message History`, `Use Slash Commands`, `Manage Messages`
- [x] **6.1.6** Copy the generated URL, open it in your browser, and invite the bot to your Discord server
- [x] **6.1.7** In your Discord server, create a category called `GHOSTCRAFT` and inside it create a channel called `#ghostcraft-main`
- [x] **6.1.8** Right-click `#ghostcraft-main` → **Copy Channel ID** → save as `DISCORD_MAIN_CHANNEL_ID` in `.env`
- [x] **6.1.9** Go to **General Information** in the dev portal → copy **Application ID** → save as `DISCORD_CLIENT_ID` in `.env`
- [x] **6.1.10** Right-click your Discord server icon → **Copy Server ID** → save as `DISCORD_GUILD_ID` in `.env`

### 6.2 Set up the Discord.js client in code
- [x] **6.2.1** Create `src/discord/client.ts` — initializes a `Client` with intents: `Guilds`, `GuildMessages`, `MessageContent`
- [x] **6.2.2** Export a singleton `client` and a `loginDiscord(): Promise<void>` function
- [x] **6.2.3** In `src/index.ts`, call `loginDiscord()` and log when ready: `client.once('ready', () => log('Bot online: ' + client.user?.tag))`
- [x] **6.2.4** Run `npm run dev` — confirm `Bot online: GhostCraft#XXXX` prints in the terminal. The bot should show as online in your Discord server.

### 6.3 Register slash commands with Discord
- [x] **6.3.1** Create `src/discord/registerCommands.ts` — uses Discord REST API to register these four commands guild-scoped (instant, no 1-hour wait):
  - `/spawn` — option: `role` (string, required, choices: lumberjack / miner / farmer / builder)
  - `/auto` — option: `goal` (string, required)
  - `/status` — no options
  - `/dismiss` — option: `agent` (string, required)
- [x] **6.3.2** Create `scripts/register-commands.ts` — a one-off script that calls this function
- [x] **6.3.3** Run it: `npx ts-node scripts/register-commands.ts`
- [x] **6.3.4** Open Discord, type `/` in `#ghostcraft-main` — confirm all four GhostCraft commands appear in the autocomplete

### 6.4 Build the Thread Manager
- [x] **6.4.1** Create `src/discord/threadManager.ts` with:
  - `createAgentThread(role: AgentRole, client: Client): Promise<{ threadId: string }>`
  - `archiveThread(threadId: string, client: Client): Promise<void>`
  - `postToThread(threadId: string, content: string, client: Client): Promise<void>`
- [x] **6.4.2** `createAgentThread` fetches `#ghostcraft-main` by ID and calls `channel.threads.create({ name: '{emoji} {RoleName} — Active', autoArchiveDuration: 60 })`
- [x] **6.4.3** Test it: write `scripts/test-thread.ts` that creates a test thread and immediately archives it — confirm you see it appear and disappear in Discord

### 6.5 Build the Embed Builder
- [x] **6.5.1** Create `src/discord/embedBuilder.ts` — each function returns a `discord.js` `EmbedBuilder`:
  - `buildIdleEmbed(state: AgentState): EmbedBuilder`
  - `buildWorkingEmbed(state: AgentState): EmbedBuilder`
  - `buildCompleteEmbed(state: AgentState): EmbedBuilder`
  - `buildErrorEmbed(state: AgentState, errorMsg: string): EmbedBuilder`
  - `buildCommanderPlanningEmbed(goal: string): EmbedBuilder`
  - `buildCommanderActiveEmbed(state: CommanderState): EmbedBuilder`
- [x] **6.5.2** The status card body for agent embeds should look like this (use a code block field for monospace):
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━
  Task:      {currentTask}
  Progress:  {progressBar} {current}/{total}
  Status:    {statusEmoji} {statusText}
  Inventory: {inventory}
  Location:  x:{x} y:{y} z:{z}
  ━━━━━━━━━━━━━━━━━━━━━━━━
  Last update: just now
  ```
- [x] **6.5.3** Use `setColor(ROLE_COLORS[role])` on each embed
- [x] **6.5.4** The Commander embeds use `ROLE_COLORS.commander` (gold) and show the plan list as bullet points

### 6.6 Build the Embed Updater
- [x] **6.6.1** Create `src/discord/embedUpdater.ts` with:
  - `startUpdateLoop(agentId: string, client: Client): void`
  - `stopUpdateLoop(agentId: string): void`
- [x] **6.6.2** Maintain a `Map<string, NodeJS.Timeout>` internally for active intervals
- [x] **6.6.3** Each loop tick: get latest `AgentState` from registry → fetch the status message → build the right embed based on `state.status` → `message.edit({ embeds: [embed] })`
- [x] **6.6.4** Wrap the entire tick in try/catch — a failed edit must never crash the bot
- [x] **6.6.5** `stopUpdateLoop` clears the interval and removes it from the map

---

## Step 7 — Mineflayer Bot Runtime

### 7.1 Build the Bot Factory
- [x] **7.1.1** Create `src/minecraft/botFactory.ts` — exports `createBot(username: string): Promise<Bot>`
- [x] **7.1.2** Bot creation options:
  ```typescript
  const bot = mineflayer.createBot({
    host: env.MC_SERVER_HOST,
    port: env.MC_SERVER_PORT,
    username,
    version: '1.20.1',
    auth: 'offline',
  });
  bot.loadPlugin(pathfinder);
  ```
- [x] **7.1.3** Return a Promise that resolves on the `spawn` event with a 30-second timeout that rejects if the bot never appears in the world
- [x] **7.1.4** Attach `error` and `kicked` event listeners that log the reason and update the agent's status to `'error'` in the registry

### 7.2 Build the Bot Controller
- [x] **7.2.1** Create `src/minecraft/botController.ts` — an in-memory `Map<string, Bot>` of live bot instances with:
  - `registerBot(agentId: string, bot: Bot): void`
  - `getBot(agentId: string): Bot | undefined`
  - `removeBot(agentId: string): void`
  - `getBotState(agentId: string): { location, inventory } | null` — reads directly from the live bot object
- [x] **7.2.2** `getBotState` reads `bot.entity.position` and `bot.inventory.items()` — the embed updater calls this every tick to get fresh data
- [x] **7.2.3** The embed updater loop should call `getBotState` on each tick and push the fresh data into `AgentState` via `updateAgent` before building the embed

### 7.3 Write a standalone bot connection test
- [x] **7.3.1** Create `scripts/test-bot.ts` — spawns `GC_Test`, logs its position every 5 seconds for 15 seconds, then disconnects
- [x] **7.3.2** Run it: `npx ts-node scripts/test-bot.ts` — confirm the bot appears in the Minecraft server console and you can see it standing in the world
- [x] **7.3.3** After the script ends, confirm the bot cleanly disconnects (disappears from the player list)

---

## Step 8 — Task Execution Engine

### 8.1 Build the Task Executor
- [x] **8.1.1** Create `src/minecraft/taskExecutor.ts` — exports `executeTask(agentId: string, taskString: string): Promise<void>`
- [x] **8.1.2** Build a task parser using regex pattern matching:
  ```typescript
  // "collect N <item>" / "mine N <item>" / "chop N <item>"
  const collectMatch = taskString.match(/(?:collect|mine|chop|harvest|get)\s+(\d+)\s+(.+)/i);

  // "come back" / "return to spawn"
  const returnMatch = /come back|return|go to spawn/i.test(taskString);

  // "stop" / "cancel" / "halt"
  const stopMatch = /stop|cancel|halt/i.test(taskString);
  ```
- [x] **8.1.3** Implement `collectResource(agentId, resourceName, count)`:
  1. Normalize the resource name using a lookup map (e.g. `"oak logs"` → `"oak_log"`)
  2. Use `bot.findBlock({ matching: mcData.blocksByName[blockName].id, maxDistance: 64 })` to locate the nearest block
  3. Use pathfinder to navigate to it: `bot.pathfinder.setGoal(new GoalBlock(pos.x, pos.y, pos.z))`
  4. Wait for pathfinder to reach the block, then `await bot.dig(block)`
  5. After each dig, count items in inventory and call `updateAgent` with new `taskCurrent` and `taskProgress`
  6. Repeat until `taskCurrent >= count`
  7. On completion, call `updateAgent` with `status: 'complete'`
- [x] **8.1.4** Build a resource name normalizer map covering the demo resources at minimum:
  ```typescript
  const RESOURCE_MAP: Record<string, string> = {
    'oak log': 'oak_log', 'oak logs': 'oak_log', 'wood': 'oak_log',
    'cobblestone': 'cobblestone', 'stone': 'stone',
    'wheat': 'wheat', 'coal': 'coal_ore',
  };
  ```
- [x] **8.1.5** Add a 60-second timeout to `collectResource` — if no progress is made (taskCurrent hasn't changed), set status to `'error'` to prevent bots getting permanently stuck during the demo

### 8.2 Wire task execution to the Discord conversation
- [x] **8.2.1** Create `src/commands/conversationHandler.ts` — registers a `messageCreate` listener on the Discord client:
  ```typescript
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const agent = getAgentByThreadId(message.channelId);
    if (!agent) return;
    await handleAgentMessage(agent, message.content, client);
  });
  ```
- [x] **8.2.2** Implement `handleAgentMessage`:
  1. Update agent state: `status: 'working'`, `currentTask: content`, reset `taskCurrent: 0`
  2. Post personality task-start message to thread (non-blocking)
  3. Call `taskExecutor.executeTask(agent.agentId, content)`
  4. On completion, post personality completion message
- [x] **8.2.3** Import `conversationHandler.ts` in `src/index.ts` (the import itself registers the listener)
- [ ] **8.2.4** **End-to-end test:** Run the full bot, spawn a lumberjack with `/spawn lumberjack`, type `collect 5 oak logs` in its thread — confirm the bot walks to the tree area and starts chopping

---

## Step 9 — Botpress Commander Integration

> This is where Botpress does its job. Instead of calling Claude directly with a hardcoded prompt, you send the user's goal to your Botpress agent (configured in Step 2) and it returns the structured JSON plan. Botpress manages the LLM, the conversation context, and the response.

### 9.1 Build the Botpress Client wrapper
- [ ] **9.1.1** Create `src/botpress/bpClient.ts` — wraps `@botpress/client` to send messages to your Commander bot and get responses:
  ```typescript
  import { Client } from '@botpress/client';
  import { env } from '../utils/env';

  const bp = new Client({ token: env.BOTPRESS_TOKEN });

  export async function askCommander(goal: string): Promise<string> {
    // Create a new conversation with the Botpress bot
    const { conversation } = await bp.createConversation({
      botId: env.BOTPRESS_BOT_ID,
      channel: 'channel',          // check Botpress docs for correct channel name
      tags: {},
    });

    // Send the goal as a user message
    await bp.createMessage({
      botId: env.BOTPRESS_BOT_ID,
      conversationId: conversation.id,
      userId: 'ghostcraft-system',
      payload: { type: 'text', text: goal },
      tags: {},
    });

    // Wait for the bot's response
    // Poll the conversation messages until the bot replies
    return await waitForBotReply(conversation.id);
  }
  ```
- [ ] **9.1.2** Implement `waitForBotReply(conversationId: string): Promise<string>` — polls `bp.listMessages` every 500ms until a bot message appears, then returns its text. Add a 15-second timeout.
- [ ] **9.1.3** Note: The exact `@botpress/client` API shape may differ slightly — check the package's TypeScript types and adjust accordingly. The above is a guide, not guaranteed API.

### 9.2 Build the Commander plan parser
- [ ] **9.2.1** Create `src/botpress/commanderParser.ts` — exports `parseCommanderResponse(rawResponse: string): CommanderPlan`
- [ ] **9.2.2** The Botpress bot *should* return raw JSON (that's what the system prompt demands) but handle edge cases:
  ```typescript
  // Strip markdown code fences if the LLM added them anyway
  const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);
  ```
- [ ] **9.2.3** Validate the parsed object: confirm `agents` is an array, each agent has a `role` in `VALID_ROLES` and a `task` string. Throw a descriptive error if not.
- [ ] **9.2.4** Add a retry: if parsing fails, call `askCommander` again with an extra instruction appended: `" Respond with ONLY the JSON object, no other text."`

### 9.3 Build the Commander orchestrator
- [ ] **9.3.1** Create `src/agents/commander.ts` — exports `runCommander(goal: string, discordClient: Client): Promise<void>`
- [ ] **9.3.2** Implement the full Commander flow:
  1. Post `buildCommanderPlanningEmbed(goal)` to `#ghostcraft-main` → save the message ID
  2. Call `askCommander(goal)` from `bpClient.ts` → get raw response from Botpress
  3. Call `parseCommanderResponse` → get structured `CommanderPlan`
  4. For each agent in the plan: call `spawnAgent(agent.role, true, discordClient)` → collect `AgentState`
  5. Assign tasks: for each spawned agent, call `taskExecutor.executeTask(agentId, agent.task)` (non-blocking — use `void`, don't `await`)
  6. Edit the Commander embed to `buildCommanderActiveEmbed(commanderState)`
  7. Post Commander personality message to `#ghostcraft-main`
  8. Start the Commander monitoring loop
- [ ] **9.3.3** Implement `startCommanderMonitoring(deployedAgentIds: string[], embedMessageId: string, discordClient: Client)`:
  - Poll every 30 seconds
  - Check if all agents in `deployedAgentIds` have `status === 'complete'`
  - If yes: post a completion summary message, stop polling
- [ ] **9.3.4** The Commander personality message should use your direct LLM call (see Step 10) — keep it short and authoritative

### 9.4 Build the /auto slash command handler
- [ ] **9.4.1** Create `src/commands/autoCommand.ts`:
  1. `await interaction.deferReply()` — the Botpress call takes a few seconds
  2. Extract `goal` from `interaction.options.getString('goal')`
  3. Call `runCommander(goal, client)` (wrap in try/catch)
  4. `await interaction.editReply('👑 Commander deployed. Watch the main channel.')`
  5. On error: `await interaction.editReply('Commander failed: ' + error.message)`
- [ ] **9.4.2** Wire in `src/index.ts` under `commandName === 'auto'`

### 9.5 Build the remaining slash command handlers
- [ ] **9.5.1** Create `src/commands/spawnCommand.ts`:
  - Defer reply → validate role → call `spawnAgent` → reply `"{emoji} {Name} deployed! Check the thread."`
- [ ] **9.5.2** Create `src/commands/statusCommand.ts`:
  - Get all agents from registry → build a status summary embed listing each agent's name, task, and progress → reply
- [ ] **9.5.3** Create `src/commands/dismissCommand.ts`:
  - Find agent by matching the option string against agent names → call `dismissAgent` → reply confirming
- [ ] **9.5.4** Wire all three in `src/index.ts`

---

## Step 10 — Agent Personality Messages

> These are direct LLM calls (not through Botpress) — they're short, fire-and-forget, and non-critical. If they fail, the system keeps working.

### 10.1 Build the LLM client for personality
- [ ] **10.1.1** Create `src/llm/llmClient.ts` — wraps the Anthropic SDK:
  ```typescript
  export async function callLLM(system: string, user: string): Promise<string>
  ```
- [ ] **10.1.2** Use model `claude-haiku-4-5-20251001`, `max_tokens: 100`
- [ ] **10.1.3** On any error, return a sensible default string (e.g. `"On it."`) rather than throwing — personality messages are not critical path

### 10.2 Build the personality prompt system
- [ ] **10.2.1** Create `src/llm/personalityPrompt.ts` — exports:
  - `PERSONALITY_PROMPTS: Record<AgentRole, string>` — one system prompt per role
  - `generatePersonalityMessage(role: AgentRole, event: string): Promise<string>` — calls `callLLM` with the role's system prompt and event description
- [ ] **10.2.2** Each system prompt follows this format:
  ```
  You are [Role], a Minecraft worker bot. Personality: [description].
  Respond to events in ONE short sentence, in character. No quotes. No AI references.
  ```
- [ ] **10.2.3** To post a personality message: call `generatePersonalityMessage`, then call `threadManager.postToThread(threadId, '{emoji} *' + message + '*', client)`
- [ ] **10.2.4** Call personality messages on these events: task started, task complete, task error
- [ ] **10.2.5** Test: spawn a lumberjack, give it a task — confirm an italicized in-character message appears in the thread within 3 seconds

---

## Step 11 — Wiring, Integration Testing & Demo Polish

### 11.1 Wire the main entry point
- [ ] **11.1.1** Open `src/index.ts` and wire everything:
  ```typescript
  import { loginDiscord, client } from './discord/client';
  import { connectRcon } from './minecraft/serverAdmin';
  import './commands/conversationHandler'; // registers messageCreate listener

  client.once('ready', async () => {
    log('GhostCraft online: ' + client.user?.tag);
    await connectRcon();
    log('RCON connected. All systems ready.');
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    switch (interaction.commandName) {
      case 'spawn':   return handleSpawn(interaction, client);
      case 'auto':    return handleAuto(interaction, client);
      case 'status':  return handleStatus(interaction, client);
      case 'dismiss': return handleDismiss(interaction, client);
    }
  });

  process.on('unhandledRejection', (err) => error('Unhandled rejection:', err));

  loginDiscord();
  ```
- [ ] **11.1.2** Run `npx tsc --noEmit` — fix all TypeScript errors before proceeding
- [ ] **11.1.3** Run `npm run dev` — confirm both `Bot online` and `RCON connected` appear

### 11.2 Full integration test — run all 5 test cases
- [ ] **11.2.1** **Test 1 — Spawn:** `/spawn lumberjack` → thread created, bot joins server, loadout given, idle embed visible, greeting message posts
- [ ] **11.2.2** **Test 2 — Task:** In lumberjack thread: `collect 10 oak logs` → bot walks to trees, embed progress bar advances, personality message posts
- [ ] **11.2.3** **Test 3 — Two agents:** `/spawn miner` while lumberjack works → give miner `collect 8 cobblestone` → both bots visible in Minecraft, both embeds updating simultaneously
- [ ] **11.2.4** **Test 4 — Commander:** `/auto I want to build a simple house with wood and cobblestone` → Botpress called → Commander embed shows plan → two threads auto-spawn → both bots start tasks → Commander posts personality message
- [ ] **11.2.5** **Test 5 — Dismiss:** `/dismiss lumberjack` → bot disconnects from server, thread archives, registry clears

### 11.3 Stability hardening
- [ ] **11.3.1** Add a 1000ms delay between each RCON `/give` command in `giveLoadout` — some servers need a tick between them
- [ ] **11.3.2** Add bot reconnection guard — if a bot unexpectedly disconnects, update its state to `error` and post a message to its thread
- [ ] **11.3.3** Add a stuck-bot guard in `collectResource` — if `taskCurrent` doesn't increase for 60 seconds, set status to `error`
- [ ] **11.3.4** Confirm `stopUpdateLoop` is always called when an agent is removed — check for interval leaks

### 11.4 Demo run rehearsals
- [ ] **11.4.1** Run the full scripted demo arc (Beats 1–6 from `ghostcraft_spec.md`) from a fresh server restart — time it (target: under 5 minutes)
- [ ] **11.4.2** Verify bots navigate to the tree area and stone area without getting stuck
- [ ] **11.4.3** If a bot gets stuck, adjust tree/stone placement in the world to be more accessible
- [ ] **11.4.4** Run the full demo arc **5 times** without failure before tagging

### 11.5 Visual and presentation polish
- [ ] **11.5.1** Check all embeds look clean — especially the progress bar and the monospace status card
- [ ] **11.5.2** Confirm Commander embed looks impressive — gold color, clear plan with emojis
- [ ] **11.5.3** Set up your screen: Discord on the left, Minecraft on the right (or two monitors)
- [ ] **11.5.4** Position Minecraft camera at spawn facing the tree/stone area so bots are visible to the audience
- [ ] **11.5.5** Practice the verbal script from the spec while running the demo — know exactly what to say at each beat

### 11.6 Final commit and tag
- [ ] **11.6.1** Run `npx tsc --noEmit` — zero errors
- [ ] **11.6.2** Confirm `.env` is NOT staged: `git status`
- [ ] **11.6.3** Commit: `git add -A && git commit -m "feat: GhostCraft v1.0 demo-ready"`
- [ ] **11.6.4** Tag: `git tag v1.0-demo-ready`

---

## Bonus Features *(only after v1.0-demo-ready is tagged and tested)*

### B.1 Agent-to-agent communication
- [ ] **B.1.1** When a Commander-spawned agent completes its task, check if another Commander agent needs to be notified
- [ ] **B.1.2** Post a handoff message to the downstream agent's thread (e.g. Lumberjack tells Builder where the wood is)
- [ ] **B.1.3** The downstream agent receives this as a new task instruction

### B.2 Commander completion summary
- [ ] **B.2.1** When all Commander-deployed agents reach `status: 'complete'`, post a final mission summary embed in `#ghostcraft-main`
- [ ] **B.2.2** Summary lists: each agent, their task, and items collected
- [ ] **B.2.3** Commander personality message: "Mission complete. All materials collected. Ready for the next phase."

### B.3 /status command polish
- [ ] **B.3.1** Enhance `/status` to show a single embed with all agents, their progress bars, and a total tasks-completed-today counter

---

## Quick Reference — What Botpress Does vs. What discord.js Does

| Concern | Handled by |
|---------|-----------|
| Commander goal decomposition (LLM) | **Botpress** (Step 9) |
| Commander conversation context | **Botpress** |
| Slash commands | discord.js |
| Discord threads | discord.js |
| Live status embeds | discord.js |
| Message routing to agents | discord.js |
| Agent personality messages (LLM) | Direct Claude API (Step 10) |
| Minecraft bot control | Mineflayer |
| Minecraft item giving | RCON |

## Quick Reference — Critical Files

| File | Purpose | Step |
|------|---------|------|
| `src/utils/types.ts` | All TypeScript interfaces | 4.1 |
| `src/utils/constants.ts` | Roles, colors, loadouts | 4.2 |
| `src/utils/env.ts` | Typed env vars | 1.4 |
| `src/agents/agentRegistry.ts` | In-memory agent store | 5.1 |
| `src/agents/agentManager.ts` | Spawn/dismiss orchestration | 5.3 |
| `src/agents/commander.ts` | Commander mode logic | 9.3 |
| `src/botpress/bpClient.ts` | Calls Botpress agent API | 9.1 |
| `src/botpress/commanderParser.ts` | Parses Botpress JSON response | 9.2 |
| `src/minecraft/botFactory.ts` | Creates Mineflayer bots | 7.1 |
| `src/minecraft/botController.ts` | Registry of live bot objects | 7.2 |
| `src/minecraft/taskExecutor.ts` | Natural language → bot actions | 8.1 |
| `src/minecraft/serverAdmin.ts` | RCON commands | 3.4 |
| `src/discord/client.ts` | Discord.js client singleton | 6.2 |
| `src/discord/threadManager.ts` | Thread creation/management | 6.4 |
| `src/discord/embedBuilder.ts` | All embed templates | 6.5 |
| `src/discord/embedUpdater.ts` | 15s live update loop | 6.6 |
| `src/llm/llmClient.ts` | Direct Claude API for personalities | 10.1 |
| `src/llm/personalityPrompt.ts` | Per-role personality prompts | 10.2 |
| `src/commands/spawnCommand.ts` | /spawn handler | 9.5 |
| `src/commands/autoCommand.ts` | /auto handler | 9.4 |
| `src/commands/statusCommand.ts` | /status handler | 9.5 |
| `src/commands/dismissCommand.ts` | /dismiss handler | 9.5 |
| `src/index.ts` | Main entry point | 11.1 |
