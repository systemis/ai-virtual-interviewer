import { useRef, useEffect } from "react";
import type { Message } from "../types";

interface ConversationPanelProps {
  messages: Message[];
  userInput: string;
  setUserInput: (input: string) => void;
  isLoading: boolean;
  isSpeaking: boolean;
  isRecording: boolean;
  useVoice: boolean;
  onSendMessage: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function ConversationPanel({
  messages,
  userInput,
  setUserInput,
  isLoading,
  isSpeaking,
  isRecording,
  useVoice,
  onSendMessage,
  onStartRecording,
  onStopRecording,
  onKeyPress,
}: ConversationPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col"
      style={{ height: "600px" }}
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Conversation
      </h3>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-blue-600 dark:bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              }`}
            >
              <div className="text-xs font-semibold mb-1 opacity-75">
                {msg.role === "user" ? "You" : "Interviewer"}
              </div>
              <div className="text-sm">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t dark:border-gray-700 pt-4">
        <div className="flex space-x-2">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={
              useVoice
                ? "Click mic to speak or type..."
                : "Type your answer..."
            }
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400 dark:placeholder-gray-500"
            rows={3}
            disabled={isLoading || isSpeaking}
          />
          <div className="flex flex-col space-y-2">
            {useVoice && (
              <button
                onClick={isRecording ? onStopRecording : onStartRecording}
                disabled={isLoading || isSpeaking}
                className={`mic-button p-4 rounded-lg transition-all ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 recording-active"
                    : "bg-green-500 hover:bg-green-600"
                } text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                title={isRecording ? "Stop Recording" : "Start Recording"}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={onSendMessage}
              disabled={!userInput.trim() || isLoading || isSpeaking}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {isRecording
            ? "🔴 Recording... Speak now!"
            : "🎤 Click mic to speak • Type or press Enter to send"}
        </div>
      </div>
    </div>
  );
}

