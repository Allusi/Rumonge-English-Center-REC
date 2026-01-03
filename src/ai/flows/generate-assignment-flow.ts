
'use server';

/**
 * @fileOverview An AI agent to generate assignments based on course content.
 *
 * - generateAssignment - A function that creates an assignment draft.
 * - GenerateAssignmentInput - The input type for the generateAssignment function.
 * - GenerateAssignmentOutput - The return type for the generateAssignment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAssignmentInputSchema = z.object({
  topic: z.string().describe('The specific topic from the course material for which to create an assignment. For example: "English Alphabet" or "Greetings and Introductions".'),
});
export type GenerateAssignmentInput = z.infer<
  typeof GenerateAssignmentInputSchema
>;

const GenerateAssignmentOutputSchema = z.object({
  title: z.string().describe('A concise and relevant title for the assignment.'),
  instructions: z.string().describe("Detailed instructions for the student. This should include a mix of multiple-choice questions, fill-in-the-blanks, or short answer questions. The instructions should be clear, well-formatted with lists and line breaks, and directly related to the provided topic and source material. Ensure there are at least 3 distinct questions or tasks."),
});
export type GenerateAssignmentOutput = z.infer<
  typeof GenerateAssignmentOutputSchema
>;

export async function generateAssignment(
  input: GenerateAssignmentInput
): Promise<GenerateAssignmentOutput> {
  return generateAssignmentFlow(input);
}

const generateAssignmentPrompt = ai.definePrompt({
  name: 'generateAssignmentPrompt',
  input: {schema: GenerateAssignmentInputSchema},
  output: {schema: GenerateAssignmentOutputSchema},
  prompt: `You are an expert AI English teacher creating an assignment for students at the "Rumonge English School (R.E.C)". Your task is to generate a new assignment based on a specific topic from the Unit One textbook.

The assignment should be appropriate for beginner-level English language learners.

The topic for this assignment is: {{{topic}}}

Use the following excerpts from the Unit One textbook as your primary source material to create the questions and instructions:

---
**Unit One Source Material Excerpt:**

**Section 1: English Alphabet**
In English, we have twenty-six (26) English letters, divided into consonants (21) and vowels (5: A, E, I, O, U). Letters can be upper case (A, B, C...) or lower case (a, b, c...). We speak with sounds and write with letters.
Expressions:
- "To be as easy as ABC": to be very easy.
- "From A to Z": covering all details.

**Section 2: Greetings, Introduction and Request**
- Friendly Greetings: Hi!, Hello!, How are you doing?
- Respectable Greetings: Good morning, Good afternoon, Good evening.
- Introductions: "My name is...", "What is your name?", "This is my friend...".
- Making a Request: "Can I...?", "May I...?", "Do you mind if I...?".

**Section 3: People, Things and Places**
- Places: Town, Village, Church, Hospital, School.
- Things at home: spoon, table, broom, cup, radio.
- Things at school: pen, book, chair, desk, blackboard.
- Wild Animals: Lion, Elephant, Monkey.
- Domestic Animals: Cow, Goat, Hen, Dog.
---

Based on the provided topic and source material, generate an assignment with a clear title and detailed instructions. The instructions should be well-formatted with clear headings (e.g., "Question 1", "Task 2") and use line breaks to separate different parts of the assignment. The instructions must include at least three distinct questions or tasks. The tone should be encouraging and clear for a beginner.

For example, if the topic is "English Alphabet", an ideal format would be:

Question 1:
List the five vowels in the English alphabet.

Question 2:
Write the alphabet in lowercase letters from a to z.

Question 3:
Use the expression "from A to Z" in a sentence.`,
});

const generateAssignmentFlow = ai.defineFlow(
  {
    name: 'generateAssignmentFlow',
    inputSchema: GenerateAssignmentInputSchema,
    outputSchema: GenerateAssignmentOutputSchema,
  },
  async input => {
    const {output} = await generateAssignmentPrompt(input);
    return output!;
  }
);
