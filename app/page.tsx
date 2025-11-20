"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./lib/supabase/client";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleStartInterview = () => {
    if (user) {
      router.push('/interview');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Liquid Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-400 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-20">
          <div className="flex flex-col items-center text-center space-y-8 max-w-5xl animate-in fade-in zoom-in-95 duration-700">

            {/* Hero Badge */}
            <div className="inline-flex items-center rounded-full border border-indigo-200 dark:border-indigo-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-4 py-2 text-sm font-medium text-indigo-800 dark:text-indigo-300 shadow-sm ring-1 ring-white/50 dark:ring-slate-700/50">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
              AI-Powered Interview Coach
            </div>

            {/* Hero Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              Master Your Interview Skills <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                With Confidence
              </span>
            </h1>

            {/* Hero Description */}
            <p className="max-w-3xl text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Practice with our intelligent AI interviewer, enhance your question-answering skills, and build the confidence you need to ace any interview.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={handleStartInterview}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-indigo-700 hover:scale-105 hover:shadow-2xl"
              >
                <span className="mr-2">Start Practicing Free</span>
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
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-2xl border-2 border-indigo-600 dark:border-indigo-500 px-8 py-4 text-lg font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300"
              >
                See How It Works
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 w-full max-w-3xl">
              {[
                { number: "10K+", label: "Interviews Practiced" },
                { number: "95%", label: "Feel More Confident" },
                { number: "24/7", label: "Available Anytime" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Statement Section */}
        <section className="py-20 px-4 md:px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Interview Anxiety? <span className="text-indigo-600 dark:text-indigo-400">We Understand.</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto">
              Many talented professionals struggle with interview anxiety, lack of practice opportunities,
              and uncertainty about their performance. Traditional interview prep can be expensive,
              time-consuming, and stressful.
            </p>

            {/* Problem Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "😰",
                  title: "Interview Anxiety",
                  desc: "Feeling nervous and unprepared for real interviews"
                },
                {
                  icon: "⏰",
                  title: "Limited Practice",
                  desc: "No safe space to practice and make mistakes"
                },
                {
                  icon: "💸",
                  title: "Expensive Coaching",
                  desc: "Professional interview coaches cost hundreds per session"
                },
              ].map((problem, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 p-6"
                >
                  <div className="text-4xl mb-3">{problem.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {problem.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Get interview-ready in three simple steps
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Choose Your Role",
                  desc: "Select your target job role, experience level, and interview type",
                  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                },
                {
                  step: "02",
                  title: "Practice with AI",
                  desc: "Answer questions naturally with voice or text. Our AI adapts to your responses",
                  icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                },
                {
                  step: "03",
                  title: "Get Instant Feedback",
                  desc: "Receive detailed feedback on communication, technical skills, and areas to improve",
                  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative group"
                >
                  <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={item.icon}
                        />
                      </svg>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 md:px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Everything you need to ace your interviews
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "⚡",
                  title: "Real-time Feedback",
                  desc: "Get instant analysis of your answers and delivery"
                },
                {
                  icon: "🎙️",
                  title: "Voice Interaction",
                  desc: "Practice speaking naturally like a real interview"
                },
                {
                  icon: "🎯",
                  title: "Role-Specific Questions",
                  desc: "Tailored questions for your industry and role"
                },
                {
                  icon: "📊",
                  title: "Performance Analytics",
                  desc: "Track your progress with detailed metrics"
                },
                {
                  icon: "🔄",
                  title: "Unlimited Practice",
                  desc: "Practice as many times as you need, no limits"
                },
                {
                  icon: "🌙",
                  title: "24/7 Availability",
                  desc: "Practice anytime that fits your schedule"
                },
                {
                  icon: "🎓",
                  title: "Skill Enhancement",
                  desc: "Improve your question-answering abilities"
                },
                {
                  icon: "💪",
                  title: "Build Confidence",
                  desc: "Feel prepared and confident for real interviews"
                },
                {
                  icon: "🔒",
                  title: "Private & Secure",
                  desc: "Your practice sessions are completely private"
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section - Highlighting Main Benefits */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Why Choose InterviewAI?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Transform your interview performance
              </p>
            </div>

            {/* Main Benefits - Two Key Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Benefit 1: Enhance Skills */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 p-8">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Enhance Your Question-Answering Skills
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                    Practice answering challenging interview questions and receive AI-powered feedback to improve your responses.
                    Learn how to structure your answers, communicate clearly, and highlight your strengths effectively.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Master the STAR method for behavioral questions",
                      "Learn to articulate your experience clearly",
                      "Improve your technical explanation skills",
                      "Develop concise and impactful answers"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Benefit 2: Build Confidence */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-8">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Build Unshakeable Confidence
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                    Overcome interview anxiety through repeated practice in a safe, judgment-free environment.
                    Build the confidence you need to perform at your best when it matters most.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Practice in a low-pressure environment",
                      "Build muscle memory for common questions",
                      "Reduce anxiety through familiarity",
                      "Walk into interviews feeling prepared"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 px-4 md:px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Perfect For
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Whether you're just starting out or advancing your career
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "🎓",
                  title: "Recent Graduates",
                  desc: "Prepare for your first professional interviews"
                },
                {
                  icon: "🔄",
                  title: "Career Switchers",
                  desc: "Transition confidently to a new industry"
                },
                {
                  icon: "💼",
                  title: "Job Seekers",
                  desc: "Land your next opportunity with confidence"
                },
                {
                  icon: "📈",
                  title: "Career Advancers",
                  desc: "Prepare for senior-level interviews"
                },
              ].map((useCase, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="text-5xl mb-4">{useCase.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {useCase.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Everything you need to know about InterviewAI
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "How does the AI interviewer work?",
                  a: "Our AI uses advanced language models to conduct realistic interviews. It asks relevant questions based on your role and experience, listens to your answers, and provides detailed feedback on your performance."
                },
                {
                  q: "Can I practice with voice or text?",
                  a: "Yes! You can answer questions using your voice (recommended for realistic practice) or type your responses. The AI adapts to both input methods."
                },
                {
                  q: "What kind of feedback will I receive?",
                  a: "You'll receive comprehensive feedback including overall scores, communication assessment, technical evaluation, strengths, areas for improvement, and specific recommendations."
                },
                {
                  q: "Is my interview data private?",
                  a: "Absolutely. All your practice sessions are completely private and secure. We never share your data with third parties."
                },
                {
                  q: "How many times can I practice?",
                  a: "You can practice unlimited times! There are no restrictions on how many interviews you can complete."
                },
                {
                  q: "What types of interviews are supported?",
                  a: "We support behavioral, technical, and system design interviews across various experience levels (Junior, Mid-level, Senior)."
                },
              ].map((faq, idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 hover:shadow-lg transition-all"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <svg
                      className="w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have improved their interview skills and landed their dream jobs.
            </p>
            <button
              onClick={handleStartInterview}
              className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-5 text-lg font-semibold text-indigo-600 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              <span className="mr-2">Start Practicing Now - It's Free</span>
              <svg
                className="h-5 w-5"
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
            <p className="mt-6 text-indigo-200 text-sm">
              No credit card required • Unlimited practice • Instant feedback
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 md:px-8 bg-slate-900 text-slate-400">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-white">InterviewAI</span>
                </div>
                <p className="text-sm max-w-md">
                  Your AI-powered interview coach. Practice, improve, and land your dream job with confidence.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                  <li><Link href="/interview" className="hover:text-white transition-colors">Start Practice</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8 text-center text-sm">
              <p>&copy; 2024 InterviewAI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
