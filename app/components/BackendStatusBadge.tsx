import type { BackendStatus } from "../types";

interface BackendStatusBadgeProps {
  status: BackendStatus;
}

export default function BackendStatusBadge({ status }: BackendStatusBadgeProps) {
  if (status === "checking") {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400" suppressHydrationWarning>
        Checking backend connection...
      </div>
    );
  }
  if (status === "connected") {
    return (
      <div
        className="flex items-center text-xs text-green-600 dark:text-green-400"
        suppressHydrationWarning
      >
        <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2"></span>
        Backend Connected
      </div>
    );
  }
  return (
    <div
      className="flex items-center text-xs text-red-600 dark:text-red-400"
      suppressHydrationWarning
    >
      <span className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mr-2"></span>
      Backend Disconnected - Check API configuration
    </div>
  );
}

