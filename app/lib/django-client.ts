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
    model: model || "claude-3-haiku-20240307",
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
        model: request.model || "claude-3-haiku-20240307",
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

// ============================================================================
// VOICE CHAT API - Unified Voice Interaction Pipeline
// ============================================================================

export interface VoiceChatRequest {
  audio: Blob;
  provider?: "openai" | "anthropic";
  model?: string;
  voice?: string;
  system_prompt?: string;
  conversation_history?: Array<{ role: "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
  include_audio?: boolean;
  language?: string;
}

export interface VoiceChatResponse {
  user_text: string;
  assistant_text: string;
  audio?: {
    data: string; // base64 encoded audio
    provider: string;
    content_type: string;
    encoding: string;
    voice: string;
  };
  metadata: {
    provider: string;
    model: string;
    temperature: number;
    max_tokens: number;
  };
  success: boolean;
}

export interface VoiceConversationRequest {
  audio: Blob;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  system_prompt?: string;
  provider?: "openai" | "anthropic";
  model?: string;
  voice?: string;
  temperature?: number;
  max_tokens?: number;
  include_audio?: boolean;
}

/**
 * Complete voice interaction pipeline: Speech → Text → LLM → Text → Speech
 * Single API call handles entire voice conversation flow
 *
 * @param request - Voice chat request parameters
 * @returns Complete voice interaction response with transcription, LLM response, and audio
 *
 * @example
 * ```typescript
 * const audioBlob = await recordAudio();
 * const response = await voiceChat({
 *   audio: audioBlob,
 *   provider: "anthropic",
 *   system_prompt: "You are a helpful assistant",
 *   voice: "aria",
 *   include_audio: true
 * });
 *
 * console.log("User said:", response.user_text);
 * console.log("Assistant replied:", response.assistant_text);
 * if (response.audio) {
 *   playAudio(response.audio.data); // Play base64 audio
 * }
 * ```
 */
export async function voiceChat(
  request: VoiceChatRequest,
): Promise<VoiceChatResponse> {
  try {
    const formData = new FormData();
    formData.append("audio", request.audio, "recording.webm");

    // Add optional parameters
    if (request.provider) formData.append("provider", request.provider);
    if (request.model) formData.append("model", request.model);
    if (request.voice) formData.append("voice", request.voice);
    if (request.system_prompt)
      formData.append("system_prompt", request.system_prompt);
    if (request.temperature !== undefined)
      formData.append("temperature", request.temperature.toString());
    if (request.max_tokens !== undefined)
      formData.append("max_tokens", request.max_tokens.toString());
    if (request.include_audio !== undefined)
      formData.append("include_audio", request.include_audio.toString());
    if (request.language) formData.append("language", request.language);

    // Add conversation history if provided
    if (request.conversation_history) {
      formData.append(
        "conversation_history",
        JSON.stringify(request.conversation_history),
      );
    }

    const response = await fetch(`${DJANGO_API_URL}/voice-chat`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Voice chat failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Django Voice Chat Error:", error);
    throw error;
  }
}

/**
 * Voice conversation with full message history management
 * Enhanced version with explicit conversation context
 *
 * @param request - Voice conversation request with full message history
 * @returns Voice interaction response
 *
 * @example
 * ```typescript
 * const messages = [
 *   { role: "system", content: "You are a helpful assistant" },
 *   { role: "user", content: "Hello" },
 *   { role: "assistant", content: "Hi! How can I help?" }
 * ];
 *
 * const audioBlob = await recordAudio();
 * const response = await voiceConversation({
 *   audio: audioBlob,
 *   messages: messages,
 *   provider: "anthropic",
 *   voice: "aria"
 * });
 * ```
 */
export async function voiceConversation(
  request: VoiceConversationRequest,
): Promise<VoiceChatResponse> {
  try {
    const formData = new FormData();
    formData.append("audio", request.audio, "recording.webm");
    formData.append("messages", JSON.stringify(request.messages));

    // Add optional parameters
    if (request.system_prompt)
      formData.append("system_prompt", request.system_prompt);
    if (request.provider) formData.append("provider", request.provider);
    if (request.model) formData.append("model", request.model);
    if (request.voice) formData.append("voice", request.voice);
    if (request.temperature !== undefined)
      formData.append("temperature", request.temperature.toString());
    if (request.max_tokens !== undefined)
      formData.append("max_tokens", request.max_tokens.toString());
    if (request.include_audio !== undefined)
      formData.append("include_audio", request.include_audio.toString());

    const response = await fetch(`${DJANGO_API_URL}/voice-conversation`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Voice conversation failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Django Voice Conversation Error:", error);
    throw error;
  }
}

/**
 * Save completed interview data to the backend
 */
export interface SaveInterviewRequest {
  user_id?: string | null;
  jobRole: string;
  experience: string;
  interviewType: string;
  messages: Array<{ role: string; content: string }>;
  feedback: {
    overallScore: number;
    communicationScore: number;
    technicalScore: number;
    strengths: string[];
    areasForImprovement: string[];
    detailedFeedback: string;
    recommendations: string[];
  };
  questionCount: number;
}

export interface SaveInterviewResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export async function saveInterview(
  request: SaveInterviewRequest
): Promise<SaveInterviewResponse> {
  try {
    const response = await fetch(`${DJANGO_API_URL}/interviews/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: request.user_id || null,
        job_role: request.jobRole,
        experience_level: request.experience,
        interview_type: request.interviewType,
        conversation: request.messages,
        feedback: request.feedback,
        question_count: request.questionCount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save interview");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error saving interview:", error);
    throw error;
  }
}

export async function getInterviewHistory(userId?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (userId) {
      params.append("user_id", userId);
    }

    const response = await fetch(`${DJANGO_API_URL}/interviews/history?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching interview history:", error);
    throw error;
  }
}
