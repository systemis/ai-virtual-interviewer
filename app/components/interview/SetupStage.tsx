
interface SetupStageProps {
  jobRole: string;
  setJobRole: (role: string) => void;
  experience: string;
  setExperience: (exp: string) => void;
  interviewType: string;
  setInterviewType: (type: string) => void;
  onStart: () => void;
}

export default function SetupStage({
  jobRole,
  setJobRole,
  experience,
  setExperience,
  interviewType,
  setInterviewType,
  onStart,
}: SetupStageProps) {
  return (
    <div className="flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Target Job Role
          </label>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="e.g. Product Manager, Software Engineer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Experience
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="Junior">Junior</option>
              <option value="Mid-level">Mid-level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="Behavioral">Behavioral</option>
              <option value="Technical">Technical</option>
              <option value="System Design">System Design</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white shadow-lg transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="mr-2">Start Interview</span>
        <svg
          className="h-5 w-5 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </button>
    </div>
  );
}
