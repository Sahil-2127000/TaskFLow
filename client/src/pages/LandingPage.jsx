import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 md:py-16 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] items-center gap-12 md:gap-16">
        {/* Left: Hero Copy */}
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-ink tracking-tight leading-[1.1] mb-5">
            Organize Today <br />
            Build a <span className="text-brand">Better</span> <br />
            Tomorrow
          </h1>

          <p className="text-base text-muted leading-relaxed max-w-md mb-8">
            A simple and efficient todo app to keep track of your tasks, boost productivity, and achieve your goals.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-ctl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-cta transition"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Right: Floating Mockup Card */}
        <div className="relative mt-4 md:mt-0">
          {/* Card Mockup */}
          <div className="bg-surface rounded-modal p-7 shadow-modal border border-border max-w-sm mx-auto w-full animate-fade">
            <div className="flex justify-between items-center mb-5">
              <span className="text-base font-bold text-ink">My Tasks</span>
              <div className="w-2 h-2 rounded-full bg-brand" />
            </div>

            {/* Mock task rows */}
            <div className="flex flex-col gap-3.5">
              {[
                { title: 'Complete DSA practice', done: true },
                { title: 'Revise React components', done: true },
                { title: 'Prepare project deployment', done: false },
                { title: 'Review system design concepts', done: false },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-4.5 h-4.5 rounded-[4px] flex items-center justify-center text-white transition ${
                      task.done ? 'bg-brand' : 'border border-[#C4C2D4]'
                    }`}
                  >
                    {task.done && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      task.done ? 'text-muted line-through' : 'text-ink'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Handwritten Annotation Banner */}
          <div className="absolute -bottom-8 left-4 -rotate-3 flex items-center gap-1.5 text-ink text-sm font-semibold">
            <span>Small steps, Big progress</span>
            <Sparkles size={16} className="text-brand" />
          </div>
        </div>
      </main>

      {/* Feature Stat Footer Banner */}
      <footer className="bg-surface border-t border-border py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-extrabold text-ink">100%</div>
            <div className="text-xs text-muted mt-1">Free to use</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-ink">Stay</div>
            <div className="text-xs text-muted mt-1">Productive</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-ink">Organize</div>
            <div className="text-xs text-muted mt-1">Your Life</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-ink">Achieve</div>
            <div className="text-xs text-muted mt-1">Your Goals</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
