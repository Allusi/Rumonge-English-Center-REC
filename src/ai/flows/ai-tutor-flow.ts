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

export async function aiTutor(input: AITutorInput): Promise<AITutorOutput> {
  // If the history is empty, start the conversation.
  if (input.history.length === 0) {
    return "Hello! I'm R.E.C, your friendly AI English tutor. How's your day going?";
  }

  const historyWithUserFlag = input.history.map(m => ({ ...m, isUser: m.role === 'user' }));
  const {output} = await aiTutorPrompt({ history: historyWithUserFlag });
  
  if (output === null) {
    console.error("AI tutor returned null output. Returning a fallback message.");
    return "I'm sorry, I'm having a little trouble thinking. Could you say that again?";
  }

  return output;
}

const aiTutorPrompt = ai.definePrompt({
  name: 'aiTutorPrompt',
  input: {schema: AITutorFlowInputSchema},
  output: {schema: AITutorOutputSchema},
  prompt: `You are an expert English tutor AI from "Rumonge English School (R.E.C)". Your role is to help students practice and improve their English through conversation. 

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
