import React from 'react';

interface Interview {
  id: string;
  job_role: string;
  experience_level: string;
  interview_type: string;
  completed_at: string;
  overall_score: number;
  question_count: number;
}

interface InterviewListProps {
  interviews: Interview[];
  isLoading: boolean;
}

export const InterviewList: React.FC<InterviewListProps> = ({ interviews, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No interviews found. Start a new interview to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {interviews.map((interview) => (
        <div
          key={interview.id}
          className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{interview.job_role}</h3>
              <p className="text-sm text-gray-400">{interview.experience_level} • {interview.interview_type}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${interview.overall_score >= 8 ? 'bg-green-500/20 text-green-400' :
                interview.overall_score >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
              }`}>
              Score: {interview.overall_score}/10
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-400 mt-4 pt-4 border-t border-white/10">
            <span>{new Date(interview.completed_at).toLocaleDateString()}</span>
            <span>{interview.question_count} Questions</span>
          </div>
        </div>
      ))}
    </div>
  );
};
