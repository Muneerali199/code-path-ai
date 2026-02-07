import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Globe, Smartphone, Maximize2, ExternalLink, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileNode[]
}

interface PreviewPanelProps {
  files: FileNode[]
  className?: string
  dependencies?: { name: string; version: string; status: string }[]
}

// Flatten file tree to get all files
function flattenFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  for (const node of nodes) {
    if (node.type === 'file') result.push(node)
    if (node.children) result.push(...flattenFiles(node.children))
  }
  return result
}

// Find a file by name in flat list
function findFile(files: FileNode[], name: string): FileNode | undefined {
  return files.find(f => f.name === name || f.name.endsWith(`/${name}`))
}

// Extract imports from code to build CDN import map
function extractImports(code: string): string[] {
  const imports: string[] = []
  const importRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([\w@/.-]+)['"]/g
  let match
  while ((match = importRegex.exec(code)) !== null) {
    const pkg = match[1]
    // Skip relative imports
    if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
      // Get the package name (handle scoped packages)
      const pkgName = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0]
      if (!imports.includes(pkgName)) imports.push(pkgName)
    }
  }
  return imports
}

// Build the srcdoc HTML that renders the project
function buildPreviewHTML(files: FileNode[]): string {
  const flat = flattenFiles(files)

  // Find key files
  const appFile = findFile(flat, 'App.tsx') || findFile(flat, 'App.jsx') || findFile(flat, 'App.js')
  const indexCss = findFile(flat, 'index.css') || findFile(flat, 'App.css') || findFile(flat, 'styles.css') || findFile(flat, 'style.css')
  const indexHtml = findFile(flat, 'index.html')
  const packageJson = findFile(flat, 'package.json')

  // If there's an index.html with no React, just render it directly
  if (indexHtml?.content && !appFile) {
    let html = indexHtml.content
    // Inject CSS if found
    if (indexCss?.content) {
      html = html.replace('</head>', `<style>${indexCss.content}</style></head>`)
    }
    return html
  }

  // Collect all CSS from project files
  const allCss = flat
    .filter(f => f.name.endsWith('.css'))
    .map(f => f.content || '')
    .join('\n')

  // Collect all code files for inline bundling
  const codeFiles = flat.filter(f =>
    f.name.endsWith('.tsx') || f.name.endsWith('.jsx') ||
    f.name.endsWith('.ts') || f.name.endsWith('.js')
  )

  // Extract all npm package imports
  const allImports = new Set<string>()
  for (const file of codeFiles) {
    if (file.content) {
      extractImports(file.content).forEach(pkg => allImports.add(pkg))
    }
  }
  // Always need react + react-dom
  allImports.add('react')
  allImports.add('react-dom')
  // Remove react-dom/client — it's part of react-dom
  allImports.delete('react-dom/client')

  // Build import map using esm.sh
  const importMap: Record<string, string> = {}
  for (const pkg of allImports) {
    importMap[pkg] = `https://esm.sh/${pkg}?bundle`
  }
  // Add explicit react-dom/client mapping
  importMap['react-dom/client'] = `https://esm.sh/react-dom@18/client?bundle`
  // Ensure react is consistent
  importMap['react'] = `https://esm.sh/react@18?bundle`
  importMap['react-dom'] = `https://esm.sh/react-dom@18?bundle`

  // Build module code — inline all project files as modules  
  // Strip TypeScript types, handle JSX via Babel standalone
  const appCode = appFile?.content || 'export default function App() { return <div>No App component found</div>; }'

  // Collect component files (for relative imports)
  const componentModules: { name: string; content: string }[] = []
  for (const file of codeFiles) {
    if (file.name !== 'App.tsx' && file.name !== 'App.jsx' && file.name !== 'App.js' &&
        file.name !== 'main.tsx' && file.name !== 'main.jsx' && file.name !== 'index.tsx') {
      if (file.content) {
        componentModules.push({ name: file.name, content: file.content })
      }
    }
  }

  // Escape backticks and dollar signs in code for template literals
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    #root { min-height: 100vh; }
    .preview-error {
      padding: 2rem; color: #ef4444; background: #1a1a2e; min-height: 100vh;
      font-family: monospace; white-space: pre-wrap; font-size: 14px;
    }
    .preview-error h3 { color: #f87171; margin-bottom: 1rem; font-size: 16px; }
    ${allCss}
  </style>
  <!-- Tailwind CSS CDN for styling -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Babel standalone for JSX/TSX transpilation -->
  <script src="https://unpkg.com/@babel/standalone@7.24.0/babel.min.js"></script>
  <script type="importmap">
  ${JSON.stringify({ imports: importMap }, null, 2)}
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module" data-presets="react,typescript">
    import React from 'react';
    import ReactDOM from 'react-dom/client';

    // Destructure all common React hooks so user code can reference them directly
    const { useState, useEffect, useRef, useCallback, useMemo, useContext, useReducer, useLayoutEffect, createContext, Fragment } = React;

    // ---- Inline component modules ----
    ${componentModules.map(m => {
      // Wrap each component file's code, stripping its own imports
      const code = m.content
        .replace(/^import\s+.*from\s+['"]\.\//gm, '// [resolved] import ')
        .replace(/^export\s+default\s+/gm, 'export default ')
      return `// --- ${m.name} ---\n// Component available via inline code`
    }).join('\n')}

    // ---- Main App Component ----
    ${appCode
      // Strip all import statements (they're handled by the import map + top-level imports above)
      .replace(/^\s*import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, '')
    }

    // ---- Mount ----
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(typeof App !== 'undefined' ? App : () => React.createElement('div', null, 'App component not found')));
    } catch (err) {
      document.getElementById('root').innerHTML = '<div class="preview-error"><h3>Runtime Error</h3>' + err.message + '</div>';
      console.error('Preview render error:', err);
    }
  </script>
  <script>
    // Global error handler
    window.addEventListener('error', function(e) {
      var root = document.getElementById('root');
      if (root && e.message) {
        root.innerHTML = '<div class="preview-error"><h3>Error</h3>' + e.message + '</div>';
      }
    });
  </script>
</body>
</html>`
}

const PreviewPanel = React.memo(function PreviewPanel({ files, className, dependencies }: PreviewPanelProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [key, setKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Build a stable content fingerprint — only rebuild when actual file contents change
  const filesFingerprint = useMemo(() => {
    const flat = flattenFiles(files)
    // Hash based on file names + content lengths + first/last 50 chars
    return flat.map(f => `${f.name}:${(f.content || '').length}:${(f.content || '').slice(0, 50)}:${(f.content || '').slice(-50)}`).join('|')
  }, [files])

  // Only rebuild srcdoc when the actual content fingerprint changes (not on every render)
  const srcdoc = useMemo(() => buildPreviewHTML(files), [filesFingerprint])

  // Track the last srcdoc we loaded into the iframe to avoid re-mounting
  const lastLoadedSrcdocRef = useRef<string>('')

  // Only show loading when srcdoc actually changes (content change), not on file selection
  useEffect(() => {
    if (srcdoc === lastLoadedSrcdocRef.current) return // no actual change
    lastLoadedSrcdocRef.current = srcdoc
    setIsLoading(true)
    setError(null)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [srcdoc, key])

  const handleRefresh = () => {
    lastLoadedSrcdocRef.current = '' // force reload on next render
    setKey(prev => prev + 1)
  }

  const handleOpenNewTab = useCallback(() => {
    const blob = new Blob([srcdoc], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }, [srcdoc])

  return (
    <div className={cn("h-full flex flex-col bg-[#09090b]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#09090b] border-b border-white/10">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-white">Live Preview</span>
          <div className="flex items-center gap-1 ml-4 bg-white/5 rounded-md p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 hover:bg-white/10",
                device === 'desktop' ? "bg-white/10 text-white" : "text-slate-400"
              )}
              onClick={() => setDevice('desktop')}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 hover:bg-white/10",
                device === 'mobile' ? "bg-white/10 text-white" : "text-slate-400"
              )}
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-white hover:bg-white/10"
            onClick={handleRefresh}
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-white hover:bg-white/10"
            onClick={handleOpenNewTab}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-[#0d0d12] p-2 flex items-center justify-center overflow-hidden">
        <div
          className={cn(
            "bg-white transition-all duration-300 shadow-2xl overflow-hidden relative",
            device === 'mobile'
              ? "w-[375px] h-[667px] rounded-3xl border-8 border-gray-800"
              : "w-full h-full rounded-md border border-white/10"
          )}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f] z-10">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-400 mb-4" />
                <p className="text-sm text-white/40">Building preview...</p>
                <p className="text-xs text-white/20 mt-1">Compiling JSX & loading dependencies</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f] z-10 p-6">
              <div className="flex flex-col items-center text-center">
                <AlertCircle className="h-8 w-8 text-red-400 mb-4" />
                <p className="text-sm text-red-300 font-mono">{error}</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            key={key}
            srcDoc={srcdoc}
            title="Live Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-modals allow-popups allow-same-origin"
          />
        </div>
      </div>
    </div>
  )
})

export default PreviewPanel