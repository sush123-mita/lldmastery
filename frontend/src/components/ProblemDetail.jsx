import React, { useState } from 'react';
import { 
  CheckCircle, 
  ShieldCheck, 
  Box, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Layers, 
  Info 
} from 'lucide-react';

export default function ProblemDetail({ problem }) {
  const [activeTab, setActiveTab] = useState('requirements');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  if (!problem) return null;

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center space-x-1 px-4 pt-3 pb-2 border-b border-slate-800 bg-slate-900 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('requirements')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
            activeTab === 'requirements'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Requirements</span>
        </button>

        <button
          onClick={() => setActiveTab('entities')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
            activeTab === 'entities'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Expected Entities ({problem.keyEntitiesExpected?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
            activeTab === 'patterns'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Design Patterns</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
            activeTab === 'faq'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Interview FAQ</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-5 text-sm space-y-6">
        {activeTab === 'requirements' && (
          <div className="space-y-6 animate-fade-in">
            {/* Overview */}
            <div>
              <h3 className="text-base font-bold text-white mb-2">{problem.title}</h3>
              <p className="text-slate-300 leading-relaxed text-sm bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                {problem.description}
              </p>
            </div>

            {/* Functional Requirements */}
            <div>
              <div className="flex items-center space-x-2 text-sky-400 font-bold mb-3 text-xs uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" />
                <span>Functional Requirements</span>
              </div>
              <ul className="space-y-2.5">
                {problem.functionalRequirements?.map((req, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-slate-300 text-xs sm:text-sm">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                      {idx + 1}
                    </span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Functional Requirements */}
            <div>
              <div className="flex items-center space-x-2 text-purple-400 font-bold mb-3 text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Non-Functional & Concurrency Requirements</span>
              </div>
              <ul className="space-y-2.5">
                {problem.nonFunctionalRequirements?.map((req, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-slate-300 text-xs sm:text-sm">
                    <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/20">
                      •
                    </span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'entities' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                These are the core domain entities expected in this design. Your solution should define appropriate classes/interfaces with well-scoped responsibilities.
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {problem.keyEntitiesExpected?.map((ent, idx) => (
                <div key={idx} className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-sky-300 text-sm">{ent.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {ent.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{ent.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-xs text-slate-400">
              Applying suitable design patterns makes your architecture resilient to future requirement evolutions.
            </div>

            <div className="space-y-3">
              {problem.suggestedPatterns?.map((pat, idx) => (
                <div key={idx} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-white text-sm">{pat.name}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{pat.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-xs text-slate-400">
              Common interviewer follow-up questions and trade-offs.
            </div>

            {problem.interviewQuestions?.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-800/40 overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-medium text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-800/40 transition"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
