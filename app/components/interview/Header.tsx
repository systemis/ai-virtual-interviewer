
interface HeaderProps {
  onBack?: () => void;
  stage: "setup" | "interview" | "feedback";
}

export default function Header({ onBack, stage }: HeaderProps) {
  return (
    <header className="mb-8 text-center relative">
      {onBack && stage === "setup" && (
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
      )}
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
        AI Interviewer
      </h1>
      <p className="text-slate-500 dark:text-slate-400">
        Master your interview skills with real-time AI feedback
      </p>
    </header>
  );
}
