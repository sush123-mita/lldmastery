import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Eye, Edit3, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function DiagramViewer({ diagram, onChange, sampleDiagram }) {
  const [viewMode, setViewMode] = useState('both'); // 'both', 'preview', 'editor'
  const [renderError, setRenderError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        darkMode: true,
        background: '#0f172a',
        primaryColor: '#0284c7',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#38bdf8',
        lineColor: '#94a3b8',
        secondaryColor: '#334155',
        tertiaryColor: '#1e293b'
      }
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagram || diagram.trim().length === 0) {
        if (containerRef.current) containerRef.current.innerHTML = '<p class="text-xs text-slate-500 italic p-4 text-center">No Mermaid diagram provided yet. Use the editor to define class relationships.</p>';
        setRenderError(null);
        return;
      }

      try {
        setRenderError(null);
        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, diagram.trim());
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.warn('Mermaid rendering error:', err);
        setRenderError('Invalid Mermaid syntax. Check class definitions or arrows (<|--, *--, o--, -->).');
      }
    };

    renderDiagram();
  }, [diagram]);

  const handleLoadSample = () => {
    if (sampleDiagram) {
      onChange(sampleDiagram);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-slate-200">Mermaid Class Diagram (Optional Visual LLD)</span>
        </div>

        <div className="flex items-center space-x-2">
          {sampleDiagram && (
            <button
              onClick={handleLoadSample}
              className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md transition"
            >
              Load Sample Diagram
            </button>
          )}

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-2 py-1 text-xs rounded-md transition ${viewMode === 'editor' ? 'bg-sky-500 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('both')}
              className={`px-2 py-1 text-xs rounded-md transition ${viewMode === 'both' ? 'bg-sky-500 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 text-xs rounded-md transition ${viewMode === 'preview' ? 'bg-sky-500 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Diagram Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === 'editor' || viewMode === 'both') && (
          <div className={`${viewMode === 'both' ? 'w-1/2 border-r border-slate-800' : 'w-full'} flex flex-col bg-slate-950`}>
            <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
              <span>Mermaid Definition</span>
              <span className="text-slate-500">classDiagram</span>
            </div>
            <textarea
              value={diagram}
              onChange={(e) => onChange(e.target.value)}
              placeholder="classDiagram&#10;    class ParkingLot {&#10;        +park()&#10;    }&#10;    class ParkingSpot&#10;    ParkingLot *-- ParkingSpot"
              spellCheck="false"
              className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none resize-none font-mono text-xs leading-5 editor-textarea"
            />
          </div>
        )}

        {/* Live SVG Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'both') && (
          <div className={`${viewMode === 'both' ? 'w-1/2' : 'w-full'} flex flex-col bg-slate-900/40 relative overflow-hidden`}>
            <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 text-[11px] text-slate-400">
              <span>Live Visualizer</span>
            </div>

            {renderError && (
              <div className="p-3 m-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{renderError}</span>
              </div>
            )}

            <div 
              ref={containerRef} 
              className="flex-1 p-4 overflow-auto flex items-center justify-center min-h-[250px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
