export interface Message {
  role: "user" | "interviewer";
  content: string;
}

export interface Feedback {
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  communicationScore: number;
  technicalScore: number;
  detailedFeedback: string;
  recommendations: string[];
}

export type InterviewStage = "setup" | "interview" | "feedback";
export type ExperienceLevel = "entry-level" | "mid-level" | "senior" | "lead";
export type InterviewType = "behavioral" | "technical" | "hr-screening" | "case-study";
export type BackendStatus = "checking" | "connected" | "error" | "disconnected";
export type MicPermission = "unknown" | "granted" | "denied" | "unsupported";
export type Expression = "neutral" | "encouraging" | "thinking" | "listening";

