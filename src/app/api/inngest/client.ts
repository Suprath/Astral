// src/app/api/inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'AstralCopilot',
  // Optional: Set your API key or URL if needed
  // apiKey: process.env.INNGEST_API_KEY,
});
