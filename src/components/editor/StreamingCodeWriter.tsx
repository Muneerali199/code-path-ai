import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { cn } from '@/lib/utils'
import {
  Check,
  Loader2,
  Sparkles,
  Clock,
  ChevronRight,
} from 'lucide-react'

export interface StreamingFile {
  id: string
  name: string
  content: string
  language: string
  type: 'file' | 'folder'
}

interface StreamingCodeWriterProps {
  files: StreamingFile[]
  onComplete: (files: StreamingFile[]) => void
  onCancel?: () => void
  className?: string
  speed?: number // chars per tick (default 8)
}

type FileStatus = 'pending' | 'writing' | 'done'

const languageIcons: Record<string, string> = {
  tsx: '⚛️',
  jsx: '⚛️',
  ts: '🔷',
  js: '🟡',
  css: '🎨',
  html: '🌐',
  json: '📋',
  md: '📝',
  py: '🐍',
  rs: '🦀',
  go: '🐹',
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop() || ''
  return languageIcons[ext] || '📄'
}

function getLanguageFromName(name: string): string {
  const ext = name.split('.').pop() || ''
  const map: Record<string, string> = {
    tsx: 'typescript',
    ts: 'typescript',
    jsx: 'javascript',
    js: 'javascript',
    css: 'css',
    html: 'html',
    json: 'json',
    md: 'markdown',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    rb: 'ruby',
    php: 'php',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    sh: 'shell',
    bash: 'shell',
    dockerfile: 'dockerfile',
  }
  return map[ext] || 'plaintext'
}

export default function StreamingCodeWriter({
  files,
  onComplete,
  onCancel,
  className,
  speed = 8,
}: StreamingCodeWriterProps) {
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  const [displayedContent, setDisplayedContent] = useState('')
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [progress, setProgress] = useState(0)

  // Use refs for animation state to avoid stale closures
  const animFrameRef = useRef<number | null>(null)
  const lastTickRef = useRef(0)
  const activeIndexRef = useRef(0)
  const charIndexRef = useRef(0)
  const completedContentsRef = useRef<Record<number, string>>({})
  const isCompleteRef = useRef(false)
  const selectedTabRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Only process actual files (not folders)
  const fileList = useRef(files.filter(f => f.type === 'file' && f.content))

  // Update fileList when files prop changes
  useEffect(() => {
    fileList.current = files.filter(f => f.type === 'file' && f.content)
  }, [files])

  // Initialize on mount / files change
  useEffect(() => {
    const list = files.filter(f => f.type === 'file' && f.content)
    fileList.current = list

    const statuses: Record<string, FileStatus> = {}
    list.forEach((f, i) => {
      statuses[f.id] = i === 0 ? 'writing' : 'pending'
    })
    setFileStatuses(statuses)
    setSelectedTab(0)
    setDisplayedContent('')
    setIsComplete(false)
    setProgress(0)

    activeIndexRef.current = 0
    charIndexRef.current = 0
    completedContentsRef.current = {}
    isCompleteRef.current = false
    selectedTabRef.current = 0
    lastTickRef.current = 0
  }, [files])

  // Elapsed timer
  useEffect(() => {
    if (isComplete) return
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime, isComplete])

  // Main animation loop — all mutable state is in refs
  useEffect(() => {
    const list = fileList.current
    if (list.length === 0) return

    const totalChars = list.reduce((a, f) => a + f.content.length, 0)
    const TICK_MS = 16 // ~60fps
    const charsPerTick = speed

    const tick = (timestamp: number) => {
      if (isCompleteRef.current) return

      if (timestamp - lastTickRef.current < TICK_MS) {
        animFrameRef.current = requestAnimationFrame(tick)
        return
      }
      lastTickRef.current = timestamp

      const idx = activeIndexRef.current
      const currentFile = list[idx]
      if (!currentFile) return

      const targetContent = currentFile.content
      const nextChar = Math.min(charIndexRef.current + charsPerTick, targetContent.length)
      charIndexRef.current = nextChar

      const sliced = targetContent.slice(0, nextChar)

      // Only update displayed content if this file's tab is selected
      if (selectedTabRef.current === idx) {
        setDisplayedContent(sliced)
      }

      // Update progress
      const charsWrittenBefore = Object.values(completedContentsRef.current).reduce((a, b) => a + b.length, 0)
      const pct = totalChars > 0 ? Math.round(((charsWrittenBefore + nextChar) / totalChars) * 100) : 0
      setProgress(pct)

      if (nextChar >= targetContent.length) {
        // File done
        completedContentsRef.current[idx] = targetContent
        setFileStatuses(prev => ({ ...prev, [currentFile.id]: 'done' }))

        const nextIndex = idx + 1
        if (nextIndex < list.length) {
          activeIndexRef.current = nextIndex
          charIndexRef.current = 0
          selectedTabRef.current = nextIndex
          setSelectedTab(nextIndex)
          setDisplayedContent('')
          setFileStatuses(prev => ({
            ...prev,
            [list[nextIndex].id]: 'writing',
          }))
        } else {
          // All done
          isCompleteRef.current = true
          setIsComplete(true)
          setProgress(100)
          return // Don't schedule another frame
        }
      }

      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [files, speed]) // Only re-run when files or speed change

  // Auto-complete callback
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onCompleteRef.current(fileList.current)
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [isComplete])

  // Handle tab selection — show completed content or live content
  const handleTabSelect = (index: number) => {
    setSelectedTab(index)
    selectedTabRef.current = index

    if (completedContentsRef.current[index] !== undefined) {
      setDisplayedContent(completedContentsRef.current[index])
    } else if (index === activeIndexRef.current) {
      // Currently writing this file — show what we have so far
      const currentFile = fileList.current[index]
      if (currentFile) {
        setDisplayedContent(currentFile.content.slice(0, charIndexRef.current))
      }
    } else {
      setDisplayedContent(`// ${fileList.current[index]?.name} — waiting...`)
    }
  }

  const list = fileList.current
  const currentFile = list[selectedTab]
  const completedCount = Object.keys(completedContentsRef.current).length
  const statsWritten = completedCount + (activeIndexRef.current < list.length && !isComplete ? 1 : 0)

  if (list.length === 0) return null

  return (
    <div className={cn('flex flex-col h-full bg-[#0d0d15] overflow-hidden', className)}>
      {/* Top Progress Bar */}
      <div className="relative">
        <div className="h-0.5 bg-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-violet-900/30 via-[#0d0d15] to-blue-900/20 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Sparkles className="w-4 h-4 text-violet-400" />
            {!isComplete && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-400 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-sm font-medium text-white/80">
            {isComplete ? 'Code Generation Complete' : 'AI is writing code...'}
          </span>
          <span className="text-xs text-white/30 ml-2">
            {statsWritten}/{list.length} files • {progress}%
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {elapsed}s
          </span>
          {!isComplete && onCancel && (
            <button
              onClick={onCancel}
              className="text-white/30 hover:text-red-400 transition-colors px-2 py-0.5 rounded hover:bg-red-500/10"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex items-center bg-[#0a0a12] border-b border-white/[0.06] overflow-x-auto scrollbar-none">
        {list.map((file, index) => {
          const status = fileStatuses[file.id] || 'pending'
          const isSelected = selectedTab === index
          return (
            <button
              key={file.id}
              onClick={() => handleTabSelect(index)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border-r border-white/[0.04] whitespace-nowrap transition-all duration-200 min-w-0',
                isSelected
                  ? 'bg-[#0d0d15] text-white/80 border-b-2 border-b-violet-500'
                  : 'text-white/30 hover:text-white/50 hover:bg-white/[0.02]'
              )}
            >
              {status === 'writing' ? (
                <Loader2 className="w-3 h-3 text-violet-400 animate-spin flex-shrink-0" />
              ) : status === 'done' ? (
                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              ) : (
                <span className="text-[10px] flex-shrink-0">{getFileIcon(file.name)}</span>
              )}
              <span className="truncate max-w-[120px]">{file.name}</span>
              {status === 'writing' && (
                <span className="flex-shrink-0 ml-1">
                  <span className="inline-block w-1.5 h-3 bg-violet-400 animate-pulse rounded-sm" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          key={`streaming-${selectedTab}`}
          height="100%"
          language={currentFile ? getLanguageFromName(currentFile.name) : 'plaintext'}
          value={displayedContent}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: 'on',
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            automaticLayout: true,
            smoothScrolling: true,
            renderLineHighlight: 'none',
            folding: false,
            wordWrap: 'on',
            guides: { indentation: true },
            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          }}
        />

        {/* Cursor line indicator for the active writing file */}
        {selectedTab === activeIndexRef.current && !isComplete && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-violet-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] text-white/90 shadow-lg shadow-violet-500/20">
            <Loader2 className="w-3 h-3 animate-spin" />
            Writing {currentFile?.name}...
          </div>
        )}
      </div>

      {/* File list sidebar (compact, at the bottom) */}
      <div className="border-t border-white/[0.06] bg-[#0a0a12] px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {list.map((file, index) => {
          const status = fileStatuses[file.id] || 'pending'
          return (
            <div
              key={file.id}
              className={cn(
                'flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md transition-all whitespace-nowrap',
                status === 'done'
                  ? 'text-emerald-400/80 bg-emerald-500/10'
                  : status === 'writing'
                    ? 'text-violet-400 bg-violet-500/15 ring-1 ring-violet-500/30'
                    : 'text-white/20'
              )}
            >
              {status === 'writing' && <ChevronRight className="w-3 h-3 animate-pulse" />}
              {status === 'done' && <Check className="w-3 h-3" />}
              {file.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}
