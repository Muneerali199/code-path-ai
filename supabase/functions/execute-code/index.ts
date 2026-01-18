import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
          __logs;
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

    // For other languages, return a message about needing Judge0 integration
    return new Response(
      JSON.stringify({ 
        output: `[${language.toUpperCase()}] Code execution for this language requires sandbox integration.\n\nYour code:\n${code}`,
        error: null 
      }),
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
