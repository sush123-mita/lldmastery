import React from 'react';
import { Clock, Trophy, ChevronRight, CheckCircle2, Code2, Sparkles } from 'lucide-react';

export default function ProblemList({ problems, selectedSlug, onSelectProblem }) {
  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Title */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
          Low-Level Design Problems
        </h2>
        <p className="text-xs text-slate-500">Select a problem to start practicing and receive feedback</p>
      </div>

      {/* Problem Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {problems.map((prob) => {
          const isSelected = prob.slug === selectedSlug;
          return (
            <div
              key={prob._id || prob.slug}
              onClick={() => onSelectProblem(prob.slug)}
              className={`p-3.5 rounded-xl border transition cursor-pointer relative group ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-500/60 shadow-lg shadow-sky-500/5 ring-1 ring-sky-500/20'
                  : 'bg-slate-800/30/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className={`text-sm font-semibold leading-tight line-clamp-2 ${
                  isSelected ? 'text-sky-300' : 'text-slate-200 group-hover:text-white'
                }`}>
                  {prob.title}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {prob.difficulty}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {prob.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{prob.timeEstimateMinutes}m</span>
                </div>

                <div className="flex items-center space-x-2">
                  {prob.bestScore !== null && prob.bestScore !== undefined && (
                    <div className="flex items-center space-x-1 text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <Trophy className="w-3 h-3" />
                      <span>{prob.bestScore}%</span>
                    </div>
                  )}
                  {prob.submissionCount > 0 && (
                    <span className="text-slate-400 font-medium">
                      {prob.submissionCount} {prob.submissionCount === 1 ? 'attempt' : 'attempts'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
