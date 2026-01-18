
'use server';
// By importing genkit, we ensure the 'ai' object is created.
import './genkit';

// Now we can import the flows, which will in turn import the created 'ai' object.
import '@/ai/flows/grammar-check-feedback.ts';
import '@/ai/flows/ai-tutor-flow.ts';
import '@/ai/flows/tts-flow.ts';
import '@/ai/flows/generate-assignment-flow.ts';
