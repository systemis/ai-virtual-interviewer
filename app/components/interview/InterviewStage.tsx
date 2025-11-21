import { useEffect, useRef } from "react";
import type { Message } from "../../types";

interface InterviewStageProps {
  questions: string[];
  currentQuestionIndex: number;
  messages: Message[];
  isSpeaking: boolean;
  isLoading: boolean;
  isInterviewEnding: boolean;
  userInput: string;
  setUserInput: (input: string) => void;
  onSendMessage: () => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFinishInterview: () => void;
  recordingDuration: number;
}

export default function InterviewStage({
  questions,
  currentQuestionIndex,
  messages,
  isSpeaking,
  isLoading,
  isInterviewEnding,
  userInput,
  setUserInput,
  onSendMessage,
  isRecording,
  onStartRecording,
  onStopRecording,
  onFinishInterview,
  recordingDuration,
}: InterviewStageProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-[600px] flex-col animate-in fade-in zoom-in-95 duration-500">
      {/* Current Question Display */}
      {questions && questions.length > 0 && (
        <div className="mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Question {Math.min(currentQuestionIndex + 1, questions.length)} of{" "}
              {questions.length}
            </span>
          </div>
          <p className="text-sm md:text-base font-medium text-indigo-900 dark:text-indigo-100">
            {questions[Math.min(currentQuestionIndex, questions.length - 1)]}
          </p>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-[80%] flex-col space-y-1 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`rounded-2xl px-5 py-3 text-sm md:text-base shadow-sm ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 px-1">
                {msg.role === "user" ? "You" : "Interviewer"}
              </span>
            </div>
          </div>
        ))}
        {isSpeaking && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 shadow-sm">
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500/50 delay-75"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500/50 delay-150"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500/50 delay-300"></div>
            </div>
          </div>
        )}
        {isLoading && !isSpeaking && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-4">
        {isInterviewEnding ? (
          <div className="flex-1 flex justify-center">
            <button
              onClick={onFinishInterview}
              className="rounded-xl bg-green-600 px-8 py-3 font-medium text-white shadow-lg transition-all hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <span>View Feedback</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative flex-1">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
              placeholder={
                isLoading
                  ? "Waiting for response..."
                  : isSpeaking
                  ? "AI is speaking..."
                  : "Type your answer..."
              }
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 pr-12 text-slate-900 dark:text-white shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isRecording || isLoading || isSpeaking}
            />
            <button
              onClick={onSendMessage}
              disabled={
                !userInput.trim() || isRecording || isLoading || isSpeaking
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Microphone Button - Hide when ending */}
        {!isInterviewEnding && (
          <div className="relative">
            {isRecording && (
              <div className="absolute inset-0 animate-pulse-ring rounded-full bg-red-500/20"></div>
            )}
            <button
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={isLoading || isSpeaking}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                isRecording
                  ? "bg-red-500 text-white ring-4 ring-red-500/20"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {isRecording ? (
                <div className="h-4 w-4 rounded-sm bg-current" />
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {isRecording && (
        <p className="mt-2 text-center text-sm font-medium text-red-500 animate-pulse">
          Recording... {formatTime(recordingDuration)}
        </p>
      )}
    </div>
  );
}
