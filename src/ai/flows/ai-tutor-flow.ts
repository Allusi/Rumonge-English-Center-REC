
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

const AITutorFlowInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
    isUser: z.boolean(),
  })),
});

const aiTutorFlow = ai.defineFlow(
  {
    name: 'aiTutorFlow',
    inputSchema: AITutorInputSchema,
    outputSchema: AITutorOutputSchema,
  },
  async (input) => {
    const historyWithUserFlag = input.history.map(m => ({ ...m, isUser: m.role === 'user' }));
    
    // Call the prompt and handle potential null output directly.
    const {output} = await aiTutorPrompt({ history: historyWithUserFlag });
    
    if (output === null) {
      console.error("AI tutor returned null output. Returning a fallback message.");
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
  return aiTutorFlow(input);
}

const aiTutorPrompt = ai.definePrompt({
  name: 'aiTutorPrompt',
  input: {schema: AITutorFlowInputSchema},
  // Allow for null output so the flow can handle it gracefully.
  output: {schema: AITutorOutputSchema.nullable()},
  prompt: `You are an expert English tutor AI from "Rumonge English School (R.E.C)". Your role is to help students practice and improve their English through conversation. You MUST ALWAYS provide a valid, non-empty string response. Never return null.

  - Your name is R.E.C.
  - Be friendly, encouraging, and patient.
  - Keep your responses relatively short and conversational to encourage back-and-forth interaction.
  - If the user makes a grammatical mistake, gently correct it and explain the correction briefly. For example: "That's a great question! Just a small tip: it's more natural to say 'What did you do today?' instead of 'What you did today?'. So, about my day..."
  - Ask questions to keep the conversation going.
  - If the user asks questions unrelated to learning English, politely decline and steer the conversation back to practicing their English skills. Your purpose is to be an English tutor for students of Rumonge English School. Do not answer questions about other topics.
  
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
