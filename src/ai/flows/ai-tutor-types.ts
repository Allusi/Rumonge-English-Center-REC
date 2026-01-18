import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const AITutorInputSchema = z.object({
  history: z.array(MessageSchema),
});
export type AITutorInput = z.infer<typeof AITutorInputSchema>;

export const AITutorOutputSchema = z.string().min(1, "The AI tutor's response cannot be empty.");
export type AITutorOutput = z.infer<typeof AITutorOutputSchema>;

export const audioResponseSchema = z.object({
  media: z.string().describe("Base64-encoded WAV audio data URI."),
});
export type AudioResponse = z.infer<typeof audioResponseSchema>;
