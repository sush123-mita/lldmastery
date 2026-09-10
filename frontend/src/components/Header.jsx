import React from 'react';
import { Layers, Lightbulb, BookOpen, CheckCircle, Flame } from 'lucide-react';

export default function Header({ currentProblem, onOpenDesignPhilosophy, attemptCount = 0 }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">LLD<span className="text-sky-400">Mastery</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Interactive Practice
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Low-Level Design & Explainable Feedback Platform</p>
          </div>
        </div>

        {/* Middle Status (if problem selected) */}
        {currentProblem && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-slate-400 font-medium">Practicing:</span>
            <span className="text-white font-semibold truncate max-w-xs">{currentProblem.title}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              currentProblem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              currentProblem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {currentProblem.difficulty}
            </span>
          </div>
        )}

        {/* Actions & Insights */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenDesignPhilosophy}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
          >
            <Lightbulb className="w-4 h-4 text-indigo-400 animate-pulse-subtle" />
            <span>Design Q&A</span>
          </button>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700 text-xs text-slate-300">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-100">{attemptCount}</span>
            <span className="text-slate-400">Attempts</span>
          </div>
        </div>
      </div>
    </header>
  );
}
