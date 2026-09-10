import React, { useState } from 'react';
import { History, TrendingUp, TrendingDown, ArrowRight, Eye, Calendar, Sparkles } from 'lucide-react';

export default function AttemptHistory({ history, onSelectAttempt, currentAttemptId }) {
  const [comparing, setComparing] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2 h-full">
        <History className="w-10 h-10 text-slate-700" />
        <h3 className="text-sm font-semibold text-slate-400">No Attempts Yet</h3>
        <p className="text-xs max-w-xs">
          Submit your first solution to start tracking your Low-Level Design improvement progression.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Attempt History & Progression</h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {history.length} {history.length === 1 ? 'Attempt' : 'Attempts'}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {history.map((att, idx) => {
          const isSelected = att._id === currentAttemptId;
          const isPositiveDelta = att.scoreDelta > 0;
          const isNegativeDelta = att.scoreDelta < 0;

          return (
            <div
              key={att._id}
              onClick={() => onSelectAttempt(att._id)}
              className={`p-4 rounded-xl border transition cursor-pointer relative ${
                isSelected
                  ? 'bg-slate-800 border-indigo-500/80 shadow-lg ring-1 ring-indigo-500/30'
                  : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">
                    Attempt #{att.attemptNumber}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded border border-slate-800">
                    {att.language}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {att.scoreDelta !== 0 && (
                    <span className={`text-xs font-bold flex items-center space-x-0.5 ${
                      isPositiveDelta ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isPositiveDelta ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{isPositiveDelta ? `+${att.scoreDelta}` : att.scoreDelta}</span>
                    </span>
                  )}
                  <div className="text-sm font-extrabold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {att.overallScore}%
                  </div>
                </div>
              </div>

              {/* Rubric mini summary */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                <span>Patterns: {att.detectedPatterns?.length || 0} applied</span>
                <span className={att.antiPatterns?.length > 0 ? 'text-rose-400' : 'text-slate-400'}>
                  Anti-patterns: {att.antiPatterns?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <span className="text-indigo-400 font-semibold flex items-center space-x-1">
                  <span>View Feedback</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
