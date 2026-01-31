import React, { useState } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    target: 'none',
    title: 'Welcome to TriLan C#',
    desc: 'Your secure, offline-capable C# playground. Let\'s show you around quickly.',
    icon: '👋'
  },
  {
    target: 'sidebar-nav',
    title: 'Project Explorer',
    desc: 'Manage your files, switch projects, and access settings here.',
    position: 'right-10 top-20'
  },
  {
    target: 'editor-container',
    title: 'Smart Editor',
    desc: 'Type code here. Try typing "cw" and hitting Tab for snippets!',
    position: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
  },
  {
    target: 'run-button',
    title: 'Run & Compile',
    desc: 'Execute your code instantly in our sandboxed environment.',
    position: 'right-4 top-20'
  },
  {
    target: 'console-panel',
    title: 'Output Console',
    desc: 'View results and errors here. You can resize or maximize it.',
    position: 'bottom-20 left-10'
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center animate-in fade-in">
        <div className="max-w-md w-full mx-4 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="relative h-32 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-6xl">{current.icon || '✨'}</span>
                <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 text-white p-1 rounded-full hover:bg-black/40 transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-6 text-center">
                <h3 className="text-2xl font-bold mb-2">{current.title}</h3>
                <p className="text-text-muted mb-6">{current.desc}</p>
                
                <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                        {STEPS.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`} />
                        ))}
                    </div>
                    <button 
                        onClick={() => isLast ? onClose() : setStep(s => s + 1)}
                        className="flex items-center space-x-2 bg-primary text-primary-fg px-6 py-2 rounded-xl font-bold hover:brightness-110 shadow-lg shadow-primary/25 transition-all"
                    >
                        <span>{isLast ? 'Get Started' : 'Next'}</span>
                        {isLast ? <Check size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Onboarding;