# GhostCraft — Project Specification
### Autonomous AI Minecraft Task Delegation Through Discord
### Built with Botpress ADK + Mineflayer + Mindcraft + PaperMC

---

## Table of Contents
1. [Project Vision](#project-vision)
2. [The Elevator Pitch](#the-elevator-pitch)
3. [Demo Arc](#demo-arc)
4. [System Architecture](#system-architecture)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Core Concepts](#core-concepts)
8. [Feature Specifications](#feature-specifications)
9. [The Commander Mode](#the-commander-mode)
10. [Agent Personalities](#agent-personalities)
11. [Live Status Embeds](#live-status-embeds)
12. [Minecraft Server Setup](#minecraft-server-setup)
13. [Agent Loadouts](#agent-loadouts)
14. [Discord Setup](#discord-setup)
15. [Environment Variables](#environment-variables)
16. [Build Order](#build-order)
17. [Bonus Features](#bonus-features)
18. [Demo Environment Setup](#demo-environment-setup)

---

## Project Vision

GhostCraft is an autonomous AI agent system that lets you delegate real Minecraft tasks to a workforce of AI bots — entirely through Discord. Each agent is a real Minecraft bot (powered by Mineflayer) that joins your server, receives natural language instructions, executes tasks autonomously, and reports back with live status updates in its own dedicated Discord thread.

The system has two modes:

**Manual Mode** — You spawn individual named agents (Lumberjack, Miner, etc.), each with their own Discord thread, their own personality, their own live status card, and their own set of skills. You talk to them directly. They work independently.

**Commander Mode (Auto Mode)** — You give a single high-level natural language goal to a master orchestrator agent. The Commander reasons about what tasks are needed, spawns the appropriate worker agents automatically, assigns them their tasks, monitors their progress, and coordinates the overall workflow. You typed one sentence. A workforce appeared.

GhostCraft is not a toy. It is a demonstration of what multi-agent AI orchestration looks like when given a tangible, visual, universally understood environment — Minecraft — as the execution surface. The demo is visceral, the concept is immediately understood by anyone, and the underlying architecture is a genuine production-quality multi-agent system.

---

## The Elevator Pitch

> "GhostCraft is an autonomous agent system that allows for AI Minecraft task delegation through Discord's easy-to-use UI, orchestrated by Botpress's ADK. You tell it what you want done. It figures out who to send. They go do it. You watch."

---

## Demo Arc

This is the exact sequence for a 3-5 minute demo. Every beat is planned. Do not deviate from this during the presentation.

### Beat 1 — The Setup (30 seconds)
Open Discord. Show the GhostCraft bot is online. Briefly explain:
> "GhostCraft lets you manage a team of AI Minecraft workers from Discord. Each worker is a real bot inside our Minecraft server. Let's start with manual mode."

### Beat 2 — Spawn the Lumberjack (60 seconds)
Type in Discord:
```
/spawn lumberjack
```
A new Discord thread opens: **🪓 Lumberjack — Active**

The live status embed appears in the thread:
```
🪓 LUMBERJACK — Active
━━━━━━━━━━━━━━━━━━━━━━━━
Task:      Idle — awaiting orders
Progress:  Waiting...
Status:    🟢 Online
Inventory: Iron Axe x1
Location:  x:0 y:64 z:0
━━━━━━━━━━━━━━━━━━━━━━━━
Last update: just now
```

On the Minecraft screen (shown to audience), a bot character named "Lumberjack" joins the server.

Type in the Lumberjack thread:
```
collect 32 oak logs
```

The bot starts walking toward the pre-placed tree area. The status embed updates live. The bot sends a personality message:
> 🪓 *"Found a good oak forest nearby. Starting harvest. This is what I live for."*

The status card updates:
```
Task:      Collect 32 oak logs
Progress:  ████░░░░░░░░ 8/32
Status:    🌲 Harvesting trees
```

### Beat 3 — Spawn the Miner simultaneously (45 seconds)
Without closing the Lumberjack thread, go back to the main channel. Type:
```
/spawn miner
```

A second thread opens: **⛏️ Miner — Active**

A second bot joins the Minecraft server. Now there are TWO bots working simultaneously, each with their own live thread.

Type in the Miner thread:
```
collect 16 cobblestone
```

The miner heads toward the pre-placed stone area. Personality message:
> ⛏️ *"Underground is where I belong. Going deep."*

Both status cards are now updating simultaneously. Two threads. Two bots. Two live status cards.

Point this out to the audience explicitly:
> "Two agents. Two threads. Two bots. Both working right now. Completely independently."

### Beat 4 — The transition (15 seconds)
> "That's manual mode. You manage each agent individually. But what if you don't want to think about any of that?"

Close both agent threads (or just navigate away).

### Beat 5 — Commander Mode (90 seconds — THE MOMENT)
Go back to the main GhostCraft channel. Type:
```
/auto "I want to build a simple house. I need wood and cobblestone."
```

Show the Commander thinking. A master status embed appears in the main channel:

```
👑 COMMANDER — Planning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal:    Build a simple house
Status:  🧠 Analyzing requirements...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

After a few seconds the Commander updates:

```
👑 COMMANDER — Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal:    Build a simple house
Plan:    
  ✅ Identified: Need wood + cobblestone
  🪓 Lumberjack → Collect 32 oak logs
  ⛏️ Miner → Collect 16 cobblestone
  
Agents:  2 deployed
Status:  🟢 Workers dispatched
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Two new threads automatically appear — Lumberjack and Miner — both already with their tasks assigned. Both bots join the Minecraft server. Both start working.

Commander posts to the main channel:
> 👑 *"I've analyzed the goal. Dispatching a Lumberjack for wood and a Miner for cobblestone. I'll report when materials are ready."*

The audience just watched one sentence spawn a planning agent that decomposed the goal, made decisions, and deployed a workforce autonomously.

### Beat 6 — The Close (20 seconds)
> "One sentence. Two workers deployed. Materials being collected right now in a live Minecraft server. This is GhostCraft — autonomous AI task delegation. You focus on what you want. GhostCraft figures out how to get it done."

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Discord Server                            │
│                                                                 │
│  #ghostcraft-main          #lumberjack-1    #miner-1           │
│  User: /auto "build house"  Live embed       Live embed         │
│  Commander: Planning...     updating...      updating...        │
└──────────────────┬──────────────────────────────────────────────┘
                   │ Botpress ADK
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Botpress ADK Agent                            │
│                                                                 │
│  ┌─────────────────────┐    ┌────────────────────────────────┐  │
│  │   Slash Commands    │    │     Conversation Handler       │  │
│  │   /spawn [role]     │    │     Routes messages to         │  │
│  │   /auto [goal]      │    │     correct agent thread       │  │
│  │   /status           │    │     Maintains context          │  │
│  │   /dismiss [agent]  │    └────────────────────────────────┘  │
│  └─────────────────────┘                                        │
└──────────────────┬──────────────────────────────────────────────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
┌──────────────────┐  ┌──────────────────────────────────────────┐
│  Agent Manager   │  │           Commander (LLM)                │
│                  │  │                                          │
│  Spawns bots     │  │  Receives high-level goal                │
│  Assigns tasks   │  │  Decomposes into subtasks                │
│  Tracks state    │  │  Decides which agents to spawn           │
│  Updates embeds  │  │  Monitors overall progress               │
│  Routes messages │  │  Reports back to main channel            │
└────────┬─────────┘  └──────────────────────┬───────────────────┘
         │                                    │
         └──────────────┬─────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Mineflayer Bot Runtime                          │
│                                                                 │
│  Bot Instance 1          Bot Instance 2        Bot Instance N  │
│  (Lumberjack)            (Miner)               (...)           │
│  - Joins server          - Joins server                        │
│  - Receives task         - Receives task                       │
│  - Executes via          - Executes via                        │
│    Mindcraft/LLM           Mindcraft/LLM                       │
│  - Reports status        - Reports status                      │
│  - Sends personality     - Sends personality                   │
│    messages to Discord     messages to Discord                 │
└─────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              PaperMC Local Minecraft Server                      │
│                                                                 │
│  - Runs locally on localhost:25565                              │
│  - Offline mode enabled (no Mojang auth needed)                 │
│  - Pre-built demo world with trees and stone nearby             │
│  - Bots join as fake players                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Agent Framework | Botpress ADK (TypeScript) | Discord integration, conversation handling, slash commands, thread management |
| Minecraft Bots | Mineflayer (Node.js) | Bot joins server, moves, mines, chops, interacts with world |
| AI Task Planning | Mindcraft (wraps Mineflayer + LLM) | Natural language task execution for individual agents |
| Commander LLM | Gemini Flash or Claude Haiku | Decomposes high-level goals into agent tasks |
| Personality LLM | Gemini Flash or Claude Haiku | Generates in-character status messages |
| Discord UI | Discord.js | Thread creation, embed building, live embed editing |
| Minecraft Server | PaperMC (local) | The actual Minecraft world where bots operate |
| Memory (bonus) | Backboard.io | Agent memory across sessions |
| Language | TypeScript | Entire project |

---

## Project Structure

```
ghostcraft/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── agent.config.ts                    # Botpress ADK config
├── conversation/
│   └── index.ts                       # Main Botpress message handler
├── commands/
│   ├── spawnCommand.ts                # /spawn [role] handler
│   ├── autoCommand.ts                 # /auto [goal] handler
│   ├── statusCommand.ts               # /status handler
│   └── dismissCommand.ts             # /dismiss [agent] handler
├── agents/
│   ├── agentManager.ts               # Spawns, tracks, dismisses agents
│   ├── agentRegistry.ts              # In-memory store of active agents
│   ├── agentConfig.ts                # Role definitions, loadouts, personalities
│   └── commander.ts                  # Commander/auto mode orchestrator
├── minecraft/
│   ├── botFactory.ts                 # Creates Mineflayer bot instances
│   ├── botController.ts              # Sends tasks to bots, reads state
│   ├── taskExecutor.ts               # Translates task strings to Mineflayer actions
│   └── serverAdmin.ts                # RCON commands for item giving etc.
├── discord/
│   ├── threadManager.ts              # Creates and manages Discord threads
│   ├── embedBuilder.ts               # Builds all Discord embeds
│   └── embedUpdater.ts               # Live embed update loop
├── llm/
│   ├── llmClient.ts                  # Unified LLM API wrapper
│   ├── commanderPrompt.ts            # System prompt for Commander
│   └── personalityPrompt.ts          # System prompt for agent personalities
└── utils/
    ├── logger.ts
    └── constants.ts                  # Role names, colors, emojis
```

---

## Core Concepts

### Agent
An agent is the combination of:
1. A **Discord thread** — where humans interact with it
2. A **pinned status embed** — live updating card showing what it's doing
3. A **Mineflayer bot instance** — the actual player in the Minecraft world
4. A **personality** — the character it expresses in its messages
5. A **role** — determines its skills, loadout, and task vocabulary

### Agent State Object
Every active agent is tracked in the agent registry as:

```typescript
interface AgentState {
  agentId: string           // uuid
  role: AgentRole           // "lumberjack" | "miner" | "builder" | "farmer"
  name: string              // "Lumberjack", "Miner", etc.
  threadId: string          // Discord thread channel ID
  statusMessageId: string   // ID of the pinned status embed message
  botUsername: string       // Minecraft username the bot uses
  currentTask: string       // Human readable current task
  taskProgress: string      // e.g. "8/32"
  status: AgentStatus       // "idle" | "working" | "complete" | "error"
  location: { x: number, y: number, z: number }
  inventory: string[]       // Simple string list of held items
  createdAt: Date
  spawnedByCommander: boolean
}
```

### Agent Roles

| Role | Emoji | Skills | Default Task Vocabulary |
|------|-------|--------|------------------------|
| Lumberjack | 🪓 | Chop trees, collect logs | collect logs, chop wood, harvest trees |
| Miner | ⛏️ | Mine stone, coal, iron | mine stone, collect cobblestone, dig |
| Farmer | 🌾 | Harvest crops, plant seeds | harvest wheat, plant seeds, collect food |
| Builder | 🏗️ | Place blocks, construct | build structure, place blocks, construct |

---

## Feature Specifications

### Feature 1: /spawn Command

**Command:** `/spawn [role]`
**Examples:** `/spawn lumberjack`, `/spawn miner`

**Flow:**
1. Botpress ADK receives the slash command
2. `spawnCommand.ts` validates the role is a known role
3. `agentManager.ts` is called with the role
4. `threadManager.ts` creates a new Discord thread named "🪓 Lumberjack — Active"
5. `embedBuilder.ts` builds the initial idle status embed
6. Thread sends the embed → saves the message ID to agent state
7. `botFactory.ts` creates a new Mineflayer bot instance with a unique username
8. Bot joins the PaperMC server
9. `serverAdmin.ts` runs RCON commands to give the bot its loadout items
10. Agent state is registered in `agentRegistry.ts`
11. `embedUpdater.ts` starts the 15-second update loop for this agent
12. Bot sends a personality greeting message to the thread
13. Botpress responds in the original channel: "🪓 Lumberjack deployed! Check the thread."

**Error handling:** If role is unknown, respond with available roles. If bot fails to connect, respond with error and clean up thread.

---

### Feature 2: Talking to an Agent in its Thread

**Flow:**
1. User sends a message in an agent thread (e.g. "collect 32 oak logs")
2. Botpress conversation handler detects the message came from a registered agent thread
3. `agentRegistry.ts` looks up which agent owns this thread
4. `taskExecutor.ts` translates the natural language task into a Mineflayer/Mindcraft instruction
5. Bot receives the task and begins executing
6. Agent state is updated: `currentTask = "Collect 32 oak logs"`, `status = "working"`
7. Personality LLM generates an acknowledgment message in character
8. Status embed updates on next tick

**Task translation examples:**
- "collect 32 oak logs" → Mindcraft instruction: `"collect 32 oak_log"`
- "mine some cobblestone" → Mindcraft instruction: `"collect 16 cobblestone"`
- "come back to spawn" → Mineflayer pathfinder: go to spawn coordinates
- "stop what you're doing" → cancel current Mineflayer task

---

### Feature 3: Live Status Embed

The status embed is a Discord embed that is sent once when the agent spawns and then edited in place every 15 seconds with current data.

**Idle state:**
```
🪓 LUMBERJACK — Active
━━━━━━━━━━━━━━━━━━━━━━━━
Task:      Idle — awaiting orders
Progress:  Waiting for task...
Status:    🟢 Online
Inventory: Iron Axe x1, Chest x2
Location:  x:0 y:64 z:0
━━━━━━━━━━━━━━━━━━━━━━━━
Last update: just now
```

**Working state:**
```
🪓 LUMBERJACK — Active
━━━━━━━━━━━━━━━━━━━━━━━━
Task:      Collect 32 oak logs
Progress:  ████████░░░░ 16/32
Status:    🌲 Harvesting trees
Inventory: Iron Axe x1, Oak Log x16
Location:  x:142 y:64 z:-88
━━━━━━━━━━━━━━━━━━━━━━━━
Last update: 8 seconds ago
```

**Complete state:**
```
🪓 LUMBERJACK — Complete
━━━━━━━━━━━━━━━━━━━━━━━━
Task:      Collect 32 oak logs ✅
Progress:  ████████████ 32/32
Status:    ✅ Task complete!
Inventory: Iron Axe x1, Oak Log x32
Location:  x:142 y:64 z:-88
━━━━━━━━━━━━━━━━━━━━━━━━
Last update: just now
```

**Implementation notes:**
- The update loop reads directly from the Mineflayer bot's state: `bot.inventory`, `bot.entity.position`
- Progress is tracked by counting collected items in inventory
- The progress bar is generated by a simple function: given current/total, return a string of filled and empty block characters
- `embedUpdater.ts` runs a `setInterval` per agent at 15 second intervals
- On agent dismiss, clear the interval to prevent memory leaks

---

### Feature 4: Agent Personality Messages

Each role has a defined personality. When events happen (task started, block mined, task complete, error encountered), the bot sends a short in-character message to its Discord thread.

This is implemented by passing the event to the LLM with a personality prompt and posting the response to the thread. The LLM call is fast (Haiku/Flash) and the messages are short (1-2 sentences max).

**Personality definitions:**

**Lumberjack:**
- Personality: Enthusiastic, loves trees and the outdoors, slightly poetic about nature
- Example messages:
  - On task start: *"A fine forest lies to the north. Time to get to work."*
  - On progress: *"The trees fall one by one. Nature provides."*
  - On complete: *"32 logs, clean and stacked. A good day's work."*
  - On error: *"Something blocked my path. Recalculating route."*

**Miner:**
- Personality: Gruff, no-nonsense, loves the underground, slightly grumpy on the surface
- Example messages:
  - On task start: *"Going underground. Finally. Surface is overrated."*
  - On progress: *"Stone gives way. As it always does."*
  - On complete: *"Got what you needed. Don't ask me to go back up yet."*
  - On error: *"Hit a wall. Trying another angle."*

**Farmer:**
- Personality: Calm, patient, philosophical about growth and seasons
- Example messages:
  - On task start: *"The soil is ready. Let's see what grows."*
  - On complete: *"Harvest done. The earth gives generously."*

**Builder:**
- Personality: Perfectionist, proud, slightly dramatic about architecture
- Example messages:
  - On task start: *"Every great structure starts with a plan. I have one."*
  - On complete: *"Not bad. Not bad at all."*

**Implementation:**
The personality prompt system works like this:
```
System: You are [role] working in Minecraft. Your personality: [personality description].
Respond to this event in ONE short sentence, in character. Be natural, not robotic.
Event: [event description e.g. "just started collecting oak logs"]
```

Call the LLM, post the result to the thread. That's it.

---

## The Commander Mode

This is the showstopper feature. The Commander is an LLM-powered orchestrator that receives a high-level goal, reasons about what agents are needed, spawns them, assigns tasks, and monitors overall progress.

### /auto Command

**Command:** `/auto [goal]`
**Example:** `/auto "I want to build a simple house with wood and cobblestone"`

### Commander Flow

**Step 1 — Receive goal**
User types `/auto "build a simple house with wood and cobblestone"`

**Step 2 — Post initial Commander embed**
In the main channel, immediately post:
```
👑 COMMANDER — Planning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal:    Build a simple house
Status:  🧠 Analyzing requirements...
Agents:  None deployed yet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 3 — LLM task decomposition**
Pass the goal to the Commander LLM with this system prompt:

```
You are Commander, an AI orchestrator for a team of Minecraft worker bots.
Your job is to analyze a high-level goal and decompose it into specific tasks
for your available workers.

Available workers and their capabilities:
- lumberjack: collects wood, chops trees, harvests logs
- miner: mines stone, cobblestone, coal, iron ore
- farmer: harvests crops, plants seeds, collects food
- builder: places blocks, constructs structures (basic)

Given a goal, respond with ONLY valid JSON in this format:
{
  "analysis": "Brief explanation of what's needed",
  "agents": [
    {
      "role": "lumberjack",
      "task": "collect 32 oak logs",
      "reason": "Need wood for walls and roof"
    },
    {
      "role": "miner", 
      "task": "collect 16 cobblestone",
      "reason": "Need stone for foundation"
    }
  ],
  "summary": "One sentence describing the overall plan"
}

Goal: [USER GOAL]
```

**Step 4 — Parse LLM response**
Parse the JSON. Extract the list of agents and their tasks.

**Step 5 — Spawn agents automatically**
For each agent in the plan, call the same spawn flow as the `/spawn` command. Each agent gets its own thread, its own bot, its own live status card. They are all flagged as `spawnedByCommander: true`.

**Step 6 — Update Commander embed**
After all agents are spawned:
```
👑 COMMANDER — Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal:    Build a simple house
Plan:    Need wood + stone for construction
         
  🪓 Lumberjack → Collect 32 oak logs
  ⛏️ Miner      → Collect 16 cobblestone
  
Agents:  2 deployed and working
Status:  🟢 Workers dispatched
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Last update: just now
```

**Step 7 — Commander posts a personality message**
The Commander also has a voice — authoritative, intelligent, slightly dramatic:
> 👑 *"Goal received. Analyzed requirements. Lumberjack and Miner deployed. I'll monitor their progress and report when materials are ready."*

**Step 8 — Ongoing monitoring (optional, implement if time)**
Commander checks agent states every 30 seconds. When all agents complete their tasks, it posts a final summary:
> 👑 *"Mission complete. All materials collected. Lumberjack: 32 oak logs. Miner: 16 cobblestone. Ready for construction phase."*

### Commander Personality
The Commander is calm, intelligent, strategic. It speaks like a military commander or project manager. It never sounds robotic. It refers to the agents as "my workers" or "the team."

---

## Agent Loadouts

When a bot spawns, the PaperMC server gives it its starting items via RCON commands. This is done immediately after the bot joins the server, before it receives any tasks.

```typescript
const LOADOUTS: Record<AgentRole, string[]> = {
  lumberjack: [
    "iron_axe",
    "chest 2",      // 2 chests to store collected logs
    "bread 8",      // food so they don't starve
  ],
  miner: [
    "iron_pickaxe",
    "chest 2",
    "torch 16",
    "bread 8",
  ],
  farmer: [
    "diamond_hoe",
    "wheat_seeds 32",
    "bone_meal 16",
    "bread 8",
  ],
  builder: [
    "oak_planks 64",
    "cobblestone 64",
    "iron_shovel",
    "bread 8",
  ]
}
```

For each item in the loadout, run:
```
/give [botUsername] [item] [quantity]
```

This is sent via RCON from `serverAdmin.ts`.

**RCON setup:**
In PaperMC's `server.properties`:
```
enable-rcon=true
rcon.password=ghostcraft123
rcon.port=25575
```

Use the `rcon-client` npm package to send commands programmatically.

---

## Minecraft Server Setup

### PaperMC Setup
1. Download latest PaperMC jar from papermc.io
2. Run once to generate config files: `java -jar paper.jar`
3. Accept EULA: set `eula=true` in `eula.txt`
4. Configure `server.properties`:
   ```
   online-mode=false          # Allows bots to join without Mojang auth
   enable-rcon=true
   rcon.password=ghostcraft123
   rcon.port=25575
   max-players=20
   spawn-protection=0         # Allows building at spawn
   gamemode=creative           # Makes item giving unnecessary if preferred
   difficulty=peaceful         # No enemies during demo
   ```
5. Start server: `java -jar paper.jar nogui`
6. Server runs on `localhost:25565`

### Demo World Design
The world needs to be set up specifically for the demo. Do this before the hackathon presentation:

- **Tree area:** Plant or find a cluster of 10-15 oak trees within 30 blocks of spawn. The lumberjack should be able to find and chop these quickly.
- **Stone area:** Expose a large surface-level stone deposit within 30 blocks of spawn in a different direction from the trees. The miner should reach it in under 10 seconds.
- **Flat spawn area:** Clear flat ground at spawn so bots can navigate without getting stuck.
- **Lighting:** Place torches everywhere so mobs don't spawn during the demo (or keep difficulty=peaceful).
- **Test it:** Run the full demo sequence at least 5 times before presenting to confirm bots navigate correctly.

### Bot Usernames
Each bot should have a clear, human-readable username so judges watching the Minecraft screen know which bot is which:

- `GC_Lumberjack`
- `GC_Miner`
- `GC_Farmer`
- `GC_Builder`

If multiple of the same role are spawned, append a number: `GC_Lumberjack_2`

---

## Discord Setup

### Required Bot Permissions
- Send Messages
- Create Public Threads
- Manage Threads
- Embed Links
- Read Message History
- Use Slash Commands
- Manage Messages (for pinning)

### Slash Commands to Register
```
/spawn [role]    — Spawn a named agent with a specific role
/auto [goal]     — Commander mode: give a high-level goal
/status          — List all active agents and their current states
/dismiss [agent] — Remove an agent and close its thread
```

### Channel Structure
The bot should operate in a dedicated category:

```
📁 GHOSTCRAFT
  #ghostcraft-main          ← Main channel for /spawn, /auto, /status
  (threads created here automatically per agent)
```

### Embed Color Scheme
```typescript
const ROLE_COLORS = {
  lumberjack: 0x228B22,   // Forest green
  miner:      0x808080,   // Stone grey  
  farmer:     0xF4A460,   // Sandy brown
  builder:    0x4169E1,   // Royal blue
  commander:  0xFFD700,   // Gold
}
```

---

## Environment Variables

```
# Botpress
BOTPRESS_BOT_ID=
BOTPRESS_TOKEN=

# Discord
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
DISCORD_CLIENT_ID=
DISCORD_MAIN_CHANNEL_ID=    # The #ghostcraft-main channel ID

# Minecraft
MC_SERVER_HOST=localhost
MC_SERVER_PORT=25565
RCON_PASSWORD=ghostcraft123
RCON_PORT=25575

# LLM (use one)
GEMINI_API_KEY=
ANTHROPIC_API_KEY=

# Optional: Backboard memory
BACKBOARD_API_KEY=
```

---

## Build Order

This is the recommended sequence for building GhostCraft. Each step produces something testable.

### Phase 1 — Infrastructure (1-1.5 hours)
1. Initialize Botpress ADK project, install all dependencies
2. Set up Discord bot with correct permissions, get bot token
3. Start PaperMC server locally, confirm it runs
4. Verify a manual Mineflayer bot can join the server (write a 10-line test script)
5. Set up RCON connection, verify `/give` commands work
6. Set up LLM client (Gemini or Claude)

### Phase 2 — Single Agent Manual Mode (1.5-2 hours)
1. Build `/spawn` slash command handler
2. Build `botFactory.ts` — creates a Mineflayer bot that joins the server
3. Build `agentRegistry.ts` — stores and retrieves agent state
4. Build `threadManager.ts` — creates Discord thread, sends initial embed
5. Build `embedBuilder.ts` — builds the status embed from agent state
6. Build `embedUpdater.ts` — the 15-second edit loop
7. Build RCON loadout giving on spawn
8. Test: `/spawn lumberjack` → thread appears → bot joins server → gets items → embed updates

### Phase 3 — Task Execution (1 hour)
1. Build conversation handler that detects messages in agent threads
2. Build `taskExecutor.ts` — translates natural language to Mineflayer/Mindcraft instructions
3. Wire task execution to update agent state (currentTask, progress)
4. Test: type "collect 10 oak logs" in lumberjack thread → bot starts chopping → embed updates with progress

### Phase 4 — Personality (30 minutes)
1. Build `personalityPrompt.ts` — system prompts per role
2. Build personality message sender — on key events, call LLM, post to thread
3. Test: start a task → bot sends an in-character message

### Phase 5 — Commander Mode (1.5-2 hours)
1. Build `/auto` slash command handler
2. Build `commander.ts` — sends goal to LLM, parses JSON response
3. Build Commander embed (master status card in main channel)
4. Wire Commander to spawn multiple agents automatically
5. Build Commander personality messages
6. Test full Commander flow end to end

### Phase 6 — Polish and Demo Prep (30 minutes — 1 hour)
1. Set up the demo Minecraft world (trees, stone, flat spawn)
2. Test full demo sequence 5 times
3. Fix any bot navigation issues
4. Ensure all embeds look clean and consistent
5. Git commit and tag: `v1.0-demo-ready`

---

## Bonus Features

These are ordered by impact vs. implementation effort. Only attempt after `v1.0-demo-ready` is tagged and working reliably.

### Bonus 1: Agent-to-Agent Communication
When an agent completes a task, it sends a message to another agent's thread. Example: Lumberjack completes collecting wood and tells the Builder where the materials are.

Implementation: When agent state transitions to "complete," look up if Commander mode is active and if there's a downstream agent. Post a message to that agent's thread. The downstream agent's bot receives it as a task instruction.

This creates a genuine pipeline: Lumberjack → Builder → completion. Incredibly impressive.

### Bonus 2: Backboard Memory
Each agent remembers where it found resources in previous sessions. On spawn, query Backboard for the agent's memory. If it has previous location data, navigate there first instead of searching.

Example status message with memory:
> ⛏️ *"I remember finding iron near x:88 y:12 last time. Heading there first."*

Implementation: On task complete, write `{ role, resourceType, location }` to Backboard. On task start, query Backboard for relevant memories and inject into the task prompt.

### Bonus 3: /status Command
Shows an overview of all active agents in one embed:

```
👑 GHOSTCRAFT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Active Agents: 2

🪓 Lumberjack   Working   16/32 logs
⛏️ Miner        Working   8/16 stone

Total Tasks Completed Today: 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Bonus 4: /dismiss Command
Cleanly removes an agent: cancels its Mineflayer task, disconnects the bot from the server, stops the embed update loop, archives the Discord thread, removes from registry.

### Bonus 5: Commander Progress Monitoring
Commander actively watches agent states and updates its master embed as agents complete tasks. When all agents finish, Commander posts a completion summary and suggests next steps.

---

## Demo Environment Setup

**Do all of this BEFORE the hackathon presentation:**

- [ ] PaperMC server starts cleanly with `java -jar paper.jar nogui`
- [ ] Server is configured with `online-mode=false`, `difficulty=peaceful`, RCON enabled
- [ ] Demo world has a cluster of 10-15 oak trees within 30 blocks of spawn
- [ ] Demo world has a large exposed stone deposit within 30 blocks of spawn in a different direction
- [ ] Spawn area is flat and clear
- [ ] Tested manually that a Mineflayer bot can navigate to and chop the trees
- [ ] Tested manually that a Mineflayer bot can navigate to and mine the stone
- [ ] RCON item giving works: bot spawns and receives its loadout correctly
- [ ] Full demo sequence tested 5+ times end to end without failures
- [ ] Git tagged at `v1.0-demo-ready` after all tests pass
- [ ] Minecraft window and Discord window both visible simultaneously on screen during demo
- [ ] Two monitors or split screen arranged so audience sees both game and Discord at once

---
