import React from 'react';
import { PenTool, CheckCircle, HelpCircle, Sparkles } from 'lucide-react';

export default function RationaleEditor({ rationale, onChange }) {
  const guidedQuestions = [
    "Why did you choose these design patterns (e.g. Strategy / State / Factory)?",
    "How does your design handle race conditions or concurrent gate/request access?",
    "What trade-offs did you make between simplicity and extensibility?",
    "How does your design conform to the Open/Closed and Dependency Inversion principles?"
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <PenTool className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">Design Rationale & Trade-offs (Architectural Defense)</span>
        </div>
        <span className="text-[11px] text-slate-400">Interviewer Review Checklist</span>
      </div>

      <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
        {/* Guided Prompts */}
        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guiding Questions to Strengthen Your Design:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 text-[11px]">
            {guidedQuestions.map((q, i) => (
              <div key={i} className="flex items-start space-x-1.5">
                <span className="text-amber-400/80 font-bold">•</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={rationale}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Explain your architectural choices, patterns used, concurrency strategy, and potential trade-offs..."
          className="flex-1 min-h-[180px] p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 resize-none text-xs sm:text-sm leading-relaxed"
        />
      </div>

      <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-500">
        Learner's rationale is evaluated by the reasoning engine to assess architectural trade-off maturity.
      </div>
    </div>
  );
}
