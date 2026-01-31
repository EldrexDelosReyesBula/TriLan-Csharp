import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyProps {
  isOpen: boolean;
  onClose: () => void;
}

const Privacy: React.FC<PrivacyProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background animate-fade-in overflow-y-auto">
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3 text-primary">
             <Shield size={24} />
             <h1 className="text-xl font-bold">Privacy Policy</h1>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-highlight rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-12 space-y-8 text-text">
            <section>
                <h2 className="text-2xl font-bold mb-4">1. Data Privacy</h2>
                <p className="leading-relaxed text-text-muted">
                    TriLan C# is designed with privacy as a core principle. The application runs entirely within your browser (client-side). 
                    No code you write, project names, or notes are transmitted to our servers or any third-party servers.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">2. Local Storage</h2>
                <p className="leading-relaxed text-text-muted">
                    We use your browser's Local Storage to save your projects, settings, and preferences. This data persists on your device 
                    until you explicitly clear your browser cache or delete the application data.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">3. Analytics</h2>
                <p className="leading-relaxed text-text-muted">
                    We do not track your coding behavior, project content, or personal information. 
                    Basic anonymous usage statistics (e.g., app loads) may be collected by the hosting platform (e.g., Vercel) for performance monitoring, 
                    but this does not include your user-generated content.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">4. Changes</h2>
                <p className="leading-relaxed text-text-muted">
                    We may update this privacy policy from time to time. Any changes will be reflected in this document within the application.
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

export default Privacy;