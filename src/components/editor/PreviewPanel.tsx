import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { WebContainer } from '@webcontainer/api'
import { Button } from '@/components/ui/button'
import {
  RefreshCw, Globe, Smartphone, Maximize2, ExternalLink,
  AlertCircle, Loader2, Terminal as TerminalIcon
} from 'lucide-react'
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

// ─── Singleton WebContainer ────────────────────────────────────────────────
let webcontainerInstance: WebContainer | null = null
let bootPromise: Promise<WebContainer> | null = null

async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) return webcontainerInstance
  if (!bootPromise) {
    bootPromise = WebContainer.boot().then(instance => {
      webcontainerInstance = instance
      return instance
    })
  }
  return bootPromise
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function flattenFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  for (const node of nodes) {
    if (node.type === 'file') result.push(node)
    if (node.children) result.push(...flattenFiles(node.children))
  }
  return result
}

/**
 * Convert FileNode[] → WebContainer FileSystemTree
 * Builds a proper Vite + React project structure
 */
function buildFSTree(files: FileNode[]): Record<string, any> {
  const flat = flattenFiles(files)

  // Detect if project has package.json
  const pkgFile = flat.find(f => f.name === 'package.json')

  // Extract all npm imports from code files
  const npmPkgs = new Set<string>()
  for (const f of flat) {
    if (f.content && /\.(tsx?|jsx?|mjs)$/.test(f.name)) {
      const importRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([\w@/.-]+)['"]/g
      let m
      while ((m = importRegex.exec(f.content)) !== null) {
        const pkg = m[1]
        if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
          const pkgName = pkg.startsWith('@')
            ? pkg.split('/').slice(0, 2).join('/')
            : pkg.split('/')[0]
          npmPkgs.add(pkgName)
        }
      }
    }
  }

  // Build package.json
  let packageJsonContent: string
  if (pkgFile?.content) {
    try {
      const parsed = JSON.parse(pkgFile.content)
      if (!parsed.dependencies) parsed.dependencies = {}
      for (const pkg of npmPkgs) {
        if (!parsed.dependencies[pkg] && !parsed.devDependencies?.[pkg]) {
          parsed.dependencies[pkg] = 'latest'
        }
      }
      if (!parsed.dependencies['react']) parsed.dependencies['react'] = '^18'
      if (!parsed.dependencies['react-dom']) parsed.dependencies['react-dom'] = '^18'
      if (!parsed.scripts) parsed.scripts = {}
      if (!parsed.scripts.dev) parsed.scripts.dev = 'vite --host 0.0.0.0'
      if (!parsed.devDependencies) parsed.devDependencies = {}
      if (!parsed.devDependencies['vite']) parsed.devDependencies['vite'] = '^5'
      if (!parsed.devDependencies['@vitejs/plugin-react']) parsed.devDependencies['@vitejs/plugin-react'] = '^4'
      packageJsonContent = JSON.stringify(parsed, null, 2)
    } catch {
      packageJsonContent = buildDefaultPackageJson(npmPkgs)
    }
  } else {
    packageJsonContent = buildDefaultPackageJson(npmPkgs)
  }

  // Gather all CSS
  const allCss = flat
    .filter(f => f.name.endsWith('.css'))
    .map(f => f.content || '')
    .join('\n')

  // Ensure main.tsx exists — if not, create one
  const hasMain = flat.some(f =>
    f.name === 'main.tsx' || f.name === 'main.jsx' || f.name === 'index.tsx'
  )
  const hasApp = flat.some(f =>
    f.name === 'App.tsx' || f.name === 'App.jsx' || f.name === 'App.js'
  )

  // FS tree
  const tree: Record<string, any> = {
    'package.json': { file: { contents: packageJsonContent } },
    'vite.config.js': {
      file: {
        contents: [
          "import { defineConfig } from 'vite'",
          "import react from '@vitejs/plugin-react'",
          "",
          "export default defineConfig({",
          "  plugins: [react()],",
          "  server: { host: '0.0.0.0' }",
          "})"
        ].join('\n')
      }
    },
    'index.html': {
      file: {
        contents: [
          '<!DOCTYPE html>',
          '<html lang="en">',
          '<head>',
          '  <meta charset="UTF-8" />',
          '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
          '  <title>Preview</title>',
          '  <script src="https://cdn.tailwindcss.com"><\/script>',
          `  <style>${allCss}</style>`,
          '</head>',
          '<body>',
          '  <div id="root"></div>',
          '  <script type="module" src="/src/main.tsx"><\/script>',
          '</body>',
          '</html>'
        ].join('\n')
      }
    }
  }

  // Build src/ directory — preserve folder structure from FileNode tree
  // Helper to recursively convert FileNode[] → WebContainer directory tree
  function buildSrcTree(nodes: FileNode[]): Record<string, any> {
    const result: Record<string, any> = {}
    for (const node of nodes) {
      if (node.name === 'package.json' || node.name === 'index.html') continue

      if (node.type === 'folder' && node.children) {
        // Recursively build subdirectory
        result[node.name] = { directory: buildSrcTree(node.children) }
      } else if (node.type === 'file') {
        // Handle file names with path separators (e.g., "components/Card.tsx")
        if (node.name.includes('/')) {
          const parts = node.name.split('/')
          const fileName = parts.pop()!
          let current = result
          for (const dir of parts) {
            if (!current[dir]) {
              current[dir] = { directory: {} }
            }
            current = current[dir].directory
          }
          current[fileName] = { file: { contents: node.content || '' } }
        } else {
          result[node.name] = { file: { contents: node.content || '' } }
        }
      }
    }
    return result
  }

  const srcTree = buildSrcTree(files)

  // Add main.tsx if not present
  if (!hasMain && hasApp) {
    srcTree['main.tsx'] = {
      file: {
        contents: [
          "import React from 'react'",
          "import ReactDOM from 'react-dom/client'",
          "import App from './App'",
          "",
          "ReactDOM.createRoot(document.getElementById('root')!).render(",
          "  <React.StrictMode>",
          "    <App />",
          "  </React.StrictMode>",
          ")"
        ].join('\n')
      }
    }
  }

  tree['src'] = { directory: srcTree }
  return tree
}

function buildDefaultPackageJson(pkgs: Set<string>): string {
  const deps: Record<string, string> = { 'react': '^18', 'react-dom': '^18' }
  for (const pkg of pkgs) {
    if (pkg !== 'react' && pkg !== 'react-dom') deps[pkg] = 'latest'
  }
  return JSON.stringify({
    name: 'preview-project',
    private: true,
    type: 'module',
    scripts: { dev: 'vite --host 0.0.0.0' },
    dependencies: deps,
    devDependencies: {
      'vite': '^5',
      '@vitejs/plugin-react': '^4',
      '@types/react': '^18',
      '@types/react-dom': '^18',
    }
  }, null, 2)
}

// ─── Terminal Log ──────────────────────────────────────────────────────────
interface TermLine {
  text: string
  type: 'cmd' | 'info' | 'ok' | 'err' | 'out' | 'dim'
}

// ─── Preview Component ─────────────────────────────────────────────────────
const PreviewPanel = React.memo(function PreviewPanel({ files, className }: PreviewPanelProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'booting' | 'installing' | 'starting' | 'ready' | 'error'>('idle')
  const [lines, setLines] = useState<TermLine[]>([])
  const [termOpen, setTermOpen] = useState(true)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<WebContainer | null>(null)
  const prevHashRef = useRef('')
  const serverRef = useRef<any>(null)
  const bootingRef = useRef(false)

  // Auto-scroll terminal
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const log = useCallback((text: string, type: TermLine['type'] = 'out') => {
    setLines(prev => [...prev, { text, type }])
  }, [])

  // Stable files fingerprint
  const filesHash = useMemo(() => {
    const flat = flattenFiles(files)
    return flat.map(f => `${f.name}:${(f.content || '').length}:${(f.content || '').slice(0, 100)}`).join('|')
  }, [files])

  // ── Main boot flow ──
  const bootAndRun = useCallback(async () => {
    if (bootingRef.current) return
    bootingRef.current = true

    setLines([])
    setPreviewUrl(null)
    setErrMsg(null)

    try {
      // Boot
      setStatus('booting')
      log('> Initializing environment...', 'cmd')
      const wc = await getWebContainer()
      containerRef.current = wc
      log('  Environment ready', 'ok')

      // Mount
      log('> Writing project files...', 'cmd')
      const fsTree = buildFSTree(files)
      await wc.mount(fsTree)
      const flat = flattenFiles(files)
      log(`  ${flat.length} files written to /src`, 'dim')
      log('  Done', 'ok')

      // Install
      setStatus('installing')
      log('', 'out')
      log('> pnpm install', 'cmd')

      // Try pnpm first (like Bolt.new), fallback to npm
      let installProcess = await wc.spawn('pnpm', ['install']).catch(() => null)
      if (!installProcess) {
        log('  pnpm not available, using npm...', 'dim')
        installProcess = await wc.spawn('npm', ['install'])
      }

      // Stream install output
      const reader = installProcess.output.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        for (const line of text.split('\n')) {
          const trimmed = line.trim()
          if (!trimmed) continue
          if (trimmed.includes('added') || trimmed.includes('packages in') || trimmed.includes('done')) {
            log(`  ${trimmed}`, 'ok')
          } else if (trimmed.includes('WARN') || trimmed.includes('warn') || trimmed.includes('deprecated')) {
            log(`  ${trimmed}`, 'dim')
          } else if (trimmed.includes('ERR') || trimmed.includes('error') || trimmed.includes('ERESOLVE')) {
            log(`  ${trimmed}`, 'err')
          } else if (trimmed.startsWith('Packages:') || trimmed.startsWith('Progress:') || trimmed.includes('reused')) {
            log(`  ${trimmed}`, 'info')
          } else {
            log(`  ${trimmed}`, 'dim')
          }
        }
      }

      const exitCode = await installProcess.exit
      if (exitCode !== 0) {
        log(`✗ Install failed (exit ${exitCode})`, 'err')
        setStatus('error')
        setErrMsg(`Dependency install failed (exit ${exitCode})`)
        bootingRef.current = false
        return
      }
      log('✓ Dependencies installed successfully', 'ok')

      // Start dev server
      setStatus('starting')
      log('', 'out')
      log('> npm run dev', 'cmd')

      if (serverRef.current) {
        try { serverRef.current.kill() } catch {}
      }

      const devProcess = await wc.spawn('npm', ['run', 'dev'])
      serverRef.current = devProcess

      // Stream dev output in background
      const devReader = devProcess.output.getReader()
      const devDecoder = new TextDecoder()
      ;(async () => {
        while (true) {
          const { done, value } = await devReader.read()
          if (done) break
          const text = devDecoder.decode(value)
          for (const line of text.split('\n')) {
            const t = line.trim()
            if (!t) continue
            if (t.includes('Local:') || t.includes('ready in') || t.includes('VITE')) {
              log(`  ${t}`, 'ok')
            } else {
              log(`  ${t}`, 'dim')
            }
          }
        }
      })()

      // Wait for server-ready
      wc.on('server-ready', (_port, url) => {
        log('', 'out')
        log(`✓ Server running at ${url}`, 'ok')
        setPreviewUrl(url)
        setStatus('ready')
        setTimeout(() => setTermOpen(false), 1200)
      })

      devProcess.exit.then(code => {
        if (code !== 0) {
          log(`✗ Server exited (code ${code})`, 'err')
          setStatus('error')
          setErrMsg(`Dev server crashed (exit ${code})`)
        }
      })

    } catch (err: any) {
      log(`✗ ${err.message}`, 'err')
      setStatus('error')
      setErrMsg(err.message)
    } finally {
      bootingRef.current = false
    }
  }, [files, log])

  // Trigger on file changes
  useEffect(() => {
    if (files.length === 0) return
    if (filesHash === prevHashRef.current) return
    prevHashRef.current = filesHash

    // If already running, just hot-remount
    if (containerRef.current && status === 'ready') {
      ;(async () => {
        try {
          log('> Updating files...', 'cmd')
          const fsTree = buildFSTree(files)
          await containerRef.current!.mount(fsTree)
          log('✓ Files synced (HMR)', 'ok')
        } catch (err: any) {
          log(`✗ File sync failed: ${err.message}`, 'err')
          console.warn('Hot-remount failed:', err)
        }
      })()
    } else if (status === 'idle' || status === 'error') {
      bootAndRun()
    }
  }, [filesHash, files, status, bootAndRun, log])

  const handleRefresh = useCallback(() => {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = previewUrl
    }
  }, [previewUrl])

  const handleRestart = useCallback(() => {
    prevHashRef.current = ''
    setStatus('idle')
    setPreviewUrl(null)
    if (serverRef.current) {
      try { serverRef.current.kill() } catch {}
      serverRef.current = null
    }
    bootAndRun()
  }, [bootAndRun])

  const handleOpenTab = useCallback(() => {
    if (previewUrl) window.open(previewUrl, '_blank')
  }, [previewUrl])

  // ── Render ──
  return (
    <div className={cn("h-full flex flex-col bg-[#0a0a0f]", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0c0c14] border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <div className={cn(
            "h-2 w-2 rounded-full shrink-0",
            status === 'ready' ? 'bg-green-400 shadow-[0_0_6px] shadow-green-400/40' :
            status === 'error' ? 'bg-red-400' :
            status === 'idle' ? 'bg-white/20' :
            'bg-amber-400 animate-pulse'
          )} />
          <span className="text-[11px] font-medium text-white/60 truncate">
            {status === 'idle' && 'Preview'}
            {status === 'booting' && 'Booting...'}
            {status === 'installing' && 'Installing deps...'}
            {status === 'starting' && 'Starting server...'}
            {status === 'ready' && (
              <span className="text-white/80">
                <Globe className="h-3 w-3 inline mr-1 -mt-px" />
                localhost:5173
              </span>
            )}
            {status === 'error' && <span className="text-red-400">Error</span>}
          </span>

          {/* Device toggle */}
          {status === 'ready' && (
            <div className="flex items-center gap-0.5 ml-2 bg-white/5 rounded p-0.5">
              <button
                onClick={() => setDevice('desktop')}
                className={cn("p-0.5 rounded transition-colors",
                  device === 'desktop' ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
                )}
              >
                <Maximize2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={cn("p-0.5 rounded transition-colors",
                  device === 'mobile' ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
                )}
              >
                <Smartphone className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setTermOpen(!termOpen)}
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors",
              termOpen ? "bg-white/10 text-white/70" : "text-white/30 hover:text-white/50"
            )}
          >
            <TerminalIcon className="h-3 w-3" />
            Terminal
          </button>
          {status === 'ready' && (
            <>
              <button
                onClick={handleRefresh}
                className="p-1 rounded text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
              <button
                onClick={handleOpenTab}
                className="p-1 rounded text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </button>
            </>
          )}
          <button
            onClick={handleRestart}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Restart
          </button>
        </div>
      </div>

      {/* Terminal panel */}
      {termOpen && (
        <div className="shrink-0 bg-[#0d0e16] border-b border-white/[0.06] max-h-[220px] overflow-y-auto scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
        >
          <div className="px-3 py-2 font-mono text-[11px] leading-[1.6] space-y-px">
            {lines.length === 0 && status === 'idle' && (
              <div className="text-white/15 text-center py-6 text-xs select-none">
                Preview will boot when files are ready
              </div>
            )}
            {lines.map((l, i) => (
              <div key={i} className={cn(
                "whitespace-pre-wrap break-all",
                l.type === 'cmd'  && 'text-sky-400 font-semibold mt-1.5',
                l.type === 'info' && 'text-white/50',
                l.type === 'ok'   && 'text-emerald-400',
                l.type === 'err'  && 'text-red-400',
                l.type === 'out'  && 'text-white/25 h-2', // spacer
                l.type === 'dim'  && 'text-white/25',
              )}>
                {l.text}
              </div>
            ))}
            {/* Activity spinner */}
            {(status === 'booting' || status === 'installing' || status === 'starting') && (
              <div className="flex items-center gap-2 text-white/30 mt-1 py-0.5">
                <Loader2 className="h-3 w-3 animate-spin text-violet-400/60" />
                <span className="text-[10px]">
                  {status === 'booting' && 'Initializing environment...'}
                  {status === 'installing' && 'Resolving & installing packages...'}
                  {status === 'starting' && 'Compiling & starting Vite...'}
                </span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      )}

      {/* Preview area */}
      <div className="flex-1 min-h-0 bg-[#0d0d12] flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <div className={cn(
            "bg-white transition-all duration-300 overflow-hidden relative",
            device === 'mobile'
              ? "w-[375px] h-[667px] rounded-[2rem] border-[6px] border-neutral-800 shadow-2xl shadow-black/50"
              : "w-full h-full"
          )}>
            <iframe
              ref={iframeRef}
              src={previewUrl}
              title="Preview"
              className="w-full h-full border-none"
              allow="cross-origin-isolated"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-6 py-8">
            {status === 'error' ? (
              <>
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <p className="text-sm text-red-300/80 font-mono max-w-[260px] leading-relaxed">{errMsg}</p>
                <button
                  onClick={handleRestart}
                  className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 text-xs transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> Try again
                </button>
              </>
            ) : status === 'idle' ? (
              <>
                <div className="h-12 w-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                  <Globe className="h-5 w-5 text-white/15" />
                </div>
                <p className="text-[11px] text-white/20">Generate code to see the preview</p>
              </>
            ) : (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-violet-400/50 mb-4" />
                <p className="text-[11px] text-white/30">
                  {status === 'booting' && 'Initializing environment...'}
                  {status === 'installing' && 'Installing dependencies...'}
                  {status === 'starting' && 'Starting dev server...'}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

export default PreviewPanel
