import React from 'react';
import { X, Heart, Shield, FileText } from 'lucide-react';

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

const About: React.FC<AboutProps> = ({ isOpen, onClose, onOpenPrivacy, onOpenTerms }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end md:items-center">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      
      <div className={`
         relative w-full bg-surface shadow-2xl overflow-hidden flex flex-col border border-border
         rounded-t-[32px] animate-slide-up
         md:max-w-lg md:rounded-3xl md:animate-in md:zoom-in-95
      `}>
        {/* Mobile Handle */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
             <div className="w-12 h-1.5 bg-border rounded-full opacity-50" />
        </div>

        <div className="p-4 border-b border-border flex justify-between items-center bg-surface-highlight">
          <h2 className="text-lg font-bold flex items-center">
             <img src="https://eldrex.landecs.org/squad/trilan-logo.png" alt="TriLan Logo" className="w-8 h-8 object-contain mr-3 drop-shadow-md" />
             About TriLan C#
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
            <p className="text-text-muted text-sm leading-relaxed">
                TriLan C# is a lightweight, privacy-focused environment for learning C# and practicing algorithms directly in your browser. No data leaves your device.
            </p>

            <div className="grid grid-cols-2 gap-3">
                <a href="https://landecs.org/docs/donation" target="_blank" rel="noreferrer" className="flex items-center p-3 rounded-2xl bg-surface-highlight hover:bg-border transition-colors group border border-border">
                    <Heart size={20} className="text-red-500 mr-3 group-hover:scale-110 transition-transform drop-shadow-sm" />
                    <div>
                        <div className="font-semibold text-sm">Support</div>
                        <div className="text-[10px] text-text-muted">Support Development</div>
                    </div>
                </a>
                <button onClick={onOpenPrivacy} className="flex items-center p-3 rounded-2xl bg-surface-highlight hover:bg-border transition-colors group border border-border text-left">
                    <Shield size={20} className="text-blue-500 mr-3 group-hover:scale-110 transition-transform drop-shadow-sm" />
                    <div>
                        <div className="font-semibold text-sm">Privacy</div>
                        <div className="text-[10px] text-text-muted">Policy</div>
                    </div>
                </button>
                <button onClick={onOpenTerms} className="flex items-center p-3 rounded-2xl bg-surface-highlight hover:bg-border transition-colors group border border-border text-left">
                    <FileText size={20} className="text-accent mr-3 group-hover:scale-110 transition-transform drop-shadow-sm" />
                    <div>
                        <div className="font-semibold text-sm">Terms</div>
                        <div className="text-[10px] text-text-muted">Of Use</div>
                    </div>
                </button>
                <div className="flex items-center p-3 rounded-2xl bg-surface-highlight hover:bg-border transition-colors border border-border">
                     <span className="text-2xl mr-3">🚀</span>
                    <div>
                        <div className="font-semibold text-sm">v1.2.0</div>
                        <div className="text-[10px] text-text-muted">Beta</div>
                    </div>
                </div>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-text-muted">
                <h4 className="font-bold text-primary mb-1">Offline Capable</h4>
                <p>You can install this app to your home screen and use it without an internet connection.</p>
            </div>
        </div>

        <div className="p-4 border-t border-border bg-surface-highlight text-center">
            <p className="text-[10px] text-text-muted">© {new Date().getFullYear()} LanDecs. Built with React & Monaco.</p>
        </div>
      </div>
    </div>
  );
};

export default About;