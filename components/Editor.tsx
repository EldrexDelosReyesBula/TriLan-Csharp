import React, { useRef, useState, useEffect, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Theme, AppSettings, ConsoleMessage } from '../types';
import { Undo, Redo, Copy, Check, AlignLeft, Code, ChevronDown, StickyNote, Clipboard, CheckSquare } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
  theme: Theme;
  settings: AppSettings;
  compilationMessages?: ConsoleMessage[];
  onAddToNotes?: (text: string) => void;
}

const TEMPLATES = [
    { label: 'Console.WriteLine', code: 'Console.WriteLine("Hello");' },
    { label: 'If-Else Block', code: 'if (true) \n{\n    \n} \nelse \n{\n    \n}' },
    { label: 'For Loop', code: 'for (int i = 0; i < 10; i++) \n{\n    \n}' },
    { label: 'Foreach Loop', code: 'foreach (var item in collection) \n{\n    \n}' },
    { label: 'Public Class', code: 'public class MyClass \n{\n    public MyClass() \n    {\n        \n    }\n}' },
    { label: 'Void Method', code: 'public void MyMethod() \n{\n    \n}' },
    { label: 'Main Method', code: 'static void Main(string[] args) \n{\n    \n}' },
];

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, onChange, theme, settings, compilationMessages = [], onAddToNotes }) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const settingsRef = useRef<AppSettings>(settings);
  const [copied, setCopied] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  
  // Local state for debounced updates to improve mobile performance
  const [localCode, setLocalCode] = useState(code);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
      // Sync local state when prop changes from external source (e.g. file switch)
      if (code !== localCode) {
         setLocalCode(code);
         if (editorRef.current && editorRef.current.getValue() !== code) {
             editorRef.current.setValue(code);
         }
      }
  }, [code]);

  useEffect(() => {
      settingsRef.current = settings;
      // Re-apply theme when settings change (in case of custom colors)
      if (monacoRef.current) {
          updateMonacoTheme(monacoRef.current, theme);
      }
  }, [settings, theme]);

  const handleEditorChange = (value: string | undefined) => {
      const newVal = value || '';
      setLocalCode(newVal);
      
      if (debounceRef.current) {
          clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
          onChange(newVal);
      }, 500); // 500ms debounce
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    updateMonacoTheme(monaco, theme);

    monaco.languages.registerCompletionItemProvider('csharp', {
        provideCompletionItems: (model, position) => {
            if (!settingsRef.current.enableIntelliSense) return { suggestions: [] };

            const suggestions = [
                {
                    label: 'cw',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'Console.WriteLine($1);',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Console.WriteLine output'
                },
                {
                    label: 'for',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) \n{\n\t$0\n}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'For Loop'
                },
                {
                    label: 'if',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'if (${1:true}) \n{\n\t$0\n}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'If Statement'
                },
                {
                    label: 'prop',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'public ${1:int} ${2:MyProperty} { get; set; }',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Auto Property'
                }
            ];
            return { suggestions: suggestions };
        }
    });

    editor.onDidChangeCursorSelection((e) => {
        const selection = editor.getSelection();
        setHasSelection(selection && !selection.isEmpty());
    });
  };

  const updateMonacoTheme = (monaco: any, currentTheme: Theme) => {
     if (!monaco) return;
     
     // Use settings overrides if available, else fall back to theme colors
     const bg = settingsRef.current.editorBackgroundColor || currentTheme.colors.surface;
     const fg = settingsRef.current.editorTextColor || currentTheme.colors.text;
     const cursor = settingsRef.current.editorCursorColor || currentTheme.colors.accent;
     const selection = settingsRef.current.editorSelectionColor || currentTheme.colors.surfaceHighlight;

     monaco.editor.defineTheme('custom-theme', {
      base: currentTheme.type === 'dark' ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': bg, 
        'editor.foreground': fg,
        'editorLineNumber.foreground': currentTheme.colors.textMuted,
        'editor.selectionBackground': selection,
        'editor.lineHighlightBackground': currentTheme.colors.surfaceHighlight,
        'editorCursor.foreground': cursor,
      },
    });
    monaco.editor.setTheme('custom-theme');
  };

  useEffect(() => {
      if (editorRef.current && monacoRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
              const markers = compilationMessages
                .filter(m => (m.type === 'error' || m.type === 'warning') && m.line)
                .map(m => ({
                    startLineNumber: m.line!,
                    startColumn: 1,
                    endLineNumber: m.line!,
                    endColumn: 1000,
                    message: m.content + (m.suggestion ? `\nSuggestion: ${m.suggestion}` : ''),
                    severity: m.type === 'error' 
                        ? monacoRef.current.MarkerSeverity.Error 
                        : monacoRef.current.MarkerSeverity.Warning
                }));
              monacoRef.current.editor.setModelMarkers(model, "owner", markers);
          }
      }
  }, [compilationMessages]);

  const handleUndo = useCallback((e?: React.SyntheticEvent) => {
    e?.preventDefault();
    editorRef.current?.trigger('keyboard', 'undo', null);
    editorRef.current?.focus();
  }, []);

  const handleRedo = useCallback((e?: React.SyntheticEvent) => {
    e?.preventDefault();
    editorRef.current?.trigger('keyboard', 'redo', null);
    editorRef.current?.focus();
  }, []);

  const handleFormat = useCallback((e?: React.SyntheticEvent) => {
      e?.preventDefault();
      editorRef.current?.getAction('editor.action.formatDocument')?.run();
      editorRef.current?.focus();
  }, []);

  const handleSelectAll = useCallback((e?: React.SyntheticEvent) => {
      e?.preventDefault();
      if (editorRef.current) {
          const model = editorRef.current.getModel();
          const range = model.getFullModelRange();
          editorRef.current.setSelection(range);
          editorRef.current.focus();
      }
  }, []);

  const handlePaste = useCallback(async (e?: React.SyntheticEvent) => {
      e?.preventDefault();
      try {
          const text = await navigator.clipboard.readText();
          if (editorRef.current && text) {
              const selection = editorRef.current.getSelection();
              editorRef.current.executeEdits('paste', [{
                  range: selection,
                  text: text,
                  forceMoveMarkers: true
              }]);
              editorRef.current.focus();
          }
      } catch (err) {
          console.error('Failed to read clipboard', err);
          alert('Could not paste from clipboard. Please ensure permissions are granted.');
      }
  }, []);

  const handleAddToNotesAction = useCallback((e?: React.SyntheticEvent) => {
      e?.preventDefault();
      if (editorRef.current && onAddToNotes) {
          const model = editorRef.current.getModel();
          const selection = editorRef.current.getSelection();
          const text = model.getValueInRange(selection);
          if (text) {
              onAddToNotes(text);
          }
      }
  }, [onAddToNotes]);

  const insertTemplate = (code: string) => {
      if(editorRef.current) {
          editorRef.current.trigger('keyboard', 'type', { text: code });
          editorRef.current.focus();
          setIsTemplateOpen(false);
      }
  };

  const handleCopy = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (editorRef.current) {
        const value = editorRef.current.getValue();
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const actionProps = (handler: any) => ({
      onClick: handler,
      onTouchEnd: handler
  });

  return (
    <div id="editor-container" className="flex flex-col h-full w-full overflow-hidden rounded-xl border border-border shadow-inner bg-surface relative group">
      
      {/* Floating Toolbar */}
      <div className="absolute top-2 right-4 z-20 flex flex-wrap items-center justify-end gap-1 p-1 rounded-lg bg-surface border border-border shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
        
        {hasSelection && onAddToNotes && (
            <button {...actionProps(handleAddToNotesAction)} className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors flex items-center space-x-1" title="Add Selection to Notes">
                <StickyNote size={14} />
                <span className="text-[10px] font-bold">Note</span>
            </button>
        )}
        
        <div className="w-px h-4 bg-border mx-1" />

        <button {...actionProps(handleUndo)} className="p-1.5 hover:bg-surface-highlight text-text-muted hover:text-text rounded-md transition-colors" title="Undo">
            <Undo size={14} />
        </button>
        <button {...actionProps(handleRedo)} className="p-1.5 hover:bg-surface-highlight text-text-muted hover:text-text rounded-md transition-colors" title="Redo">
            <Redo size={14} />
        </button>
        <button {...actionProps(handleFormat)} className="p-1.5 hover:bg-surface-highlight text-text-muted hover:text-text rounded-md transition-colors" title="Format Document">
            <AlignLeft size={14} />
        </button>
        
        <button {...actionProps(handleSelectAll)} className="p-1.5 hover:bg-surface-highlight text-text-muted hover:text-text rounded-md transition-colors sm:hidden" title="Select All">
            <CheckSquare size={14} />
        </button>
        <button {...actionProps(handlePaste)} className="p-1.5 hover:bg-surface-highlight text-text-muted hover:text-text rounded-md transition-colors sm:hidden" title="Paste">
            <Clipboard size={14} />
        </button>

        <div className="relative">
             <button 
                onClick={() => setIsTemplateOpen(!isTemplateOpen)}
                className="p-1.5 hover:bg-surface-highlight text-text-muted hover:text-text rounded-md transition-colors flex items-center space-x-1" 
                title="Code Templates"
            >
                <Code size={14} />
                <ChevronDown size={10} />
            </button>
            {isTemplateOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsTemplateOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-20">
                        {TEMPLATES.map((t, i) => (
                            <button
                                key={i}
                                onClick={() => insertTemplate(t.code)}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-surface-highlight text-text transition-colors border-b border-border last:border-0"
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>

        <div className="w-px h-4 bg-border mx-1" />
        <button {...actionProps(handleCopy)} className="p-1.5 hover:bg-surface-highlight text-text-muted hover:text-text rounded-md transition-colors" title="Copy All">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-hidden pt-2">
        <Editor
            height="100%"
            defaultLanguage="csharp"
            language={language === 'csharp' ? 'csharp' : 'plaintext'}
            value={localCode}
            onChange={handleEditorChange}
            theme="custom-theme"
            onMount={handleEditorDidMount}
            options={{
                minimap: { enabled: false },
                fontSize: settings.editorFontSize,
                fontFamily: settings.editorFontFamily,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                roundedSelection: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                fontLigatures: true,
                formatOnType: settings.formatOnType,
                formatOnPaste: settings.formatOnPaste,
                
                quickSuggestions: settings.enableIntelliSense,
                snippetSuggestions: settings.enableIntelliSense ? 'inline' : 'none',
                suggestOnTriggerCharacters: settings.enableIntelliSense && settings.suggestOnTriggerCharacters,
                acceptSuggestionOnEnter: settings.acceptSuggestionOnEnter ? 'on' : 'off',
                wordBasedSuggestions: settings.enableIntelliSense && settings.wordBasedSuggestions,
            }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;