import { createClient } from './client';
import type { Message, Feedback, InterviewRecord } from '../../types';

export interface SaveInterviewParams {
  jobRole: string;
  experience: string;
  interviewType: string;
  messages: Message[];
  feedback: Feedback;
  questionCount: number;
}

/**
 * Saves interview data and feedback to Supabase
 * @param params Interview data to save
 * @returns The saved interview record
 */
export async function saveInterviewToSupabase(
  params: SaveInterviewParams
): Promise<InterviewRecord | null> {
  try {
    const supabase = createClient();

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Prepare the interview record
    const interviewRecord: Omit<InterviewRecord, 'id' | 'created_at'> = {
      user_id: user?.id || undefined,
      job_role: params.jobRole,
      experience_level: params.experience,
      interview_type: params.interviewType,
      conversation: params.messages,
      feedback: params.feedback,
      overall_score: params.feedback.overallScore,
      communication_score: params.feedback.communicationScore,
      technical_score: params.feedback.technicalScore,
      question_count: params.questionCount,
      completed_at: new Date().toISOString(),
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('interviews')
      .insert(interviewRecord)
      .select()
      .single();

    if (error) {
      console.error('Error saving interview to Supabase:', error);
      return null;
    }

    console.log('Interview saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error saving interview:', error);
    return null;
  }
}

/**
 * Retrieves all interviews for the current user
 * @returns Array of interview records
 */
export async function getUserInterviews(): Promise<InterviewRecord[]> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    // Fetch user's interviews
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interviews:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching interviews:', error);
    return [];
  }
}

/**
 * Retrieves a specific interview by ID
 * @param id Interview ID
 * @returns Interview record or null
 */
export async function getInterviewById(id: string): Promise<InterviewRecord | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching interview:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching interview:', error);
    return null;
  }
}

/**
 * Deletes an interview by ID
 * @param id Interview ID
 * @returns Success boolean
 */
export async function deleteInterview(id: string): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('interviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting interview:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting interview:', error);
    return false;
  }
}
