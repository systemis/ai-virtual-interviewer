import type { Feedback } from "../../types";

interface FeedbackStageProps {
  feedback: Feedback;
  onStartNew: () => void;
}

export default function FeedbackStage({
  feedback,
  onStartNew,
}: FeedbackStageProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-6 md:p-8">
        <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
          Interview Feedback
        </h2>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Overall
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {feedback.overallScore}/10
            </div>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Communication
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {feedback.communicationScore}/10
            </div>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Technical
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {feedback.technicalScore}/10
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Strengths
            </h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
              {feedback.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Areas for Improvement
            </h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
              {feedback.areasForImprovement.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Detailed Feedback
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {feedback.detailedFeedback}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={onStartNew}
          className="rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white shadow-lg transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
        >
          Start New Interview
        </button>
      </div>
    </div>
  );
}
