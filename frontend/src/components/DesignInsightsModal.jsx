import React from 'react';
import { X, HelpCircle, CheckCircle2, Cpu, RefreshCw, GitBranch, ShieldAlert } from 'lucide-react';

export default function DesignInsightsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const coreQuestions = [
    {
      id: 'q1',
      icon: CheckCircle2,
      color: 'text-sky-400',
      question: '1. What does a learner actually need to provide for an LLD practice attempt to be meaningful?',
      answer: `An LLD solution is not just an algorithm or a syntax test. For an attempt to be meaningfully evaluated, a learner needs to articulate three interconnected dimensions:
• Structural Definition: Clear classes, interfaces, enums, and access modifiers that establish domain boundaries.
• Behavioral Interactions: Methods and design patterns (e.g. Strategy, State, Observer) demonstrating how entities collaborate without tight coupling.
• Design Rationale & Trade-offs: The 'Why' behind decisions (e.g., choosing Composition over Inheritance, synchronous vs event-driven dispatch, thread-safety invariants).
Optional Mermaid class diagrams provide visual verification of relationships (inheritance, aggregation, dependency).`
    },
    {
      id: 'q2',
      icon: GitBranch,
      color: 'text-emerald-400',
      question: '2. What makes feedback useful when there can be more than one valid LLD solution?',
      answer: `Because multiple valid designs exist (e.g. Strategy vs Template Method vs Functional dispatch), useful feedback must NOT rely on strict string matching against a single reference solution. Instead, useful feedback:
• Evaluates against first-principles rubrics: Cohesion, Coupling, SOLID principles, Extensibility, and Race condition resilience.
• Flags concrete Anti-Patterns: Such as "God Class", "Feature Envy", or "Switch-case polymorphism violations".
• Provides Actionable Before/After Refactoring: Demonstrating how the learner's specific structure can evolve rather than rejecting it outright.`
    },
    {
      id: 'q3',
      icon: Cpu,
      color: 'text-purple-400',
      question: '3. Which parts of evaluation should be deterministic, and which parts benefit from an LLM?',
      answer: `We use a Hybrid Evaluation Model:
• Deterministic Engine: AST / regex parsing for entity extraction, interface detection, enum usage, missing domain models, cyclomatic/conditional complexity, and thread safety keyword presence. Fast, zero-hallucination, and reproducible.
• LLM / Reasoning Engine: Qualitative synthesis, understanding contextual trade-offs, providing nuanced design commentary, and generating bespoke "Before & After" refactoring code snippets tailored to the learner's exact code.`
    },
    {
      id: 'q4',
      icon: RefreshCw,
      color: 'text-amber-400',
      question: '4. How would your design accommodate another evaluation approach or submission format later?',
      answer: `The platform utilizes the Pipeline Pattern and Strategy Pattern in the Evaluator subsystem:
• Submissions pass through an EvaluatorPipeline comprising pluggable EvaluatorStrategy instances (DeterministicEvaluator, RubricEvaluator, AIEvaluator, StaticAnalysisEvaluator).
• New languages or submission formats (e.g., PlantUML, JSON schemas, Git repository links) can be added by implementing a new parser without modifying the submission lifecycle or UI contracts.`
    },
    {
      id: 'q5',
      icon: ShieldAlert,
      color: 'text-rose-400',
      question: '5. What should happen if evaluation takes time or fails?',
      answer: `• State Machine Lifecycle: Submissions transition through explicit states: QUEUED → EVALUATING → COMPLETED or FAILED.
• Non-blocking / Optimistic UX: The learner receives an immediate 202 Accepted response and a submission tracking token, polling or streaming evaluation progress.
• Resilient Graceful Degradation: If an external LLM times out or errors, the pipeline automatically falls back to the deterministic heuristic engine, ensuring the learner always receives structured feedback without being blocked.
• Explicit Retry Button: Failed attempts allow one-click retries without losing code.`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">LLD Architecture & Design Philosophy</h2>
              <p className="text-xs text-slate-400">Deep-dive answers to the 5 core LLD platform design questions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {coreQuestions.map((q) => {
            const Icon = q.icon;
            return (
              <div key={q.id} className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition">
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`p-2 rounded-lg bg-slate-900 border border-slate-700 ${q.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 leading-snug">
                    {q.question}
                  </h3>
                </div>
                <div className="pl-11 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {q.answer}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium text-sm transition"
          >
            Got it, back to practice
          </button>
        </div>
      </div>
    </div>
  );
}
