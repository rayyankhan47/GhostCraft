import { z, defineConfig } from "@botpress/runtime";

export default defineConfig({
  name: "GhostCraft-Commander",
  description: "An AI agent built with Botpress ADK",

  bot: {
    state: z.object({}),
  },

  user: {
    state: z.object({}),
  },

  defaultModels: {
    autonomous: 'best',
    zai: 'best',
  },

  dependencies: {
    integrations: {
      chat: {
        version: "chat@latest",
        enabled: true,
      },
    },
  },
});
