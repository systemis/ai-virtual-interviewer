-- Create interviews table to store interview data and feedback
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  interview_type TEXT NOT NULL,
  conversation JSONB NOT NULL,
  feedback JSONB NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 1 AND overall_score <= 10),
  communication_score INTEGER NOT NULL CHECK (communication_score >= 1 AND communication_score <= 10),
  technical_score INTEGER NOT NULL CHECK (technical_score >= 1 AND technical_score <= 10),
  question_count INTEGER NOT NULL CHECK (question_count >= 0),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_overall_score ON interviews(overall_score);

-- Enable Row Level Security (RLS)
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own interviews
CREATE POLICY "Users can view their own interviews"
  ON interviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own interviews
CREATE POLICY "Users can insert their own interviews"
  ON interviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own interviews
CREATE POLICY "Users can update their own interviews"
  ON interviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own interviews
CREATE POLICY "Users can delete their own interviews"
  ON interviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow anonymous users to insert interviews (if you want to support non-authenticated users)
-- Uncomment the following policy if you want to allow non-authenticated interview storage
/*
CREATE POLICY "Anonymous users can insert interviews"
  ON interviews
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anonymous users can view interviews without user_id"
  ON interviews
  FOR SELECT
  USING (user_id IS NULL);
*/

-- Create a view for interview statistics (optional, for analytics)
CREATE OR REPLACE VIEW interview_statistics AS
SELECT
  user_id,
  COUNT(*) as total_interviews,
  AVG(overall_score) as avg_overall_score,
  AVG(communication_score) as avg_communication_score,
  AVG(technical_score) as avg_technical_score,
  MAX(created_at) as last_interview_date
FROM interviews
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON interview_statistics TO authenticated;

COMMENT ON TABLE interviews IS 'Stores completed AI interview sessions with conversation history and feedback';
COMMENT ON COLUMN interviews.id IS 'Unique identifier for the interview';
COMMENT ON COLUMN interviews.user_id IS 'Reference to the user who took the interview (nullable for anonymous)';
COMMENT ON COLUMN interviews.job_role IS 'Target job position for the interview';
COMMENT ON COLUMN interviews.experience_level IS 'Candidate experience level (Junior, Mid-level, Senior)';
COMMENT ON COLUMN interviews.interview_type IS 'Type of interview (Behavioral, Technical, System Design)';
COMMENT ON COLUMN interviews.conversation IS 'Full conversation history as JSON array';
COMMENT ON COLUMN interviews.feedback IS 'AI-generated feedback as JSON object';
COMMENT ON COLUMN interviews.overall_score IS 'Overall interview score (1-10)';
COMMENT ON COLUMN interviews.communication_score IS 'Communication skills score (1-10)';
COMMENT ON COLUMN interviews.technical_score IS 'Technical skills score (1-10)';
COMMENT ON COLUMN interviews.question_count IS 'Number of questions asked in the interview';
COMMENT ON COLUMN interviews.completed_at IS 'Timestamp when the interview was completed';
COMMENT ON COLUMN interviews.created_at IS 'Timestamp when the record was created';
