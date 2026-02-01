import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeSettings {
  mode: 'neural-dark' | 'neural-light' | 'high-contrast';
  accentColor: 'sage' | 'forge' | 'sync' | 'custom';
  customAccent?: string;
}

export interface EditorSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  tabSize: number;
  useSpaces: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn';
  wordWrapColumn: number;
  minimap: boolean;
  lineNumbers: 'on' | 'off' | 'relative';
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'all';
  bracketPairColorization: boolean;
  smoothScrolling: boolean;
  cursorStyle: 'line' | 'block' | 'underline';
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
}

export interface AISettings {
  defaultModel: string;
  sageEnabled: boolean;
  forgeEnabled: boolean;
  collaborationMode: 'sage-led' | 'forge-led' | 'balanced';
  autoSuggest: boolean;
  suggestOnType: boolean;
  explainOnHover: boolean;
  showInlineCompletions: boolean;
  completionDelay: number;
  maxTokens: number;
  temperature: number;
}

export interface MCPSettings {
  enabled: boolean;
  serverUrl: string;
  autoIndex: boolean;
  indexOnSave: boolean;
  contextDepth: number;
  maxFileSize: number;
  excludePatterns: string[];
}

export interface ShortcutSettings {
  [key: string]: string;
}

interface SettingsState {
  theme: ThemeSettings;
  editor: EditorSettings;
  ai: AISettings;
  mcp: MCPSettings;
  shortcuts: ShortcutSettings;
  
  // Actions
  setTheme: (theme: Partial<ThemeSettings>) => void;
  setEditor: (editor: Partial<EditorSettings>) => void;
  setAI: (ai: Partial<AISettings>) => void;
  setMCP: (mcp: Partial<MCPSettings>) => void;
  setShortcut: (key: string, value: string) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  theme: {
    mode: 'neural-dark' as const,
    accentColor: 'forge' as const,
  },
  editor: {
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    lineHeight: 1.6,
    tabSize: 2,
    useSpaces: true,
    wordWrap: 'on' as const,
    wordWrapColumn: 80,
    minimap: true,
    lineNumbers: 'on' as const,
    renderWhitespace: 'selection' as const,
    bracketPairColorization: true,
    smoothScrolling: true,
    cursorStyle: 'line' as const,
    cursorBlinking: 'blink' as const,
  },
  ai: {
    defaultModel: 'gpt-4',
    sageEnabled: true,
    forgeEnabled: true,
    collaborationMode: 'balanced' as const,
    autoSuggest: true,
    suggestOnType: true,
    explainOnHover: true,
    showInlineCompletions: true,
    completionDelay: 300,
    maxTokens: 2048,
    temperature: 0.7,
  },
  mcp: {
    enabled: true,
    serverUrl: 'http://localhost:3001',
    autoIndex: true,
    indexOnSave: true,
    contextDepth: 3,
    maxFileSize: 1024 * 1024, // 1MB
    excludePatterns: ['node_modules', '.git', 'dist', 'build'],
  },
  shortcuts: {
    'commandPalette': 'Ctrl+Shift+P',
    'quickOpen': 'Ctrl+P',
    'findInFiles': 'Ctrl+Shift+F',
    'toggleSidebar': 'Ctrl+B',
    'toggleAIPanel': 'Ctrl+Shift+A',
    'toggleTerminal': 'Ctrl+`',
    'saveFile': 'Ctrl+S',
    'formatDocument': 'Shift+Alt+F',
    'goToDefinition': 'F12',
    'renameSymbol': 'F2',
    'commentLine': 'Ctrl+/',
    'askSage': 'Ctrl+Shift+S',
    'askForge': 'Ctrl+Shift+G',
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      setTheme: (theme) => {
        console.log('settingsStore.setTheme called with:', theme);
        const currentTheme = get().theme;
        console.log('Current theme:', currentTheme);
        const newTheme = { ...currentTheme, ...theme };
        console.log('New theme:', newTheme);
        set({ theme: newTheme });
      },
      setEditor: (editor) => set({ editor: { ...get().editor, ...editor } }),
      setAI: (ai) => set({ ai: { ...get().ai, ...ai } }),
      setMCP: (mcp) => set({ mcp: { ...get().mcp, ...mcp } }),
      setShortcut: (key, value) => set({
        shortcuts: { ...get().shortcuts, [key]: value },
      }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'codementor-settings',
    }
  )
);
