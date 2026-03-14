# GhostCraft — Final Push Plan
### Pivot: Botpress as the Discord Agent Brain
### Created: 2026-03-14

---

## What Changed

The original plan used Botpress as a backend JSON proxy for Commander task decomposition — a single LLM call hidden behind an unreliable API. That's:
- A waste of Botpress (it's just a JSON pipe, no conversation, no multi-turn)
- Broken (SDK issues, `adk chat` not responding, webchat stopped working)
- Not what BPHacks is about — the hackathon wants **Discord agents built with Botpress**

**New plan:** Use Claude API directly for the simple Commander task decomposition (reliable, 30 lines of code). Then make Botpress the **Discord agent itself** — the smart conversational layer users interact with in Discord.

---

## New Architecture

```
User messages in Discord
        │
        ├── /spawn, /status, /dismiss ──→ discord.js bot (local)
        │                                  handles slash commands,
        │                                  threads, embeds, Mineflayer
        │
        └── Natural language chat ──→ Botpress Discord Agent
            "build me a house"        (hosted on Botpress Cloud,
            "how are the bots?"        connected via Discord integration)
            "stop the miner"                  │
                                              │ webhook to local system
                                              ▼
                                    Local webhook server
                                    triggers Commander / spawn / status
                                              │
                                              ▼
                                    Mineflayer bots ←→ PaperMC Server
```

**Two ways to control GhostCraft in Discord:**
1. **Slash commands** (`/spawn`, `/auto`, `/status`, `/dismiss`) — handled by discord.js directly
2. **Natural conversation** — chat with the Botpress agent: "I need wood and stone for a house" → Botpress understands, triggers Commander, responds conversationally

Both paths end up at the same Mineflayer bots in Minecraft.

**Demo narrative:** "We built a Discord agent with Botpress that you can talk to naturally. It understands your goals, deploys Minecraft bots, and keeps you updated — all through conversation."

---

## Remaining Steps

### Phase A — Commander via Direct Claude API (replaces broken Step 9.1–9.2)

> Goal: `askCommander()` calls Claude directly. Simple, reliable, no Botpress SDK issues.

- [ ] **A.1** Create `src/agents/commander.ts` with `askCommander(goal: string): Promise<CommanderPlan>`
  - Uses Anthropic SDK (`@anthropic-ai/sdk`)
  - System prompt = Commander instructions from project_plan.md Step 2.2.2
  - Model: `claude-haiku-4-5-20251001` (fast, cheap, good for structured output)
  - Parses response with existing `commanderParser.ts`
- [ ] **A.2** Test: script that calls `askCommander("build a house")` → prints parsed plan
- [ ] **A.3** Commit

### Phase B — Commander Orchestrator + /auto Command (Step 9.3–9.4)

> Goal: Wire Commander into the full spawn-and-assign pipeline.

- [ ] **B.1** Build `runCommander(goal, discordClient)` in `commander.ts`:
  1. Post Commander planning embed to #ghostcraft-main
  2. Call `askCommander(goal)` → get plan
  3. For each agent in plan: `spawnAgent(role, true, client)`
  4. For each spawned agent: `executeTask(agentId, task)` (fire-and-forget)
  5. Edit embed to show active plan
- [ ] **B.2** Build `/auto` command handler (`src/commands/autoCommand.ts`)
- [ ] **B.3** Wire in `src/index.ts`
- [ ] **B.4** Test: `/auto I want to build a house` → Commander embed, bots spawn, tasks start
- [ ] **B.5** Commit

### Phase C — Agent Personality Messages (Step 10)

> Goal: Bots talk in character when they start/finish tasks.

- [ ] **C.1** Create `src/llm/llmClient.ts` — wraps Anthropic SDK, `callLLM(system, user): Promise<string>`
- [ ] **C.2** Create `src/llm/personalityPrompt.ts` — per-role prompts + `generatePersonalityMessage(role, event)`
- [ ] **C.3** Wire personality messages into task start/complete/error events
- [ ] **C.4** Test: spawn lumberjack, give task, see in-character messages in thread
- [ ] **C.5** Commit

### Phase D — Botpress Discord Agent (The BPHacks Showcase)

> Goal: Connect Botpress to Discord so users can chat naturally with the GhostCraft agent. This is the centerpiece of the hackathon submission.

- [ ] **D.1** Redesign the ADK bot (`GhostCraft-Commander/`) as a **Discord conversational agent**:
  - Enable the **Discord integration** in `agent.config.ts` (Botpress ADK has a built-in Discord integration)
  - Configure it with a Discord bot token (can reuse same bot or create a second one)
  - Conversation handler understands intents:
    - **Build/create goals** → triggers Commander (via webhook to local system)
    - **Status queries** → "how are the bots?" → returns current agent statuses
    - **Control commands** → "stop the miner", "add a farmer" → triggers spawn/dismiss
    - **General chat** → responds in character as the Commander personality
- [ ] **D.2** Set up a local webhook server in the ghostcraft Node.js app
  - Simple Express endpoint: `POST /api/command`
  - Receives structured commands from Botpress: `{ action: "auto", goal: "..." }`, `{ action: "status" }`, `{ action: "spawn", role: "miner" }`, `{ action: "dismiss", agent: "..." }`
  - Triggers the same Commander/spawn/status/dismiss logic
  - Returns results as JSON so Botpress can respond conversationally
- [ ] **D.3** Update the ADK conversation handler to:
  - Parse user messages into intents
  - Call the local webhook with the appropriate action
  - Format the response conversationally: "Deploying a lumberjack and miner for your house. I'll keep you posted!"
- [ ] **D.4** Deploy: `cd GhostCraft-Commander && adk deploy`
- [ ] **D.5** Test end-to-end: type "build me a house" in Discord → Botpress responds → bots spawn → tasks execute
- [ ] **D.6** Commit

### Phase E — Final Integration & Demo Polish (Step 11)

- [ ] **E.1** Wire everything in `src/index.ts`, `npx tsc --noEmit` — zero errors
- [ ] **E.2** Full integration tests (all 5 test cases from project_plan.md Step 11.2)
- [ ] **E.3** Demo rehearsal — full arc, target under 5 minutes
- [ ] **E.4** Visual polish: embeds, Commander embed
- [ ] **E.5** Final commit + tag: `git tag v1.0-demo-ready`

---

## Demo Flow

1. **Open Discord** — show #ghostcraft-main
2. **Chat naturally**: type "Hey Commander, I want to build a house with wood and stone"
3. **Botpress responds in Discord**: "On it! I'll deploy a lumberjack for wood and a miner for stone. Setting up now..."
4. **Show Commander embed** appearing with the plan breakdown
5. **Show threads** spawning for each bot with status embeds
6. **Switch to Minecraft** — bots walking to resources, collecting
7. **Back to Discord** — show live progress updates in embeds
8. **Chat again**: "How are the bots doing?" → Botpress gives a status update
9. **Show /spawn** — demonstrate slash commands still work alongside natural chat
10. **Close with /status** — full overview of all agents

**Key narrative**: "We built a Discord agent with Botpress that manages a team of autonomous Minecraft bots. You just tell it what you want in natural language."

---

## What Can Be Mocked/Simplified for Demo

- **Webhook path**: If Botpress → local webhook is tricky, the Botpress agent can respond conversationally in Discord while `/auto` is triggered manually behind the scenes. The audience sees the Botpress chat + the bots working.
- **Commander decomposition**: Use a predictable prompt so the output is deterministic for the demo.
- **Status queries**: Can be hardcoded responses in the Botpress bot if webhook status polling is too complex.

---

## Priority Order If Running Out of Time

1. **Phase A** (30 min) — Must have. Direct Claude commander.
2. **Phase B** (45 min) — Must have. /auto working end-to-end.
3. **Phase D** (1-2 hrs) — **The Botpress showcase. This is what the hackathon judges.** Prioritize over personality messages.
4. **Phase C** (30 min) — Nice to have. Makes demo more engaging.
5. **Phase E** (30 min) — Polish. Always last.

Note: Phase D is ranked above Phase C because Botpress integration is the hackathon requirement. Personality messages are flavor — the Botpress Discord agent is the submission.
