import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Code2, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  TrendingUp,
  Clock
} from 'lucide-react';

export default function EvaluationResults({ submission, onRetry, onClose }) {
  const isCompleted = submission?.status === 'COMPLETED';
  const isQueued = submission?.status === 'QUEUED';
  const isEvaluating = submission?.status === 'EVALUATING';
  const isFailed = submission?.status === 'FAILED';

  useEffect(() => {
    if (isCompleted && submission?.overallScore >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isCompleted, submission?.overallScore]);

  if (!submission) return null;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-white">Evaluation & Feedback</h2>
        </div>

        <div className="flex items-center space-x-2">
          {submission.evaluationDurationMs > 0 && (
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{submission.evaluationDurationMs}ms</span>
            </span>
          )}
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Attempt #{submission.attemptNumber}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Status Tracker when processing */}
        {(isQueued || isEvaluating) && (
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 text-center space-y-4 animate-fade-in">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 animate-ping"></div>
              <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                {isQueued ? 'Submission Queued...' : 'Architect Reasoning in Progress...'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Running static entity extraction, SOLID compliance rubrics, and generating explainable architectural feedback.
              </p>
            </div>
          </div>
        )}

        {/* Failed State */}
        {isFailed && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3 animate-fade-in">
            <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-sm font-bold text-rose-300">Evaluation Failed</h3>
            <p className="text-xs text-rose-200/80">{submission.errorMessage || 'An error occurred during evaluation.'}</p>
            <button
              onClick={() => onRetry(submission._id)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Evaluation</span>
            </button>
          </div>
        )}

        {/* Completed Feedback State */}
        {isCompleted && (
          <div className="space-y-6 animate-fade-in">
            {/* Overall Score Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-850 border border-slate-700/80 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall LLD Score</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {submission.overallScore}
                    </span>
                    <span className="text-lg text-slate-400 font-semibold">/ 100</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    {submission.overallScore >= 80 
                      ? '🌟 Production-Grade Design: Excellent abstraction and modularity.'
                      : submission.overallScore >= 60
                      ? '⚡ Good Foundation: Solid baseline with concrete opportunities for decoupling.'
                      : '🌱 Needs Refactoring: Address key anti-patterns and modularize core responsibilities.'}
                  </p>
                </div>

                <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border ${
                  submission.overallScore >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  submission.overallScore >= 60 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                  'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  <Trophy className="w-8 h-8 mb-1" />
                  <span className="text-[11px] font-bold">
                    {submission.overallScore >= 80 ? 'EXPERT' : submission.overallScore >= 60 ? 'INTERMEDIATE' : 'LEARNER'}
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Dimensional Rubrics */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Dimensional Rubric Scores</span>
              </h3>

              <div className="space-y-3">
                {submission.rubricBreakdown?.map((rubric, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{rubric.name}</span>
                      <span className="font-bold text-sky-400">{rubric.score}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rubric.score >= 80 ? 'bg-emerald-500' :
                          rubric.score >= 60 ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`}
                        style={{ width: `${rubric.score}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">{rubric.feedback}</p>

                    {/* Improvements tags if any */}
                    {rubric.improvements?.length > 0 && (
                      <div className="pt-1 text-[11px] text-amber-400/90 flex items-start space-x-1">
                        <span className="font-bold shrink-0">💡 Tip:</span>
                        <span>{rubric.improvements[0]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Patterns Detected */}
            {submission.antiPatterns?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Detected Anti-Patterns ({submission.antiPatterns.length})</span>
                </h3>

                <div className="space-y-2.5">
                  {submission.antiPatterns.map((anti, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-300">{anti.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {anti.severity} SEVERITY
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{anti.description}</p>
                      {anti.refactoringSuggestion && (
                        <p className="text-[11px] text-rose-300/90 bg-rose-950/40 p-2 rounded border border-rose-500/20">
                          <strong className="text-rose-200">Refactoring:</strong> {anti.refactoringSuggestion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Before & After Refactoring Suggestions */}
            {submission.refactoringSuggestions?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center space-x-1.5">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span>Actionable Refactoring Recommendations</span>
                </h3>

                <div className="space-y-4">
                  {submission.refactoringSuggestions.map((refactor, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-800/50 border border-slate-800 overflow-hidden">
                      <div className="p-3 bg-slate-800/80 border-b border-slate-700/80">
                        <h4 className="text-xs font-bold text-sky-300">{refactor.title}</h4>
                        <p className="text-[11px] text-slate-300 mt-1">{refactor.explanation}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 text-xs font-mono">
                        {/* Before Code */}
                        <div className="p-3 bg-rose-950/20 border-b md:border-b-0 md:border-r border-slate-800">
                          <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">
                            Current / Anti-pattern Approach
                          </div>
                          <pre className="text-slate-300 whitespace-pre-wrap overflow-x-auto text-[11px] leading-snug">
                            {refactor.beforeCode}
                          </pre>
                        </div>

                        {/* After Code */}
                        <div className="p-3 bg-emerald-950/20">
                          <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">
                            Refactored / Decoupled Pattern
                          </div>
                          <pre className="text-slate-300 whitespace-pre-wrap overflow-x-auto text-[11px] leading-snug">
                            {refactor.afterCode}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Design Summary */}
            {submission.summary && (
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Architectural Summary</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{submission.summary}</p>
              </div>
            )}

            {/* Trade-off Analysis */}
            {submission.tradeOffAnalysis && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Trade-off Analysis</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{submission.tradeOffAnalysis}</p>
              </div>
            )}

            {/* Next Milestone Advice */}
            {submission.nextMilestoneAdvice && (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Next Improvement Milestone</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{submission.nextMilestoneAdvice}</p>
              </div>
            )}

            {/* Identified Domain Entities Checklist */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Domain Entity Coverage</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {submission.identifiedEntities?.map((ent, idx) => (
                  <div key={idx} className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    ent.status === 'FOUND' 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200' 
                      : 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {ent.status === 'FOUND' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className="font-mono font-semibold">{ent.name}</span>
                    </div>
                    <span className="text-[10px] uppercase text-slate-400">{ent.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
