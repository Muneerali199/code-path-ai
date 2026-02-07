import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// API Keys — read from environment (set via `supabase secrets set`)
const GLM_API_KEY = Deno.env.get("GLM_API_KEY") || "";
const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY") || "";

// Endpoints
const GLM_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";

// Determine if the task is complex enough to warrant GLM
function isComplexTask(mode: string, message: string): boolean {
  // Use Mistral for everything (faster) — GLM only as fallback
  return false;
}

// Build system prompt based on mode
function buildSystemPrompt(mode: string, context?: any): string {
  const fileContext = context?.currentFileContent
    ? `\n\nCurrent file "${context.currentFile || "untitled"}":\n\`\`\`\n${context.currentFileContent}\n\`\`\``
    : "";

  const projectContext =
    context?.projectFiles && context.projectFiles.length > 0
      ? `\n\nOther project files for reference:\n${context.projectFiles
          .map(
            (f: any) => `--- ${f.name} (${f.language}) ---\n${f.content?.slice(0, 1500)}`
          )
          .join("\n\n")}`
      : "";

  switch (mode) {
    case "create":
      return `You are an expert full-stack developer. Generate production-quality code based on the user's request.

RULES:
- Return code in fenced code blocks with language tags and file paths: \`\`\`tsx:src/components/MyComponent.tsx
- Include a package.json if external packages are needed
- Use modern best practices (React hooks, TypeScript, Tailwind CSS)
- Make the code complete and runnable — no placeholders or TODOs
- For multi-file projects, generate ALL necessary files
- Always include proper imports and exports${fileContext}${projectContext}`;

    case "explain":
      return `You are a patient coding teacher. Explain the code clearly and thoroughly.

Return a JSON object with this structure:
{
  "overview": "Brief summary",
  "structured": {
    "whatHappened": "What this code does step by step",
    "why": "Why it's written this way",
    "remember": ["Key takeaway 1", "Key takeaway 2"],
    "concepts": ["concept1", "concept2"]
  },
  "functions": [{"name": "fn", "description": "what it does", "parameters": ["p1"], "returnType": "void"}],
  "complexity": "O(n)",
  "bestPractices": ["practice1"],
  "improvements": ["suggestion1"],
  "relatedConcepts": ["concept1"]
}${fileContext}${projectContext}`;

    case "analyze":
      return `You are a senior code reviewer. Analyze the provided code thoroughly.

Return a JSON object with this structure:
{
  "overview": "Brief analysis summary",
  "structured": {
    "whatHappened": "What this code does",
    "why": "Architecture decisions",
    "remember": ["Key insight 1"],
    "concepts": ["concept1"]
  },
  "functions": [{"name": "fn", "description": "what it does", "parameters": [], "returnType": "void"}],
  "complexity": "time and space complexity",
  "bestPractices": ["what's done well"],
  "improvements": ["what could be better"],
  "relatedConcepts": ["related tech"]
}${fileContext}${projectContext}`;

    case "improve":
      return `You are an expert developer. Improve the provided code based on the user's request.

RULES:
- Return the COMPLETE improved file(s) in fenced code blocks with file paths
- Keep existing functionality unless told to change it
- Apply best practices, fix bugs, improve performance
- Include a brief explanation of what changed and why
- Format: \`\`\`tsx:filename.tsx${fileContext}${projectContext}`;

    default:
      return `You are an expert programming assistant. Help the user with their coding request.${fileContext}${projectContext}`;
  }
}

// Call GLM API (glm-4-flash for speed)
async function callGLM(
  systemPrompt: string,
  userMessage: string,
  messages?: any[],
  mode?: string
): Promise<{ response: string; model: string; usage: any }> {
  const chatMessages = [];

  chatMessages.push({ role: "system", content: systemPrompt });

  if (messages && messages.length > 0) {
    for (const msg of messages) {
      chatMessages.push({ role: msg.role, content: msg.content });
    }
  } else {
    chatMessages.push({ role: "user", content: userMessage });
  }

  // Use glm-4-flash for speed, glm-4.7 only for very complex tasks
  const model = "glm-4-flash";
  const maxTokens = mode === "create" || mode === "improve" ? 8192 : 4096;

  const res = await fetch(GLM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GLM API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  return {
    response: content,
    model: data.model || model,
    usage: data.usage || {},
  };
}

// Call Mistral API (mistral-small-latest for speed)
async function callMistral(
  systemPrompt: string,
  userMessage: string,
  messages?: any[],
  mode?: string
): Promise<{ response: string; model: string; usage: any }> {
  const chatMessages = [];

  chatMessages.push({ role: "system", content: systemPrompt });

  if (messages && messages.length > 0) {
    for (const msg of messages) {
      chatMessages.push({ role: msg.role, content: msg.content });
    }
  } else {
    chatMessages.push({ role: "user", content: userMessage });
  }

  // More tokens for code generation, fewer for explain/analyze
  const maxTokens = mode === "create" || mode === "improve" ? 8192 : 4096;

  const res = await fetch(MISTRAL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: chatMessages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Mistral API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  return {
    response: content,
    model: data.model || "mistral-large-latest",
    usage: data.usage || {},
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, mode, messages, context } = await req.json();

    if (!message && (!messages || messages.length === 0)) {
      return new Response(
        JSON.stringify({ error: "No message provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = buildSystemPrompt(mode || "create", context);
    const userMsg = message || messages[messages.length - 1]?.content || "";

    // Decide which model to use based on task complexity
    const useGLM = isComplexTask(mode || "create", userMsg);

    let result;

    if (useGLM) {
      // Try GLM first, fallback to Mistral on error
      try {
        console.log(`[ai-code-gen] Using GLM (glm-4-flash) for mode=${mode}`);
        result = await callGLM(systemPrompt, userMsg, messages, mode);
      } catch (glmErr) {
        console.warn(`[ai-code-gen] GLM failed, falling back to Mistral:`, glmErr);
        result = await callMistral(systemPrompt, userMsg, messages, mode);
        result.model = `${result.model} (fallback)`;
      }
    } else {
      // Use Mistral for simple tasks
      try {
        console.log(`[ai-code-gen] Using Mistral for mode=${mode}`);
        result = await callMistral(systemPrompt, userMsg, messages, mode);
      } catch (mistralErr) {
        // Fallback to GLM if Mistral fails
        console.warn(`[ai-code-gen] Mistral failed, falling back to GLM:`, mistralErr);
        result = await callGLM(systemPrompt, userMsg, messages, mode);
        result.model = `${result.model} (fallback)`;
      }
    }

    return new Response(
      JSON.stringify({
        response: result.response,
        model: result.model,
        usage: result.usage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[ai-code-gen] Error:", err);
    return new Response(
      JSON.stringify({
        error: "AI generation failed",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
