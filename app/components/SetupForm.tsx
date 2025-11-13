import type { ExperienceLevel, InterviewType, BackendStatus, MicPermission } from "../types";
import BackendStatusBadge from "./BackendStatusBadge";

interface SetupFormProps {
  jobRole: string;
  setJobRole: (role: string) => void;
  experience: ExperienceLevel;
  setExperience: (exp: ExperienceLevel) => void;
  interviewType: InterviewType;
  setInterviewType: (type: InterviewType) => void;
  useVoice: boolean;
  setUseVoice: (use: boolean) => void;
  backendStatus: BackendStatus;
  micPermission: MicPermission;
  debugInfo: string;
  isLoading: boolean;
  onTestMicrophone: () => void;
  onStartInterview: () => void;
}

export default function SetupForm({
  jobRole,
  setJobRole,
  experience,
  setExperience,
  interviewType,
  setInterviewType,
  useVoice,
  setUseVoice,
  backendStatus,
  micPermission,
  debugInfo,
  isLoading,
  onTestMicrophone,
  onStartInterview,
}: SetupFormProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900"
      suppressHydrationWarning
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
        suppressHydrationWarning
      >
        <div className="text-center mb-8" suppressHydrationWarning>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            3D AI Interview Simulator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Practice with a virtual interviewer and get instant feedback
          </p>
          <div className="mt-4 space-y-2" suppressHydrationWarning>
            <BackendStatusBadge status={backendStatus} />
            {debugInfo && (
              <div
                className="text-xs p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200"
                suppressHydrationWarning
              >
                {debugInfo}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Role *
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div suppressHydrationWarning>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experience Level
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="entry-level">Entry Level (0-2 years)</option>
              <option value="mid-level">Mid Level (3-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
              <option value="lead">Lead/Principal (10+ years)</option>
            </select>
          </div>

          <div suppressHydrationWarning>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interview Type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value as InterviewType)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="behavioral">Behavioral</option>
              <option value="technical">Technical</option>
              <option value="hr-screening">HR Screening</option>
              <option value="case-study">Case Study</option>
            </select>
          </div>

          <div
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            suppressHydrationWarning
          >
            <input
              type="checkbox"
              id="useVoice"
              checked={useVoice}
              onChange={(e) => setUseVoice(e.target.checked)}
              className="w-5 h-5 text-blue-600"
            />
            <label htmlFor="useVoice" className="text-sm text-gray-700 dark:text-gray-300">
              Enable voice interaction
            </label>
          </div>

          {useVoice && micPermission !== "granted" && (
            <button
              onClick={onTestMicrophone}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all"
            >
              🎤 Test Microphone (Click First!)
            </button>
          )}

          <button
            onClick={onStartInterview}
            disabled={isLoading || backendStatus !== "connected"}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? "Starting Interview..." : "Start Interview"}
          </button>

          <div
            className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1"
            suppressHydrationWarning
          >
            <p>💡 Voice features work in all modern browsers</p>
            <p>🎤 Click &quot;Test Microphone&quot; first if using voice</p>
            {backendStatus !== "connected" && (
              <p className="text-red-600 dark:text-red-400">⚠️ Check API configuration</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

