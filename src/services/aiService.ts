// AI Service - Multi-provider support with Supabase Edge Function as default fallback
//
// Provider priority:
//  1. If the user has set an API key for a provider in Settings → AI → Providers,
//     we call that provider's API directly from the client.
//  2. Otherwise, we fall back to the built-in Supabase Edge Function
//     (Mistral primary + GLM fallback, keys managed server-side).

import { useSettingsStore, type AIProviderConfig } from '@/store/settingsStore';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const AI_ENDPOINT = `${SUPABASE_URL}/functions/v1/ai-code-gen`;

export interface AIRequestPayload {
  message: string;
  mode: 'create' | 'explain' | 'analyze' | 'improve' | 'fix';
  messages?: { role: string; content: string }[];
  context?: {
    currentFile?: string | null;
    currentFileContent?: string | null;
    selectedCode?: string | null;
    projectContext?: string[];
    projectFiles?: { name: string; content: string; language: string }[];
  };
}

export interface AIResponse {
  response: string;
  model?: string;
  provider?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
  details?: string;
}

// ── Build system prompt (shared across all providers) ──
function buildClientSystemPrompt(mode: string, context?: AIRequestPayload['context']): string {
  const fileContext = context?.currentFileContent
    ? `\n\nCurrent file "${context.currentFile || 'untitled'}":\n\`\`\`\n${context.currentFileContent}\n\`\`\``
    : '';

  const projectContext = context?.projectFiles?.length
    ? `\n\nOther project files:\n${context.projectFiles.map(f => `--- ${f.name} (${f.language}) ---\n${f.content?.slice(0, 1500)}`).join('\n\n')}`
    : '';

  switch (mode) {
    case 'create':
      return `You are an expert full-stack developer. Generate production-quality code based on the user's request.

RULES:
- Return code in fenced code blocks with language tags and file paths: \`\`\`tsx:src/components/MyComponent.tsx
- Include a package.json if external packages are needed
- Use modern best practices (React hooks, TypeScript, Tailwind CSS)
- Make the code complete and runnable — no placeholders or TODOs
- For multi-file projects, generate ALL necessary files
- Always include proper imports and exports${fileContext}${projectContext}`;

    case 'explain':
      return `You are a senior engineer helping a teammate understand a file. Be direct and concise.

Return a JSON object with EXACTLY this structure:
{
  "responsibility": "One or two sentences: what this file is responsible for.",
  "why": "Why it's structured this way. Keep it brief — 2-3 sentences max.",
  "keyDetail": "One critical thing someone modifying this file must know.",
  "improvement": "One concrete, optional improvement — or null if the code is fine."
}

RULES:
- Sound like a helpful teammate, not a textbook.
- No filler words. No "this code is a...". Just say what it does.
- Do NOT include: overviews, concepts lists, complexity analysis, best practices, related concepts, SEO advice.
- If the code is simple, keep the entire response under 6 lines.
- Every sentence must help someone understand or modify the file. If it doesn't — cut it.${fileContext}${projectContext}`;

    case 'analyze':
      return `You are a senior engineer doing a quick code review for a teammate. Be direct.

Return a JSON object with EXACTLY this structure:
{
  "responsibility": "What this file/code is responsible for. 1-2 sentences.",
  "why": "Why it's built this way. Architectural reasoning in 2-3 sentences.",
  "keyDetail": "The most important thing to know before changing this code.",
  "improvement": "One specific, actionable improvement — or null if it's solid."
}

RULES:
- Sound like a senior engineer in a PR review, not a tutorial.
- No filler. No generic advice. No complexity theory.
- Every sentence must be directly useful for understanding or modifying this code.${fileContext}${projectContext}`;

    case 'improve':
      return `You are an expert developer. Improve the provided code based on the user's request.

RULES:
- Return the COMPLETE improved file(s) in fenced code blocks with file paths
- Keep existing functionality unless told to change it
- Apply best practices, fix bugs, improve performance
- Include a brief explanation of what changed and why
- Format: \`\`\`tsx:src/filename.tsx${fileContext}${projectContext}`;

    case 'fix':
      return `You are a senior engineer fixing a build/runtime error. The user will give you the error log and the project files.

RULES:
- Analyze the error log to identify the root cause.
- Return ONLY the fixed file(s) in fenced code blocks with file paths: \`\`\`tsx:src/components/MyComponent.tsx
- Fix the actual error — do not refactor or "improve" unrelated code.
- If a missing dependency is the cause, include an updated package.json.
- Before the code blocks, write ONE sentence explaining what was wrong.
- Be precise. No filler.${fileContext}${projectContext}`;

    default:
      return `You are an expert programming assistant. Help the user with their coding request.${fileContext}${projectContext}`;
  }
}

// ── Truncate context to manage payload size ──
function truncatePayload(payload: AIRequestPayload): AIRequestPayload {
  const p = { ...payload, context: payload.context ? { ...payload.context } : undefined };
  if (p.context?.projectFiles) {
    p.context.projectFiles = p.context.projectFiles.slice(0, 3).map(f => ({
      ...f,
      content: f.content.slice(0, 800),
    }));
  }
  if (p.context?.currentFileContent && p.context.currentFileContent.length > 3000) {
    p.context.currentFileContent = p.context.currentFileContent.slice(0, 3000);
  }
  return p;
}

// ── OpenAI-compatible provider call (works for OpenAI, Groq, Mistral, DeepSeek) ──
async function callOpenAICompatible(
  provider: AIProviderConfig,
  systemPrompt: string,
  userMessage: string,
  messages?: { role: string; content: string }[],
  settings?: { maxTokens: number; temperature: number }
): Promise<AIResponse> {
  const chatMessages: { role: string; content: string }[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (messages?.length) {
    chatMessages.push(...messages);
  } else {
    chatMessages.push({ role: 'user', content: userMessage });
  }

  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.selectedModel,
      messages: chatMessages,
      max_tokens: settings?.maxTokens ?? 4096,
      temperature: settings?.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${provider.name} API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return {
    response: data.choices?.[0]?.message?.content || '',
    model: data.model || provider.selectedModel,
    provider: provider.name,
    usage: data.usage || {},
  };
}

// ── Anthropic (Claude) call — uses Messages API ──
async function callAnthropic(
  provider: AIProviderConfig,
  systemPrompt: string,
  userMessage: string,
  messages?: { role: string; content: string }[],
  settings?: { maxTokens: number; temperature: number }
): Promise<AIResponse> {
  const msgList: { role: string; content: string }[] = [];

  if (messages?.length) {
    for (const m of messages) {
      if (m.role !== 'system') {
        msgList.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
      }
    }
  } else {
    msgList.push({ role: 'user', content: userMessage });
  }

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
      system: systemPrompt,
      messages: msgList,
      max_tokens: settings?.maxTokens ?? 4096,
      temperature: settings?.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.content?.map((b: any) => b.text).join('') || '';
  return {
    response: content,
    model: data.model || provider.selectedModel,
    provider: 'Anthropic',
    usage: {
      prompt_tokens: data.usage?.input_tokens || 0,
      completion_tokens: data.usage?.output_tokens || 0,
      total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
  };
}

// ── Google Gemini call ──
async function callGemini(
  provider: AIProviderConfig,
  systemPrompt: string,
  userMessage: string,
  messages?: { role: string; content: string }[],
  settings?: { maxTokens: number; temperature: number }
): Promise<AIResponse> {
  const contents: any[] = [];

  // System instruction via systemInstruction field
  if (messages?.length) {
    for (const m of messages) {
      if (m.role !== 'system') {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }
    }
  } else {
    contents.push({ role: 'user', parts: [{ text: userMessage }] });
  }

  const url = `${provider.baseUrl}/models/${provider.selectedModel}:generateContent?key=${provider.apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        maxOutputTokens: settings?.maxTokens ?? 4096,
        temperature: settings?.temperature ?? 0.7,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
  return {
    response: text,
    model: provider.selectedModel,
    provider: 'Google',
    usage: {
      prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
      completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: data.usageMetadata?.totalTokenCount || 0,
    },
  };
}

// ── OpenRouter call — OpenAI-compatible but with extra headers ──
async function callOpenRouter(
  provider: AIProviderConfig,
  systemPrompt: string,
  userMessage: string,
  messages?: { role: string; content: string }[],
  settings?: { maxTokens: number; temperature: number }
): Promise<AIResponse> {
  const chatMessages: { role: string; content: string }[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (messages?.length) {
    chatMessages.push(...messages);
  } else {
    chatMessages.push({ role: 'user', content: userMessage });
  }

  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'CodePath AI',
    },
    body: JSON.stringify({
      model: provider.selectedModel,
      messages: chatMessages,
      max_tokens: settings?.maxTokens ?? 4096,
      temperature: settings?.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return {
    response: data.choices?.[0]?.message?.content || '',
    model: data.model || provider.selectedModel,
    provider: `OpenRouter (${data.model || provider.selectedModel})`,
    usage: data.usage || {},
  };
}

// ── Route to the correct provider ──
async function callProvider(
  provider: AIProviderConfig,
  systemPrompt: string,
  userMessage: string,
  messages?: { role: string; content: string }[],
  settings?: { maxTokens: number; temperature: number }
): Promise<AIResponse> {
  switch (provider.id) {
    case 'anthropic':
      return callAnthropic(provider, systemPrompt, userMessage, messages, settings);
    case 'google':
      return callGemini(provider, systemPrompt, userMessage, messages, settings);
    case 'openrouter':
      return callOpenRouter(provider, systemPrompt, userMessage, messages, settings);
    // OpenAI, Groq, Mistral, DeepSeek all use OpenAI-compatible API
    default:
      return callOpenAICompatible(provider, systemPrompt, userMessage, messages, settings);
  }
}

// ── Default edge function call (existing behavior) ──
async function callEdgeFunction(payload: AIRequestPayload): Promise<AIResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(errorData.error || errorData.details || `AI request failed: ${response.status}`);
    }

    const data = await response.json();
    return { ...data, provider: 'Built-in (Mistral)' };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI request timed out after 90s. Please try again with a simpler prompt.');
    }
    throw err;
  }
}

// ── Main entry point — called by all AI consumers ──
export async function callMistralAI(payload: AIRequestPayload): Promise<AIResponse> {
  const truncated = truncatePayload(payload);

  // Read current AI settings from Zustand store
  const { ai } = useSettingsStore.getState();
  const activeProviderId = ai.defaultProvider;

  // If user has selected a custom provider with a valid API key, use it directly
  if (activeProviderId !== 'default') {
    const provider = ai.providers.find(p => p.id === activeProviderId);
    if (provider?.enabled && provider.apiKey.trim()) {
      const systemPrompt = buildClientSystemPrompt(truncated.mode, truncated.context);
      return callProvider(
        provider,
        systemPrompt,
        truncated.message,
        truncated.messages,
        { maxTokens: ai.maxTokens, temperature: ai.temperature }
      );
    }
  }

  // Fallback: use the built-in Supabase edge function
  return callEdgeFunction(truncated);
}
