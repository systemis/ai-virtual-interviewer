"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMicrophone } from "../hooks/useMicrophone";
import { useInterview } from "../hooks/useInterview";
import type { Message, Feedback, Expression } from "../types";

export default function InterviewApp({ onBack }: { onBack?: () => void }) {
  // Interview State
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [experience, setExperience] = useState("Mid-level");
  const [interviewType, setInterviewType] = useState("Behavioral");
  const [stage, setStage] = useState<"setup" | "interview" | "feedback">("setup");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Hook State Requirements
  const [questionCount, setQuestionCount] = useState(0);
  const [expression, setExpression] = useState<Expression>("neutral");
  const [useVoice, setUseVoice] = useState(true);

  // UI Refs & State
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isRecording,
    startRecording,
    stopRecording: stopMicRecording,
  } = useMicrophone();

  const {
    isSpeaking,
    startInterview: startInterviewFlow,
    sendMessage: sendInterviewMessage,
    sendVoiceMessage,
    questions,
    currentQuestionIndex,
    isLoading,
    isInterviewEnding,
    generateFeedback: generateInterviewFeedback,
  } = useInterview({
    jobRole,
    experience,
    interviewType,
    questionCount,
    setQuestionCount,
    setExpression,
    useVoice,
    setStage,
    setFeedback,
  });

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      // Reset logic moved to where isRecording becomes true to avoid effect loop, 
      // or we just don't reset here and rely on startRecording to reset it if needed.
      // But checking useMicrophone hook, it doesn't seem to expose reset.
      // To fix lint, we can just set duration to 0 before the interval starts in a way that doesn't trigger immediate re-render loop if possible
      // Actually, setting it here is fine if isRecording changes.
      // The lint error says "Calling setState synchronously within an effect".
      // We can wrap it in a timeout or just ignore if we are sure it only happens on change.
      // Better fix: reset duration when startRecording is called, but we can't modify that easily without touching hook.
      // Alternative:

      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartInterview = async () => {
    setStage("interview");
    const initialMessages = await startInterviewFlow();
    setMessages(initialMessages);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = { role: "user", content: userInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setUserInput("");

    await handleSendMessageWithText(userInput, updatedMessages);
  };

  const handleSendMessageWithText = async (
    text: string,
    currentMessages: Message[]
  ) => {
    try {
      const newMessages = await sendInterviewMessage(currentMessages, text);
      setMessages(newMessages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopMicRecording();
      if (audioBlob) {
        // We won't optimistically add the message here because we don't have the text yet.
        // The hook handles the transcription and adding the user message.
        // However, to display the message *after* STT but *before* LLM response,
        // the hook needs to surface that intermediate state or update messages progressively.
        // Currently sendVoiceMessage returns the FINAL messages.

        // Let's rely on the hook to update the state if we pass a callback or if the hook exposes
        // an intermediate "transcribing" state.

        // Actually, `useInterview` manages its own internal logic but `messages` state is owned by `InterviewApp`.
        // The `sendVoiceMessage` in `useInterview` returns the final array.
        // If we want to show the text *as soon as it is transcribed*, we need to split `sendVoiceMessage`
        // or pass a callback to `sendVoiceMessage` like `onTranscription(text)`.

        // But wait, `sendVoiceMessage` in the hook is async.
        // It calls `speechToText`, gets text, calls `processUserResponse`.
        // We can refactor `sendVoiceMessage` to take an `onUserText` callback.

        const updatedMessages = await sendVoiceMessage(messages, audioBlob, (userText) => {
          const userMessage: Message = { role: "user", content: userText };
          setMessages(prev => [...prev, userMessage]);
        });
        setMessages(updatedMessages);
      }
    } catch (error) {
      console.error("Recording error:", error);
      alert("Failed to process voice message. Please try again.");
    }
  };

  const handleFinishInterview = async () => {
    try {
      // Import the save function from Django client
      const { saveInterview } = await import("../lib/django-client");

      // Generate feedback from current conversation
      const feedbackData = await generateInterviewFeedback(messages);
      setFeedback(feedbackData);

      // Save interview to backend via Django API
      try {
        await saveInterview({
          jobRole,
          experience,
          interviewType,
          messages,
          feedback: feedbackData,
          questionCount,
        });
        console.log("Interview saved successfully");
      } catch (saveError) {
        console.error("Failed to save interview:", saveError);
        // Continue to feedback screen even if save fails
      }

      setStage("feedback");
    } catch (error) {
      console.error("Error generating feedback:", error);
      alert("Failed to generate feedback. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-3xl rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl ring-1 ring-white/50 dark:ring-slate-700/50 md:p-10 border border-white/20 dark:border-slate-700/50">
      {/* Header */}
      <header className="mb-8 text-center relative">
        {onBack && stage === "setup" && (
          <button
            onClick={onBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
        )}
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
          AI Interviewer
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Master your interview skills with real-time AI feedback
        </p>
      </header>

      {/* Setup Stage */}
      {stage === "setup" && (
        <div className="flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-full max-w-md space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Target Job Role
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="e.g. Product Manager, Software Engineer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Experience
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Type
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="Behavioral">Behavioral</option>
                  <option value="Technical">Technical</option>
                  <option value="System Design">System Design</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white shadow-lg transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="mr-2">Start Interview</span>
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Interview Stage */}
      {stage === "interview" && (
        <div className="flex h-[600px] flex-col animate-in fade-in zoom-in-95 duration-500">
          {/* Current Question Display */}
          {questions && questions.length > 0 && (
            <div className="mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Question {Math.min(currentQuestionIndex + 1, questions.length)} of {questions.length}
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
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`flex max-w-[80%] flex-col space-y-1 ${msg.role === "user" ? "items-end" : "items-start"
                    }`}
                >
                  <div
                    className={`rounded-2xl px-5 py-3 text-sm md:text-base shadow-sm ${msg.role === "user"
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
                  onClick={handleFinishInterview}
                  className="rounded-xl bg-green-600 px-8 py-3 font-medium text-white shadow-lg transition-all hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                >
                  <span>View Feedback</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative flex-1">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={isLoading ? "Waiting for response..." : isSpeaking ? "AI is speaking..." : "Type your answer..."}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 pr-12 text-slate-900 dark:text-white shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isRecording || isLoading || isSpeaking}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isRecording || isLoading || isSpeaking}
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
                  onClick={isRecording ? handleStopRecording : startRecording}
                  disabled={isLoading || isSpeaking}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isRecording
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
      )}

      {/* Feedback Stage */}
      {stage === "feedback" && feedback && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
              Interview Feedback
            </h2>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Overall</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{feedback.overallScore}/10</div>
              </div>
              <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Communication</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{feedback.communicationScore}/10</div>
              </div>
              <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Technical</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{feedback.technicalScore}/10</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Strengths</h3>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Areas for Improvement</h3>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                  {feedback.areasForImprovement.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Detailed Feedback</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feedback.detailedFeedback}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => {
                setStage("setup");
                setMessages([]);
                setFeedback(null);
                setQuestionCount(0);
              }}
              className="rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white shadow-lg transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start New Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
