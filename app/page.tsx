"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./lib/supabase/client";
import InterviewApp from "./components/InterviewApp";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [showApp, setShowApp] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const handleStartInterview = () => {
    if (user) {
      router.push('/interview');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 selection:bg-indigo-500/30">
      {/* Header for logged-in users */}
      {user && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Interview Practice</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-300 hidden sm:block">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liquid Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-400 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 md:p-8">

        {!showApp ? (
          /* Landing Page Content */
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl animate-in fade-in zoom-in-95 duration-700">

            {/* Hero Badge */}
            <div className="inline-flex items-center rounded-full border border-indigo-200 dark:border-indigo-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-3 py-1 text-sm font-medium text-indigo-800 dark:text-indigo-300 shadow-sm ring-1 ring-white/50 dark:ring-slate-700/50">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
              AI-Powered Interview Coach
            </div>

            {/* Hero Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Interview Skills
              </span>
            </h1>

            {/* Hero Description */}
            <p className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Practice with our intelligent AI interviewer. Get real-time feedback, improve your communication, and land your dream job with confidence.
            </p>

            {/* CTA Button */}
            <button
              onClick={handleStartInterview}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-indigo-700 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              <span className="mr-2">{user ? 'Continue to Interview' : 'Start Practice Interview'}</span>
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
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </button>

            {/* Features Grid (Glassmorphism) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
              {[
                {
                  title: "Real-time Feedback",
                  desc: "Instant analysis of your answers and delivery.",
                  icon: "⚡",
                },
                {
                  title: "Voice Interaction",
                  desc: "Speak naturally just like a real interview.",
                  icon: "🎙️",
                },
                {
                  title: "Tailored Scenarios",
                  desc: "Practice for specific roles and experience levels.",
                  icon: "🎯",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group rounded-2xl border border-white/40 dark:border-slate-700/40 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-6 shadow-lg transition-all hover:-translate-y-1 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-xl"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Interview App Component */
          <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <InterviewApp onBack={() => setShowApp(false)} />
          </div>
        )}
      </div>
    </main>
  );
}
