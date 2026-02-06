import { ThemePreset, Project, AppSettings, Keybinding } from './types';

export const DEFAULT_C_SHARP_CODE = `using System;

namespace TriLanApp {
    class Calculator {
        static void Main() {
            Console.Write("Enter first number: ");
            double num1 = Convert.ToDouble(Console.ReadLine());
            
            Console.Write("Enter operation (+, -, *, /): ");
            char operation = Console.ReadKey().KeyChar;
            Console.WriteLine();
            
            Console.Write("Enter second number: ");
            double num2 = Convert.ToDouble(Console.ReadLine());
            
            double result = operation switch
            {
                '+' => num1 + num2,
                '-' => num1 - num2,
                '*' => num1 * num2,
                '/' => num2 != 0 ? num1 / num2 : throw new DivideByZeroException(),
                _ => throw new InvalidOperationException("Invalid operation")
            };
            
            Console.WriteLine($"Result: {result}");
        }
    }
}`;

// Base colors for modes
export const BASE_COLORS = {
    light: {
        background: '#fdfbff',
        surface: '#f4f6f8',
        surfaceHighlight: '#e8eaed',
        border: '#dde1e6',
        text: '#1a1c1e',
        textMuted: '#5d6b76',
        primaryFg: '#ffffff'
    },
    dark: {
        background: '#0f1115', 
        surface: '#181b21',
        surfaceHighlight: '#232830',
        border: '#2d333b',
        text: '#e6edf3',
        textMuted: '#8b949e',
        primaryFg: '#000000'
    },
    highContrast: {
        background: '#000000',
        surface: '#000000',
        surfaceHighlight: '#1a1a1a',
        border: '#ffffff',
        text: '#ffffff',
        textMuted: '#e5e5e5',
        primaryFg: '#000000'
    }
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: { primary: '#0ea5e9', secondary: '#38bdf8', accent: '#00d0ff' }
  },
  {
    id: 'purple',
    name: 'Lavender',
    colors: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' }
  },
  {
    id: 'cosmic-orange',
    name: 'Cosmic Orange',
    colors: { primary: '#f97316', secondary: '#fdba74', accent: '#fb923c' }
  },
  {
    id: 'vintage',
    name: 'Vintage',
    colors: { primary: '#b45309', secondary: '#d97706', accent: '#f59e0b' }
  },
  {
    id: 'pastel',
    name: 'Soft Pastel',
    colors: { primary: '#f472b6', secondary: '#fbcfe8', accent: '#fce7f3' }
  },
  {
    id: 'solarized',
    name: 'Solarized',
    colors: { primary: '#2aa198', secondary: '#859900', accent: '#b58900' }
  },
  {
    id: 'pink',
    name: 'Blush Pink',
    colors: { primary: '#ec4899', secondary: '#fbcfe8', accent: '#f472b6' }
  },
  {
    id: 'retro',
    name: 'Retro Arcade',
    colors: { primary: '#8b5cf6', secondary: '#6366f1', accent: '#ec4899' }
  },
  {
    id: 'sage',
    name: 'Calm Sage',
    colors: { primary: '#10b981', secondary: '#6ee7b7', accent: '#34d399' }
  },
  {
    id: 'mono',
    name: 'Monochrome',
    colors: { primary: '#525252', secondary: '#737373', accent: '#a3a3a3' }
  }
];

export const DEFAULT_KEYBINDINGS: Keybinding[] = [
    { action: 'save', key: 'Ctrl + S', label: 'Save Project' },
    { action: 'run', key: 'Ctrl + Enter', label: 'Run Code' },
    { action: 'format', key: 'Shift + Alt + F', label: 'Format Code' },
    { action: 'sidebar', key: 'Ctrl + B', label: 'Toggle Sidebar' },
    { action: 'console', key: 'Ctrl + `', label: 'Toggle Console' }
];

export const EDITOR_FONTS = [
    { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
    { name: 'Fira Code', value: '"Fira Code", monospace' },
    { name: 'Source Code Pro', value: '"Source Code Pro", monospace' },
    { name: 'Consolas (System)', value: 'Consolas, "Courier New", monospace' },
];

export const UI_FONTS = [
    { name: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", sans-serif' },
    { name: 'Inter', value: '"Inter", sans-serif' },
    { name: 'Roboto', value: '"Roboto", sans-serif' },
    { name: 'System Sans', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
];

export const DEFAULT_SETTINGS: AppSettings = {
    themeMode: 'system',
    activeThemeId: 'ocean', 
    editorFontFamily: '"JetBrains Mono", monospace',
    editorFontSize: 14,
    uiFontFamily: '"Plus Jakarta Sans", sans-serif',
    consolePromptSymbol: '>',
    consoleBackgroundColor: '',
    consoleTextColor: '',
    consoleFontFamily: '"JetBrains Mono", monospace',
    hasSeenOnboarding: false,
    
    highContrast: false,
    reduceMotion: false,
    simplifiedMode: false,
    keybindings: DEFAULT_KEYBINDINGS,

    formatOnType: true,
    formatOnPaste: true,
    enableIntelliSense: true,
    acceptSuggestionOnEnter: true,
    suggestOnTriggerCharacters: true,
    wordBasedSuggestions: true,
    autoRun: false
};

export const DEFAULT_PROJECT: Project = {
  id: 'default-project',
  name: 'My First App',
  created: Date.now(),
  lastModified: Date.now(),
  activeFileId: 'main-cs',
  files: [
    {
      id: 'main-cs',
      parentId: null,
      name: 'Calculator.cs',
      type: 'file',
      language: 'csharp',
      content: DEFAULT_C_SHARP_CODE,
      notes: 'Main entry point for the application.'
    },
    {
      id: 'utils-cs',
      parentId: null,
      name: 'Utils.cs',
      type: 'file',
      language: 'csharp',
      content: 'public class Utils {\n    public static void Log(string m) => Console.WriteLine(m);\n}',
      notes: 'Helper functions go here.'
    },
  ],
};