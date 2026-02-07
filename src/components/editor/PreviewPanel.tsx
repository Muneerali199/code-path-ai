import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { WebContainer } from '@webcontainer/api'
import {
  RefreshCw, Globe, Smartphone, Maximize2, ExternalLink,
  AlertCircle, Loader2, Terminal as TerminalIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

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
    }).catch(err => {
      // Reset promise so a retry is possible
      bootPromise = null
      throw err
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
 */
function buildFSTree(files: FileNode[]): Record<string, any> {
  const flat = flattenFiles(files)
  const pkgFile = flat.find(f => f.name === 'package.json')

  // Extract npm imports
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

  const allCss = flat
    .filter(f => f.name.endsWith('.css'))
    .map(f => f.content || '')
    .join('\n')

  const hasMain = flat.some(f =>
    f.name === 'main.tsx' || f.name === 'main.jsx' || f.name === 'index.tsx'
  )
  const hasApp = flat.some(f =>
    f.name === 'App.tsx' || f.name === 'App.jsx' || f.name === 'App.js'
  )

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

  // Build src/ preserving folder structure
  function buildSrcTree(nodes: FileNode[]): Record<string, any> {
    const result: Record<string, any> = {}
    for (const node of nodes) {
      if (node.name === 'package.json' || node.name === 'index.html') continue
      if (node.type === 'folder' && node.children) {
        result[node.name] = { directory: buildSrcTree(node.children) }
      } else if (node.type === 'file') {
        if (node.name.includes('/')) {
          const parts = node.name.split('/')
          const fileName = parts.pop()!
          let current = result
          for (const dir of parts) {
            if (!current[dir]) current[dir] = { directory: {} }
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

// ─── Interactive Terminal Hook ─────────────────────────────────────────────

function useXterm(containerEl: HTMLDivElement | null) {
  const termRef = useRef<Terminal | null>(null)
  const fitRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!containerEl) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
      lineHeight: 1.4,
      theme: {
        background: '#0d0e16',
        foreground: '#c8c8d0',
        cursor: '#a78bfa',
        cursorAccent: '#0d0e16',
        selectionBackground: '#7c3aed40',
        black: '#1a1a2e',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#fbbf24',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#e2e8f0',
        brightBlack: '#4a4a6a',
        brightRed: '#fca5a5',
        brightGreen: '#86efac',
        brightYellow: '#fde68a',
        brightBlue: '#93c5fd',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#f8fafc',
      },
      scrollback: 5000,
      convertEol: true,
      allowProposedApi: true,
    })

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.loadAddon(new WebLinksAddon())

    term.open(containerEl)

    // Small delay to ensure container has layout dimensions before fitting
    requestAnimationFrame(() => {
      try { fit.fit() } catch { /* ignore */ }
    })

    termRef.current = term
    fitRef.current = fit

    // Resize on container resize
    const ro = new ResizeObserver(() => {
      try { fit.fit() } catch { /* ignore */ }
    })
    ro.observe(containerEl)

    return () => {
      ro.disconnect()
      term.dispose()
      termRef.current = null
      fitRef.current = null
    }
  }, [containerEl])

  return { termRef, fitRef }
}

// ─── Preview Component ─────────────────────────────────────────────────────

const PreviewPanel = React.memo(function PreviewPanel({ files, className }: PreviewPanelProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'booting' | 'installing' | 'starting' | 'ready' | 'error'>('idle')
  const [termOpen, setTermOpen] = useState(true)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<WebContainer | null>(null)
  const prevHashRef = useRef('')
  const serverRef = useRef<any>(null)
  const bootingRef = useRef(false)
  const shellProcessRef = useRef<any>(null)

  // xterm container ref — use callback ref so useXterm reacts
  const [termEl, setTermEl] = useState<HTMLDivElement | null>(null)
  const { termRef, fitRef } = useXterm(termEl)

  // Stable files fingerprint
  const filesHash = useMemo(() => {
    const flat = flattenFiles(files)
    return flat.map(f => `${f.name}:${(f.content || '').length}:${(f.content || '').slice(0, 100)}`).join('|')
  }, [files])

  // ── Write colored text to xterm ──
  const write = useCallback((text: string, color?: 'red' | 'green' | 'yellow' | 'blue' | 'cyan' | 'dim' | 'bold') => {
    const t = termRef.current
    if (!t) return
    const codes: Record<string, string> = {
      red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
      blue: '\x1b[34m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m',
    }
    const reset = '\x1b[0m'
    if (color) {
      t.write(`${codes[color]}${text}${reset}`)
    } else {
      t.write(text)
    }
  }, [])

  const writeln = useCallback((text: string, color?: 'red' | 'green' | 'yellow' | 'blue' | 'cyan' | 'dim' | 'bold') => {
    write(text + '\r\n', color)
  }, [write])

  // ── Stream process output to xterm ──
  const streamToTerminal = useCallback(async (process: any) => {
    const reader = process.output.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = typeof value === 'string' ? value : new TextDecoder().decode(value)
        termRef.current?.write(text)
      }
    } catch {
      // stream ended
    }
  }, [])

  // ── Start interactive jsh shell ──
  const startShell = useCallback(async (wc: WebContainer) => {
    if (shellProcessRef.current) {
      try { shellProcessRef.current.kill() } catch {}
    }

    const term = termRef.current
    if (!term) return

    try {
      const shellProcess = await wc.spawn('jsh', {
        terminal: { cols: term.cols, rows: term.rows },
      })
      shellProcessRef.current = shellProcess

      // Pipe shell output → xterm
      const reader = shellProcess.output.getReader()
      ;(async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const text = typeof value === 'string' ? value : new TextDecoder().decode(value)
            term.write(text)
          }
        } catch { /* stream ended */ }
      })()

      // Pipe xterm input → shell stdin
      const input = shellProcess.input.getWriter()
      const disposeOnData = term.onData((data: string) => {
        input.write(data)
      })

      // Handle terminal resize
      const disposeOnResize = term.onResize(({ cols, rows }: { cols: number; rows: number }) => {
        shellProcess.resize({ cols, rows })
      })

      shellProcess.exit.then(() => {
        disposeOnData.dispose()
        disposeOnResize.dispose()
        shellProcessRef.current = null
      })

      return shellProcess
    } catch (err) {
      console.warn('Failed to start shell:', err)
    }
  }, [])

  // ── Main boot flow ──
  const bootAndRun = useCallback(async () => {
    if (bootingRef.current) return
    bootingRef.current = true

    setPreviewUrl(null)
    setErrMsg(null)

    // Wait for xterm to be ready (it's created async via state callback ref)
    await new Promise<void>(resolve => {
      const check = () => {
        if (termRef.current) { resolve(); return }
        setTimeout(check, 50)
      }
      check()
    })

    const term = termRef.current!
    term.clear()

    try {
      // Boot WebContainer
      setStatus('booting')
      writeln('⚡ Initializing WebContainer...', 'cyan')

      let wc: WebContainer
      try {
        wc = await getWebContainer()
      } catch (err: any) {
        // Handle "already booted" — reuse existing instance
        if (err.message?.includes('single WebContainer') && webcontainerInstance) {
          wc = webcontainerInstance
        } else {
          throw err
        }
      }
      containerRef.current = wc
      writeln('✓ Environment ready\r\n', 'green')

      // Mount files
      writeln('📁 Writing project files...', 'cyan')
      const fsTree = buildFSTree(files)
      await wc.mount(fsTree)
      const flat = flattenFiles(files)
      writeln(`   ${flat.length} files written`, 'dim')
      writeln('✓ Done\r\n', 'green')

      // Install dependencies
      setStatus('installing')
      writeln('📦 Installing dependencies...', 'cyan')
      writeln('$ npm install\r\n', 'bold')

      const installProcess = await wc.spawn('npm', ['install'])
      await streamToTerminal(installProcess)

      const exitCode = await installProcess.exit
      if (exitCode !== 0) {
        writeln(`\r\n✗ Install failed (exit ${exitCode})`, 'red')
        setStatus('error')
        setErrMsg(`Install failed (exit ${exitCode})`)
        writeln('\r\nStarting shell — you can run commands manually:\r\n', 'dim')
        await startShell(wc)
        bootingRef.current = false
        return
      }
      writeln('\r\n✓ Dependencies installed\r\n', 'green')

      // Start dev server
      setStatus('starting')
      writeln('🚀 Starting dev server...', 'cyan')
      writeln('$ npm run dev\r\n', 'bold')

      if (serverRef.current) {
        try { serverRef.current.kill() } catch {}
      }

      const devProcess = await wc.spawn('npm', ['run', 'dev'])
      serverRef.current = devProcess

      // Stream dev output to terminal
      streamToTerminal(devProcess)

      // Listen for server-ready
      wc.on('server-ready', (_port, url) => {
        writeln(`\r\n✓ Server running at ${url}`, 'green')
        writeln('─'.repeat(40), 'dim')
        writeln('You can type commands below (e.g. npm install <pkg>)\r\n', 'dim')
        setPreviewUrl(url)
        setStatus('ready')
      })

      devProcess.exit.then(async (code) => {
        if (code !== 0 && status !== 'ready') {
          writeln(`\r\n✗ Server exited (code ${code})`, 'red')
          setStatus('error')
          setErrMsg(`Dev server crashed (exit ${code})`)
        }
        // Start interactive shell once server exits
        writeln('\r\n', undefined)
        await startShell(wc)
      })

    } catch (err: any) {
      writeln(`\r\n✗ ${err.message}`, 'red')
      setStatus('error')
      setErrMsg(err.message)
      // Start shell if we have a container so user can debug
      if (containerRef.current) {
        writeln('\r\nStarting shell — you can debug manually:\r\n', 'dim')
        await startShell(containerRef.current)
      }
    } finally {
      bootingRef.current = false
    }
  }, [files, writeln, write, streamToTerminal, startShell])

  // Trigger on file changes
  useEffect(() => {
    if (files.length === 0) return
    if (filesHash === prevHashRef.current) return
    prevHashRef.current = filesHash

    if (containerRef.current && status === 'ready') {
      // Hot-remount files
      ;(async () => {
        try {
          writeln('\r\n📁 Updating files...', 'cyan')
          const fsTree = buildFSTree(files)
          await containerRef.current!.mount(fsTree)
          writeln('✓ Files synced (HMR)\r\n', 'green')
        } catch (err: any) {
          writeln(`✗ File sync failed: ${err.message}\r\n`, 'red')
        }
      })()
    } else if (status === 'idle' || status === 'error') {
      bootAndRun()
    }
  }, [filesHash, files, status, bootAndRun, writeln])

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
    if (shellProcessRef.current) {
      try { shellProcessRef.current.kill() } catch {}
      shellProcessRef.current = null
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
                localhost
              </span>
            )}
            {status === 'error' && <span className="text-red-400">Error</span>}
          </span>

          {status === 'ready' && (
            <div className="flex items-center gap-0.5 ml-2 bg-white/5 rounded p-0.5">
              <button
                onClick={() => setDevice('desktop')}
                title="Desktop view"
                className={cn("p-0.5 rounded transition-colors",
                  device === 'desktop' ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
                )}
              >
                <Maximize2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                title="Mobile view"
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
            title="Toggle terminal"
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
                title="Refresh preview"
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
            title="Restart environment"
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Restart
          </button>
        </div>
      </div>

      {/* Terminal panel — real xterm.js interactive terminal */}
      <div
        className={cn(
          "shrink-0 border-b border-white/[0.06] overflow-hidden transition-all duration-200",
          termOpen ? "h-[220px]" : "h-0 border-b-0"
        )}
      >
        <div
          ref={setTermEl}
          className="w-full h-full"
          style={{ padding: '4px 0 4px 8px' }}
        />
      </div>

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
