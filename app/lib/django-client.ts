/**
 * Django Backend API Client
 *
 * This module provides functions to interact with the Django LLM backend
 * instead of using Next.js API routes directly.
 */

const DJANGO_API_URL =
  process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000/api";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  provider: "openai" | "anthropic";
  model?: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  role: string;
  content: string;
  model: string;
  finish_reason?: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
}

/**
 * Call Django backend for chat completions
 */
export async function chatCompletion(
  request: ChatCompletionRequest,
): Promise<ChatCompletionResponse> {
  try {
    const response = await fetch(`${DJANGO_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Chat completion failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Django API Error:", error);
    throw error;
  }
}

/**
 * Call Anthropic through Django backend
 */
export async function callAnthropicAPI(params: {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  systemPrompt: string;
  maxTokens?: number;
  model?: string;
}): Promise<ChatCompletionResponse> {
  const { messages, systemPrompt, maxTokens = 300, model } = params;

  // Add system message to messages array
  const formattedMessages: Message[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  return chatCompletion({
    provider: "anthropic",
    model: model || "claude-sonnet-4-20250514",
    messages: formattedMessages,
    max_tokens: maxTokens,
    temperature: 0.7,
  });
}

/**
 * Call OpenAI through Django backend
 */
export async function callOpenAIAPI(params: {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  systemPrompt: string;
  maxTokens?: number;
  model?: string;
}): Promise<ChatCompletionResponse> {
  const { messages, systemPrompt, maxTokens = 300, model } = params;

  // Add system message to messages array
  const formattedMessages: Message[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  return chatCompletion({
    provider: "openai",
    model: model || "gpt-4o-mini",
    messages: formattedMessages,
    max_tokens: maxTokens,
    temperature: 0.7,
  });
}

/**
 * Check Django backend health
 */
export async function checkDjangoBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${DJANGO_API_URL}/health`);
    if (!response.ok) return false;

    const data: HealthCheckResponse = await response.json();
    return data.status === "healthy";
  } catch (error) {
    console.error("Django backend health check failed:", error);
    return false;
  }
}

/**
 * Get Django backend status
 */
export async function getDjangoBackendStatus(): Promise<HealthCheckResponse | null> {
  try {
    const response = await fetch(`${DJANGO_API_URL}/health`);
    if (!response.ok) return null;

    const data: HealthCheckResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Django backend status check failed:", error);
    return null;
  }
}

/**
 * Streaming chat completion
 * Returns an async generator for streaming responses
 */
export async function* chatCompletionStream(
  request: ChatCompletionRequest,
): AsyncGenerator<{ content: string; finish_reason?: string }> {
  const response = await fetch(`${DJANGO_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!response.ok) {
    throw new Error("Stream request failed");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No reader available");
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            yield parsed;
          } catch (e) {
            console.error("Error parsing stream chunk:", e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export interface TextToSpeechRequest {
  text: string;
  voice?: string;
  format?: "base64" | "file";
}

export interface TextToSpeechResponse {
  audio: string; // base64 encoded audio
  format: string;
  voice: string;
}

export interface SpeechToTextResponse {
  text: string;
}

export interface ChatWithAudioRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  system?: string;
  model?: string;
  max_tokens?: number;
  include_audio?: boolean;
  voice?: string;
}

export interface ChatWithAudioResponse {
  role: string;
  content: string;
  model: string;
  audio?: {
    data: string; // base64 encoded audio
    provider: string;
    content_type: string;
    encoding: string;
    voice: string;
  };
  audio_error?: string;
}

/**
 * Chat with audio response - gets both text and audio in single API call
 * More efficient than calling chat + TTS separately
 */
export async function chatWithAudio(
  request: ChatWithAudioRequest,
): Promise<ChatWithAudioResponse> {
  try {
    const response = await fetch(`${DJANGO_API_URL}/chat-with-audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: request.messages,
        system: request.system,
        model: request.model || "claude-sonnet-4-20250514",
        max_tokens: request.max_tokens || 1000,
        include_audio: request.include_audio !== false, // default true
        voice: request.voice || "en-US-AriaNeural",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Chat with audio failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Django chat with audio error:", error);
    throw error;
  }
}

/**
 * Convert text to speech using Django backend (Edge TTS)
 */
export async function textToSpeech(
  request: TextToSpeechRequest,
): Promise<TextToSpeechResponse> {
  try {
    const response = await fetch(`${DJANGO_API_URL}/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: request.text,
        voice: request.voice || "en-US-AriaNeural",
        format: request.format || "base64",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Text-to-speech failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Django TTS Error:", error);
    throw error;
  }
}

/**
 * Convert speech to text using Django backend (OpenAI Whisper)
 */
export async function speechToText(
  audioBlob: Blob,
): Promise<SpeechToTextResponse> {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await fetch(`${DJANGO_API_URL}/speech-to-text`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Speech-to-text failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Django STT Error:", error);
    throw error;
  }
}
