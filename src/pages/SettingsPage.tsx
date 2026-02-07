import React, { useState, useContext, useEffect, useCallback } from 'react';
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
  Loader2,
  CloudOff,
  Cloud,
  AlertTriangle,
  Zap,
  Settings2,
  Sparkles,
  Database,
  CheckCircle,
} from 'lucide-react';
import { type MCPServerProfile, useSettingsStore, type AIProviderConfig } from '@/store/settingsStore';
import { NavigationContext } from '@/App';
import { useAuth } from '@/hooks/useAuth';
import { loadUserSettings, saveUserSettings } from '@/services/settingsService';
import { toast } from 'sonner';

// ─── Section definitions ──────────────────────────────────────────

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const sections: SettingsSection[] = [
  { id: 'ai', name: 'AI & Models', icon: Brain, description: 'Provider, API keys, models' },
  { id: 'theme', name: 'Theme', icon: Palette, description: 'Colors and appearance' },
  { id: 'editor', name: 'Editor', icon: Type, description: 'Font, spacing, behavior' },
  { id: 'mcp', name: 'MCP Server', icon: Server, description: 'Context and indexing' },
  { id: 'shortcuts', name: 'Shortcuts', icon: Keyboard, description: 'Key bindings' },
];

// ─── Provider metadata ─────────────────────────────────────────────

const providerMeta: Record<string, { icon: string; color: string; docsUrl: string }> = {
  openai: { icon: '🟢', color: 'text-green-400', docsUrl: 'https://platform.openai.com/api-keys' },
  anthropic: { icon: '🟠', color: 'text-orange-400', docsUrl: 'https://console.anthropic.com/settings/keys' },
  google: { icon: '🔵', color: 'text-blue-400', docsUrl: 'https://makersuite.google.com/app/apikey' },
  groq: { icon: '⚡', color: 'text-yellow-400', docsUrl: 'https://console.groq.com/keys' },
  mistral: { icon: '🟣', color: 'text-purple-400', docsUrl: 'https://console.mistral.ai/api-keys' },
  deepseek: { icon: '🐋', color: 'text-cyan-400', docsUrl: 'https://platform.deepseek.com/api_keys' },
};

// ─── Toggle Switch ──────────────────────────────────────────────────

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; size?: 'sm' | 'md' }> = ({
  enabled, onChange, size = 'md',
}) => (
  <button
    onClick={onChange}
    className={`${size === 'sm' ? 'w-9 h-5' : 'w-11 h-6'} rounded-full transition-colors relative ${
      enabled ? 'bg-violet-500' : 'bg-white/10'
    }`}
  >
    <span
      className={`absolute top-0.5 ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-white transition-transform shadow-sm ${
        enabled ? (size === 'sm' ? 'left-[18px]' : 'left-[22px]') : 'left-0.5'
      }`}
    />
  </button>
);

// ─── AI & Models Settings ───────────────────────────────────────────

const AIModelSettings: React.FC<{ onDirty: () => void }> = ({ onDirty }) => {
  const ai = useSettingsStore((s) => s.ai);
  const setAI = useSettingsStore((s) => s.setAI);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, 'testing' | 'ok' | 'fail'>>({});

  const toggleKeyVisibility = (id: string) => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));

  const updateProvider = (id: string, patch: Partial<AIProviderConfig>) => {
    const providers = ai.providers.map(p => p.id === id ? { ...p, ...patch } : p);
    setAI({ providers });
    onDirty();
  };

  const setActiveProvider = (id: string) => {
    setAI({ defaultProvider: id });
    onDirty();
  };

  const testApiKey = async (provider: AIProviderConfig) => {
    setTestResult(prev => ({ ...prev, [provider.id]: 'testing' }));
    try {
      let ok = false;
      if (provider.id === 'google') {
        const url = `${provider.baseUrl}/models/${provider.selectedModel}:generateContent?key=${provider.apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Say hi' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        });
        ok = res.ok;
      } else if (provider.id === 'anthropic') {
        const res = await fetch(`${provider.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': provider.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: provider.selectedModel,
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 5,
          }),
        });
        ok = res.ok;
      } else {
        // OpenAI-compatible (OpenAI, Groq, Mistral, DeepSeek)
        const res = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`,
          },
          body: JSON.stringify({
            model: provider.selectedModel,
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 5,
          }),
        });
        ok = res.ok;
      }
      setTestResult(prev => ({ ...prev, [provider.id]: ok ? 'ok' : 'fail' }));
      if (ok) toast.success(`${provider.name} API key is valid`);
      else toast.error(`${provider.name} API key test failed`);
    } catch {
      setTestResult(prev => ({ ...prev, [provider.id]: 'fail' }));
      toast.error(`${provider.name} connection failed`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Provider */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-white">Active AI Provider</h3>
        </div>
        <p className="text-xs text-white/40 mb-5">
          Choose which AI provider powers code generation, explanations, and fixes.
          Add your own API key below to use premium models.
        </p>

        {/* Built-in default */}
        <button
          onClick={() => setActiveProvider('default')}
          className={`w-full p-4 rounded-xl border text-left transition-all mb-3 ${
            ai.defaultProvider === 'default'
              ? 'border-violet-500/50 bg-violet-500/10 ring-1 ring-violet-500/20'
              : 'border-white/[0.06] hover:border-white/10 bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  Built-in (Default)
                  {ai.defaultProvider === 'default' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/30 text-violet-300 font-bold tracking-wider">ACTIVE</span>
                  )}
                </div>
                <div className="text-xs text-white/40">Mistral + GLM fallback · No API key needed</div>
              </div>
            </div>
            {ai.defaultProvider === 'default' && <CheckCircle className="w-5 h-5 text-violet-400" />}
          </div>
        </button>

        {/* Provider cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ai.providers.map(provider => {
            const meta = providerMeta[provider.id];
            const hasKey = provider.apiKey.trim().length > 0;
            const isActive = ai.defaultProvider === provider.id;
            const isExpanded = expandedProvider === provider.id;
            const test = testResult[provider.id];

            return (
              <div
                key={provider.id}
                className={`rounded-xl border transition-all ${
                  isActive
                    ? 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/20'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
                }`}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{meta?.icon || '🤖'}</span>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          {provider.name}
                          {isActive && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/30 text-violet-300 font-bold tracking-wider">ACTIVE</span>
                          )}
                          {hasKey && !isActive && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold tracking-wider">READY</span>
                          )}
                        </div>
                        <div className="text-xs text-white/40">
                          {hasKey
                            ? `Model: ${provider.models.find(m => m.id === provider.selectedModel)?.name || provider.selectedModel}`
                            : 'Click to add API key'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded configuration */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-white/[0.04] pt-4">
                    {/* API Key input */}
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Key className="w-3 h-3" /> API Key
                        </span>
                        {meta?.docsUrl && (
                          <a
                            href={meta.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 hover:text-violet-300 transition-colors"
                          >
                            Get key →
                          </a>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showKeys[provider.id] ? 'text' : 'password'}
                            value={provider.apiKey}
                            onChange={e => updateProvider(provider.id, { apiKey: e.target.value })}
                            placeholder={`Enter your ${provider.name} API key...`}
                            className="w-full px-3 py-2 pr-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/40 font-mono placeholder:text-white/20"
                          />
                          <button
                            onClick={() => toggleKeyVisibility(provider.id)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                          >
                            {showKeys[provider.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {/* Test key button */}
                        {hasKey && (
                          <button
                            onClick={() => testApiKey(provider)}
                            disabled={test === 'testing'}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 border ${
                              test === 'ok'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : test === 'fail'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-white/[0.04] text-white/50 border-white/[0.08] hover:text-white/80'
                            }`}
                          >
                            {test === 'testing' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : test === 'ok' ? (
                              <span className="flex items-center gap-1"><Check className="w-3 h-3" />Valid</span>
                            ) : test === 'fail' ? (
                              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Failed</span>
                            ) : (
                              'Test'
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-white/20 mt-1.5">
                        Keys are stored in your browser and synced to your account when you save. Never sent to our servers.
                      </p>
                    </div>

                    {/* Model selection */}
                    <div>
                      <label className="text-xs text-white/50 mb-2 block flex items-center gap-1.5">
                        <Settings2 className="w-3 h-3" /> Choose Model
                      </label>
                      <div className="space-y-1.5">
                        {provider.models.map(model => (
                          <button
                            key={model.id}
                            onClick={() => updateProvider(provider.id, { selectedModel: model.id })}
                            className={`w-full px-3 py-2.5 rounded-lg border text-left transition-all ${
                              provider.selectedModel === model.id
                                ? 'border-violet-500/40 bg-violet-500/10'
                                : 'border-white/[0.06] hover:border-white/10 bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs font-medium text-white">{model.name}</div>
                                <div className="text-[10px] text-white/30 mt-0.5">{model.description}</div>
                              </div>
                              {provider.selectedModel === model.id && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Activate button */}
                    {hasKey && (
                      <button
                        onClick={() => {
                          setActiveProvider(provider.id);
                          updateProvider(provider.id, { enabled: true });
                        }}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/20'
                        }`}
                      >
                        {isActive ? '✓ Currently Active' : `Use ${provider.name}`}
                      </button>
                    )}

                    {/* Remove key */}
                    {hasKey && (
                      <button
                        onClick={() => {
                          updateProvider(provider.id, { apiKey: '', enabled: false });
                          if (isActive) setActiveProvider('default');
                          setTestResult(prev => { const n = { ...prev }; delete n[provider.id]; return n; });
                        }}
                        className="w-full py-1.5 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        Remove API key
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Generation Parameters */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Generation Parameters</h3>
        </div>
        <p className="text-xs text-white/40 mb-4">Controls how the AI generates responses.</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Max Tokens</label>
            <input
              type="number"
              value={ai.maxTokens}
              onChange={e => { setAI({ maxTokens: parseInt(e.target.value) || 2048 }); onDirty(); }}
              min={256}
              max={32768}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/40"
            />
            <span className="text-[10px] text-white/25 mt-1 block">256 – 32,768</span>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Temperature</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={ai.temperature}
                onChange={e => { setAI({ temperature: parseFloat(e.target.value) }); onDirty(); }}
                className="flex-1 accent-violet-500"
              />
              <span className="text-sm text-white/60 font-mono w-10 text-right">{ai.temperature.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Behavior */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-white">AI Behavior</h3>
        </div>
        <p className="text-xs text-white/40 mb-4">Toggle AI assistant features.</p>

        <div className="space-y-1">
          {[
            { key: 'autoSuggest', label: 'Auto-suggest completions', desc: 'AI suggests code as you type' },
            { key: 'suggestOnType', label: 'Suggest on type', desc: 'Show suggestions while typing' },
            { key: 'explainOnHover', label: 'Explain on hover', desc: 'Hover over code for AI explanations' },
            { key: 'showInlineCompletions', label: 'Inline completions', desc: 'Ghost text completions in editor' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div>
                <div className="text-sm text-white">{item.label}</div>
                <div className="text-[10px] text-white/30">{item.desc}</div>
              </div>
              <ToggleSwitch
                enabled={(ai as any)[item.key]}
                onChange={() => { setAI({ [item.key]: !(ai as any)[item.key] } as any); onDirty(); }}
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-xs text-white/50 mb-1.5 block">Collaboration Mode</label>
          <select
            value={ai.collaborationMode}
            onChange={e => { setAI({ collaborationMode: e.target.value as any }); onDirty(); }}
            className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/40"
          >
            <option value="balanced">Balanced — Equal input from both AIs</option>
            <option value="sage-led">Sage-led — Learning focused</option>
            <option value="forge-led">Forge-led — Productivity focused</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// ─── Theme Settings ─────────────────────────────────────────────────

const ThemeSettings: React.FC<{ onDirty: () => void }> = ({ onDirty }) => {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const themes = [
    { id: 'neural-dark', name: 'Neural Dark', icon: Moon, description: 'Default dark theme' },
    { id: 'neural-light', name: 'Neural Light', icon: Sun, description: 'Light variant' },
    { id: 'high-contrast', name: 'High Contrast', icon: Contrast, description: 'Maximum accessibility' },
  ];

  const accents = [
    { id: 'sage', name: 'Sage (Cyan)', color: '#00d4ff' },
    { id: 'forge', name: 'Forge (Green)', color: '#00ff9d' },
    { id: 'sync', name: 'Sync (Purple)', color: '#a855f7' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Color Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme({ mode: t.id as any }); onDirty(); }}
              className={`p-4 rounded-xl border transition-all ${
                theme.mode === t.id
                  ? 'border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/20'
                  : 'border-white/[0.06] hover:border-white/10 bg-white/[0.02]'
              }`}
            >
              <t.icon className={`w-6 h-6 mb-2 ${theme.mode === t.id ? 'text-violet-400' : 'text-white/30'}`} />
              <div className="text-sm font-medium text-white">{t.name}</div>
              <div className="text-[11px] text-white/40">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Accent Color</h3>
        <div className="flex gap-4">
          {accents.map(accent => (
            <button
              key={accent.id}
              onClick={() => { setTheme({ accentColor: accent.id as any }); onDirty(); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                theme.accentColor === accent.id
                  ? 'border-violet-500/40 bg-violet-500/10'
                  : 'border-white/[0.06] hover:border-white/10'
              }`}
            >
              <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: accent.color, boxShadow: `0 0 10px ${accent.color}40` }} />
              <span className="text-sm text-white">{accent.name}</span>
              {theme.accentColor === accent.id && <Check className="w-4 h-4 text-violet-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Editor Settings ────────────────────────────────────────────────

const EditorSettingsPanel: React.FC<{ onDirty: () => void }> = ({ onDirty }) => {
  const editor = useSettingsStore((s) => s.editor);
  const setEditor = useSettingsStore((s) => s.setEditor);

  const updateEditor = (patch: any) => { setEditor(patch); onDirty(); };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Font</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Font Family</label>
            <select
              value={editor.fontFamily}
              onChange={e => updateEditor({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/40"
            >
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Fira Code">Fira Code</option>
              <option value="Cascadia Code">Cascadia Code</option>
              <option value="Source Code Pro">Source Code Pro</option>
              <option value="IBM Plex Mono">IBM Plex Mono</option>
              <option value="monospace">System Monospace</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Font Size</label>
            <input
              type="number"
              value={editor.fontSize}
              onChange={e => updateEditor({ fontSize: parseInt(e.target.value) || 14 })}
              min={10}
              max={24}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/40"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Spacing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Line Height</label>
            <input
              type="number"
              step="0.1"
              value={editor.lineHeight}
              onChange={e => updateEditor({ lineHeight: parseFloat(e.target.value) || 1.6 })}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/40"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Tab Size</label>
            <input
              type="number"
              value={editor.tabSize}
              onChange={e => updateEditor({ tabSize: parseInt(e.target.value) || 2 })}
              min={1}
              max={8}
              className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/40"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
        <div className="space-y-1">
          {[
            { key: 'minimap', label: 'Show Minimap', desc: 'Code overview on the right' },
            { key: 'bracketPairColorization', label: 'Bracket Pair Colorization', desc: 'Color-match bracket pairs' },
            { key: 'smoothScrolling', label: 'Smooth Scrolling', desc: 'Animated scroll behavior' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div>
                <div className="text-sm text-white">{item.label}</div>
                <div className="text-[10px] text-white/30">{item.desc}</div>
              </div>
              <ToggleSwitch
                enabled={(editor as any)[item.key]}
                onChange={() => updateEditor({ [item.key]: !(editor as any)[item.key] })}
              />
            </div>
          ))}

          <div className="flex items-center justify-between py-2.5 px-3">
            <div>
              <div className="text-sm text-white">Word Wrap</div>
              <div className="text-[10px] text-white/30">Wrap long lines</div>
            </div>
            <select
              value={editor.wordWrap}
              onChange={e => updateEditor({ wordWrap: e.target.value })}
              className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded text-sm text-white focus:outline-none focus:border-violet-500/40"
            >
              <option value="off">Off</option>
              <option value="on">On</option>
              <option value="wordWrapColumn">At Column</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2.5 px-3">
            <div>
              <div className="text-sm text-white">Cursor Style</div>
              <div className="text-[10px] text-white/30">Editor cursor shape</div>
            </div>
            <select
              value={editor.cursorStyle}
              onChange={e => updateEditor({ cursorStyle: e.target.value })}
              className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded text-sm text-white focus:outline-none focus:border-violet-500/40"
            >
              <option value="line">Line</option>
              <option value="block">Block</option>
              <option value="underline">Underline</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MCP Settings ───────────────────────────────────────────────────

const MCPSettingsPanel: React.FC<{ onDirty: () => void }> = ({ onDirty }) => {
  const mcp = useSettingsStore((s) => s.mcp);
  const setMCP = useSettingsStore((s) => s.setMCP);

  const updateServers = (servers: MCPServerProfile[], nextActive = mcp.activeServerId) => {
    const active = servers.find(s => s.id === nextActive && s.enabled);
    const activeServerId = active?.id ?? servers.find(s => s.enabled)?.id ?? servers[0]?.id ?? '';
    setMCP({ servers, activeServerId });
    onDirty();
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

  const kindLabels: Record<string, string> = {
    local: 'Local', reference: 'Ref', community: 'Community', official: 'Official',
  };

  return (
    <div className="space-y-8">
      {/* Active server */}
      <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">
              {mcp.servers.find(s => s.id === mcp.activeServerId)?.name || 'No active server'}
            </div>
            <div className="text-xs text-white/40">
              {mcp.servers.find(s => s.id === mcp.activeServerId)?.url || 'Set an endpoint'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Active</span>
          </div>
        </div>
      </div>

      {/* Server list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Connections</h3>
          <button
            onClick={addServer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-300 text-xs font-medium hover:bg-violet-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Server
          </button>
        </div>

        <div className="space-y-3">
          {mcp.servers.map(server => (
            <div key={server.id} className={`p-4 rounded-xl border transition-all ${
              mcp.activeServerId === server.id ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/[0.06] bg-white/[0.02]'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateServers(mcp.servers.map(s => s.id === server.id ? { ...s, enabled: true } : s), server.id)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                      mcp.activeServerId === server.id ? 'bg-violet-500/20 text-violet-300' : 'bg-white/[0.04] text-white/40 hover:text-white/80'
                    }`}
                  >
                    {mcp.activeServerId === server.id ? 'Active' : 'Set Active'}
                  </button>
                  <span className="text-sm text-white font-medium">{server.name}</span>
                  {server.kind && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30">{kindLabels[server.kind] ?? server.kind}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    enabled={server.enabled}
                    onChange={() => updateServers(mcp.servers.map(s => s.id === server.id ? { ...s, enabled: !s.enabled } : s))}
                    size="sm"
                  />
                  {server.isCustom && (
                    <button
                      onClick={() => updateServers(mcp.servers.filter(s => s.id !== server.id))}
                      className="p-1.5 rounded hover:bg-white/5 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={server.url}
                onChange={e => updateServers(mcp.servers.map(s => s.id === server.id ? { ...s, url: e.target.value } : s))}
                placeholder="http://localhost:3001"
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/40 font-mono placeholder:text-white/15"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Indexing */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Indexing</h3>
        <div className="space-y-1">
          {[
            { key: 'autoIndex', label: 'Auto-index new projects' },
            { key: 'indexOnSave', label: 'Re-index on file save' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02]">
              <span className="text-sm text-white">{item.label}</span>
              <ToggleSwitch
                enabled={(mcp as any)[item.key]}
                onChange={() => { setMCP({ [item.key]: !(mcp as any)[item.key] } as any); onDirty(); }}
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-xs text-white/50 mb-2 block">Context Depth</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="5"
              value={mcp.contextDepth}
              onChange={e => { setMCP({ contextDepth: parseInt(e.target.value) }); onDirty(); }}
              className="flex-1 accent-violet-500"
            />
            <span className="text-sm text-white/60 font-mono w-6 text-center">{mcp.contextDepth}</span>
          </div>
          <div className="flex justify-between text-[10px] text-white/25 mt-1">
            <span>Shallow</span>
            <span>Deep</span>
          </div>
        </div>
      </div>

      {/* Exclude patterns */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Exclude Patterns</h3>
        <div className="flex flex-wrap gap-2">
          {mcp.excludePatterns.map((pattern, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-xs text-white/40 border border-white/[0.06] font-mono">
              {pattern}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Shortcuts Settings ─────────────────────────────────────────────

const ShortcutsSettings: React.FC<{ onDirty: () => void }> = ({ onDirty }) => {
  const shortcuts = useSettingsStore((s) => s.shortcuts);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Keyboard Shortcuts</h3>
      <div className="space-y-1">
        {Object.entries(shortcuts).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
            <span className="text-sm text-white capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs font-mono text-white/50 border border-white/[0.08]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Settings Page ─────────────────────────────────────────────

export const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('ai');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'error'>('local');
  const resetSettings = useSettingsStore((s) => s.resetSettings);
  const { navigate } = useContext(NavigationContext);
  const { user } = useAuth();

  const markDirty = useCallback(() => setIsDirty(true), []);

  // Load settings from DB on mount
  useEffect(() => {
    const load = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        setSyncStatus('local');
        return;
      }
      try {
        const found = await loadUserSettings(user.uid);
        setSyncStatus(found ? 'synced' : 'local');
      } catch {
        setSyncStatus('error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  // Save all settings to DB + Zustand
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user?.uid) {
        const ok = await saveUserSettings(user.uid);
        if (ok) {
          setSyncStatus('synced');
          toast.success('Settings saved to cloud');
        } else {
          setSyncStatus('error');
          toast.error('Failed to save to cloud — saved locally');
        }
      } else {
        toast.success('Settings saved locally');
      }
      setIsDirty(false);
    } catch {
      setSyncStatus('error');
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetSettings();
    setIsDirty(true);
    toast.info('Settings reset to defaults — click Save to persist');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'ai': return <AIModelSettings onDirty={markDirty} />;
      case 'theme': return <ThemeSettings onDirty={markDirty} />;
      case 'editor': return <EditorSettingsPanel onDirty={markDirty} />;
      case 'mcp': return <MCPSettingsPanel onDirty={markDirty} />;
      case 'shortcuts': return <ShortcutsSettings onDirty={markDirty} />;
      default: return <AIModelSettings onDirty={markDirty} />;
    }
  };

  return (
    <div className="h-full flex bg-[#09090f]">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/[0.06] bg-[#0a0a12] flex flex-col">
        <div className="p-4 border-b border-white/[0.06]">
          <button
            onClick={() => navigate('editor')}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Editor</span>
          </button>
        </div>

        <div className="flex-1 p-2 space-y-0.5">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                activeSection === section.id
                  ? 'bg-violet-500/10 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
              }`}
            >
              <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-violet-400' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{section.name}</div>
                <div className="text-[10px] text-white/25 truncate">{section.description}</div>
              </div>
              {activeSection === section.id && (
                <div className="w-1 h-4 rounded-full bg-violet-500" />
              )}
            </button>
          ))}
        </div>

        {/* Sync status */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-[11px]">
            {syncStatus === 'synced' && (
              <><Cloud className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Synced to cloud</span></>
            )}
            {syncStatus === 'local' && (
              <><CloudOff className="w-3.5 h-3.5 text-white/30" /><span className="text-white/30">{user ? 'Not synced yet' : 'Local only (sign in to sync)'}</span></>
            )}
            {syncStatus === 'error' && (
              <><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-400">Sync failed</span></>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {sections.find(s => s.id === activeSection)?.name}
              </h1>
              <p className="text-xs text-white/30 mt-1">
                {sections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-white/[0.06] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  isDirty
                    ? 'bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/20'
                    : 'bg-violet-500/20 text-violet-300'
                }`}
              >
                {isSaving ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                ) : isDirty ? (
                  <><Save className="w-3.5 h-3.5" /> Save Changes</>
                ) : (
                  <><Database className="w-3.5 h-3.5" /> Saved</>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
              <span className="ml-3 text-sm text-white/40">Loading settings...</span>
            </div>
          ) : (
            renderSection()
          )}
        </div>
      </div>
    </div>
  );
};
