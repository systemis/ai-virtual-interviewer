import type { Feedback } from "../types";

interface FeedbackViewProps {
  feedback: Feedback;
  onReset: () => void;
}

export default function FeedbackView({ feedback, onReset }: FeedbackViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Interview Feedback
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Here&apos;s how you performed
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 mb-8 text-center">
            <div className="text-6xl font-bold mb-2">
              {feedback.overallScore}/10
            </div>
            <div className="text-xl">Overall Performance</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Communication Skills
              </h3>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {feedback.communicationScore}/10
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Technical Knowledge
              </h3>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {feedback.technicalScore}/10
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              ✨ Strengths
            </h3>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2">
                    ✓
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {strength}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              📈 Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {feedback.areasForImprovement.map((area, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-orange-500 dark:text-orange-400 mr-2">
                    →
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {area}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              💬 Detailed Feedback
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
              {feedback.detailedFeedback}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              🎯 Recommendations
            </h3>
            <ul className="space-y-2">
              {feedback.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">
                    •
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {rec}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onReset}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}
