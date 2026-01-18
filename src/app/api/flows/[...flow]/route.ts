import { run } from '@genkit-ai/next';

// This is the entry point that registers all of our flows.
// It's also used by the genkit dev server.
import '@/ai/dev';

export { run as GET, run as POST, run as OPTIONS };
