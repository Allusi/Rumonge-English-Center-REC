'use server';

/**
 * @fileOverview An AI agent to provide grammar check feedback on written assignments.
 *
 * - grammarCheckFeedback - A function that handles the grammar check process.
 * - GrammarCheckFeedbackInput - The input type for the grammarCheckFeedback function.
 * - GrammarCheckFeedbackOutput - The return type for the grammarCheckfeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GrammarCheckFeedbackInputSchema = z.object({
  text: z.string().describe('The text to check for grammatical errors.'),
});
export type GrammarCheckFeedbackInput = z.infer<
  typeof GrammarCheckFeedbackInputSchema
>;

const CorrectionSchema = z.object({
  original: z.string().describe('The original incorrect text snippet.'),
  corrected: z.string().describe('The corrected version of the text snippet.'),
  explanation: z
    .string()
    .describe(
      'A brief explanation of the grammatical error and the correction.'
    ),
  startIndex: z
    .number()
    .describe('The starting index of the original snippet in the input text.'),
  endIndex: z
    .number()
    .describe('The ending index of the original snippet in the input text.'),
});

const GrammarCheckFeedbackOutputSchema = z.object({
  hasErrors: z.boolean().describe('Whether any grammatical errors were found.'),
  correctedText: z
    .string()
    .describe('The full text with all corrections applied.'),
  corrections: z
    .array(CorrectionSchema)
    .describe('An array of corrections for the text.'),
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
  prompt: `You are an expert AI grammar checker. Your task is to meticulously review the provided text for any grammatical errors, spelling mistakes, or punctuation issues.

For the given text, you must identify each error and provide a correction and a clear, concise explanation for it. It is crucial to also provide the start and end index of each error in the original text.

If there are no errors, you must set 'hasErrors' to false and return an empty 'corrections' array.

If errors are found:
1. Set 'hasErrors' to true.
2. Construct the 'correctedText' by applying all corrections to the original text.
3. For each error, create a correction object containing:
    - 'original': The exact text snippet that is incorrect.
    - 'corrected': The suggested correct text snippet.
    - 'explanation': A brief explanation of the error.
    - 'startIndex': The starting character index of the 'original' snippet in the input text.
    - 'endIndex': The ending character index of the 'original' snippet in the input text.
4. Populate the 'corrections' array with these objects.

Review the following text:
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