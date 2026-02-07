// AI Service - Calls Supabase Edge Function (GLM-4.7 primary + Mistral fallback)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const AI_ENDPOINT = `${SUPABASE_URL}/functions/v1/ai-code-gen`;

export interface AIRequestPayload {
  message: string;
  mode: 'create' | 'explain' | 'analyze' | 'improve';
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
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
  details?: string;
}

export async function callMistralAI(payload: AIRequestPayload): Promise<AIResponse> {
  // Truncate context to reduce payload size and speed up response
  if (payload.context?.projectFiles) {
    payload.context.projectFiles = payload.context.projectFiles.slice(0, 3).map(f => ({
      ...f,
      content: f.content.slice(0, 800), // Only first 800 chars per file
    }));
  }
  if (payload.context?.currentFileContent && payload.context.currentFileContent.length > 3000) {
    payload.context.currentFileContent = payload.context.currentFileContent.slice(0, 3000);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

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

    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI request timed out after 90s. Please try again with a simpler prompt.');
    }
    throw err;
  }
}
