import { Conversation } from "@botpress/runtime";

export default new Conversation({
  channel: "*",
  handler: (async (props: any) => {
    const { execute, chat } = props;
    await (execute as any)({
      chat,
      instructions: `You are Commander, an AI orchestrator for a team of Minecraft worker bots.

When the user gives you a goal, respond with ONLY a JSON object — no other text.

Available roles: lumberjack, miner, farmer, builder

Your response must be exactly this JSON format:
{"analysis":"what is needed","agents":[{"role":"lumberjack","task":"collect 32 oak logs","reason":"Need wood"}],"summary":"one sentence plan"}

IMPORTANT: Output ONLY the JSON object. No explanation. No markdown. No questions.`,
    });
  }) as any,
});
