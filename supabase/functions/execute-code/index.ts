import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JUDGE0_URL = Deno.env.get("JUDGE0_URL") || "";
const JUDGE0_API_KEY = Deno.env.get("JUDGE0_API_KEY") || "";

// Judge0 language IDs
const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63, // Node.js
  typescript: 74,
  python: 71, // Python 3
  java: 62,
  cpp: 54, // C++ (GCC)
  c: 50, // C (GCC)
  go: 60,
  rust: 73,
};

const runWithJudge0 = async ({
  code,
  languageId,
}: {
  code: string;
  languageId: number;
}) => {
  if (!JUDGE0_URL) {
    throw new Error("Judge0 is not configured");
  }

  const url = `${JUDGE0_URL.replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (JUDGE0_API_KEY) {
    headers["X-Auth-Token"] = JUDGE0_API_KEY;
  }

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      redirect_stderr_to_stdout: false,
    }),
  });

  const json = await resp.json().catch(() => null);
  if (!resp.ok) {
    throw new Error((json && (json.error || json.message)) || `Judge0 request failed (HTTP ${resp.status})`);
  }
  if (!json) {
    throw new Error("Judge0 returned an invalid response");
  }

  const stdout = (json.stdout ?? "") as string;
  const stderr = (json.stderr ?? "") as string;
  const compileOutput = (json.compile_output ?? "") as string;
  const message = (json.message ?? "") as string;
  const status = json.status as { id?: number; description?: string } | undefined;

  const statusId = status?.id;
  const statusDesc = status?.description;

  const output = stdout || "";
  const error = compileOutput || stderr || message || "";

  if (statusId && statusId !== 3 && !error) {
    return { output, error: statusDesc || "Execution failed" };
  }

  return { output, error: error || null };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: "No code provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const languageId = LANGUAGE_IDS[language] || LANGUAGE_IDS.javascript;

    // For MVP, we'll use a simple JavaScript evaluation approach
    // In production, this would integrate with Judge0 or similar
    if (language === 'javascript') {
      try {
        // Capture console.log output
        let output = '';
        const originalConsole = { log: console.log };
        const logs: string[] = [];
        
        // Create a simple sandbox for JavaScript execution
        const sandboxCode = `
          const __logs = [];
          const console = {
            log: (...args) => __logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            error: (...args) => __logs.push('Error: ' + args.join(' ')),
            warn: (...args) => __logs.push('Warning: ' + args.join(' ')),
          };
          try {
            ${code}
          } catch (e) {
            __logs.push('Error: ' + e.message);
          }
          return __logs;
        `;

        // Use Function constructor for safer evaluation
        const result = new Function(sandboxCode)();
        output = Array.isArray(result) ? result.join('\n') : String(result);

        return new Response(
          JSON.stringify({ output, error: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ 
            output: '', 
            error: e instanceof Error ? e.message : 'Execution error' 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!JUDGE0_URL) {
      return new Response(
        JSON.stringify({ output: "", error: "Server is missing Judge0 configuration." }),
        { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await runWithJudge0({ code, languageId });
    return new Response(
      JSON.stringify({ output: result.output || "", error: result.error ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("execute-code error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
