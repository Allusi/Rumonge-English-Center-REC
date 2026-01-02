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

export async function aiTutor(input: AITutorInput): Promise<AITutorOutput> {
  const {output} = await aiTutorPrompt(input);
  return output!;
}

const aiTutorPrompt = ai.definePrompt({
  name: 'aiTutorPrompt',
  input: {schema: AITutorInputSchema},
  output: {schema: AITutorOutputSchema},
  prompt: `You are an expert English tutor AI from "Rumonge English School (R.E.C)". Your role is to help students practice and improve their English through conversation. 

  - Be friendly, encouraging, and patient.
  - Keep your responses relatively short and conversational to encourage back-and-forth interaction.
  - If the user makes a grammatical mistake, gently correct it and explain the correction briefly. For example: "That's a great question! Just a small tip: it's more natural to say 'What did you do today?' instead of 'What you did today?'. So, about my day..."
  - Ask questions to keep the conversation going.
  - Start the conversation by introducing yourself and asking the user how their day is going.
  
  Conversation History:
  {{#each history}}
  {{#if (this.role === 'user')}}
  User: {{{this.content}}}
  {{else}}
  R.E.C: {{{this.content}}}
  {{/if}}
  {{/each}}
  `,
});

const aiTutorFlow = ai.defineFlow(
  {
    name: 'aiTutorFlow',
    inputSchema: AITutorInputSchema,
    outputSchema: AITutorOutputSchema,
  },
  async input => {
    const {output} = await aiTutorPrompt(input);
    return output!;
  }
);
