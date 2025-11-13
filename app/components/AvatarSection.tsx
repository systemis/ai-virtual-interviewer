import AvatarDisplay from "./AvatarDisplay";
import type { Expression } from "../types";

interface AvatarSectionProps {
  expression: Expression;
  isSpeaking: boolean;
  isListening: boolean;
}

export default function AvatarSection({
  expression,
  isSpeaking,
  isListening,
}: AvatarSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div
        className="flex justify-center items-center"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <AvatarDisplay
          expression={expression}
          isSpeaking={isSpeaking}
          isListening={isListening}
        />
      </div>
    </div>
  );
}

