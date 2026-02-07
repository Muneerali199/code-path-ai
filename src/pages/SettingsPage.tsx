import React, { useState, useContext } from 'react';
import {
  ArrowLeft,
  Palette,
  Type,
  Brain,
  Server,
  Keyboard,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Moon,
  Sun,
  Contrast,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Key,
  Shield,
} from 'lucide-react';
import { MCPServerProfile, useSettingsStore } from '@/store/settingsStore';
import { NavigationContext } from '@/App';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const sections: SettingsSection[] = [
  { id: 'theme', name: 'Theme', icon: Palette, description: 'Colors and appearance' },
  { id: 'editor', name: 'Editor', icon: Type, description: 'Font, spacing, behavior' },
  { id: 'ai', name: 'AI Settings', icon: Brain, description: 'Models and behavior' },
  { id: 'mcp', name: 'MCP Server', icon: Server, description: 'Context and indexing' },
  { id: 'shortcuts', name: 'Shortcuts', icon: Keyboard, description: 'Key bindings' },
];

const ThemeSettings: React.FC = () => {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  const themes = [
    { id: 'neural-dark', name: 'Neural Dark', icon: Moon, description: 'Default dark theme' },
    { id: 'neural-light', name: 'Neural Light', icon: Sun, description: 'Light variant' },
    { id: 'high-contrast', name: 'High Contrast', icon: Contrast, description: 'Maximum accessibility' },
  ];

  const handleThemeChange = (mode: string) => {
    console.log('Changing theme to:', mode);
    setTheme({ mode: mode as any });
    console.log('Theme updated');
  };

  const handleAccentChange = (accentColor: string) => {
    console.log('Changing accent to:', accentColor);
    setTheme({ accentColor: accentColor as any });
    console.log('Accent updated');
  };

  const accents = [
    { id: 'sage', name: 'Sage (Cyan)', color: '#00d4ff' },
    { id: 'forge', name: 'Forge (Green)', color: '#00ff9d' },
    { id: 'sync', name: 'Sync (Purple)', color: '#a855f7' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Color Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`p-4 rounded-xl border transition-all ${
                theme.mode === t.id
                  ? 'border-primary bg-primary/10'
                  : 'border-neural-border hover:border-gray-600'
              }`}
            >
              <t.icon className={`w-6 h-6 mb-2 ${theme.mode === t.id ? 'text-primary' : 'text-gray-400'}`} />
              <div className="text-sm font-medium text-foreground">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Accent Color</h3>
        <div className="flex gap-4">
          {accents.map((accent) => (
            <button
              key={accent.id}
              onClick={() => handleAccentChange(accent.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                theme.accentColor === accent.id
                  ? 'border-primary bg-primary/10'
                  : 'border-neural-border hover:border-gray-600'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: accent.color, boxShadow: `0 0 10px ${accent.color}` }}
              />
              <span className="text-sm text-foreground">{accent.name}</span>
              {theme.accentColor === accent.id && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const EditorSettings: React.FC = () => {
  const editor = useSettingsStore((state) => state.editor);
  const setEditor = useSettingsStore((state) => state.setEditor);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Font</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Font Family</label>
            <select
              value={editor.fontFamily}
              onChange={(e) => setEditor({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 bg-neural-input border border-neural-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Fira Code">Fira Code</option>
              <option value="Cascadia Code">Cascadia Code</option>
              <option value="Source Code Pro">Source Code Pro</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Font Size</label>
            <input
              type="number"
              value={editor.fontSize}
              onChange={(e) => setEditor({ fontSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-neural-input border border-neural-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Spacing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Line Height</label>
            <input
              type="number"
              step="0.1"
              value={editor.lineHeight}
              onChange={(e) => setEditor({ lineHeight: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-neural-input border border-neural-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Tab Size</label>
            <input
              type="number"
              value={editor.tabSize}
              onChange={(e) => setEditor({ tabSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-neural-input border border-neural-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Features</h3>
        <div className="space-y-3">
          {[
            { key: 'minimap', label: 'Show Minimap' },
            { key: 'wordWrap', label: 'Word Wrap', isSelect: true, options: ['off', 'on', 'wordWrapColumn'] },
            { key: 'bracketPairColorization', label: 'Bracket Pair Colorization' },
            { key: 'smoothScrolling', label: 'Smooth Scrolling' },
          ].map((item: any) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">{item.label}</span>
              {item.isSelect ? (
                <select
                  value={(editor as any)[item.key]}
                  onChange={(e) => setEditor({ [item.key]: e.target.value } as any)}
                  className="px-3 py-1.5 bg-neural-input border border-neural-border rounded text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  {item.options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => setEditor({ [item.key]: !(editor as any)[item.key] } as any)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    (editor as any)[item.key] ? 'bg-primary' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      (editor as any)[item.key] ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AISettings: React.FC = () => {
  const ai = useSettingsStore((state) => state.ai);
  const setAI = useSettingsStore((state) => state.setAI);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (providerId: string) => {
    setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const updateProvider = (providerId: string, patch: Partial<{ enabled: boolean; apiKey: string; selectedModel: string }>) => {
    const providers = ai.providers.map(p =>
      p.id === providerId ? { ...p, ...patch } : p
    );
    setAI({ providers });
  };

  const setActiveProvider = (providerId: string) => {
    setAI({ defaultProvider: providerId });
  };

  const providerIcons: Record<string, string> = {
    openai: '🟢',
    anthropic: '🟠',
    google: '🔵',
    groq: '⚡',
    mistral: '🟣',
    deepseek: '🐋',
  };

  return (
    <div className="space-y-6">
      {/* Active Provider Selector */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">Active AI Provider</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Select which AI provider to use. The built-in provider works out of the box.
          To use others, add your API key below.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveProvider('default')}
            className={`p-4 rounded-xl border text-left transition-all ${
              ai.defaultProvider === 'default'
                ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                : 'border-neural-border hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Built-in (Default)
              </span>
              {ai.defaultProvider === 'default' && <Check className="w-4 h-4 text-primary" />}
            </div>
            <div className="text-xs text-muted-foreground">Mistral + GLM fallback — no API key needed</div>
          </button>
          {ai.providers.map((provider) => {
            const hasKey = provider.apiKey.trim().length > 0;
            return (
              <button
                key={provider.id}
                onClick={() => {
                  if (hasKey) {
                    setActiveProvider(provider.id);
                    updateProvider(provider.id, { enabled: true });
                  }
                }}
                disabled={!hasKey}
                className={`p-4 rounded-xl border text-left transition-all ${
                  ai.defaultProvider === provider.id
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                    : hasKey
                    ? 'border-neural-border hover:border-gray-600 cursor-pointer'
                    : 'border-neural-border opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span>{providerIcons[provider.id] || '🤖'}</span>
                    {provider.name}
                  </span>
                  {ai.defaultProvider === provider.id && <Check className="w-4 h-4 text-primary" />}
                </div>
                <div className="text-xs text-muted-foreground">
                  {hasKey ? provider.models.find(m => m.id === provider.selectedModel)?.name || provider.selectedModel : 'Add API key to enable'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider API Keys & Model Selection */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Provider Configuration
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Add your own API keys to use premium models. Keys are stored locally in your browser — never sent to our servers.
        </p>
        <div className="space-y-4">
          {ai.providers.map((provider) => {
            const hasKey = provider.apiKey.trim().length > 0;
            const isActive = ai.defaultProvider === provider.id;
            return (
              <div
                key={provider.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-neural-border bg-neural-panel'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{providerIcons[provider.id] || '🤖'}</span>
                    <span className="text-sm font-semibold text-foreground">{provider.name}</span>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        ACTIVE
                      </span>
                    )}
                    {hasKey && !isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                        READY
                      </span>
                    )}
                  </div>
                  {hasKey && (
                    <button
                      onClick={() => {
                        setActiveProvider(provider.id);
                        updateProvider(provider.id, { enabled: true });
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary/20 text-primary'
                          : 'bg-neural-input text-muted-foreground hover:text-foreground hover:bg-white/5'
                      }`}
                    >
                      {isActive ? 'Active' : 'Use this'}
                    </button>
                  )}
                </div>

                {/* API Key Input */}
                <div className="mb-3">
                  <label className="text-xs text-muted-foreground mb-1.5 block">API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys[provider.id] ? 'text' : 'password'}
                      value={provider.apiKey}
                      onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                      placeholder={`Enter your ${provider.name} API key...`}
                      className="w-full px-3 py-2 pr-10 bg-neural-input border border-neural-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50 font-mono"
                    />
                    <button
                      onClick={() => toggleKeyVisibility(provider.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Model</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {provider.models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => updateProvider(provider.id, { selectedModel: model.id })}
                        className={`px-3 py-2 rounded-lg border text-left transition-all text-sm ${
                          provider.selectedModel === model.id
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-neural-border hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground text-xs">{model.name}</span>
                          {provider.selectedModel === model.id && <Check className="w-3 h-3 text-primary" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{model.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual-AI Behavior */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Dual-AI Behavior</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Collaboration Mode</label>
            <select
              value={ai.collaborationMode}
              onChange={(e) => setAI({ collaborationMode: e.target.value as any })}
              className="w-full px-3 py-2 bg-neural-input border border-neural-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="balanced">Balanced - Equal input from both</option>
              <option value="sage-led">Sage-led - Learning focused</option>
              <option value="forge-led">Forge-led - Productivity focused</option>
            </select>
          </div>

          <div className="space-y-3">
            {[
              { key: 'autoSuggest', label: 'Auto-suggest completions' },
              { key: 'suggestOnType', label: 'Suggest as you type' },
              { key: 'explainOnHover', label: 'Explain code on hover' },
              { key: 'showInlineCompletions', label: 'Show inline completions' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{item.label}</span>
                <button
                  onClick={() => setAI({ [item.key]: !(ai as any)[item.key] } as any)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    (ai as any)[item.key] ? 'bg-primary' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      (ai as any)[item.key] ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Advanced</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Max Tokens</label>
            <input
              type="number"
              value={ai.maxTokens}
              onChange={(e) => setAI({ maxTokens: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-neural-input border border-neural-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Temperature</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={ai.temperature}
              onChange={(e) => setAI({ temperature: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-neural-input border border-neural-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MCPSettings: React.FC = () => {
  const mcp = useSettingsStore((state) => state.mcp);
  const setMCP = useSettingsStore((state) => state.setMCP);
  const BACKEND_URL = 'http://localhost:3001';

  const syncActiveServer = async (server: MCPServerProfile) => {
    try {
      await fetch(`${BACKEND_URL}/mcp/connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: server.id, url: server.url || null }),
      });
    } catch (error) {
      console.error('Failed to sync MCP server:', error);
    }
  };

  const getNextActiveServerId = (servers: MCPServerProfile[], currentId: string) => {
    const currentActive = servers.find((server) => server.id === currentId && server.enabled);
    if (currentActive) return currentId;
    const firstEnabled = servers.find((server) => server.enabled);
    return firstEnabled?.id ?? servers[0]?.id ?? '';
  };

  const updateServers = (servers: MCPServerProfile[], nextActiveId = mcp.activeServerId) => {
    const activeServerId = getNextActiveServerId(servers, nextActiveId);
    setMCP({ servers, activeServerId });
  };

  const updateServer = (id: string, patch: Partial<MCPServerProfile>) => {
    const servers = mcp.servers.map((server) =>
      server.id === id ? { ...server, ...patch } : server
    );
    updateServers(servers);
  };

  const setActiveServer = (id: string) => {
    const servers = mcp.servers.map((server) =>
      server.id === id ? { ...server, enabled: true } : server
    );
    updateServers(servers, id);
    const active = servers.find((server) => server.id === id);
    if (active) {
      void syncActiveServer(active);
    }
  };

  const toggleServer = (id: string) => {
    const servers = mcp.servers.map((server) =>
      server.id === id ? { ...server, enabled: !server.enabled } : server
    );
    updateServers(servers);
  };

  const addServer = () => {
    const newServer: MCPServerProfile = {
      id: `custom-${Date.now()}`,
      name: 'Custom MCP',
      url: '',
      enabled: true,
      kind: 'community',
      description: 'Custom endpoint',
      isCustom: true,
    };
    updateServers([...mcp.servers, newServer], newServer.id);
  };

  const removeServer = (id: string) => {
    const servers = mcp.servers.filter((server) => server.id !== id);
    updateServers(servers);
  };

  const activeServer = mcp.servers.find((server) => server.id === mcp.activeServerId);
  const activeLabel = activeServer?.name ?? 'No active server';
  const activeUrl = activeServer?.url || 'Set an endpoint to connect';
  const kindLabels: Record<string, string> = {
    local: 'Local',
    reference: 'Reference',
    community: 'Community',
    official: 'Official',
  };

  React.useEffect(() => {
    if (activeServer) {
      void syncActiveServer(activeServer);
    }
  }, [activeServer?.id, activeServer?.url]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/30">
        <div>
          <div className="text-sm font-medium text-foreground">MCP Server Status</div>
          <div className="text-xs text-primary">
            {activeServer?.enabled ? `${activeLabel} selected` : 'No active server'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-primary">Ready</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-neural-panel border border-neural-border">
        <div className="text-sm text-gray-400 mb-1">Active MCP Server</div>
        <div className="text-base font-semibold text-white">{activeLabel}</div>
        <div className="text-xs text-gray-500">{activeUrl}</div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Connections</h3>
          <button
            onClick={addServer}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-forge text-neural-bg text-sm font-medium hover:bg-forge/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Server
          </button>
        </div>

        <div className="space-y-3">
          {mcp.servers.map((server) => (
            <div
              key={server.id}
              className="p-4 rounded-xl bg-neural-panel border border-neural-border"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveServer(server.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      mcp.activeServerId === server.id
                        ? 'bg-forge/20 border-forge text-forge'
                        : 'bg-neural-input border-neural-border text-gray-400 hover:text-white'
                    }`}
                  >
                    {mcp.activeServerId === server.id ? 'Active' : 'Set Active'}
                  </button>

                  <input
                    type="text"
                    value={server.name}
                    onChange={(e) => updateServer(server.id, { name: e.target.value })}
                    className="px-3 py-1.5 bg-neural-input border border-neural-border rounded-lg text-sm text-white focus:outline-none focus:border-forge/50"
                  />

                  {server.kind && (
                    <span className="text-xs px-2 py-1 rounded-full bg-neural-input text-gray-400 border border-neural-border">
                      {kindLabels[server.kind] ?? server.kind}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleServer(server.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      server.enabled ? 'bg-forge' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        server.enabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>

                  {server.isCustom && (
                    <button
                      onClick={() => removeServer(server.id)}
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
                      title="Remove server"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <label className="text-sm text-gray-400 mb-2 block">Server URL</label>
                <input
                  type="text"
                  value={server.url}
                  onChange={(e) => updateServer(server.id, { url: e.target.value })}
                  onBlur={() => {
                    if (server.id === mcp.activeServerId) {
                      void syncActiveServer(server);
                    }
                  }}
                  placeholder="https://your-mcp-host or http://localhost:3001"
                  className="w-full px-3 py-2 bg-neural-input border border-neural-border rounded-lg text-white text-sm focus:outline-none focus:border-forge/50"
                />
                {server.description && (
                  <div className="mt-2 text-xs text-gray-500">{server.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Indexing</h3>
        <div className="space-y-3">
          {[
            { key: 'autoIndex', label: 'Auto-index new projects' },
            { key: 'indexOnSave', label: 'Re-index on file save' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-300">{item.label}</span>
              <button
                onClick={() => setMCP({ [item.key]: !(mcp as any)[item.key] } as any)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  (mcp as any)[item.key] ? 'bg-forge' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    (mcp as any)[item.key] ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Context Depth</label>
            <input
              type="range"
              min="1"
              max="5"
              value={mcp.contextDepth}
              onChange={(e) => setMCP({ contextDepth: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Shallow</span>
              <span>Deep</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Exclude Patterns</h3>
        <div className="flex flex-wrap gap-2">
          {mcp.excludePatterns.map((pattern, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-neural-input text-sm text-gray-400 border border-neural-border"
            >
              {pattern}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const ShortcutsSettings: React.FC = () => {
  const shortcuts = useSettingsStore((state) => state.shortcuts);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {Object.entries(shortcuts).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-lg bg-neural-input border border-neural-border"
            >
              <span className="text-sm text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <button
                onClick={() => setEditingKey(editingKey === key ? null : key)}
                className="px-3 py-1.5 rounded bg-neural-panel text-sm font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {value}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('theme');
  const [saved, setSaved] = useState(false);
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  const { navigate } = useContext(NavigationContext);

  const handleSave = () => {
    console.log('Settings saved (already persisted by Zustand)');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'theme':
        return <ThemeSettings />;
      case 'editor':
        return <EditorSettings />;
      case 'ai':
        return <AISettings />;
      case 'mcp':
        return <MCPSettings />;
      case 'shortcuts':
        return <ShortcutsSettings />;
      default:
        return <ThemeSettings />;
    }
  };

  return (
    <div className="h-full flex bg-neural-bg">
      {/* Sidebar */}
      <div className="w-64 border-r border-neural-border bg-neural-panel">
        <div className="p-4 border-b border-neural-border">
          <button
            onClick={() => navigate('editor')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Editor</span>
          </button>
        </div>

        <div className="p-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-primary' : ''}`} />
              <div>
                <div className="text-sm font-medium">{section.name}</div>
                <div className="text-xs text-muted-foreground">{section.description}</div>
              </div>
              <ChevronRight className={`w-4 h-4 ml-auto ${activeSection === section.id ? 'text-primary' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              {sections.find((s) => s.id === activeSection)?.name}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={resetSettings}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neural-input text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save'}
              </button>
            </div>
          </div>

          {renderSection()}
        </div>
      </div>
    </div>
  );
};
