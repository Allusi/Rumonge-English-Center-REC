import { nextHandler } from '@genkit-ai/next';

// This is the entry point that registers all of our flows.
// It's also used by the genkit dev server.
import '@/ai/dev';

export const { GET, POST, OPTIONS } = nextHandler();
