'use server';

/**
 * @fileOverview An AI agent to provide grammar check feedback on written assignments.
 *
 * - grammarCheckFeedback - A function that handles the grammar check process.
 * - GrammarCheckFeedbackInput - The input type for the grammarCheckFeedback function.
 * - GrammarCheckFeedbackOutput - The return type for the grammarCheckFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GrammarCheckFeedbackInputSchema = z.object({
  text: z.string().describe('The text to check for grammatical errors.'),
});
export type GrammarCheckFeedbackInput = z.infer<
  typeof GrammarCheckFeedbackInputSchema
>;

const GrammarCheckFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The grammar check feedback.'),
});
export type GrammarCheckFeedbackOutput = z.infer<
  typeof GrammarCheckFeedbackOutputSchema
>;

export async function grammarCheckFeedback(
  input: GrammarCheckFeedbackInput
): Promise<GrammarCheckFeedbackOutput> {
  return grammarCheckFeedbackFlow(input);
}

const grammarCheckFeedbackPrompt = ai.definePrompt({
  name: 'grammarCheckFeedbackPrompt',
  input: {schema: GrammarCheckFeedbackInputSchema},
  output: {schema: GrammarCheckFeedbackOutputSchema},
  prompt: `You are an AI grammar checker. Review the text below and provide feedback on any grammatical errors. If there are no errors, indicate that the text is grammatically correct.

Text: {{{text}}}`,
});

const grammarCheckFeedbackFlow = ai.defineFlow(
  {
    name: 'grammarCheckFeedbackFlow',
    inputSchema: GrammarCheckFeedbackInputSchema,
    outputSchema: GrammarCheckFeedbackOutputSchema,
  },
  async input => {
    const {output} = await grammarCheckFeedbackPrompt(input);
    return output!;
  }
);
