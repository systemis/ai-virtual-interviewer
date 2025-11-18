'use client';

import { useState, useCallback } from 'react';
import {
  chatCompletion,
  callAnthropicAPI,
  callOpenAIAPI,
  type ChatCompletionRequest,
  type ChatCompletionResponse,
} from '../lib/django-client';

/**
 * Custom hook for interacting with Django LLM backend
 */
export function useDjangoLLM() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a chat completion request
   */
  const sendMessage = useCallback(
    async (request: ChatCompletionRequest): Promise<ChatCompletionResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await chatCompletion(request);
        setLoading(false);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    []
  );

  /**
   * Call Anthropic Claude through Django
   */
  const callClaude = useCallback(
    async (params: {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      systemPrompt: string;
      maxTokens?: number;
      model?: string;
    }): Promise<ChatCompletionResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await callAnthropicAPI(params);
        setLoading(false);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    []
  );

  /**
   * Call OpenAI through Django
   */
  const callOpenAI = useCallback(
    async (params: {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      systemPrompt: string;
      maxTokens?: number;
      model?: string;
    }): Promise<ChatCompletionResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await callOpenAIAPI(params);
        setLoading(false);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    []
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    callClaude,
    callOpenAI,
    loading,
    error,
    clearError,
  };
}
