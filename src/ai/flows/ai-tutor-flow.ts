
'use server';

/**
 * @fileOverview An AI agent that acts as an English tutor.
 *
 * - aiTutor - A function that handles the conversation with the AI tutor.
 */

import {ai} from '@/ai/genkit';
import {
  AITutorInputSchema,
  AITutorOutputSchema,
  type AITutorInput,
  type AITutorOutput,
} from '@/ai/flows/ai-tutor-types';
import { z } from 'genkit';

// This is the schema the PROMPT expects, with the isUser flag.
const AITutorPromptInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
    isUser: z.boolean(),
  })),
});


const aiTutorFlow = ai.defineFlow(
  {
    name: 'aiTutorFlow',
    inputSchema: AITutorPromptInputSchema, // Flow now expects the same as the prompt
    outputSchema: AITutorOutputSchema,
  },
  async (input) => {
    // No transformation needed inside the flow
    const {output} = await aiTutorPrompt(input);
    
    // Explicitly check for empty, whitespace-only, or non-string responses.
    if (typeof output !== 'string' || output.trim() === '') {
      console.error("AI tutor returned invalid output. Returning a fallback message. Output was:", output);
      return "I'm sorry, I'm having a little trouble thinking. Could you say that again?";
    }
    
    return output;
  }
);


export async function aiTutor(input: AITutorInput): Promise<AITutorOutput> {
  // If the history is empty, start the conversation.
  if (input.history.length === 0) {
    return "Hello! I'm R.E.C, your friendly AI English tutor. How would you like to practice today?";
  }

  // Transform the data before calling the flow
  const historyWithUserFlag = input.history.map(m => ({ ...m, isUser: m.role === 'user' }));
  return aiTutorFlow({ history: historyWithUserFlag });
}

const aiTutorPrompt = ai.definePrompt({
  name: 'aiTutorPrompt',
  input: {schema: AITutorPromptInputSchema},
  output: {schema: AITutorOutputSchema},
  prompt: `You are an expert English tutor AI from "Rumonge English School (R.E.C)". Your role is to help students practice and improve their English through conversation. You MUST ALWAYS provide a valid, non-empty string response in English.

  - Your name is R.E.C.
  - Be friendly, encouraging, and patient.
  - Keep your responses relatively short and conversational to encourage back-and-forth interaction.
  - If the user makes a grammatical mistake, gently correct it and explain the correction briefly. For example: "That's a great question! Just a small tip: it's more natural to say 'What did you do today?' instead of 'What you did today?'. So, about my day..."
  - Ask questions to keep the conversation going.
  - **CRITICAL RULE**: If the user asks a question unrelated to learning English, or speaks in a language other than English, you MUST respond with: "I am an English tutor, and I can only help with learning English. Let's get back to practicing!" Do not answer the off-topic question. Do not attempt to translate. Just use that exact phrase.

  Conversation History:
  {{#each history}}
  {{#if this.isUser}}
  User: {{{this.content}}}
  {{else}}
  R.E.C: {{{this.content}}}
  {{/if}}
  {{/each}}
  `,
});
