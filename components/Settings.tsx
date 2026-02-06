import React, { useState } from 'react';
import { AppSettings, Snapshot } from '../types';
import { THEME_PRESETS, EDITOR_FONTS, UI_FONTS } from '../constants';
import { 
    X, Palette, Save, 
    Monitor, Moon, Sun, Terminal,
    Accessibility, Keyboard, Eye, Zap, Layers, Type, FileCode, ToggleLeft, ToggleRight, Play, History, RotateCcw, Trash2, MousePointer
} from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onSaveAs: (newName: string) => void;
  project: any;
  isMobile: boolean;
  onSaveSnapshot: () => void;
  onRestoreSnapshot: (snapshot: Snapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  snapshots: Snapshot[];
}

const Settings: React.FC<SettingsProps> = ({
  isOpen, onClose, settings, onUpdateSettings, project, 
  onSaveAs, isMobile, onSaveSnapshot, onRestoreSnapshot, onDeleteSnapshot, snapshots
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'editor' | 'access' | 'project'>('appearance');
  const [saveAsName, setSaveAsName] = useState('');

  if (!isOpen) return null;

  const TabButton = ({ id, label, icon: Icon }: any) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex-1 flex flex-col sm:flex-row items-center justify-center sm:space-x-2 py-3 border-b-2 transition-all duration-200 ${
            activeTab === id 
            ? 'border-primary text-primary font-bold bg-primary/10' 
            : 'border-transparent text-text-muted hover:text-text hover:bg-surface-highlight'
        }`}
      >
        <Icon size={18} className="mb-1 sm:mb-0" />
        <span className="text-xs sm:text-sm">{label}</span>
      </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end md:items-center">
        <div 
            className="absolute inset-0 bg-black/60 animate-fade-in" 
            onClick={onClose}
        />
        
        <div className={`
            relative w-full bg-surface shadow-2xl overflow-hidden flex flex-col
            transition-all border border-border
            h-[85vh] rounded-t-[32px] animate-slide-up
            md:h-auto md:max-h-[85vh] md:max-w-3xl md:rounded-3xl md:animate-in md:zoom-in-95
        `}>
            
            {isMobile && (
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-border rounded-full opacity-50" />
                </div>
            )}

            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-highlight">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl text-primary-fg shadow-lg shadow-primary/20">
                        <Palette size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Settings</h2>
                        <p className="text-xs text-text-muted">Preferences & Project</p>
                    </div>
                </div>
                {!isMobile && (
                    <button onClick={onClose} className="p-2 hover:bg-surface-highlight rounded-full transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="flex border-b border-border bg-surface">
                <TabButton id="appearance" label="Appearance" icon={Palette} />
                <TabButton id="editor" label="Editor" icon={FileCode} />
                <TabButton id="access" label="Accessibility" icon={Accessibility} />
                <TabButton id="project" label="Project" icon={Save} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar">
                
                {/* APPEARANCE TAB */}
                {activeTab === 'appearance' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <section>
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Display Mode</h3>
                            <div className="flex rounded-xl bg-surface-highlight p-1 border border-border">
                                {['light', 'system', 'dark'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => onUpdateSettings({ ...settings, themeMode: mode as any })}
                                        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            settings.themeMode === mode 
                                            ? 'bg-surface shadow-md text-primary ring-1 ring-border' 
                                            : 'text-text-muted hover:text-text'
                                        }`}
                                    >
                                        {mode === 'light' && <Sun size={16} />}
                                        {mode === 'dark' && <Moon size={16} />}
                                        {mode === 'system' && <Monitor size={16} />}
                                        <span className="capitalize">{mode}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Theme Preset</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {THEME_PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => onUpdateSettings({ ...settings, activeThemeId: preset.id })}
                                        className={`relative group flex flex-col items-center p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                                            settings.activeThemeId === preset.id 
                                            ? 'border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' 
                                            : 'border-transparent bg-surface-highlight hover:border-border'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full shadow-lg border-2 border-surface mb-2" style={{ background: preset.colors.primary }} />
                                        <span className="text-xs font-medium text-center truncate w-full">{preset.name}</span>
                                        {settings.activeThemeId === preset.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_currentColor]" />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center">
                                <Type size={14} className="mr-2" /> Typography
                            </h3>
                            <div className="bg-surface-highlight rounded-xl border border-border p-4 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Editor Font</label>
                                        <select 
                                            value={settings.editorFontFamily} 
                                            onChange={(e) => onUpdateSettings({...settings, editorFontFamily: e.target.value})}
                                            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                        >
                                            {EDITOR_FONTS.map((font, idx) => (
                                                <option key={idx} value={font.value}>{font.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">UI Font</label>
                                        <select 
                                            value={settings.uiFontFamily} 
                                            onChange={(e) => onUpdateSettings({...settings, uiFontFamily: e.target.value})}
                                            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                        >
                                            {UI_FONTS.map((font, idx) => (
                                                <option key={idx} value={font.value}>{font.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="w-full h-px bg-border" />

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Font Size</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-text-muted">px</span>
                                            <input 
                                                type="number"
                                                min="10"
                                                max="64"
                                                value={settings.editorFontSize}
                                                onChange={(e) => onUpdateSettings({...settings, editorFontSize: Math.max(10, Math.min(64, parseInt(e.target.value) || 14))})}
                                                className="w-16 bg-surface border border-border rounded-md px-2 py-1 text-sm text-center focus:ring-1 focus:ring-primary outline-none font-mono"
                                            />
                                        </div>
                                    </div>
                                    <input 
                                       type="range" 
                                       min="10" 
                                       max="32" 
                                       step="1"
                                       value={settings.editorFontSize}
                                       onChange={(e) => onUpdateSettings({...settings, editorFontSize: parseInt(e.target.value)})}
                                       className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-surface-highlight rounded-2xl p-5 border border-border">
                             <h3 className="text-sm font-semibold mb-4 flex items-center">
                                <Terminal size={16} className="mr-2 text-accent" />
                                Console Customization
                             </h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
                                    <label className="text-sm pl-2">Background</label>
                                    <input type="color" className="w-8 h-8 rounded-md cursor-pointer border-0 bg-transparent" 
                                        value={settings.consoleBackgroundColor || '#000000'} 
                                        onChange={e => onUpdateSettings({...settings, consoleBackgroundColor: e.target.value})}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
                                    <label className="text-sm pl-2">Text Color</label>
                                    <input type="color" className="w-8 h-8 rounded-md cursor-pointer border-0 bg-transparent" 
                                        value={settings.consoleTextColor || '#ffffff'} 
                                        onChange={e => onUpdateSettings({...settings, consoleTextColor: e.target.value})}
                                    />
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 p-2 rounded-lg bg-surface border border-border">
                                     <label className="text-sm pl-2 whitespace-nowrap">Prompt</label>
                                     <input 
                                        type="text" 
                                        maxLength={3}
                                        className="w-full bg-transparent text-right font-mono outline-none border-b border-transparent focus:border-primary transition-colors text-accent font-bold"
                                        value={settings.consolePromptSymbol}
                                        onChange={e => onUpdateSettings({...settings, consolePromptSymbol: e.target.value})}
                                     />
                                 </div>
                                 <div className="flex items-center space-x-3 p-2 rounded-lg bg-surface border border-border">
                                    <label className="text-sm pl-2 whitespace-nowrap">Font</label>
                                    <select 
                                        value={settings.consoleFontFamily || settings.editorFontFamily} 
                                        onChange={(e) => onUpdateSettings({...settings, consoleFontFamily: e.target.value})}
                                        className="w-full bg-transparent text-right text-xs outline-none"
                                    >
                                        {EDITOR_FONTS.map((font, idx) => (
                                            <option key={idx} value={font.value}>{font.name}</option>
                                        ))}
                                    </select>
                                 </div>
                             </div>
                        </section>

                        <section className="bg-surface-highlight rounded-2xl p-5 border border-border">
                             <h3 className="text-sm font-semibold mb-4 flex items-center">
                                <FileCode size={16} className="mr-2 text-accent" />
                                Editor Colors Overrides
                             </h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
                                    <label className="text-sm pl-2">Background</label>
                                    <input type="color" className="w-8 h-8 rounded-md cursor-pointer border-0 bg-transparent" 
                                        value={settings.editorBackgroundColor || '#1e1e1e'} 
                                        onChange={e => onUpdateSettings({...settings, editorBackgroundColor: e.target.value})}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
                                    <label className="text-sm pl-2">Text</label>
                                    <input type="color" className="w-8 h-8 rounded-md cursor-pointer border-0 bg-transparent" 
                                        value={settings.editorTextColor || '#d4d4d4'} 
                                        onChange={e => onUpdateSettings({...settings, editorTextColor: e.target.value})}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
                                    <label className="text-sm pl-2">Cursor</label>
                                    <input type="color" className="w-8 h-8 rounded-md cursor-pointer border-0 bg-transparent" 
                                        value={settings.editorCursorColor || '#ffffff'} 
                                        onChange={e => onUpdateSettings({...settings, editorCursorColor: e.target.value})}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
                                    <label className="text-sm pl-2">Selection</label>
                                    <input type="color" className="w-8 h-8 rounded-md cursor-pointer border-0 bg-transparent" 
                                        value={settings.editorSelectionColor || '#264f78'} 
                                        onChange={e => onUpdateSettings({...settings, editorSelectionColor: e.target.value})}
                                    />
                                </div>
                             </div>
                             <div className="mt-4 flex justify-end">
                                 <button 
                                    onClick={() => onUpdateSettings({
                                        ...settings, 
                                        editorBackgroundColor: undefined,
                                        editorTextColor: undefined,
                                        editorCursorColor: undefined,
                                        editorSelectionColor: undefined
                                    })}
                                    className="text-xs text-text-muted hover:text-red-500 underline"
                                 >
                                     Reset Editor Colors
                                 </button>
                             </div>
                        </section>
                    </div>
                )}

                {/* EDITOR TAB */}
                {activeTab === 'editor' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <section>
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center">
                                <FileCode size={14} className="mr-2" /> Code Intelligence
                            </h3>
                            <div className="bg-surface-highlight rounded-xl border border-border p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Zap size={20} /></div>
                                        <div>
                                            <div className="font-semibold text-sm">IntelliSense</div>
                                            <div className="text-xs text-text-muted">Enable code completion and suggestions</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.enableIntelliSense} 
                                            onChange={e => onUpdateSettings({...settings, enableIntelliSense: e.target.checked})} 
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-surface rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                    </label>
                                </div>
                                
                                <div className={`pl-12 space-y-3 transition-all duration-300 ${settings.enableIntelliSense ? 'opacity-100 max-h-40' : 'opacity-50 max-h-0 overflow-hidden'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Suggest on Trigger Characters</span>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.suggestOnTriggerCharacters} 
                                            onChange={e => onUpdateSettings({...settings, suggestOnTriggerCharacters: e.target.checked})}
                                            className="accent-primary w-4 h-4 rounded cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Accept Suggestion on Enter</span>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.acceptSuggestionOnEnter} 
                                            onChange={e => onUpdateSettings({...settings, acceptSuggestionOnEnter: e.target.checked})}
                                            className="accent-primary w-4 h-4 rounded cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-muted">Word Based Suggestions</span>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.wordBasedSuggestions} 
                                            onChange={e => onUpdateSettings({...settings, wordBasedSuggestions: e.target.checked})}
                                            className="accent-primary w-4 h-4 rounded cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="w-full h-px bg-border" />

                                <div className="flex flex-col space-y-3">
                                     <div className="flex items-center justify-between">
                                         <div>
                                             <div className="text-sm font-medium">Format On Type</div>
                                             <div className="text-xs text-text-muted">Automatically format line after typing</div>
                                         </div>
                                         <button 
                                            onClick={() => onUpdateSettings({...settings, formatOnType: !settings.formatOnType})}
                                            className={`text-2xl transition-colors ${settings.formatOnType ? 'text-primary' : 'text-text-muted'}`}
                                         >
                                             {settings.formatOnType ? <ToggleRight /> : <ToggleLeft />}
                                         </button>
                                     </div>
                                     <div className="flex items-center justify-between">
                                         <div>
                                             <div className="text-sm font-medium">Format On Paste</div>
                                             <div className="text-xs text-text-muted">Automatically format content after pasting</div>
                                         </div>
                                         <button 
                                            onClick={() => onUpdateSettings({...settings, formatOnPaste: !settings.formatOnPaste})}
                                            className={`text-2xl transition-colors ${settings.formatOnPaste ? 'text-primary' : 'text-text-muted'}`}
                                         >
                                             {settings.formatOnPaste ? <ToggleRight /> : <ToggleLeft />}
                                         </button>
                                     </div>
                                </div>
                                
                                <div className="w-full h-px bg-border" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Play size={20} /></div>
                                        <div>
                                            <div className="font-semibold text-sm">Auto-Run Code</div>
                                            <div className="text-xs text-text-muted">Automatically execute code when you stop typing</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.autoRun} 
                                            onChange={e => onUpdateSettings({...settings, autoRun: e.target.checked})} 
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-surface rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ACCESSIBILITY TAB */}
                {activeTab === 'access' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <section>
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center">
                                <Accessibility size={14} className="mr-2" /> Visual Aids
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-highlight transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Eye size={20} /></div>
                                        <div>
                                            <div className="font-semibold text-sm">High Contrast Mode</div>
                                            <div className="text-xs text-text-muted">Maximized visibility and pure black/white background.</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={settings.highContrast} onChange={e => onUpdateSettings({...settings, highContrast: e.target.checked})} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-surface-highlight rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-highlight transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Zap size={20} /></div>
                                        <div>
                                            <div className="font-semibold text-sm">Reduce Motion</div>
                                            <div className="text-xs text-text-muted">Disable animations for a simpler experience.</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={settings.reduceMotion} onChange={e => onUpdateSettings({...settings, reduceMotion: e.target.checked})} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-surface-highlight rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-highlight transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Layers size={20} /></div>
                                        <div>
                                            <div className="font-semibold text-sm">Simplified Mode</div>
                                            <div className="text-xs text-text-muted">Hide advanced features and declutter the UI.</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={settings.simplifiedMode} onChange={e => onUpdateSettings({...settings, simplifiedMode: e.target.checked})} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-surface-highlight rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center">
                                <Keyboard size={14} className="mr-2" /> Keyboard Shortcuts
                            </h3>
                            <div className="bg-surface-highlight rounded-xl border border-border overflow-hidden">
                                {settings.keybindings.map((kb, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 border-b border-border last:border-0 hover:bg-surface transition-colors">
                                        <span className="text-sm font-medium">{kb.label}</span>
                                        <kbd className="px-2 py-1 bg-surface border border-border rounded-md text-xs font-mono text-text-muted shadow-sm">
                                            {kb.key}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
                {/* ... existing project tab ... */}
                {activeTab === 'project' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                         {/* Snapshots */}
                         <section className="bg-surface-highlight rounded-xl p-4 border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold flex items-center">
                                    <History size={16} className="mr-2 text-accent" />
                                    Snapshots
                                </h3>
                                <button 
                                    onClick={onSaveSnapshot}
                                    className="text-xs bg-primary text-primary-fg px-3 py-1.5 rounded-lg font-bold shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    + Save Snapshot
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                {snapshots.length === 0 ? (
                                    <p className="text-xs text-text-muted text-center py-4">No snapshots saved yet.</p>
                                ) : (
                                    snapshots.map(snap => (
                                        <div key={snap.id} className="flex items-center justify-between p-2 bg-surface rounded-lg border border-border">
                                            <div>
                                                <div className="text-xs font-bold text-text">{new Date(snap.timestamp).toLocaleString()}</div>
                                                <div className="text-[10px] text-text-muted">{snap.project.files.length} files</div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => { if(confirm('Restore this snapshot? Current unsaved changes will be lost.')) onRestoreSnapshot(snap); }}
                                                    className="p-1.5 hover:bg-surface-highlight text-blue-500 rounded-md transition-colors"
                                                    title="Restore"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => onDeleteSnapshot(snap.id)}
                                                    className="p-1.5 hover:bg-surface-highlight text-red-500 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Save As */}
                        <section className="bg-surface-highlight rounded-xl p-4 border border-border">
                            <h3 className="text-sm font-semibold mb-4 flex items-center">
                                <Save size={16} className="mr-2 text-accent" />
                                Save Copy
                            </h3>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="text" 
                                    placeholder="New Project Name"
                                    value={saveAsName}
                                    onChange={(e) => setSaveAsName(e.target.value)}
                                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                                <button 
                                    onClick={() => { if(saveAsName) { onSaveAs(saveAsName); setSaveAsName(''); } }}
                                    disabled={!saveAsName}
                                    className="bg-surface-highlight border border-border text-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-border transition-colors disabled:opacity-50"
                                >
                                    Save As
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Settings;