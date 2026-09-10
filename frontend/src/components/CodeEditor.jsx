import React, { useState } from 'react';
import { Code2, RotateCcw, Copy, Check, FileCode, Sparkles } from 'lucide-react';

export default function CodeEditor({ 
  code, 
  onChange, 
  language, 
  onLanguageChange, 
  onResetTemplate,
  problem
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newCode);
      // Put cursor after tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-semibold">
            <FileCode className="w-4 h-4 text-sky-400" />
            <span>Implementation Code</span>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-slate-800 text-xs font-semibold text-sky-300 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="cpp">C++</option>
            </select>
          </div>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onResetTemplate}
            title="Reset to Starter Template"
            className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Template</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex relative overflow-hidden bg-slate-950 font-mono text-xs sm:text-sm">
        {/* Line Numbers */}
        <div className="w-12 py-3 bg-slate-900/60 border-r border-slate-800/80 text-right pr-3 select-none text-slate-600 font-mono text-xs overflow-hidden">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          placeholder="// Write your code here"
          className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none resize-none leading-6 font-mono text-xs sm:text-sm editor-textarea overflow-auto selection:bg-sky-500/30"
        />
      </div>

      {/* Editor Footer */}
      <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
        <span>{lineNumbers.length} lines • {code.length} characters</span>
        <span className="text-slate-400 font-mono">Press Tab to indent</span>
      </div>
    </div>
  );
}
