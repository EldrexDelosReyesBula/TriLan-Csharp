import React, { useRef, useEffect, useState } from 'react';
import { ConsoleMessage, AppSettings } from '../types';
import { Terminal, Trash2, AlertCircle, CheckCircle, Info, ChevronUp, ChevronDown, Maximize2, Minimize2, X, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';

interface ConsoleProps {
  messages: ConsoleMessage[];
  onClear: () => void;
  isOpen: boolean;
  isMaximized: boolean;
  toggleOpen: () => void;
  toggleMaximize: () => void;
  onClose: () => void;
  promptSymbol: string;
  settings?: AppSettings;
  isWaitingForInput?: boolean;
  onInputSubmit?: (value: string) => void;
}

const Console: React.FC<ConsoleProps> = ({ 
    messages, 
    onClear, 
    isOpen, 
    isMaximized,
    toggleOpen, 
    toggleMaximize,
    onClose,
    promptSymbol,
    settings,
    isWaitingForInput = false,
    onInputSubmit
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Auto-scroll to bottom on new messages or input state
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMaximized, isWaitingForInput]);

  // Auto-focus input when waiting
  useEffect(() => {
      if (isWaitingForInput && isOpen && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isWaitingForInput, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && onInputSubmit) {
          onInputSubmit(inputValue);
          setInputValue('');
      }
  };

  const containerClass = isMaximized 
    ? 'fixed inset-0 z-50 h-screen w-screen' 
    : `w-full transition-all duration-300 ease-in-out border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] ${isOpen ? 'h-64' : 'h-10'}`;

  const customStyle = {
      backgroundColor: settings?.consoleBackgroundColor,
      color: settings?.consoleTextColor,
      fontFamily: settings?.consoleFontFamily || settings?.editorFontFamily
  };

  return (
    <div 
      className={`flex flex-col bg-surface ${containerClass}`}
      style={isOpen ? { backgroundColor: customStyle.backgroundColor } : {}}
    >
      {/* Console Header */}
      <div 
        className="flex items-center justify-between px-4 h-10 shrink-0 bg-surface-highlight cursor-pointer select-none border-b border-border"
        onClick={toggleOpen}
      >
        <div className="flex items-center space-x-3 text-sm font-semibold text-text-muted group">
          <Terminal size={14} className={`text-accent ${isWaitingForInput ? 'animate-pulse' : ''}`} />
          <span className="group-hover:text-text transition-colors">Console Output {isWaitingForInput && '(Waiting for Input)'}</span>
          {messages.length > 0 && (
             <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                 messages.some(m => m.type === 'error') 
                    ? 'bg-red-500/20 text-red-500' 
                    : 'bg-green-500/20 text-green-500'
             }`}>
               {messages.length} MSG
             </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
            <button 
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="p-1.5 hover:bg-surface text-text-muted hover:text-red-400 rounded-md transition-colors"
                title="Clear Console"
            >
                <Trash2 size={14} />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
                onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
                className="p-1.5 hover:bg-surface text-text-muted hover:text-text rounded-md transition-colors hidden sm:block"
                title={isMaximized ? "Restore" : "Maximize"}
            >
                {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            {!isMaximized && (
                <button
                    onClick={(e) => { e.stopPropagation(); toggleOpen(); }}
                    className="p-1.5 hover:bg-surface text-text-muted hover:text-text rounded-md transition-colors"
                    title={isOpen ? "Minimize" : "Open"}
                >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
            )}
            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-1.5 hover:bg-red-500/20 text-text-muted hover:text-red-500 rounded-md transition-colors"
                title="Close"
            >
                <X size={14} />
            </button>
        </div>
      </div>

      {/* Console Body */}
      {isOpen && (
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm custom-scrollbar relative"
          style={{
              backgroundColor: customStyle.backgroundColor, 
              color: customStyle.color,
              fontFamily: customStyle.fontFamily
          }}
          onClick={() => isWaitingForInput && inputRef.current?.focus()}
        >
          {messages.length === 0 && !isWaitingForInput ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted/40 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-surface-highlight flex items-center justify-center mb-3">
                    <Terminal size={20} />
                </div>
                <p>Waiting for compiler output...</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={msg.id} 
                className="flex flex-col space-y-1 animate-in slide-in-from-left-2 duration-300"
              >
                <div className="flex items-start space-x-3 group">
                    <span className="text-[10px] text-text-muted mt-[3px] opacity-0 group-hover:opacity-50 select-none w-12 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </span>
                    <div className="mt-0.5 shrink-0">
                    {msg.type === 'error' && <AlertCircle size={14} className="text-red-500" />}
                    {msg.type === 'warning' && <AlertTriangle size={14} className="text-yellow-500" />}
                    {msg.type === 'success' && <CheckCircle size={14} className="text-green-500" />}
                    {msg.type === 'info' && <span className="text-accent font-bold">{promptSymbol}</span>}
                    {msg.type === 'system' && <Info size={14} className="text-blue-400" />}
                    </div>
                    <div className={`break-all leading-relaxed whitespace-pre-wrap ${
                        msg.type === 'error' ? 'text-red-400' : 
                        msg.type === 'warning' ? 'text-yellow-400' :
                        msg.type === 'success' ? 'text-green-400' : 
                        msg.type === 'system' ? 'text-blue-300 italic' : 
                        settings?.consoleTextColor ? '' : 'text-text'
                    }`}>
                    {msg.content}
                    </div>
                </div>
                {msg.suggestion && (
                    <div className="flex items-start space-x-3 ml-[72px] mt-1 p-2 rounded-lg bg-surface-highlight/50 border border-border/50">
                        <Lightbulb size={12} className="text-accent shrink-0 mt-0.5" />
                        <span className="text-xs text-text-muted italic"><strong className="text-accent not-italic">Suggestion:</strong> {msg.suggestion}</span>
                    </div>
                )}
              </div>
            ))
          )}
          
          {/* User Input Line */}
          {isWaitingForInput && (
              <div className="flex items-center space-x-3 animate-in fade-in duration-200 pl-[60px]">
                  <div className="mt-0.5 shrink-0 text-accent font-bold animate-pulse">
                      <ArrowRight size={14} />
                  </div>
                  <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent border-none outline-none text-text font-mono p-0 focus:ring-0 placeholder:text-text-muted/50"
                      placeholder="Type your input here and press Enter..."
                      autoComplete="off"
                  />
              </div>
          )}
          
          <div className="h-2" /> 
        </div>
      )}
    </div>
  );
};

export default Console;