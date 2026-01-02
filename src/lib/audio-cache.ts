
"use client";

import { textToSpeech } from "@/ai/flows/tts-flow";

const audioCache = new Map<string, string>();

/**
 * Retrieves the audio data URI for a given text.
 * It first checks a client-side cache. If the audio is not found,
 * it calls the textToSpeech flow and caches the result.
 * @param text The text to convert to speech.
 * @returns A promise that resolves to the audio data URI.
 */
export async function getAudioForText(text: string): Promise<string> {
  if (audioCache.has(text)) {
    return audioCache.get(text)!;
  }

  try {
    const { media } = await textToSpeech(text);
    audioCache.set(text, media);
    return media;
  } catch (error) {
    console.error("Failed to get audio for text:", error);
    // Re-throw the error so the caller can handle it, e.g., show a toast.
    throw error;
  }
}
