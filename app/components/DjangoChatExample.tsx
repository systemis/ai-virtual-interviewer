'use client';

import { useState } from 'react';
import { useDjangoLLM } from '../hooks/useDjangoLLM';

/**
 * Example component demonstrating Django backend integration
 * This shows how to use the Django backend for LLM calls
 */
export default function DjangoChatExample() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('anthropic');
  const { callClaude, callOpenAI, loading, error } = useDjangoLLM();

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = provider === 'anthropic'
        ? await callClaude({
            messages: [...messages, userMessage],
            systemPrompt: 'You are a helpful AI assistant.',
            maxTokens: 1000,
          })
        : await callOpenAI({
            messages: [...messages, userMessage],
            systemPrompt: 'You are a helpful AI assistant.',
            maxTokens: 1000,
          });

      if (response) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.content },
        ]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">Django Backend Chat Demo</h1>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium">Provider:</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'openai' | 'anthropic')}
              className="p-2 border rounded"
              disabled={loading}
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT)</option>
            </select>
          </label>
          <div className="text-sm text-gray-600">
            Using: Django Backend @ localhost:8000
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
          <div className="text-sm mt-1">
            Make sure Django server is running: <code>cd django-backend && ./start.sh</code>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 border rounded-lg p-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation!</p>
            <p className="text-sm mt-2">
              Messages will be processed through the Django backend
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-[80%]'
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <p className="font-semibold text-sm mb-1">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </p>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div className="bg-gray-100 p-3 rounded-lg mr-auto max-w-[80%]">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <p className="text-gray-500">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          className="flex-1 p-3 border rounded-lg resize-none"
          rows={3}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        Tip: You can switch between OpenAI and Anthropic providers above
      </div>
    </div>
  );
}
