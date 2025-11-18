import { useState, useRef } from "react";
import { textToSpeech } from "@/app/lib/django-client";

export const useSpeechSynthesis = (useVoice: boolean) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (text: string): Promise<void> => {
    if (!useVoice || !text) return Promise.resolve();

    try {
      // Cancel any ongoing speech
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsSpeaking(true);

      // Call Django TTS backend
      const response = await textToSpeech({
        text,
        voice: "en-US-AriaNeural", // Edge TTS voice
        format: "base64",
      });

      // Create audio element from base64
      const audio = new Audio(`data:audio/mp3;base64,${response.audio}`);
      audioRef.current = audio;

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          resolve();
        };

        audio.onerror = (error) => {
          console.error("Audio playback error:", error);
          setIsSpeaking(false);
          audioRef.current = null;
          reject(error);
        };

        audio.play().catch((error) => {
          console.error("Failed to play audio:", error);
          setIsSpeaking(false);
          audioRef.current = null;
          reject(error);
        });
      });
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      audioRef.current = null;
      throw error;
    }
  };

  const cancel = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    speak,
    cancel,
  };
};
