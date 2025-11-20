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

// Database types for Supabase
export interface InterviewRecord {
  id?: string;
  user_id?: string;
  job_role: string;
  experience_level: string;
  interview_type: string;
  conversation: Message[];
  feedback: Feedback;
  overall_score: number;
  communication_score: number;
  technical_score: number;
  question_count: number;
  completed_at: string;
  created_at?: string;
}

