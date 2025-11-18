import { useState } from "react";
import type { Expression, Feedback, Message } from "../types";
import { chatWithAudio } from "../lib/django-client";

interface UseInterviewParams {
  jobRole: string;
  experience: string;
  interviewType: string;
  questionCount: number;
  setQuestionCount: (count: number | ((prev: number) => number)) => void;
  setExpression: (expr: Expression) => void;
  useVoice: boolean;
  setStage: (stage: "setup" | "interview" | "feedback") => void;
}

export const useInterview = ({
  jobRole,
  experience,
  interviewType,
  questionCount,
  setQuestionCount,
  setExpression,
  useVoice,
  setStage,
}: UseInterviewParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Helper function to play audio from base64
  const playAudio = async (audioBase64: string): Promise<void> => {
    if (!audioBase64) return;

    try {
      setIsSpeaking(true);
      const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
      await audio.play();

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          setIsSpeaking(false);
          resolve();
        };
        audio.onerror = (error) => {
          console.error("Audio playback error:", error);
          setIsSpeaking(false);
          reject(error);
        };
      });
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsSpeaking(false);
    }
  };

  const startInterview = async (): Promise<Message[]> => {
    setIsLoading(true);
    setExpression("neutral");

    const systemPrompt = `You are a professional interviewer conducting a ${interviewType} interview for a ${jobRole} position. The candidate has ${experience} experience.

Your role:
- Ask relevant, thoughtful questions appropriate for the role and experience level
- Listen carefully to responses and ask natural follow-up questions
- Be encouraging but professional
- Ask 5-7 questions total
- After about 5-7 questions, wrap up the interview naturally

Keep responses concise and conversational (2-3 sentences max per turn). Start by greeting the candidate and asking your first question.`;

    try {
      const data = await chatWithAudio({
        messages: [
          {
            role: "user",
            content: "Hello, I'm ready for the interview.",
          },
        ],
        system: systemPrompt,
        include_audio: useVoice,
      });

      const interviewerMessage = data.content;

      const newMessages: Message[] = [
        { role: "interviewer", content: interviewerMessage },
      ];

      setQuestionCount(1);
      setExpression("encouraging");

      // Play audio if included in response
      if (data.audio?.data) {
        await playAudio(data.audio.data);
      }

      return newMessages;
    } catch (error) {
      console.error("Error starting interview:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    messages: Message[],
    userInput: string,
  ): Promise<Message[]> => {
    if (!userInput.trim() || isLoading) return messages;

    const userMessage: Message = { role: "user", content: userInput };
    const updatedMessages = [...messages, userMessage];
    setIsLoading(true);
    setExpression("thinking");

    const conversationHistory = updatedMessages.map((msg) => ({
      role: msg.role === "interviewer" ? "assistant" : "user",
      content: msg.content,
    }));

    const systemPrompt = `You are a professional interviewer conducting a ${interviewType} interview for a ${jobRole} position. The candidate has ${experience} experience.

Your role:
- Ask relevant, thoughtful questions appropriate for the role and experience level
- Listen carefully to responses and ask natural follow-up questions
- Be encouraging but professional
- You've asked ${questionCount} questions so far
- After 5-7 questions, thank them and end the interview by saying "That concludes our interview. Thank you for your time."

Keep responses concise and conversational (2-3 sentences max). If this is question 5-7, wrap up the interview.`;

    try {
      const data = await chatWithAudio({
        messages: conversationHistory as Array<{
          role: "user" | "assistant";
          content: string;
        }>,
        system: systemPrompt,
        include_audio: useVoice,
      });

      const interviewerMessage = data.content;

      const finalMessages: Message[] = [
        ...updatedMessages,
        { role: "interviewer", content: interviewerMessage },
      ];

      const isInterviewComplete =
        interviewerMessage.toLowerCase().includes("concludes our interview") ||
        interviewerMessage.toLowerCase().includes("thank you for your time");

      if (isInterviewComplete) {
        setExpression("encouraging");
        // Play audio if included in response
        if (data.audio?.data) {
          await playAudio(data.audio.data);
        }
        return finalMessages;
      } else {
        setQuestionCount((prev) => prev + 1);
        setExpression("encouraging");
        // Play audio if included in response
        if (data.audio?.data) {
          await playAudio(data.audio.data);
        }
        return finalMessages;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateFeedback = async (
    conversationMessages: Message[],
  ): Promise<Feedback> => {
    setIsLoading(true);

    const fullConversation = conversationMessages
      .map(
        (msg) =>
          `${msg.role === "interviewer" ? "Interviewer" : "Candidate"}: ${
            msg.content
          }`,
      )
      .join("\n\n");

    const feedbackPrompt = `You are an expert interview coach. Review this job interview conversation and provide detailed feedback.

Interview Conversation:
${fullConversation}

Provide feedback in the following JSON format (respond ONLY with valid JSON, no other text):
{
  "overallScore": <number 1-10>,
  "strengths": ["strength1", "strength2", "strength3"],
  "areasForImprovement": ["area1", "area2", "area3"],
  "communicationScore": <number 1-10>,
  "technicalScore": <number 1-10>,
  "detailedFeedback": "A paragraph of specific, actionable feedback",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Be encouraging but honest. Focus on specific examples from the conversation.`;

    try {
      const data = await chatWithAudio({
        messages: [{ role: "user", content: feedbackPrompt }],
        system: "",
        max_tokens: 1500,
        include_audio: false,
      });

      let feedbackText = data.content;
      feedbackText = feedbackText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const feedbackData = JSON.parse(feedbackText);
      return feedbackData;
    } catch (error) {
      console.error("Error generating feedback:", error);
      return {
        overallScore: 7,
        strengths: [
          "Good communication",
          "Professional demeanor",
          "Clear responses",
        ],
        areasForImprovement: [
          "Provide more specific examples",
          "Ask clarifying questions",
          "Show more enthusiasm",
        ],
        communicationScore: 7,
        technicalScore: 7,
        detailedFeedback:
          "You did well overall. Continue practicing to improve your interview skills.",
        recommendations: [
          "Practice STAR method",
          "Research the company",
          "Prepare questions to ask",
        ],
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isSpeaking,
    startInterview,
    sendMessage,
    generateFeedback,
  };
};
