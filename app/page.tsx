"use client";

import { useState } from "react";
import FeedbackView from "./components/FeedbackView";
import InterviewView from "./components/InterviewView";
import SetupForm from "./components/SetupForm";
import { useBackendStatus } from "./hooks/useBackendStatus";
import { useInterview } from "./hooks/useInterview";
import { useMicrophone } from "./hooks/useMicrophone";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import type {
  ExperienceLevel,
  Expression,
  Feedback,
  InterviewStage,
  InterviewType,
  Message,
} from "./types";

export default function InterviewSimulator() {
  const [stage, setStage] = useState<InterviewStage>("setup");
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel>("mid-level");
  const [interviewType, setInterviewType] =
    useState<InterviewType>("behavioral");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [expression, setExpression] = useState<Expression>("neutral");
  const [questionCount, setQuestionCount] = useState(0);
  const [useVoice, setUseVoice] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const backendStatus = useBackendStatus();
  const {
    micPermission,
    isRecording,
    isListening,
    debugInfo,
    startRecording: startMicRecording,
    stopRecording: stopMicRecording,
    testMicrophone,
  } = useMicrophone();

  const { isSpeaking, speak, cancel } = useSpeechSynthesis(useVoice);

  const {
    isLoading,
    startInterview: startInterviewFlow,
    sendMessage: sendInterviewMessage,
    generateFeedback: generateInterviewFeedback,
  } = useInterview({
    jobRole,
    experience,
    interviewType,
    questionCount,
    setQuestionCount,
    setExpression,
    speak,
    setStage,
  });

  const handleStartInterview = async () => {
    if (!jobRole.trim()) {
      alert("Please enter a job role");
      return;
    }

    if (backendStatus !== "connected") {
      alert(
        "Backend server is not running. Please check your API configuration.",
      );
      return;
    }

    try {
      const initialMessages = await startInterviewFlow();
      setMessages(initialMessages);
      setStage("interview");
    } catch (error) {
      console.error("Error starting interview:", error);
      alert(
        "Failed to start interview. Please check that the API is configured correctly.",
      );
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    try {
      const updatedMessages = await sendInterviewMessage(messages, userInput);
      setMessages(updatedMessages);
      setUserInput("");

      const lastMessage = updatedMessages[updatedMessages.length - 1];
      const isInterviewComplete =
        lastMessage.role === "interviewer" &&
        (lastMessage.content
          .toLowerCase()
          .includes("concludes our interview") ||
          lastMessage.content
            .toLowerCase()
            .includes("thank you for your time"));

      if (isInterviewComplete) {
        const feedbackData = await generateInterviewFeedback(updatedMessages);
        setFeedback(feedbackData);
        setStage("feedback");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to get response. Please try again.");
    }
  };

  const handleStartRecording = async () => {
    try {
      await startMicRecording();
    } catch (error) {
      console.error("Recording error:", error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const transcribedText = await stopMicRecording();
      if (transcribedText) {
        setUserInput(transcribedText);
      }
    } catch (error) {
      console.error("Recording error:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetInterview = () => {
    setStage("setup");
    setMessages([]);
    setUserInput("");
    setQuestionCount(0);
    setFeedback(null);
    setExpression("neutral");
    cancel();
  };

  if (stage === "setup") {
    return (
      <div suppressHydrationWarning>
        <SetupForm
          jobRole={jobRole}
          setJobRole={setJobRole}
          experience={experience}
          setExperience={setExperience}
          interviewType={interviewType}
          setInterviewType={setInterviewType}
          useVoice={useVoice}
          setUseVoice={setUseVoice}
          backendStatus={backendStatus}
          micPermission={micPermission}
          debugInfo={debugInfo}
          isLoading={isLoading}
          onTestMicrophone={testMicrophone}
          onStartInterview={handleStartInterview}
        />
      </div>
    );
  }

  if (stage === "interview") {
    return (
      <InterviewView
        jobRole={jobRole}
        interviewType={interviewType}
        experience={experience}
        questionCount={questionCount}
        messages={messages}
        userInput={userInput}
        setUserInput={setUserInput}
        isLoading={isLoading}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isRecording={isRecording}
        expression={expression}
        useVoice={useVoice}
        debugInfo={debugInfo}
        onSendMessage={handleSendMessage}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onKeyPress={handleKeyPress}
      />
    );
  }

  if (stage === "feedback" && feedback) {
    return <FeedbackView feedback={feedback} onReset={resetInterview} />;
  }

  return null;
}
