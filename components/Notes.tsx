import React, { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface NotesProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  fileName: string;
  onChange: (val: string) => void;
}

const Notes: React.FC<NotesProps> = ({ isOpen, onClose, content, fileName, onChange }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  // On Mobile, it's always a bottom sheet. On Desktop, it's a side drawer.
  return (
    <>
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={onClose} />
        <div 
            className={`
                fixed z-50 bg-surface shadow-2xl border-border
                flex flex-col animate-in transition-all duration-300
                
                /* Mobile Styles (Bottom Sheet) */
                bottom-0 left-0 right-0 rounded-t-[32px] h-[80vh] border-t slide-in-from-bottom
                
                /* Desktop Styles (Side Drawer) */
                md:top-0 md:bottom-0 md:right-0 md:h-full md:rounded-none md:border-l md:slide-in-from-right
                ${isMaximized ? 'md:w-full' : 'md:w-96'}
            `}
        >
           {/* Mobile Handle */}
           <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                 <div className="w-12 h-1.5 bg-border rounded-full opacity-50" />
           </div>

           <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface-highlight">
              <div className="flex flex-col">
                  <h2 className="font-bold text-lg flex items-center">
                      <span className="mr-2 text-xl">📝</span> 
                      {isMaximized ? `Notes for ${fileName}` : 'Notes'}
                  </h2>
                  {!isMaximized && <span className="text-[10px] text-text-muted truncate max-w-[200px]">{fileName}</span>}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                    onClick={() => setIsMaximized(!isMaximized)} 
                    className="hidden md:block p-2 hover:bg-surface rounded-full transition-colors"
                    title={isMaximized ? "Restore" : "Maximize"}
                >
                    {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors">
                    <X size={20} />
                </button>
              </div>
           </div>
           
           <div className="flex-1 p-4">
               <textarea 
                   className="w-full h-full bg-background border border-border rounded-2xl p-4 resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-sans text-sm leading-relaxed"
                   placeholder={`Write notes specifically for ${fileName}...`}
                   value={content || ''}
                   onChange={(e) => onChange(e.target.value)}
               />
           </div>
           
           <div className="p-4 border-t border-border text-center text-xs text-text-muted bg-surface-highlight">
               Notes are saved automatically for <strong>{fileName}</strong>.
           </div>
        </div>
    </>
  );
};

export default Notes;