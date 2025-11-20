import { useState } from "react";
import type { Expression, Feedback, Message } from "../types";
import { chatWithAudio, speechToText, chatCompletion, saveInterview } from "../lib/django-client";

interface UseInterviewParams {
  jobRole: string;
  experience: string;
  interviewType: string;
  questionCount: number;
  setQuestionCount: (count: number | ((prev: number) => number)) => void;
  setExpression: (expr: Expression) => void;
  useVoice: boolean;
  setStage: (stage: "setup" | "interview" | "feedback") => void;
  setFeedback: (feedback: Feedback | null) => void;
}

export const useInterview = ({
  jobRole,
  experience,
  interviewType,
  setQuestionCount,
  setExpression,
  useVoice,
  setStage,
  setFeedback,
}: UseInterviewParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewEnding, setIsInterviewEnding] = useState(false);

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

    try {
      // 1. Generate Questions
      const generatePrompt = `Generate 5 interview questions for a ${experience} ${jobRole} position for a ${interviewType} interview.
      Return ONLY a JSON array of strings. Do not include any other text.
      Example: ["Question 1", "Question 2", "Question 3"]`;

      const questionsResponse = await chatCompletion({
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: generatePrompt }],
        temperature: 0.7,
      });

      let generatedQuestions: string[] = [];
      try {
        const content = questionsResponse.content.replace(/```json/g, "").replace(/```/g, "").trim();
        generatedQuestions = JSON.parse(content);
      } catch (e) {
        console.error("Failed to parse questions:", e);
        generatedQuestions = [
          "Tell me about yourself.",
          "What are your greatest strengths?",
          "Describe a challenging project you worked on.",
          "Where do you see yourself in 5 years?",
          "Do you have any questions for us?"
        ];
      }

      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setQuestionCount(1);

      // 2. Ask First Question
      const firstQuestion = generatedQuestions[0];
      const systemPrompt = `You are a professional interviewer. Your task is to ask the candidate the following question exactly: "${firstQuestion}".
      Do not add any other text. Be professional and welcoming.`;

      const data = await chatWithAudio({
        messages: [
          {
            role: "user",
            content: "Please start the interview.",
          },
        ],
        system: systemPrompt,
        include_audio: useVoice,
      });

      const interviewerMessage = data.content;
      const newMessages: Message[] = [
        { role: "interviewer", content: interviewerMessage },
      ];

      setExpression("encouraging");

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

  const processUserResponse = async (
    messages: Message[],
    userText: string
  ): Promise<Message[]> => {
    // Check if user wants to end the interview
    const wantsToEndInterview = /end.*interview|give.*feedback|wrap.*up|don't want to answer|want to finish|want feedback|skip.*rest|done with.*interview/i.test(userText);

    if (wantsToEndInterview) {
      // User explicitly requested to end the interview
      const finalMessages = [...messages, { role: "user" as const, content: userText }];

      const closingPrompt = `The candidate has requested to end the interview early.
      They said: "${userText}".
      Respond professionally by:
      1. Acknowledging their request respectfully
      2. Thanking them for their time
      3. Letting them know you'll generate feedback now

      Keep it brief and professional. Do NOT try to continue the interview or ask more questions.`;

      const data = await chatWithAudio({
        messages: [{ role: "user", content: userText }],
        system: closingPrompt,
        include_audio: useVoice,
      });

      if (data.audio?.data) {
        await playAudio(data.audio.data);
      }

      // Generate feedback
      const feedbackData = await generateFeedbackInternal(finalMessages);
      setFeedback(feedbackData);

      // Save interview to backend via Django API
      try {
        await saveInterview({
          jobRole,
          experience,
          interviewType,
          messages: finalMessages,
          feedback: feedbackData,
          questionCount: currentQuestionIndex + 1,
        });
        console.log("Interview saved successfully");
      } catch (error) {
        console.error("Failed to save interview:", error);
        // Continue to feedback screen even if save fails
      }

      setStage("feedback");

      return [
        ...finalMessages,
        { role: "interviewer", content: data.content }
      ];
    }

    const isSkip = /skip|next question/i.test(userText);
    let nextIndex = currentQuestionIndex;
    let shouldAdvance = false;
    let systemPrompt = "";

    const currentQ = questions[currentQuestionIndex];

    if (isSkip) {
      shouldAdvance = true;
    } else {
      // Validation Check
      const validationPrompt = `Context: 
      Question: "${currentQ}"
      Candidate Answer: "${userText}"
      
      Task: Determine if the candidate attempted to answer the question.
      - If they answered (even poorly), return "YES".
      - If they asked for clarification, return "NO".
      - If they talked about something completely unrelated, return "NO".
      
      Return ONLY "YES" or "NO".`;

      const validation = await chatCompletion({
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: validationPrompt }],
        temperature: 0.0,
      });

      const isValid = validation.content.trim().toUpperCase().includes("YES");
      shouldAdvance = isValid;
    }

    if (shouldAdvance) {
      nextIndex = currentQuestionIndex + 1;
      // Determine if finished BEFORE updating state
      const isFinished = nextIndex >= questions.length;

      if (isFinished) {
        // Trigger feedback flow
        const finalMessages = [...messages, { role: "user" as const, content: userText }];

        const closingPrompt = `The candidate has finished the interview. 
        User just said: "${userText}" (in response to "${currentQ}").
        Acknowledge their response briefly, then say exactly: "That concludes our interview. I will now generate your feedback."`;

        const data = await chatWithAudio({
          messages: [{ role: "user", content: "Finish interview" }],
          system: closingPrompt,
          include_audio: useVoice,
        });

        if (data.audio?.data) {
          await playAudio(data.audio.data);
        }

        // Generate feedback
        const feedbackData = await generateFeedbackInternal(finalMessages);
        setFeedback(feedbackData);

        // Save interview to backend via Django API
        try {
          await saveInterview({
            jobRole,
            experience,
            interviewType,
            messages: finalMessages,
            feedback: feedbackData,
            questionCount: questions.length,
          });
          console.log("Interview saved successfully");
        } catch (error) {
          console.error("Failed to save interview:", error);
          // Continue to feedback screen even if save fails
        }

        setStage("feedback");

        return [
          ...messages,
          { role: "user", content: userText },
          { role: "interviewer", content: data.content }
        ];
      } else {
        // Next Question
        setCurrentQuestionIndex(nextIndex);
        setQuestionCount(nextIndex + 1); // Update count for UI

        const nextQ = questions[nextIndex];
        systemPrompt = `User just answered: "${userText}" to the question "${currentQ}".
        1. Briefly acknowledge their answer.
        2. Then ask exactly: "${nextQ}".
        Do not add anything else.`;
      }
    } else {
      // Retry / Clarify
      systemPrompt = `User said: "${userText}" to the question "${currentQ}".
      They did NOT answer the question effectively or asked for clarification.
      Politely ask them to answer the question "${currentQ}" again or clarify what you meant.
      If the user explicitly wants to end the interview, ask them to confirm or say something like "I understand, we can end the interview here."`;
    }

    // If not finished, get next response
    // We must include the current userText in the messages sent to the AI
    // otherwise the AI generates a response based only on previous history + system prompt,
    // ignoring what the user just said.

    const messagesForAI = [
      ...messages.slice(-4).map(m => ({ role: m.role === "interviewer" ? "assistant" as const : "user" as const, content: m.content })),
      { role: "user" as const, content: userText }
    ];

    const data = await chatWithAudio({
      messages: messagesForAI,
      system: systemPrompt,
      include_audio: useVoice,
    });

    if (data.audio?.data) {
      await playAudio(data.audio.data);
    }

    return [
      ...messages,
      { role: "user", content: userText },
      { role: "interviewer", content: data.content }
    ];
  };

  const sendMessage = async (
    messages: Message[],
    userInput: string,
  ): Promise<Message[]> => {
    if (!userInput.trim() || isLoading) return messages;
    setIsLoading(true);
    setExpression("thinking");

    try {
      const newMessages = await processUserResponse(messages, userInput);
      setExpression("encouraging");
      return newMessages;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendVoiceMessage = async (
    messages: Message[],
    audioBlob: Blob,
    onUserText?: (text: string) => void
  ): Promise<Message[]> => {
    if (isLoading) return messages;
    setIsLoading(true);
    setExpression("listening");

    try {
      const sttResponse = await speechToText(audioBlob);
      const userText = sttResponse.text;

      // Callback to update UI with user text immediately
      if (onUserText) {
        onUserText(userText);
      }

      // Correction: We must include the user's transcribed text in the messages sent to the AI 
      // so the AI knows what the user just said!

      // FIX: Add userText to the messages payload in `processUserResponse`.

      const newMessages = await processUserResponse(messages, userText);
      setExpression("encouraging");
      return newMessages;
    } catch (error) {
      console.error("Error sending voice message:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Renamed to avoid conflict with export, though export handles it. 
  // Keeping it internal for use in processUserResponse
  const generateFeedbackInternal = async (
    conversationMessages: Message[],
  ): Promise<Feedback> => {
    // Logic reused from original generateFeedback
    const fullConversation = conversationMessages
      .map(
        (msg) =>
          `${msg.role === "interviewer" ? "Interviewer" : "Candidate"}: ${msg.content
          }`,
      )
      .join("\n\n");

    const feedbackPrompt = `You are an expert interview coach. Review this job interview conversation and provide detailed feedback.
    
    Job Role: ${jobRole}
    Experience: ${experience}
    Type: ${interviewType}

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
    `;

    try {
      const data = await chatCompletion({
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: feedbackPrompt }],
        max_tokens: 1500,
      });

      let feedbackText = data.content;
      feedbackText = feedbackText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      return JSON.parse(feedbackText);
    } catch (error) {
      console.error("Error generating feedback:", error);
      return {
        overallScore: 7,
        strengths: ["Communication"],
        areasForImprovement: ["Depth"],
        communicationScore: 7,
        technicalScore: 7,
        detailedFeedback: "Error generating detailed feedback.",
        recommendations: ["Try again"]
      };
    }
  };

  // Public wrapper if needed by component manually
  const generateFeedback = async (conversationMessages: Message[]) => {
    setIsLoading(true);
    try {
      return await generateFeedbackInternal(conversationMessages);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    isSpeaking,
    questions,
    currentQuestionIndex,
    startInterview,
    sendMessage,
    sendVoiceMessage,
    generateFeedback,
    isInterviewEnding,
  };
};
