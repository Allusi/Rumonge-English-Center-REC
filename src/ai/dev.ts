'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/grammar-check-feedback.ts';
import '@/ai/flows/ai-tutor-flow.ts';
import '@/ai/flows/tts-flow.ts';
import '@/ai/flows/generate-assignment-flow.ts';
