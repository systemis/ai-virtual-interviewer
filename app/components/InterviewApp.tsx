"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useInterview } from "../hooks/useInterview";
import { useMicrophone } from "../hooks/useMicrophone";
import type { Expression, Feedback, Message } from "../types";
import FeedbackStage from "./interview/FeedbackStage";
import Header from "./interview/Header";
import InterviewStage from "./interview/InterviewStage";
import SetupStage from "./interview/SetupStage";

export default function InterviewApp() {
  const router = useRouter()
  // Interview State
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [experience, setExperience] = useState("Mid-level");
  const [interviewType, setInterviewType] = useState("Behavioral");
  const [stage, setStage] = useState<"setup" | "interview" | "feedback">("setup");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [questionCount, setQuestionCount] = useState(0);
  const [expression, setExpression] = useState<Expression>("neutral");
  const [useVoice, setUseVoice] = useState(true);

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

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
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
      <Header onBack={() => router.push("/")} stage={stage} />

      {stage === "setup" && (
        <SetupStage
          jobRole={jobRole}
          setJobRole={setJobRole}
          experience={experience}
          setExperience={setExperience}
          interviewType={interviewType}
          setInterviewType={setInterviewType}
          onStart={handleStartInterview}
        />
      )}

      {stage === "interview" && (
        <InterviewStage
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          messages={messages}
          isSpeaking={isSpeaking}
          isLoading={isLoading}
          isInterviewEnding={isInterviewEnding}
          userInput={userInput}
          setUserInput={setUserInput}
          onSendMessage={handleSendMessage}
          isRecording={isRecording}
          onStartRecording={startRecording}
          onStopRecording={handleStopRecording}
          onFinishInterview={handleFinishInterview}
          recordingDuration={recordingDuration}
        />
      )}

      {stage === "feedback" && feedback && (
        <FeedbackStage
          feedback={feedback}
          onStartNew={() => {
            setStage("setup");
            setMessages([]);
            setFeedback(null);
            setQuestionCount(0);
          }}
        />
      )}
    </div>
  );
}
