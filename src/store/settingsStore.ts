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
  {
    id: 'supabase',
    name: 'Supabase MCP',
    url: '',
    enabled: false,
    kind: 'official',
    description: 'Database, auth, storage, edge functions',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL MCP',
    url: '',
    enabled: false,
    kind: 'reference',
    description: 'Direct Postgres queries & schema',
  },
  {
    id: 'browser',
    name: 'Browser / UI MCP',
    url: '',
    enabled: false,
    kind: 'community',
    description: 'Browser automation & screenshots',
  },
  {
    id: 'playwright',
    name: 'Playwright MCP',
    url: '',
    enabled: false,
    kind: 'official',
    description: 'E2E testing & browser control',
  },
  {
    id: 'github',
    name: 'GitHub MCP',
    url: '',
    enabled: false,
    kind: 'official',
    description: 'Repos, issues, PRs, actions',
  },
  {
    id: 'docker',
    name: 'Docker MCP',
    url: '',
    enabled: false,
    kind: 'community',
    description: 'Container management',
  },
  {
    id: 'notion',
    name: 'Notion MCP',
    url: '',
    enabled: false,
    kind: 'community',
    description: 'Pages, databases, search',
  },
  {
    id: 'linear',
    name: 'Linear MCP',
    url: '',
    enabled: false,
    kind: 'community',
    description: 'Issue tracking & projects',
  },
  {
    id: 'figma',
    name: 'Figma MCP',
    url: '',
    enabled: false,
    kind: 'community',
    description: 'Design tokens & components',
  },
  {
    id: 'sentry',
    name: 'Sentry MCP',
    url: '',
    enabled: false,
    kind: 'community',
    description: 'Error monitoring & traces',
  },
  {
    id: 'sqlite',
    name: 'SQLite MCP',
    url: '',
    enabled: false,
    kind: 'reference',
    description: 'Local SQLite databases',
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer MCP',
    url: '',
    enabled: false,
    kind: 'community',
    description: 'Headless Chrome automation',
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
          { id: 'o3-mini', name: 'o3-mini', description: 'Advanced reasoning, fast' },
          { id: 'o1', name: 'o1', description: 'Deep reasoning' },
          { id: 'o1-mini', name: 'o1-mini', description: 'Efficient reasoning' },
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
          { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most capable' },
          { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Great balance' },
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
          { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', description: 'Ultra fast, low cost' },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Long context (2M)' },
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fastest' },
          { id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro', description: 'Most capable' },
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
          { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Ultra fast' },
          { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Fast MoE model' },
          { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Compact & capable' },
          { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Llama 70B', description: 'Reasoning via Groq' },
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
          { id: 'mistral-medium-latest', name: 'Mistral Medium', description: 'Balanced' },
          { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Fast & efficient' },
          { id: 'codestral-latest', name: 'Codestral', description: 'Code-specialized' },
          { id: 'open-mistral-nemo', name: 'Mistral Nemo', description: 'Open-weight 12B' },
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
          { id: 'deepseek-chat', name: 'DeepSeek V3', description: 'Most capable, general purpose' },
          { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Code generation' },
          { id: 'deepseek-reasoner', name: 'DeepSeek R1', description: 'Deep reasoning' },
        ],
        selectedModel: 'deepseek-chat',
      },
      {
        id: 'openrouter',
        name: 'OpenRouter',
        enabled: false,
        apiKey: '',
        baseUrl: 'https://openrouter.ai/api/v1',
        models: [
          { id: 'openai/gpt-4o', name: 'GPT-4o (via OR)', description: 'OpenAI flagship' },
          { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (via OR)', description: 'Fast & cheap' },
          { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4 (via OR)', description: 'Anthropic coding' },
          { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (via OR)', description: 'Anthropic balanced' },
          { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (via OR)', description: 'Google fast' },
          { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro (via OR)', description: 'Google flagship' },
          { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (via OR)', description: 'Meta open-source' },
          { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3 (via OR)', description: 'DeepSeek latest' },
          { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (via OR)', description: 'Reasoning' },
          { id: 'mistralai/mistral-large-2411', name: 'Mistral Large (via OR)', description: 'Mistral flagship' },
          { id: 'qwen/qwen-2.5-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B (via OR)', description: 'Alibaba code model' },
          { id: 'cohere/command-r-plus', name: 'Command R+ (via OR)', description: 'Cohere flagship' },
        ],
        selectedModel: 'anthropic/claude-sonnet-4',
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
      version: 4,
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
        if (version < 4) {
          // Migrate v3 → v4: add OpenRouter provider, expanded models, new MCP servers
          const currentAi = (nextState?.ai ?? defaultSettings.ai) as any;
          const currentMcp = (nextState?.mcp ?? defaultSettings.mcp) as any;
          // Preserve user's existing API keys for old providers
          const preservedProviders = defaultSettings.ai.providers.map(dp => {
            const existing = currentAi?.providers?.find((p: any) => p.id === dp.id);
            if (existing?.apiKey) {
              return { ...dp, apiKey: existing.apiKey, enabled: existing.enabled, selectedModel: existing.selectedModel || dp.selectedModel };
            }
            return dp;
          });
          // Merge MCP servers — keep user customizations, add new defaults
          const existingServerIds = new Set((currentMcp?.servers || []).map((s: any) => s.id));
          const newServers = defaultSettings.mcp.servers.filter(s => !existingServerIds.has(s.id));
          const mergedServers = [...(currentMcp?.servers || []), ...newServers];
          return {
            ...nextState,
            ai: {
              ...currentAi,
              providers: preservedProviders,
            },
            mcp: {
              ...currentMcp,
              servers: mergedServers,
            },
          };
        }
        return nextState;
      },
    }
  )
);
