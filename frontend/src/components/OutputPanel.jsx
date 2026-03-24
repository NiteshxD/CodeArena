import React, { useState } from 'react';
import axios from 'axios';
import { Play, Loader2, AlertCircle } from 'lucide-react';

const OutputPanel = ({ codeRef, language, setLanguage, socketRef, roomId }) => {
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [executionSource, setExecutionSource] = useState(null);

  // Mapped languages supported strictly by the strict architecture
  const languages = [
    { value: 'javascript', label: 'JavaScript (Node.js)' },
    { value: 'python', label: 'Python (3.10)' },
    { value: 'cpp', label: 'C++ (GCC)' },
    { value: 'java', label: 'Java (15.0)' }
  ];

  const handleRunCode = async () => {
    const codeData = codeRef.current;
    if (!codeData) return;

    setIsLoading(true);
    setIsError(false);
    setOutput('Running...');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://codearena-jjy5.onrender.com';
      const response = await axios.post(`${backendUrl}/api/execute`, {
        code: codeData,
        language: language
      });
      
      const { output: runOutput, source } = response.data;
      
      if (source) {
        console.log(`[CodeCollab]: Code successfully executed via [${source}]`);
        setExecutionSource(source);
      } else {
        setExecutionSource(null);
      }
      
      // Map error flag visually
      if (source === 'piston-error') {
        setIsError(true);
      } else {
        setIsError(false);
      }
      
      setOutput(runOutput || 'Code executed successfully with no output.');

    } catch (err) {
      console.error(err);
      setIsError(true);
      setOutput(err.response?.data?.error || 'Execution failed due to network error or server down.');
      setExecutionSource("API Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-hidden">
      {/* Code Controls Dashboard */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50 bg-dark-800 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-dark-900 text-slate-200 border border-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block px-3 py-1.5 outline-none transition-colors"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleRunCode}
          disabled={isLoading}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-md font-medium text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0
            ${isLoading ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/20'} 
          `}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} className="fill-current" />}
          <span>{isLoading ? 'Executing...' : 'Run Code'}</span>
        </button>
      </div>

      {/* Output Display Area */}
      <div className="flex-1 bg-[#0d1117] relative p-4 flex flex-col h-full">
        <div className="flex-1 overflow-auto custom-scrollbar pr-2 pb-2">
          {output === '' ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <TerminalIcon size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-mono tracking-wide">Output will appear here</p>
            </div>
          ) : (
            <pre className={`font-mono text-sm whitespace-pre-wrap flex items-start gap-2 ${isError ? 'text-red-400' : 'text-green-400'}`}>
              {isError && <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />}
              {output}
            </pre>
          )}
        </div>
        
        {/* Execution Source Badge / Status Bar */}
        {executionSource && output !== '' && (
          <div className="mt-2 pt-2 border-t border-slate-800 text-xs font-mono text-slate-500 flex justify-end items-center opacity-80 gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Executed via: {executionSource}
          </div>
        )}
      </div>
    </div>
  );
};

// SVG component helper
const TerminalIcon = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

export default OutputPanel;
