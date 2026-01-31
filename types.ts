export interface File {
  id: string;
  parentId: string | null;
  name: string;
  type: 'file' | 'folder';
  content: string;
  language: 'csharp' | 'plaintext';
  notes?: string;
  isOpen?: boolean; // For folders
}

export interface ProjectMetadata {
  id: string;
  name: string;
  created: number;
  lastModified: number;
}

export interface Project extends ProjectMetadata {
  files: File[];
  activeFileId: string;
  notes?: string; 
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHighlight: string;
  primary: string;
  primaryFg: string;
  secondary: string;
  accent: string;
  border: string;
  text: string;
  textMuted: string;
  // Dynamic calculated colors
  surfaceTinted?: string;
}

export interface ThemePreset {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: ThemeColors;
}

export interface Keybinding {
    action: string;
    key: string;
    label: string;
}

export interface AppSettings {
  themeMode: 'light' | 'dark' | 'system';
  activeThemeId: string; 
  customColors?: Partial<ThemeColors>;
  editorFontFamily: string;
  editorFontSize: number;
  uiFontFamily: string;
  consolePromptSymbol: string;
  consoleBackgroundColor?: string;
  consoleTextColor?: string;
  consoleFontFamily?: string;
  hasSeenOnboarding: boolean;
  
  highContrast: boolean;
  reduceMotion: boolean;
  simplifiedMode: boolean;
  keybindings: Keybinding[];

  // Editor specific settings
  formatOnType: boolean;
  formatOnPaste: boolean;
  enableIntelliSense: boolean;
  acceptSuggestionOnEnter: boolean;
  suggestOnTriggerCharacters: boolean;
  wordBasedSuggestions: boolean;
  autoRun: boolean;
}

export interface ConsoleMessage {
  id: string;
  type: 'info' | 'error' | 'warning' | 'success' | 'system';
  content: string;
  timestamp: number;
  line?: number;
}