import type {
  ExperienceLevel,
  Expression,
  InterviewType,
  Message,
} from "../types";
import AvatarSection from "./AvatarSection";
import ConversationPanel from "./ConversationPanel";

interface InterviewViewProps {
  jobRole: string;
  interviewType: InterviewType;
  experience: ExperienceLevel;
  questionCount: number;
  messages: Message[];
  isLoading: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isRecording: boolean;
  expression: Expression;
  debugInfo: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export default function InterviewView({
  jobRole,
  interviewType,
  experience,
  questionCount,
  messages,
  isLoading,
  isSpeaking,
  isListening,
  isRecording,
  expression,
  debugInfo,
  onStartRecording,
  onStopRecording,
}: InterviewViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Interview: {jobRole}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {interviewType} • {experience}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Question
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {questionCount}/7
              </div>
            </div>
          </div>
          {debugInfo && (
            <div className="mt-2 text-xs p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200">
              {debugInfo}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AvatarSection
            expression={expression}
            isSpeaking={isSpeaking}
            isListening={isListening}
          />

          <ConversationPanel
            messages={messages}
            isLoading={isLoading}
            isSpeaking={isSpeaking}
            isRecording={isRecording}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
          />
        </div>
      </div>
    </div>
  );
}
