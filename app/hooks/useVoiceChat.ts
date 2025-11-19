'use client';

import { useState, useCallback, useRef } from 'react';
import {
  voiceChat,
  voiceConversation,
  type VoiceChatRequest,
  type VoiceChatResponse,
  type VoiceConversationRequest,
} from '../lib/django-client';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface VoiceChatConfig {
  provider?: 'openai' | 'anthropic';
  model?: string;
  voice?: string;
  temperature?: number;
  max_tokens?: number;
  include_audio?: boolean;
  language?: string;
}

export interface VoiceChatState {
  loading: boolean;
  error: string | null;
  lastResponse: VoiceChatResponse | null;
  conversationHistory: Message[];
}

/**
 * Custom hook for voice-based chat interactions
 * Handles complete voice interaction pipeline: Speech → Text → LLM → Text → Speech
 *
 * @param config - Default configuration for voice chat
 * @param systemPrompt - System prompt for the LLM
 *
 * @example
 * ```typescript
 * const {
 *   sendVoiceMessage,
 *   conversationHistory,
 *   loading,
 *   error,
 *   playLastResponse,
 *   clearHistory
 * } = useVoiceChat({
 *   provider: 'anthropic',
 *   voice: 'aria',
 *   include_audio: true
 * }, 'You are a helpful assistant');
 *
 * // Send voice message
 * const audioBlob = await recordAudio();
 * const response = await sendVoiceMessage(audioBlob);
 *
 * // Play response audio
 * playLastResponse();
 * ```
 */
export function useVoiceChat(
  config: VoiceChatConfig = {},
  systemPrompt?: string
) {
  const [state, setState] = useState<VoiceChatState>({
    loading: false,
    error: null,
    lastResponse: null,
    conversationHistory: systemPrompt
      ? [{ role: 'system', content: systemPrompt }]
      : [],
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Send a voice message and get response
   * Automatically manages conversation history
   */
  const sendVoiceMessage = useCallback(
    async (
      audioBlob: Blob,
      overrideConfig?: Partial<VoiceChatConfig>
    ): Promise<VoiceChatResponse | null> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        // Merge config
        const finalConfig = { ...config, ...overrideConfig };

        // Prepare request
        const request: VoiceChatRequest = {
          audio: audioBlob,
          provider: finalConfig.provider || 'anthropic',
          model: finalConfig.model,
          voice: finalConfig.voice || 'aria',
          system_prompt: systemPrompt,
          conversation_history: state.conversationHistory.filter(
            (msg) => msg.role !== 'system'
          ) as Array<{ role: 'user' | 'assistant'; content: string }>,
          temperature: finalConfig.temperature,
          max_tokens: finalConfig.max_tokens,
          include_audio: finalConfig.include_audio !== false,
          language: finalConfig.language || 'en',
        };

        // Send voice chat request
        const response = await voiceChat(request);

        // Update conversation history
        const newHistory: Message[] = [
          ...state.conversationHistory,
          { role: 'user', content: response.user_text },
          { role: 'assistant', content: response.assistant_text },
        ];

        setState({
          loading: false,
          error: null,
          lastResponse: response,
          conversationHistory: newHistory,
        });

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [config, systemPrompt, state.conversationHistory]
  );

  /**
   * Send voice message with explicit conversation context
   * Useful when you want full control over the conversation history
   */
  const sendVoiceConversation = useCallback(
    async (
      audioBlob: Blob,
      messages: Message[],
      overrideConfig?: Partial<VoiceChatConfig>
    ): Promise<VoiceChatResponse | null> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const finalConfig = { ...config, ...overrideConfig };

        const request: VoiceConversationRequest = {
          audio: audioBlob,
          messages,
          system_prompt: systemPrompt,
          provider: finalConfig.provider || 'anthropic',
          model: finalConfig.model,
          voice: finalConfig.voice || 'aria',
          temperature: finalConfig.temperature,
          max_tokens: finalConfig.max_tokens,
          include_audio: finalConfig.include_audio !== false,
        };

        const response = await voiceConversation(request);

        // Update conversation history
        const newHistory: Message[] = [
          ...messages,
          { role: 'user', content: response.user_text },
          { role: 'assistant', content: response.assistant_text },
        ];

        setState({
          loading: false,
          error: null,
          lastResponse: response,
          conversationHistory: newHistory,
        });

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [config, systemPrompt]
  );

  /**
   * Play the audio from the last response
   */
  const playLastResponse = useCallback(() => {
    if (!state.lastResponse?.audio) {
      console.warn('No audio available in last response');
      return;
    }

    try {
      const audioData = state.lastResponse.audio.data;
      const audioBlob = base64ToBlob(audioData, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);

      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Create and play new audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to play audio',
        }));
      });

      // Cleanup after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Error decoding audio:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to decode audio',
      }));
    }
  }, [state.lastResponse]);

  /**
   * Stop currently playing audio
   */
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  /**
   * Clear conversation history
   */
  const clearHistory = useCallback(() => {
    setState({
      loading: false,
      error: null,
      lastResponse: null,
      conversationHistory: systemPrompt
        ? [{ role: 'system', content: systemPrompt }]
        : [],
    });
  }, [systemPrompt]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * Add a message to conversation history manually
   */
  const addMessage = useCallback((message: Message) => {
    setState((prev) => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message],
    }));
  }, []);

  return {
    // State
    loading: state.loading,
    error: state.error,
    lastResponse: state.lastResponse,
    conversationHistory: state.conversationHistory,

    // Actions
    sendVoiceMessage,
    sendVoiceConversation,
    playLastResponse,
    stopAudio,
    clearHistory,
    clearError,
    addMessage,
  };
}

/**
 * Helper function to convert base64 to Blob
 */
function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}
