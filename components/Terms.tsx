import React from 'react';
import { X, FileText } from 'lucide-react';

interface TermsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Terms: React.FC<TermsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background animate-fade-in overflow-y-auto">
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3 text-primary">
             <FileText size={24} />
             <h1 className="text-xl font-bold">Terms of Use</h1>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-highlight rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-12 space-y-8 text-text">
            <section>
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="leading-relaxed text-text-muted">
                    By accessing and using TriLan C#, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">2. Usage License</h2>
                <p className="leading-relaxed text-text-muted">
                   Permission is granted to use TriLan C# for personal, educational, and non-commercial coding practice.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
                <p className="leading-relaxed text-text-muted">
                    The materials on TriLan C# are provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties. 
                    Furthermore, since the compilation happens via a mock engine or client-side logic, it may not perfectly reflect standard C# behavior in all edge cases.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">4. User Content</h2>
                <p className="leading-relaxed text-text-muted">
                    You retain all rights to the code you write within the application. We claim no ownership over your intellectual property.
                </p>
            </section>
            
             <div className="pt-8 border-t border-border text-center text-sm text-text-muted">
                Last updated: {new Date().toLocaleDateString()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;