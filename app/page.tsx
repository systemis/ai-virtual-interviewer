"use client";

import { useState } from "react";
import FeedbackView from "./components/FeedbackView";
import InterviewView from "./components/InterviewView";
import SetupForm from "./components/SetupForm";
import { useBackendStatus } from "./hooks/useBackendStatus";
import { useInterview } from "./hooks/useInterview";
import { useMicrophone } from "./hooks/useMicrophone";
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

  const {
    isLoading,
    isSpeaking,
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
    useVoice,
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
      setStage("interview");
      const initialMessages = await startInterviewFlow();
      setMessages(initialMessages);
    } catch (error) {
      console.error("Error starting interview:", error);
      alert(
        "Failed to start interview. Please check that the API is configured correctly.",
      );
      setStage("setup");
    }
  };

  const handleSendMessageWithText = async (
    text: string,
    currentMessages: Message[] = messages,
  ) => {
    if (!text.trim() || isLoading) return;

    try {
      const updatedMessages = await sendInterviewMessage(currentMessages, text);
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

  const handleSendMessage = async () => {
    await handleSendMessageWithText(userInput);
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

        // Immediately show the user's message in the conversation
        const userMessage: Message = { role: "user", content: transcribedText };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        // Then send to API and get AI response
        await handleSendMessageWithText(transcribedText, updatedMessages);
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
        isLoading={isLoading}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isRecording={isRecording}
        expression={expression}
        debugInfo={debugInfo}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
      />
    );
  }

  if (stage === "feedback" && feedback) {
    return <FeedbackView feedback={feedback} onReset={resetInterview} />;
  }

  return null;
}
