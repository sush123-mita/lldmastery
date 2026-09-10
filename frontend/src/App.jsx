import React, { useState, useEffect, useRef } from 'react';
import { 
  fetchProblems, 
  fetchProblemBySlug, 
  submitSolution, 
  fetchSubmission, 
  fetchProblemHistory, 
  retrySubmission 
} from './services/api';
import Header from './components/Header';
import ProblemList from './components/ProblemList';
import ProblemDetail from './components/ProblemDetail';
import CodeEditor from './components/CodeEditor';
import DiagramViewer from './components/DiagramViewer';
import RationaleEditor from './components/RationaleEditor';
import EvaluationResults from './components/EvaluationResults';
import AttemptHistory from './components/AttemptHistory';
import DesignInsightsModal from './components/DesignInsightsModal';

import { 
  Code2, 
  BookOpen, 
  Sparkles, 
  PenTool, 
  Send, 
  History, 
  CheckCircle, 
  AlertCircle,
  Menu,
  X,
  Play
} from 'lucide-react';

export default function App() {
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [selectedSlug, setSelectedSlug] = useState('parking-lot-system');
  
  // Workspace state
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [diagram, setDiagram] = useState('');
  const [designRationale, setDesignRationale] = useState('');
  const [activeCenterTab, setActiveCenterTab] = useState('editor'); // 'requirements', 'editor', 'diagram', 'rationale'
  
  // Submissions & Feedback state
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [history, setHistory] = useState([]);
  const [rightPanelTab, setRightPanelTab] = useState('feedback'); // 'feedback', 'history'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // UI modals & sidebars
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isMobileProblemListOpen, setIsMobileProblemListOpen] = useState(false);

  // Polling ref for async evaluation status
  const pollingTimerRef = useRef(null);

  // 1. Initial load of problem list
  useEffect(() => {
    loadProblems();
  }, []);

  // 2. When selectedSlug changes, load problem details
  useEffect(() => {
    if (selectedSlug) {
      loadProblemDetails(selectedSlug);
    }
  }, [selectedSlug]);

  // 3. Load history when currentProblem is set
  useEffect(() => {
    if (currentProblem?._id) {
      loadHistory(currentProblem._id);
    }
  }, [currentProblem]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  const loadProblems = async () => {
    try {
      const data = await fetchProblems();
      setProblems(data);
      if (data.length > 0 && !selectedSlug) {
        setSelectedSlug(data[0].slug);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    }
  };

  const loadProblemDetails = async (slug) => {
    try {
      const prob = await fetchProblemBySlug(slug);
      // Only reset code/diagram if switching to a DIFFERENT problem
      setCurrentProblem(prev => {
        if (prev?.slug !== slug) {
          const template = prob.starterTemplates?.[language] || prob.starterTemplates?.java || '';
          setCode(template);
          setDiagram(prob.sampleMermaidDiagram || '');
          setDesignRationale('');
          setCurrentSubmission(null);
          setSubmitError(null);
        }
        return prob;
      });
    } catch (err) {
      console.error('Failed to load problem details:', err);
    }
  };

  const loadHistory = async (problemId) => {
    try {
      const historyData = await fetchProblemHistory(problemId);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Handle language switch
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (currentProblem?.starterTemplates?.[newLang]) {
      setCode(currentProblem.starterTemplates[newLang]);
    }
  };

  // Reset template
  const handleResetTemplate = () => {
    if (currentProblem?.starterTemplates?.[language]) {
      setCode(currentProblem.starterTemplates[language]);
    }
  };

  // Submit solution
  const handleSubmit = async () => {
    if (!currentProblem?._id) return;
    if (!code || code.trim().length === 0) {
      setSubmitError('Please write your Low-Level Design code before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitSolution({
        problemId: currentProblem._id,
        language,
        code,
        diagram,
        designRationale
      });

      // Set initial queued submission
      setCurrentSubmission({
        _id: result.submissionId,
        attemptNumber: result.attemptNumber,
        status: 'QUEUED'
      });
      setRightPanelTab('feedback');

      // Poll for evaluation completion
      startPollingSubmission(result.submissionId);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Failed to submit solution');
      setIsSubmitting(false);
    }
  };

  const startPollingSubmission = (submissionId) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    let consecutiveErrors = 0;
    const MAX_ERRORS = 5;

    pollingTimerRef.current = setInterval(async () => {
      try {
        const sub = await fetchSubmission(submissionId);
        consecutiveErrors = 0;
        setCurrentSubmission(sub);

        if (sub.status === 'COMPLETED' || sub.status === 'FAILED') {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
          setIsSubmitting(false);
          // Refresh history and problem list using functional update to get latest state
          setCurrentProblem(prob => {
            if (prob?._id) {
              loadHistory(prob._id);
              loadProblems();
            }
            return prob;
          });
        }
      } catch (err) {
        consecutiveErrors++;
        console.warn('Polling error:', err);
        if (consecutiveErrors >= MAX_ERRORS) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
          setIsSubmitting(false);
          setCurrentSubmission(prev => prev ? { ...prev, status: 'FAILED', errorMessage: 'Lost connection. Click Retry.' } : prev);
        }
      }
    }, 800);
  };

  const handleRetry = async (submissionId) => {
    try {
      await retrySubmission(submissionId);
      setCurrentSubmission(prev => ({ ...prev, status: 'QUEUED', errorMessage: null }));
      startPollingSubmission(submissionId);
    } catch (err) {
      console.error('Retry error:', err);
    }
  };

  const handleSelectAttempt = async (attemptId) => {
    try {
      const sub = await fetchSubmission(attemptId);
      setCurrentSubmission(sub);
      setRightPanelTab('feedback');
    } catch (err) {
      console.error('Failed to fetch attempt:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        currentProblem={currentProblem}
        onOpenDesignPhilosophy={() => setIsDesignModalOpen(true)}
        attemptCount={history.length}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Problem Selector (Desktop) */}
        <div className="hidden lg:block w-72 h-full shrink-0">
          <ProblemList
            problems={problems}
            selectedSlug={selectedSlug}
            onSelectProblem={(slug) => setSelectedSlug(slug)}
          />
        </div>

        {/* Center Workspace (Requirements / Code / Diagram / Rationale) */}
        <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden border-r border-slate-800">
          {/* Workspace Tab Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveCenterTab('requirements')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeCenterTab === 'requirements'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Requirements</span>
              </button>

              <button
                onClick={() => setActiveCenterTab('editor')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeCenterTab === 'editor'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Solution</span>
              </button>

              <button
                onClick={() => setActiveCenterTab('diagram')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeCenterTab === 'diagram'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Class Diagram</span>
              </button>

              <button
                onClick={() => setActiveCenterTab('rationale')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeCenterTab === 'rationale'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Trade-offs</span>
              </button>
            </div>

            {/* Mobile problem toggle */}
            <button
              onClick={() => setIsMobileProblemListOpen(true)}
              className="lg:hidden text-xs text-sky-400 flex items-center space-x-1 bg-slate-800 px-2 py-1 rounded"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Problems</span>
            </button>
          </div>

          {/* Center Pane Body */}
          <div className="flex-1 p-3 overflow-hidden">
            {activeCenterTab === 'requirements' && (
              <div className="h-full rounded-xl border border-slate-800 overflow-hidden">
                <ProblemDetail problem={currentProblem} />
              </div>
            )}

            {activeCenterTab === 'editor' && (
              <CodeEditor
                code={code}
                onChange={setCode}
                language={language}
                onLanguageChange={handleLanguageChange}
                onResetTemplate={handleResetTemplate}
                problem={currentProblem}
              />
            )}

            {activeCenterTab === 'diagram' && (
              <DiagramViewer
                diagram={diagram}
                onChange={setDiagram}
                sampleDiagram={currentProblem?.sampleMermaidDiagram}
              />
            )}

            {activeCenterTab === 'rationale' && (
              <RationaleEditor
                rationale={designRationale}
                onChange={setDesignRationale}
              />
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              {submitError && (
                <span className="text-rose-400 font-medium flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{submitError}</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition ${
                  isSubmitting
                    ? 'bg-slate-700 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 shadow-sky-500/20 active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Evaluating Design...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit for LLD Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Explainable Feedback & History */}
        <div className="w-80 sm:w-96 md:w-[420px] lg:w-[460px] h-full flex flex-col bg-slate-900 shrink-0">
          {/* Right Header Navigation */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900 text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRightPanelTab('feedback')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                  rightPanelTab === 'feedback'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Feedback & Rubrics</span>
              </button>

              <button
                onClick={() => setRightPanelTab('history')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                  rightPanelTab === 'history'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Attempts ({history.length})</span>
              </button>
            </div>
          </div>

          {/* Right Body */}
          <div className="flex-1 overflow-hidden">
            {rightPanelTab === 'feedback' && (
              currentSubmission ? (
                <EvaluationResults
                  submission={currentSubmission}
                  onRetry={handleRetry}
                  onClose={() => setCurrentSubmission(null)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-600 border border-slate-700/60">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300">Ready for Review</h3>
                  <p className="text-xs max-w-xs text-slate-400 leading-relaxed">
                    Write your class and interface abstractions, then click <strong>"Submit for LLD Review"</strong> to get multidimensional rubric scores, detected anti-patterns, and actionable refactoring suggestions.
                  </p>
                </div>
              )
            )}

            {rightPanelTab === 'history' && (
              <AttemptHistory
                history={history}
                currentAttemptId={currentSubmission?._id}
                onSelectAttempt={handleSelectAttempt}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Problem Drawer */}
      {isMobileProblemListOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-80 bg-slate-900 h-full shadow-2xl flex flex-col">
            <div className="p-3 border-b border-slate-800 flex justify-end">
              <button
                onClick={() => setIsMobileProblemListOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ProblemList
                problems={problems}
                selectedSlug={selectedSlug}
                onSelectProblem={(slug) => {
                  setSelectedSlug(slug);
                  setIsMobileProblemListOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Design Insights Modal (Answers to 5 Core Questions) */}
      <DesignInsightsModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
      />
    </div>
  );
}
