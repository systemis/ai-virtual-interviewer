'use client';

import React, { useEffect, useState } from 'react';
import { getInterviewHistory } from '../lib/django-client';
import { InterviewList } from '../components/InterviewList';
import Link from 'next/link';

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // TODO: Get actual user ID from auth context
  const userId = "test-user-id";

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getInterviewHistory(userId);
        setInterviews(data);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-slate-400">
                View your interview history and progress
              </p>
            </div>
            <Link
              href="/interview"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Interview
            </Link>
          </div>
        </div>

        {/* Interviews Section */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Recent Interviews
          </h2>
          <InterviewList interviews={interviews} isLoading={isLoading} />
        </section>
      </div>
    </main>
  );
}
