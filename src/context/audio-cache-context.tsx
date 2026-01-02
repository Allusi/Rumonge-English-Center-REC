
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { textToSpeech } from "@/ai/flows/tts-flow";

interface AudioCacheContextType {
  getAudioForText: (text: string) => Promise<string>;
}

const AudioCacheContext = createContext<AudioCacheContextType | undefined>(undefined);

export function AudioCacheProvider({ children }: { children: ReactNode }) {
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());

  const getAudioForText = useCallback(async (text: string): Promise<string> => {
    if (audioCache.has(text)) {
      return audioCache.get(text)!;
    }

    try {
      const { media } = await textToSpeech(text);
      setAudioCache(prevCache => {
        const newCache = new Map(prevCache);
        newCache.set(text, media);
        return newCache;
      });
      return media;
    } catch (error) {
      console.error("Failed to get audio for text:", error);
      throw error; // Re-throw to be handled by the caller
    }
  }, [audioCache]);

  return (
    <AudioCacheContext.Provider value={{ getAudioForText }}>
      {children}
    </AudioCacheContext.Provider>
  );
}

export function useAudioCache() {
  const context = useContext(AudioCacheContext);
  if (context === undefined) {
    throw new Error('useAudioCache must be used within an AudioCacheProvider');
  }
  return context;
}
