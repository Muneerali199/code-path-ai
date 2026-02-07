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

export interface AIProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  models: { id: string; name: string; description: string }[];
  selectedModel: string;
}

export interface AISettings {
  defaultProvider: string;       // which provider to use ('default' = built-in edge function)
  providers: AIProviderConfig[]; // user-configured providers
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
  activeServerId: string;
  servers: MCPServerProfile[];
  autoIndex: boolean;
  indexOnSave: boolean;
  contextDepth: number;
  maxFileSize: number;
  excludePatterns: string[];
}

export interface MCPServerProfile {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  kind?: 'local' | 'reference' | 'community' | 'official';
  description?: string;
  isCustom?: boolean;
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

const createDefaultMcpServers = (serverUrl?: string): MCPServerProfile[] => ([
  {
    id: 'local',
    name: 'Local MCP Server',
    url: serverUrl || 'http://localhost:3001',
    enabled: true,
    kind: 'local',
    description: 'Local MCP gateway',
  },
  {
    id: 'git',
    name: 'Git MCP',
    url: '',
    enabled: false,
    kind: 'reference',
    description: 'Local git operations',
  },
  {
    id: 'filesystem',
    name: 'Filesystem MCP',
    url: '',
    enabled: false,
    kind: 'reference',
    description: 'Secure file operations',
  },
  {
    id: 'fetch',
    name: 'Fetch MCP',
    url: '',
    enabled: false,
    kind: 'reference',
    description: 'Web fetching',
  },
  {
    id: 'memory',
    name: 'Memory MCP',
    url: '',
    enabled: false,
    kind: 'reference',
    description: 'Persistent memory',
  },
  {
    id: 'everything',
    name: 'Everything MCP',
    url: '',
    enabled: false,
    kind: 'reference',
    description: 'Reference/test server',
  },
  {
    id: 'slack',
    name: 'Slack MCP',
    url: '',
    enabled: false,
    kind: 'community',
    description: 'Workspace messaging',
  },
  {
    id: 'gdrive',
    name: 'Google Drive MCP',
    url: '',
    enabled: false,
    kind: 'community',
    description: 'Drive + Sheets',
  },
]);

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
    defaultProvider: 'default',
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        enabled: false,
        apiKey: '',
        baseUrl: 'https://api.openai.com/v1',
        models: [
          { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable, multimodal' },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast & affordable' },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High capability + vision' },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast & efficient' },
        ],
        selectedModel: 'gpt-4o-mini',
      },
      {
        id: 'anthropic',
        name: 'Anthropic (Claude)',
        enabled: false,
        apiKey: '',
        baseUrl: 'https://api.anthropic.com/v1',
        models: [
          { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Best for coding' },
          { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast & cheap' },
        ],
        selectedModel: 'claude-sonnet-4-20250514',
      },
      {
        id: 'google',
        name: 'Google (Gemini)',
        enabled: false,
        apiKey: '',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: [
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast multimodal' },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Long context' },
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fastest' },
        ],
        selectedModel: 'gemini-2.0-flash',
      },
      {
        id: 'groq',
        name: 'Groq',
        enabled: false,
        apiKey: '',
        baseUrl: 'https://api.groq.com/openai/v1',
        models: [
          { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Best open-source' },
          { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Fast MoE model' },
          { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Compact & capable' },
        ],
        selectedModel: 'llama-3.3-70b-versatile',
      },
      {
        id: 'mistral',
        name: 'Mistral AI',
        enabled: false,
        apiKey: '',
        baseUrl: 'https://api.mistral.ai/v1',
        models: [
          { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Most powerful' },
          { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Fast & efficient' },
          { id: 'codestral-latest', name: 'Codestral', description: 'Code-specialized' },
        ],
        selectedModel: 'mistral-small-latest',
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        enabled: false,
        apiKey: '',
        baseUrl: 'https://api.deepseek.com/v1',
        models: [
          { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Code generation' },
          { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'General purpose' },
        ],
        selectedModel: 'deepseek-coder',
      },
    ],
    defaultModel: 'mistral-small-latest',
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
    activeServerId: 'local',
    servers: createDefaultMcpServers(),
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
      version: 3,
      migrate: (state, version) => {
        const nextState = state as SettingsState;
        if (version < 2) {
          const currentMcp = (nextState?.mcp ?? defaultSettings.mcp) as any;
          const legacyServerUrl = currentMcp?.serverUrl as string | undefined;
          const servers = currentMcp?.servers ?? createDefaultMcpServers(legacyServerUrl);
          const activeServerId = currentMcp?.activeServerId ?? servers[0]?.id ?? 'local';
          return {
            ...nextState,
            mcp: {
              ...currentMcp,
              activeServerId,
              servers,
            },
            ai: defaultSettings.ai,
          };
        }
        if (version < 3) {
          // Migrate v2 → v3: add providers & defaultProvider to AI settings
          const currentAi = (nextState?.ai ?? defaultSettings.ai) as any;
          return {
            ...nextState,
            ai: {
              ...defaultSettings.ai,
              // Preserve user's existing behavioral settings
              collaborationMode: currentAi?.collaborationMode ?? defaultSettings.ai.collaborationMode,
              autoSuggest: currentAi?.autoSuggest ?? defaultSettings.ai.autoSuggest,
              suggestOnType: currentAi?.suggestOnType ?? defaultSettings.ai.suggestOnType,
              explainOnHover: currentAi?.explainOnHover ?? defaultSettings.ai.explainOnHover,
              showInlineCompletions: currentAi?.showInlineCompletions ?? defaultSettings.ai.showInlineCompletions,
              completionDelay: currentAi?.completionDelay ?? defaultSettings.ai.completionDelay,
              maxTokens: currentAi?.maxTokens ?? defaultSettings.ai.maxTokens,
              temperature: currentAi?.temperature ?? defaultSettings.ai.temperature,
            },
          };
        }
        return nextState;
      },
    }
  )
);
