import React, { useState, useEffect, useRef } from 'react';
import { Project, File, Theme, ConsoleMessage, AppSettings } from './types';
import { DEFAULT_PROJECT, THEME_PRESETS, BASE_COLORS, DEFAULT_SETTINGS } from './constants';
import { compileAndRun } from './services/mockCompiler';
import { exportProjectToZip, importProjectFromZip } from './services/zipService';
import CodeEditor from './components/Editor';
import Sidebar from './components/Sidebar';
import Console from './components/Console';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import About from './components/About';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import Notes from './components/Notes';
import { Play, Menu, Save, Settings as SettingsIcon, Zap, Maximize, Minimize } from 'lucide-react';

const App: React.FC = () => {
  // Only use a single project in local storage
  const [project, setProject] = useState<Project>(() => {
     const saved = localStorage.getItem('trilan_project_v2');
     if (saved) return JSON.parse(saved);
     return DEFAULT_PROJECT;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
      const saved = localStorage.getItem('trilan_settings');
      if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
  });

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [isConsoleMaximized, setIsConsoleMaximized] = useState(false);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true); 
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!settings.hasSeenOnboarding);

  const [isRunning, setIsRunning] = useState(false);
  // State for interactive input
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const inputResolverRef = useRef<((value: string) => void) | null>(null);

  const [lastSaved, setLastSaved] = useState<number>(Date.now());

  // --- Dynamic Theme Logic ---
  const blendColors = (color1: string, color2: string, weight: number) => {
    const parse = (c: string) => {
        const hex = c.replace('#', '');
        if (hex.length === 3) return { r: parseInt(hex[0]+hex[0], 16), g: parseInt(hex[1]+hex[1], 16), b: parseInt(hex[2]+hex[2], 16) };
        return { r: parseInt(hex.substring(0, 2), 16), g: parseInt(hex.substring(2, 4), 16), b: parseInt(hex.substring(4, 6), 16) };
    };
    const toHex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
    try {
        const c1 = parse(color1); const c2 = parse(color2);
        return `#${toHex(c1.r*(1-weight)+c2.r*weight)}${toHex(c1.g*(1-weight)+c2.g*weight)}${toHex(c1.b*(1-weight)+c2.b*weight)}`;
    } catch(e) { return color1; }
  };

  const getEffectiveTheme = (): Theme => {
      const preset = THEME_PRESETS.find(p => p.id === settings.activeThemeId) || THEME_PRESETS[0];
      let mode = 'light';
      if (settings.themeMode === 'system') {
          mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
          mode = settings.themeMode;
      }
      let base = mode === 'dark' ? BASE_COLORS.dark : BASE_COLORS.light;
      if (settings.highContrast) base = BASE_COLORS.highContrast;

      const tintedSurface = blendColors(base.surface, preset.colors.primary, 0.03); 
      const tintedBackground = blendColors(base.background, preset.colors.primary, 0.01);
      const tintedHighlight = blendColors(base.surfaceHighlight, preset.colors.primary, 0.05);

      const mergedColors = { 
          ...base, 
          ...preset.colors, 
          ...(settings.customColors || {}),
          surface: tintedSurface,
          background: tintedBackground,
          surfaceHighlight: tintedHighlight
      };

      return {
          id: `${preset.id}-${mode}`,
          name: preset.name,
          type: mode as 'light'|'dark',
          colors: mergedColors
      };
  };

  const activeTheme = getEffectiveTheme();
  
  // Ensure activeFile is always a valid FILE (not folder)
  const activeFile = project.files.find(f => f.id === project.activeFileId && f.type === 'file') 
      || project.files.find(f => f.type === 'file') 
      || project.files[0];

  // Auto-Save Effect (Debounced 1s)
  useEffect(() => {
    const handler = setTimeout(() => {
        localStorage.setItem('trilan_project_v2', JSON.stringify(project));
        setLastSaved(Date.now());
    }, 1000);
    return () => clearTimeout(handler);
  }, [project]);

  // Auto-Run Effect (Debounced 1.5s)
  useEffect(() => {
      if (!settings.autoRun) return;
      
      const handler = setTimeout(() => {
          handleRun(true);
      }, 1500);
      return () => clearTimeout(handler);
  }, [project, settings.autoRun]);

  useEffect(() => {
    localStorage.setItem('trilan_settings', JSON.stringify(settings));
  }, [settings]);

  // Apply CSS Variables and Dynamic Fonts
  useEffect(() => {
    const root = document.documentElement;
    const colors = activeTheme.colors;
    
    Object.entries(colors).forEach(([key, val]) => {
         if (key === 'surfaceHighlight') root.style.setProperty('--surface-highlight', val);
         else if (key === 'primaryFg') root.style.setProperty('--primary-fg', val);
         else if (key === 'textMuted') root.style.setProperty('--text-muted', val);
         else root.style.setProperty(`--${key}`, val);
    });

    root.style.setProperty('--surface-tinted', blendColors(colors.surface, colors.primary, 0.05));
    root.style.setProperty('--font-sans', settings.uiFontFamily);
    root.style.setProperty('--font-mono', settings.editorFontFamily);
    if (settings.reduceMotion) document.body.classList.add('reduce-motion');
    else document.body.classList.remove('reduce-motion');

    // Dynamic Google Fonts Loading
    const fontFamilies = [settings.editorFontFamily, settings.uiFontFamily]
        .map(f => f.split(',')[0].replace(/['"]/g, '').trim());
    
    const knownFonts = ["Fira Code", "JetBrains Mono", "Source Code Pro", "Inter", "Plus Jakarta Sans", "Roboto"];
    const fontsToLoad = [...new Set(fontFamilies)].filter(f => knownFonts.includes(f));
    
    if (fontsToLoad.length > 0) {
        const linkId = 'dynamic-fonts';
        let link = document.getElementById(linkId) as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        const families = fontsToLoad.map(f => `${f.replace(/ /g, '+')}:wght@400;500;600;700`).join('&');
        const newHref = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
        if (link.href !== newHref) link.href = newHref;
    }
  }, [activeTheme, settings]);

  const handleInputSubmit = (value: string) => {
      if (inputResolverRef.current) {
          // Echo the input to the console so the user sees what they typed
          setConsoleMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              type: 'info',
              content: value + '\n', // Add newline for visual separation
              timestamp: Date.now()
          }]);
          
          setIsWaitingForInput(false);
          inputResolverRef.current(value);
          inputResolverRef.current = null;
      }
  };

  const handleRun = async (isAutoRun: boolean = false) => {
    if (!isAutoRun && window.innerWidth < 1024) setIsSidebarOpen(false);
    
    if (!activeFile || activeFile.type !== 'file' || activeFile.language !== 'csharp') {
        if (!isAutoRun) {
            setConsoleMessages([{ id: crypto.randomUUID(), type: 'error', content: 'Please select a valid C# file to run.', timestamp: Date.now() }]);
            setIsConsoleVisible(true); setIsConsoleOpen(true); 
        }
        return;
    }

    // UX Improvement: Check for empty code to prevent scary errors for beginners
    if (!activeFile.content || !activeFile.content.trim()) {
        if (!isAutoRun) {
             setConsoleMessages([{
                 id: crypto.randomUUID(),
                 type: 'system',
                 content: 'Start coding by writing your first program 🚀\nTry printing something to the console or insert a starter template.',
                 timestamp: Date.now()
             }]);
             setIsConsoleVisible(true); 
             setIsConsoleOpen(true);
        }
        return;
    }
    
    setIsRunning(true);
    // Ensure console is visible when running
    setIsConsoleVisible(true); 
    // If it's a manual run, ensure it's open. If auto-run, only open if we are not maximizing editor
    if (!isAutoRun) setIsConsoleOpen(true);
    
    setConsoleMessages([]); 
    setIsWaitingForInput(false);
    inputResolverRef.current = null; // Clear any stale resolvers

    try { 
        // We now pass callbacks to the compiler instead of waiting for a result array
        await compileAndRun(
            activeFile.content,
            (message: ConsoleMessage) => {
                setConsoleMessages(prev => [...prev, message]);
            },
            async () => {
                // Return a promise that resolves when user types in the console
                setIsWaitingForInput(true);
                // Ensure console is open if input is requested
                setIsConsoleOpen(true);
                
                return new Promise<string>((resolve) => {
                    inputResolverRef.current = resolve;
                });
            }
        );
    } catch (err) { 
        console.error(err); 
    } finally { 
        setIsRunning(false); 
        setIsWaitingForInput(false);
    }
  };

  const handleExport = async () => { try { await exportProjectToZip(project); } catch (e) { console.error(e); } };
  const handleImport = async (file: globalThis.File) => { try { const newP = await importProjectFromZip(file); setProject(newP); } catch (e) { console.error(e); } };

  const handleAddFile = (parentId: string | null) => {
      const nf: File = { 
          id: crypto.randomUUID(), 
          parentId: parentId,
          name: `File${project.files.filter(f => f.type === 'file').length}.cs`, 
          type: 'file',
          language: 'csharp', 
          content: '', 
          notes: '' 
      };
      setProject(p => {
          // If adding to a folder, ensure folder is open
          const files = [...p.files];
          if (parentId) {
               const parentIdx = files.findIndex(f => f.id === parentId);
               if (parentIdx >= 0) files[parentIdx] = { ...files[parentIdx], isOpen: true };
          }
          return { ...p, files: [...files, nf], activeFileId: nf.id };
      });
  };

  const handleAddFolder = (parentId: string | null) => {
      const nf: File = {
          id: crypto.randomUUID(),
          parentId: parentId,
          name: `Folder${project.files.filter(f => f.type === 'folder').length}`,
          type: 'folder',
          language: 'plaintext',
          content: '',
          isOpen: true
      };
      setProject(p => {
           // If adding to a folder, ensure parent folder is open
          const files = [...p.files];
          if (parentId) {
               const parentIdx = files.findIndex(f => f.id === parentId);
               if (parentIdx >= 0) files[parentIdx] = { ...files[parentIdx], isOpen: true };
          }
          return { ...p, files: [...files, nf] };
      });
  };
  
  const handleDeleteFile = (id: string) => {
      setProject(p => {
          // Recursive delete
          const toDelete = new Set<string>([id]);
          let changed = true;
          while(changed) {
              changed = false;
              p.files.forEach(f => {
                  if (f.parentId && toDelete.has(f.parentId) && !toDelete.has(f.id)) {
                      toDelete.add(f.id);
                      changed = true;
                  }
              });
          }
          
          const remaining = p.files.filter(f => !toDelete.has(f.id));
          
          // If active file was deleted, switch to another
          let newActiveId = p.activeFileId;
          if (toDelete.has(p.activeFileId)) {
              const firstFile = remaining.find(f => f.type === 'file');
              newActiveId = firstFile ? firstFile.id : '';
          }
          
          return { ...p, files: remaining, activeFileId: newActiveId };
      });
  };

  // Logic to append text to the active file's notes
  const handleAddToNotes = (text: string) => {
      if (activeFile) {
          const currentNotes = activeFile.notes || '';
          const separator = currentNotes ? '\n\n' : '';
          const newNotes = `${currentNotes}${separator}// Snippet from ${activeFile.name}:\n${text}`;
          
          setProject(p => ({
              ...p,
              files: p.files.map(f => f.id === activeFile.id ? { ...f, notes: newNotes } : f)
          }));
          
          setIsNotesOpen(true);
      }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
        // Meta key for Mac, Ctrl for others
        const isCtrl = e.ctrlKey || e.metaKey;
        
        // Save: Ctrl + S
        if (isCtrl && e.key.toLowerCase() === 's') {
            e.preventDefault();
            setLastSaved(Date.now());
            // Show system message feedback
            setConsoleMessages(prev => [...prev, { id: crypto.randomUUID(), type: 'system', content: 'Project saved.', timestamp: Date.now() }]);
        }

        // Run: Ctrl + Enter
        if (isCtrl && e.key === 'Enter') {
            e.preventDefault();
            // Don't trigger if already running
            if (!isRunning) {
                handleRun(false);
            }
        }

        // Sidebar: Ctrl + B
        if (isCtrl && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            setIsSidebarOpen(prev => !prev);
        }

        // Console: Ctrl + `
        if (isCtrl && e.key === '`') {
            e.preventDefault();
            setIsConsoleVisible(prev => {
                if (!prev) {
                    setIsConsoleOpen(true);
                    return true;
                }
                // If visible, toggle open/close of the panel content
                setIsConsoleOpen(isOpen => !isOpen);
                return true;
            });
        }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isRunning, activeFile]); // Re-bind when run state or active file changes for closure capture

  return (
    <div className={`flex h-screen w-screen bg-background text-text overflow-hidden font-sans transition-colors duration-300 ${settings.highContrast ? 'contrast-more' : ''}`}>
      
      {(!settings.simplifiedMode && !isFocusMode) && (
          <Sidebar 
            project={project} 
            activeFileId={activeFile?.id || ''} 
            onSelectFile={(id) => setProject(p => ({ ...p, activeFileId: id }))}
            onAddFile={handleAddFile}
            onAddFolder={handleAddFolder}
            onToggleFolder={(id) => setProject(p => ({ ...p, files: p.files.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f) }))}
            onOpenSettings={() => setIsSettingsOpen(true)} 
            onOpenNotes={() => setIsNotesOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)} 
            onExport={handleExport} 
            onImport={handleImport} 
            onSaveAs={() => setIsSettingsOpen(true)}
            onRenameFile={(id, name) => setProject(p => ({ ...p, files: p.files.map(f => f.id === id ? { ...f, name } : f) }))}
            onDeleteFile={handleDeleteFile}
            isMobile={window.innerWidth < 1024} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
          />
      )}

      <main className="flex-1 flex flex-col relative h-full min-w-0 transition-all duration-300">
        {!isFocusMode && (
          <header className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-border bg-surface-tinted z-10 shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                  <button className="p-2 text-text-muted hover:text-primary hover:bg-surface-highlight rounded-lg" onClick={() => settings.simplifiedMode ? setIsSettingsOpen(true) : setIsSidebarOpen(true)}>
                     {settings.simplifiedMode ? <SettingsIcon size={20} /> : <Menu size={20} />}
                  </button>
                  <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-text truncate">{activeFile?.name || 'No File Selected'}</span>
                      <span className="text-[10px] text-text-muted flex items-center space-x-1"><Save size={10} /><span>{new Date(lastSaved).toLocaleTimeString()}</span></span>
                  </div>
              </div>
              <div className="flex items-center space-x-2">
                  <button onClick={() => setIsFocusMode(!isFocusMode)} className="p-2 text-text-muted hover:text-primary rounded-lg" title="Toggle Focus Mode">
                      {isFocusMode ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                  <button onClick={() => handleRun(false)} disabled={isRunning} className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 transform active:scale-95 ${isRunning ? 'bg-secondary' : 'bg-primary text-primary-fg hover:brightness-110'}`}>
                      {isRunning ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Play size={18} fill="currentColor" />}
                      <span className="hidden sm:inline">Run</span>
                  </button>
              </div>
          </header>
        )}

        <div className={`flex-1 relative overflow-hidden bg-background ${isFocusMode ? 'p-0' : 'p-2 md:p-4'}`}>
            {isFocusMode && (
                <button onClick={() => setIsFocusMode(false)} className="absolute top-4 left-4 z-50 p-3 bg-primary text-primary-fg rounded-full shadow-2xl opacity-50 hover:opacity-100 transition-opacity">
                    <Minimize size={20} />
                </button>
            )}
            
            {activeFile ? (
                 <CodeEditor 
                    code={activeFile.content} 
                    language={activeFile.language} 
                    onChange={(c) => setProject(p => ({ ...p, files: p.files.map(f => f.id === p.activeFileId ? { ...f, content: c || '' } : f) }))}
                    theme={activeTheme} 
                    settings={settings} 
                    compilationMessages={consoleMessages} 
                    onAddToNotes={handleAddToNotes}
                />
            ) : (
                <div className="h-full flex items-center justify-center text-text-muted">
                    <p>Select a file to edit</p>
                </div>
            )}
           
        </div>

        {isConsoleVisible && (
            <div id="console-panel" className="shrink-0 z-20">
                <Console 
                    messages={consoleMessages} 
                    onClear={() => setConsoleMessages([])} 
                    isOpen={isConsoleOpen} 
                    isMaximized={isConsoleMaximized}
                    toggleOpen={() => setIsConsoleOpen(!isConsoleOpen)} 
                    toggleMaximize={() => setIsConsoleMaximized(!isConsoleMaximized)}
                    onClose={() => setIsConsoleVisible(false)} 
                    promptSymbol={settings.consolePromptSymbol || '>'} 
                    settings={settings} 
                    isWaitingForInput={isWaitingForInput}
                    onInputSubmit={handleInputSubmit}
                />
            </div>
        )}
      </main>

      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdateSettings={setSettings} project={project}
        onSaveAs={(name) => { const np = { ...project, id: crypto.randomUUID(), name }; setProject(np); }} 
        isMobile={window.innerWidth < 768} />
      
      <About isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} onOpenPrivacy={() => {setIsAboutOpen(false); setIsPrivacyOpen(true)}} onOpenTerms={() => {setIsAboutOpen(false); setIsTermsOpen(true)}} />
      <Privacy isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <Terms isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      
      <Notes isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} content={activeFile?.notes || ''} fileName={activeFile?.name || ''} onChange={(n) => setProject(p => ({ ...p, files: p.files.map(f => f.id === p.activeFileId ? { ...f, notes: n } : f) }))} />
      <Onboarding isOpen={isOnboardingOpen} onClose={() => { setIsOnboardingOpen(false); setSettings(s => ({ ...s, hasSeenOnboarding: true })); }} />
    </div>
  );
};

export default App;