/**
 * Django Backend API Integration
 *
 * Updated API utility functions that use Django backend instead of Next.js API routes
 */

import { callAnthropicAPI, checkDjangoBackendHealth } from '../lib/django-client';

export interface ClaudeAPIParams {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  systemPrompt: string;
  maxTokens?: number;
}

/**
 * Call Claude API through Django backend
 * This replaces the original callClaudeAPI function
 */
export const callClaudeAPI = async ({
  messages,
  systemPrompt,
  maxTokens = 300,
}: ClaudeAPIParams) => {
  try {
    const response = await callAnthropicAPI({
      messages,
      systemPrompt,
      maxTokens,
    });

    // Transform response to match expected format
    return {
      content: [{ text: response.content }],
      model: response.model,
      stop_reason: response.finish_reason,
    };
  } catch (error) {
    console.error("Django API Error:", error);
    throw error;
  }
};

/**
 * Check Django backend connection
 * This replaces the original checkBackendConnection function
 */
export const checkBackendConnection = async (): Promise<boolean> => {
  return checkDjangoBackendHealth();
};
