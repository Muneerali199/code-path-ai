"use strict";
/**
* Shared dark-theme styles and HTML helpers for all CodePath AI webview panels.
* Inspired by VS Code / Cursor editor aesthetics.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelHeader = exports.markdownToHtml = exports.wrapInLayout = exports.getCopyScript = exports.getBaseStyles = void 0;
// ─── Base dark-theme CSS ────────────────────────────────────────────────────
function getBaseStyles() {
    return `
        :root {
            --bg-primary: #1e1e2e;
            --bg-secondary: #181825;
            --bg-surface: #252537;
            --bg-surface-hover: #2d2d44;
            --bg-elevated: #313147;
            --bg-code: #11111b;
            --border-subtle: #33334d;
            --border-accent: #6c6cff;
            --text-primary: #cdd6f4;
            --text-secondary: #a6adc8;
            --text-muted: #6c7086;
            --accent: #89b4fa;
            --accent-hover: #74c7ec;
            --accent-dim: rgba(137, 180, 250, 0.12);
            --green: #a6e3a1;
            --green-dim: rgba(166, 227, 161, 0.12);
            --yellow: #f9e2af;
            --yellow-dim: rgba(249, 226, 175, 0.12);
            --red: #f38ba8;
            --red-dim: rgba(243, 139, 168, 0.12);
            --orange: #fab387;
            --orange-dim: rgba(250, 179, 135, 0.12);
            --purple: #cba6f7;
            --purple-dim: rgba(203, 166, 247, 0.12);
            --teal: #94e2d5;
            --pink: #f5c2e7;
            --radius-sm: 6px;
            --radius-md: 10px;
            --radius-lg: 14px;
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.35);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
            --shadow-lg: 0 8px 30px rgba(0,0,0,0.5);
            --font-sans: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
            --font-mono: 'Cascadia Code', 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
            --transition: 180ms ease;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
            height: 100%;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-family: var(--font-sans);
            font-size: 14px;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            scrollbar-width: thin;
            scrollbar-color: var(--bg-elevated) var(--bg-secondary);
        }

        body { padding: 28px 32px; }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg-secondary); }
        ::-webkit-scrollbar-thumb { background: var(--bg-elevated); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--border-subtle); }

        /* ── Typography ─────────────────────── */
        h1, h2, h3, h4 {
            font-weight: 600;
            letter-spacing: -0.01em;
            color: var(--text-primary);
        }
        h1 { font-size: 1.65rem; }
        h2 { font-size: 1.3rem; }
        h3 { font-size: 1.1rem; }
        h4 { font-size: 0.95rem; }

        p { color: var(--text-secondary); margin-bottom: 12px; }

        a { color: var(--accent); text-decoration: none; transition: color var(--transition); }
        a:hover { color: var(--accent-hover); text-decoration: underline; }

        strong { color: var(--text-primary); font-weight: 600; }
        em { color: var(--text-secondary); }

        /* ── Inline code ────────────────────── */
        code:not(pre code) {
            background: var(--bg-code);
            color: var(--purple);
            padding: 2px 7px;
            border-radius: 4px;
            font-family: var(--font-mono);
            font-size: 0.88em;
            border: 1px solid var(--border-subtle);
        }

        /* ── Code Blocks ────────────────────── */
        pre {
            position: relative;
            background: var(--bg-code);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 0;
            margin: 16px 0;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
        }
        pre .code-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 14px;
            background: var(--bg-surface);
            border-bottom: 1px solid var(--border-subtle);
            font-size: 0.78rem;
            color: var(--text-muted);
            font-family: var(--font-mono);
        }
        pre .code-header .lang-badge {
            background: var(--accent-dim);
            color: var(--accent);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
        }
        pre .copy-btn {
            background: transparent;
            color: var(--text-muted);
            border: 1px solid var(--border-subtle);
            padding: 3px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.72rem;
            font-family: var(--font-sans);
            transition: all var(--transition);
        }
        pre .copy-btn:hover {
            background: var(--bg-surface-hover);
            color: var(--text-primary);
            border-color: var(--accent);
        }
        pre code {
            display: block;
            padding: 16px 18px;
            font-family: var(--font-mono);
            font-size: 0.87rem;
            line-height: 1.7;
            color: var(--text-primary);
            overflow-x: auto;
            tab-size: 4;
        }

        /* ── Code syntax highlighting (basic) ── */
        .token-keyword { color: #c678dd; }
        .token-string { color: #98c379; }
        .token-comment { color: #5c6370; font-style: italic; }
        .token-number { color: #d19a66; }
        .token-function { color: #61afef; }
        .token-operator { color: #56b6c2; }
        .token-type { color: #e5c07b; }

        /* ── Cards ──────────────────────────── */
        .card {
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 20px 22px;
            margin-bottom: 16px;
            transition: border-color var(--transition), box-shadow var(--transition);
        }
        .card:hover {
            border-color: rgba(137, 180, 250, 0.25);
            box-shadow: var(--shadow-sm);
        }
        .card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
        }
        .card-header .icon {
            font-size: 1.2rem;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-sm);
            flex-shrink: 0;
        }
        .card-header h4 { margin: 0; font-size: 0.95rem; }

        /* ── Severity / Status badges ───────── */
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.72rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .badge.high   { background: var(--red-dim);    color: var(--red); }
        .badge.medium { background: var(--orange-dim);  color: var(--orange); }
        .badge.low    { background: var(--yellow-dim);  color: var(--yellow); }
        .badge.info   { background: var(--accent-dim);  color: var(--accent); }
        .badge.success{ background: var(--green-dim);   color: var(--green); }

        /* ── Buttons ────────────────────────── */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 9px 18px;
            border: 1px solid transparent;
            border-radius: var(--radius-sm);
            font-family: var(--font-sans);
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: all var(--transition);
            text-decoration: none;
        }
        .btn-primary {
            background: var(--accent);
            color: var(--bg-primary);
        }
        .btn-primary:hover { background: var(--accent-hover); }
        .btn-secondary {
            background: var(--bg-elevated);
            color: var(--text-primary);
            border-color: var(--border-subtle);
        }
        .btn-secondary:hover {
            background: var(--bg-surface-hover);
            border-color: var(--accent);
        }
        .btn-ghost {
            background: transparent;
            color: var(--text-secondary);
            border-color: transparent;
        }
        .btn-ghost:hover {
            background: var(--bg-surface);
            color: var(--text-primary);
        }

        /* ── Header / Branding ──────────────── */
        .panel-header {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 28px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-subtle);
        }
        .panel-header .logo {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, var(--accent), var(--purple));
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--bg-primary);
            box-shadow: 0 2px 8px rgba(137, 180, 250, 0.25);
        }
        .panel-header .title-group h2 { margin: 0; line-height: 1.2; }
        .panel-header .title-group .subtitle {
            font-size: 0.78rem;
            color: var(--text-muted);
            margin-top: 2px;
        }

        /* ── Divider ────────────────────────── */
        .divider {
            height: 1px;
            background: var(--border-subtle);
            margin: 20px 0;
        }

        /* ── Section ────────────────────────── */
        .section {
            margin-bottom: 24px;
        }
        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.82rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-muted);
            margin-bottom: 14px;
            font-weight: 600;
        }
        .section-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--border-subtle);
        }

        /* ── Details / Accordion ────────────── */
        details {
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-sm);
            margin: 10px 0;
            overflow: hidden;
        }
        details summary {
            padding: 10px 16px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.88rem;
            color: var(--text-secondary);
            transition: background var(--transition), color var(--transition);
            list-style: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        details summary::before {
            content: '▸';
            display: inline-block;
            transition: transform var(--transition);
            color: var(--text-muted);
        }
        details[open] summary::before { transform: rotate(90deg); }
        details summary:hover { background: var(--bg-surface-hover); color: var(--text-primary); }
        details > :not(summary) { padding: 0 16px 14px; }

        /* ── Animations ─────────────────────── */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
            animation: fadeInUp 0.35s ease forwards;
        }
        .delay-1 { animation-delay: 0.06s; }
        .delay-2 { animation-delay: 0.12s; }
        .delay-3 { animation-delay: 0.18s; }
        .delay-4 { animation-delay: 0.24s; }

        /* ── Grid layout ────────────────────── */
        .grid {
            display: grid;
            gap: 14px;
        }
        .grid-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-3 { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 600px) {
            .grid-2, .grid-3 { grid-template-columns: 1fr; }
        }

        /* ── Model info tag ─────────────────── */
        .model-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            color: var(--text-muted);
        }
        .model-tag .dot {
            width: 6px; height: 6px;
            border-radius: 50%;
            background: var(--green);
        }

        /* ── Tooltip ────────────────────────── */
        .tooltip-container {
            position: relative;
            display: inline-block;
        }
        .tooltip-container .tooltip {
            visibility: hidden;
            opacity: 0;
            position: absolute;
            bottom: calc(100% + 6px);
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-elevated);
            color: var(--text-primary);
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 0.75rem;
            white-space: nowrap;
            box-shadow: var(--shadow-md);
            transition: opacity var(--transition);
            z-index: 10;
        }
        .tooltip-container:hover .tooltip {
            visibility: visible;
            opacity: 1;
        }

        /* ── Empty state ────────────────────── */
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-muted);
        }
        .empty-state .icon { font-size: 2.5rem; margin-bottom: 12px; }
        .empty-state p { font-size: 0.88rem; }
    `;
}
exports.getBaseStyles = getBaseStyles;
// ─── Copy-to-clipboard script ───────────────────────────────────────────────
function getCopyScript() {
    return `
        <script>
            function copyCode(btn) {
                const codeBlock = btn.closest('pre').querySelector('code');
                const text = codeBlock.innerText;
                navigator.clipboard.writeText(text).then(() => {
                    const orig = btn.textContent;
                    btn.textContent = '✓ Copied';
                    btn.style.color = 'var(--green)';
                    btn.style.borderColor = 'var(--green)';
                    setTimeout(() => {
                        btn.textContent = orig;
                        btn.style.color = '';
                        btn.style.borderColor = '';
                    }, 1800);
                });
            }
        </script>
    `;
}
exports.getCopyScript = getCopyScript;
// ─── Wrap HTML content in the base layout ───────────────────────────────────
function wrapInLayout(title, bodyContent) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${getBaseStyles()}</style>
</head>
<body>
    ${bodyContent}
    ${getCopyScript()}
</body>
</html>`;
}
exports.wrapInLayout = wrapInLayout;
// ─── Format markdown-ish text to HTML ────────────────────────────────────────
function markdownToHtml(text) {
    let html = escapeHtml(text);
    // Fenced code blocks: ```lang\n…\n```
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
        const langLabel = lang || 'code';
        return `<pre>
            <div class="code-header">
                <span class="lang-badge">${langLabel}</span>
                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
            </div>
            <code>${highlightSyntax(code.trim())}</code>
        </pre>`;
    });
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // Unordered lists
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    // Paragraphs (double newlines)
    html = html.replace(/\n\n+/g, '</p><p>');
    html = `<p>${html}</p>`;
    html = html.replace(/<p>\s*<\/p>/g, '');
    // Don't wrap block elements in <p>
    html = html.replace(/<p>\s*(<(?:pre|ul|h[1-4]|div))/g, '$1');
    html = html.replace(/(<\/(?:pre|ul|h[1-4]|div)>)\s*<\/p>/g, '$1');
    // Single line breaks → <br>
    html = html.replace(/\n/g, '<br>');
    return html;
}
exports.markdownToHtml = markdownToHtml;
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function highlightSyntax(code) {
    // Simple keyword-based highlighting
    const keywords = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|try|catch|throw|switch|case|break|default|typeof|instanceof|void|null|undefined|true|false|def|self|print|elif|lambda|yield|with|as|in|not|and|or|is|None|True|False)\b/g;
    const strings = /((&quot;|&#x27;|`)[\s\S]*?\2)/g;
    const comments = /(\/\/.*?(?:<br>|$)|\/\*[\s\S]*?\*\/|#.*?(?:<br>|$))/g;
    const numbers = /\b(\d+\.?\d*)\b/g;
    const functions = /\b([a-zA-Z_]\w*)\s*(?=\()/g;
    let result = code;
    // Order matters: comments first, then strings, then the rest
    result = result.replace(comments, '<span class="token-comment">$1</span>');
    result = result.replace(strings, '<span class="token-string">$1</span>');
    result = result.replace(keywords, '<span class="token-keyword">$1</span>');
    result = result.replace(numbers, '<span class="token-number">$1</span>');
    result = result.replace(functions, '<span class="token-function">$1</span>');
    return result;
}
// ─── Panel header component ────────────────────────────────────────────────
function panelHeader(icon, title, subtitle, modelUsed) {
    const modelTag = modelUsed
        ? `<span class="model-tag"><span class="dot"></span>${modelUsed}</span>`
        : '';
    return `
        <div class="panel-header animate-in">
            <div class="logo">${icon}</div>
            <div class="title-group" style="flex:1;">
                <h2>${title}</h2>
                <div class="subtitle">${subtitle}</div>
            </div>
            ${modelTag}
        </div>
    `;
}
exports.panelHeader = panelHeader;
//# sourceMappingURL=webview-styles.js.map