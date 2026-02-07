import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import EnhancedFileExplorer from '@/components/ide/EnhancedFileExplorer'
import EnhancedCodeEditor from '@/components/editor/EnhancedCodeEditor'
import DualAISystem from '@/components/ai/DualAISystem'
import OutputPanel from '@/components/editor/OutputPanel'
import DiffView from '@/components/editor/DiffView'
import StreamingCodeWriter, { type StreamingFile } from '@/components/editor/StreamingCodeWriter'
import SessionTimeline from '@/components/ide/SessionTimeline'
import SkillSummary from '@/components/ide/SkillSummary'
import StatusBar from '@/components/ide/StatusBar'
import EnhancedIDEHeader from './EnhancedIDEHeader'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import {
  createProject,
  getProject,
  updateProjectFiles,
  getDefaultProjectFiles,
  type Project,
  type ProjectFile,
} from '@/services/projectService'
import {
  extractSkills,
  extractSkillsFromChanges,
  createSession,
  addChangeToSession,
  endSession,
  type CodeChange,
} from '@/services/sessionService'

// Helper: wait for Firebase auth to resolve
function useAuthReady() {
  const auth = useAuth()
  return { ...auth, isReady: !auth.loading }
}

import PreviewPanel from '@/components/editor/PreviewPanel'
import { callMistralAI } from '@/services/aiService'
import { FileGenerationService } from '@/services/fileGeneration'

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileNode[]
  isHidden?: boolean
  isExpanded?: boolean
}

interface EnhancedIDELayoutProps {
  projectId?: string
}

export default function EnhancedIDELayout({ projectId }: EnhancedIDELayoutProps) {
  const navigate = useNavigate()
  const { user, isReady } = useAuthReady()
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<FileNode[]>([])
  const [activeFile, setActiveFile] = useState<FileNode | null>(null)
  const [output, setOutput] = useState<string>('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [aiPanelVisible, setAiPanelVisible] = useState(true)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Session tracking state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionChanges, setSessionChanges] = useState<CodeChange[]>([])
  const [sessionSkills, setSessionSkills] = useState<string[]>([])
  const [sessionStart, setSessionStart] = useState<string | null>(null)
  const [selectedDiffChange, setSelectedDiffChange] = useState<CodeChange | null>(null)
  const [bottomTab, setBottomTab] = useState<'output' | 'timeline' | 'skills'>('output')



  // Pending AI change state (for diff view + accept/reject)
  const [pendingChange, setPendingChange] = useState<{
    originalCode: string
    newCode: string
    description?: string
    source: 'ai-generate' | 'ai-modify' | 'ai-improve'
  } | null>(null)

  // Streaming code writer state
  const [streamingFiles, setStreamingFiles] = useState<StreamingFile[] | null>(null)

  // Auto-save debounce
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedFilesRef = useRef<string>('')

  // Refs to track latest project/files for unmount flush
  const projectRef = useRef<Project | null>(null)
  const filesRef = useRef<FileNode[]>([])
  useEffect(() => { projectRef.current = project }, [project])
  useEffect(() => { filesRef.current = files }, [files])

  // Immediate save — no debounce, for critical saves (AI generation, unmount)
  const immediateSave = useCallback(async (projectIdToSave: string, filesToSave: FileNode[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    const filesJson = JSON.stringify(filesToSave)
    if (filesJson === lastSavedFilesRef.current) return
    try {
      await updateProjectFiles(projectIdToSave, filesToSave as ProjectFile[])
      lastSavedFilesRef.current = filesJson
      console.log('Project saved successfully')
    } catch (err) {
      console.error('Save failed:', err)
    }
  }, [])

  // Debounced auto-save to Supabase (for user typing)
  // Always reads from filesRef at save time to get the latest state
  const debouncedSave = useCallback((projectIdToSave: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const filesToSave = filesRef.current
      const filesJson = JSON.stringify(filesToSave)
      if (filesJson === lastSavedFilesRef.current) return
      try {
        await updateProjectFiles(projectIdToSave, filesToSave as ProjectFile[])
        lastSavedFilesRef.current = filesJson
      } catch (err) {
        console.error('Auto-save failed:', err)
      }
    }, 2000) // Save 2 seconds after last change
  }, [])

  // Load or create project — only runs after Firebase auth is ready
  useEffect(() => {
    // Don't run until Firebase auth has resolved
    if (!isReady) return

    const initProject = async () => {
      setIsLoading(true)
      const firebaseUid = user?.uid

      try {
        // Case 1: Loading an existing project by ID
        if (projectId) {
          const existing = await getProject(projectId)
          if (existing) {
            setProject(existing)
            setFiles(existing.files as FileNode[])
            lastSavedFilesRef.current = JSON.stringify(existing.files)
            const first = findFirstFile(existing.files as FileNode[])
            if (first) setActiveFile(first)
            setIsLoading(false)
            return
          } else {
            toast.error('Project not found')
            navigate('/dashboard')
            return
          }
        }

        // Case 2: Coming from Dashboard with a prompt
        const pendingPrompt = localStorage.getItem('websitePrompt')
        if (pendingPrompt) {
          localStorage.removeItem('websitePrompt')

          if (firebaseUid) {
            // Create a new project in Supabase with default template files
            const newProject = await createProject(firebaseUid, {
              prompt: pendingPrompt,
              description: pendingPrompt,
              template: 'website',
              files: getDefaultProjectFiles(),
            })

            setProject(newProject)
            setFiles(newProject.files as FileNode[])
            lastSavedFilesRef.current = JSON.stringify(newProject.files)
            const first = findFirstFile(newProject.files as FileNode[])
            if (first) setActiveFile(first)

            // Update URL to include the project ID (without remounting the component)
            window.history.replaceState(null, '', `/editor/${newProject.id}`)
            toast.success('Project created!')
            setIsLoading(false)
            return
          } else {
            // Not logged in but has prompt — use local fallback with the prompt as description
            const defaultFiles = getDefaultProjectFiles() as FileNode[]
            const fallback: Project = {
              id: 'local',
              firebase_uid: '',
              name: pendingPrompt.slice(0, 50),
              description: pendingPrompt,
              template: 'website',
              prompt: pendingPrompt,
              files: defaultFiles,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            setProject(fallback)
            setFiles(defaultFiles)
            const first = findFirstFile(defaultFiles)
            if (first) setActiveFile(first)
            toast.info('Sign in to save your projects')
            setIsLoading(false)
            return
          }
        }

        // Case 3: Opening /editor directly — create a default project
        if (firebaseUid) {
          const newProject = await createProject(firebaseUid, {
            name: 'Welcome Project',
            template: 'default',
            description: 'A starter project to get you coding',
            files: getDefaultProjectFiles(),
          })
          setProject(newProject)
          setFiles(newProject.files as FileNode[])
          lastSavedFilesRef.current = JSON.stringify(newProject.files)
          const first = findFirstFile(newProject.files as FileNode[])
          if (first) setActiveFile(first)
          window.history.replaceState(null, '', `/editor/${newProject.id}`)
          setIsLoading(false)
          return
        }

        // Case 4: Not logged in and no prompt — use local-only fallback
        const defaultFiles = getDefaultProjectFiles() as FileNode[]
        const fallback: Project = {
          id: 'local',
          firebase_uid: '',
          name: 'Welcome Project',
          description: 'Sign in to save your projects',
          template: 'default',
          prompt: null,
          files: defaultFiles,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setProject(fallback)
        setFiles(defaultFiles)
        const first = findFirstFile(defaultFiles)
        if (first) setActiveFile(first)
      } catch (error) {
        console.error('Error initializing project:', error)
        toast.error('Failed to create project. Using local mode.')
        // Fallback to local defaults
        const defaultFiles = getDefaultProjectFiles() as FileNode[]
        const pendingPrompt = localStorage.getItem('websitePrompt')
        localStorage.removeItem('websitePrompt')
        setProject({
          id: 'local',
          firebase_uid: '',
          name: pendingPrompt?.slice(0, 50) || 'Welcome Project',
          description: pendingPrompt || null,
          template: 'default',
          prompt: pendingPrompt || null,
          files: defaultFiles,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        setFiles(defaultFiles)
        const first = findFirstFile(defaultFiles)
        if (first) setActiveFile(first)
      } finally {
        setIsLoading(false)
      }
    }

    initProject()
    // Cleanup: flush any pending save on unmount instead of discarding
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      // Flush pending save immediately
      const p = projectRef.current
      const f = filesRef.current
      if (p && p.id !== 'local' && f.length > 0) {
        const filesJson = JSON.stringify(f)
        if (filesJson !== lastSavedFilesRef.current) {
          updateProjectFiles(p.id, f as ProjectFile[]).catch(err =>
            console.error('Unmount save failed:', err)
          )
        }
      }
    }
  }, [projectId, user?.uid, isReady])

  // Warn before closing tab if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const p = projectRef.current
      const f = filesRef.current
      if (p && p.id !== 'local' && f.length > 0) {
        const filesJson = JSON.stringify(f)
        if (filesJson !== lastSavedFilesRef.current) {
          // Attempt to save
          updateProjectFiles(p.id, f as ProjectFile[]).catch(console.error)
          e.preventDefault()
          e.returnValue = ''
        }
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Find first file in project structure
  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') {
        return node
      }
      if (node.children) {
        const found = findFirstFile(node.children)
        if (found) return found
      }
    }
    return null
  }

  // Handle file selection
  const handleFileSelect = (file: FileNode) => {
    console.log("Setting active file:", file.name, file.id);
    // Clear any pending AI change when switching files
    if (pendingChange) {
      setPendingChange(null)
    }
    setActiveFile(file)
    activeFileRef.current = file  // sync ref immediately
    toast.info(`Opened ${file.name}`)
  }

  // Handle file changes (from file explorer: rename, delete, new file, etc.)
  const handleFileChange = useCallback((updatedFiles: FileNode[]) => {
    setFiles(updatedFiles)
    filesRef.current = updatedFiles  // sync ref immediately
    
    if (project) {
      setProject(prev => prev ? { ...prev, files: updatedFiles } : prev)
      if (project.id !== 'local') {
        debouncedSave(project.id)
      }
    }
  }, [project, debouncedSave])

  // Ref to track the active file ID — prevents stale closure from overwriting the wrong file
  const activeFileRef = useRef<FileNode | null>(activeFile)
  useEffect(() => { activeFileRef.current = activeFile }, [activeFile])

  // Track user code edits (debounced — captures snapshot every meaningful edit)
  const userEditTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousCodeRef = useRef<string>('')

  const trackUserEdit = useCallback((before: string, after: string) => {
    if (!activeFile || before === after) return
    if (userEditTimerRef.current) clearTimeout(userEditTimerRef.current)

    userEditTimerRef.current = setTimeout(() => {
      const change: CodeChange = {
        id: `user-${Date.now()}`,
        timestamp: new Date().toISOString(),
        fileId: activeFile.id,
        fileName: activeFile.name,
        before,
        after,
        source: 'user',
        description: `Edited ${activeFile.name}`,
        concepts: extractSkills(after),
      }
      setSessionChanges(prev => {
        const next = [...prev, change]
        setSessionSkills(extractSkillsFromChanges(next))
        return next
      })
      if (sessionId) {
        addChangeToSession(sessionId, change).catch(() => {})
      }
      previousCodeRef.current = after
    }, 5000) // Track user edits every 5s of inactivity
  }, [activeFile, sessionId])

  // Handle code changes
  const handleCodeChange = useCallback((content: string) => {
    // Always read from ref to get the CURRENT activeFile (not a stale closure)
    const currentFile = activeFileRef.current
    if (!currentFile) return
    // Skip no-op changes (e.g. Monaco fires onChange on mount with same value)
    if (content === currentFile.content) return
    // Guard: never wipe real content with empty string (protects against stale callbacks)
    if (content === '' && (currentFile.content || '').length > 0) return

    const beforeContent = currentFile.content || ''
    const updatedFile = { ...currentFile, content }
    setActiveFile(updatedFile)
    // Sync activeFileRef IMMEDIATELY (useEffect runs after render — too late)
    activeFileRef.current = updatedFile

    // Track user edit for session
    trackUserEdit(beforeContent, content)

    // Helper to walk the tree and update the matching file's content
    const fileId = currentFile.id
    const updateFileContent = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === fileId) {
          return { ...node, content }
        }
        if (node.children) {
          return { ...node, children: updateFileContent(node.children) }
        }
        return node
      })
    }

    // Sync filesRef SYNCHRONOUSLY so applyGeneratedFiles always reads fresh data.
    // React's setFiles(updater) runs during the render phase, not at the call site,
    // so setting filesRef inside the updater is NOT immediate from the caller's POV.
    filesRef.current = updateFileContent(filesRef.current)

    // Queue React state update (functional updater for correctness with batching)
    setFiles(prevFiles => updateFileContent(prevFiles))

    const p = projectRef.current
    if (p && p.id !== 'local') {
      debouncedSave(p.id)
    }
  }, [debouncedSave, trackUserEdit])

  // Handle code execution
  const handleExecute = async (code: string, language: string) => {
    // Firebase Cloud Function URL
    const functionUrl = 'https://us-central1-codepath-3ea5e.cloudfunctions.net/executeCode'
    const canRunLocally = ['javascript', 'js'].includes(language.toLowerCase())

    setIsExecuting(true)
    setOutput('')

    // Local execution for JavaScript
    if (canRunLocally) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        const logs: string[] = []
        const originalConsole = { ...console }
        
        console.log = (...args) => {
          logs.push(args.map(arg => String(arg)).join(' '))
        }
        
        const func = new Function(code)
        func()
        
        Object.assign(console, originalConsole)
        setOutput(logs.join('\n') || 'Code executed successfully (no output)')
        toast.success('Code executed successfully')
      } catch (error) {
        setOutput(`Error: ${error.message}`)
        toast.error('Execution failed')
      } finally {
        setIsExecuting(false)
      }
      return
    }

    // Remote execution for other languages
    try {
      const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, language }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Execution failed')
      }
      
      setOutput(data.output || 'No output')
      toast.success('Code executed successfully')
    } catch (error) {
      setOutput(`Error executing code: ${error.message || error}`)
      toast.error('Code execution failed')
    } finally {
      setIsExecuting(false)
    }
  }

  // Handle AI code update — stream the new code, then show diff for accept/reject
  const handleAICodeUpdate = useCallback((newCode: string) => {
    // Find the target file: use activeFile, or find first file, or create a fallback
    let currentActive = activeFile
    if (!currentActive) {
      currentActive = findFirstFile(filesRef.current)
    }
    if (!currentActive) {
      // No files at all — create a fallback file
      currentActive = {
        id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'App.tsx',
        type: 'file' as const,
        content: '',
        language: 'typescript',
      }
      // Add this file to the files list
      setFiles(prev => [...prev, currentActive!])
      filesRef.current = [...filesRef.current, currentActive]
    }

    // Stream the single file first
    const singleFile: StreamingFile = {
      id: currentActive.id,
      name: currentActive.name,
      content: newCode,
      language: currentActive.language || 'javascript',
      type: 'file',
    }
    // Store the pending change for after streaming
    pendingAfterStreamRef.current = {
      originalCode: currentActive.content || '',
      newCode,
      description: 'AI-generated code changes',
      source: 'ai-modify' as const,
    }
    // Ensure activeFile is set
    if (!activeFile) setActiveFile(currentActive)
    setStreamingFiles([singleFile])
    toast.info('AI is writing code...')
  }, [activeFile])

  // Ref for pending change data after single-file streaming
  const pendingAfterStreamRef = useRef<{
    originalCode: string
    newCode: string
    description: string
    source: 'ai-generate' | 'ai-modify' | 'ai-improve'
  } | null>(null)

  // Accept pending AI change
  const handleAcceptChange = () => {
    if (pendingChange && activeFile) {
      handleCodeChange(pendingChange.newCode)
      // Force immediate save after accepting AI changes
      setTimeout(() => {
        const p = projectRef.current
        const f = filesRef.current
        if (p && p.id !== 'local' && f.length > 0) {
          immediateSave(p.id, f)
        }
      }, 100)
      toast.success('AI changes accepted')
      setPendingChange(null)
    }
  }

  // Reject pending AI change
  const handleRejectChange = () => {
    setPendingChange(null)
    toast.info('AI changes rejected')
  }

  // Ref to hold processed files during streaming
  const streamingProcessedRef = useRef<FileNode[]>([])

  // Apply generated files after streaming completes (or directly if no streaming)
  const applyGeneratedFiles = useCallback((processedFiles: FileNode[]) => {
    /**
     * Merge AI-generated files into the existing file tree.
     *
     * AI files come as flat entries with path-like names:
     *   { name: "components/Card.tsx", type: "file", content: "..." }
     *   { name: "App.tsx", type: "file", content: "..." }
     *
     * We need to:
     *  1. For files with `/` in the name — split into directory path + filename
     *     and nest them into the `src` folder of the existing tree.
     *  2. For bare files (e.g. "App.tsx") — match against existing files recursively
     *     (including inside `src/`) and update in-place, or add to `src/` if no match.
     */
    const insertFileAtPath = (tree: FileNode[], relPath: string, file: FileNode): FileNode[] => {
      const parts = relPath.split('/')
      if (parts.length === 1) {
        // Leaf file — try to update existing, otherwise add
        const idx = tree.findIndex(f => f.name === parts[0])
        if (idx >= 0) {
          const updated = [...tree]
          updated[idx] = { ...updated[idx], content: file.content, language: file.language, id: updated[idx].id }
          return updated
        }
        return [...tree, { ...file, name: parts[0] }]
      }

      // Need to descend into a folder
      const dirName = parts[0]
      const rest = parts.slice(1).join('/')
      const dirIdx = tree.findIndex(f => f.name === dirName && f.type === 'folder')
      const updated = [...tree]

      if (dirIdx >= 0) {
        // Folder exists — recurse into it
        const dir = updated[dirIdx]
        updated[dirIdx] = {
          ...dir,
          children: insertFileAtPath(dir.children || [], rest, file),
          isExpanded: true,
        }
      } else {
        // Create the folder
        updated.push({
          id: `folder-${dirName}-${Date.now()}`,
          name: dirName,
          type: 'folder',
          children: insertFileAtPath([], rest, file),
          isExpanded: true,
        })
      }
      return updated
    }

    const findFileByNameDeep = (nodes: FileNode[], name: string): FileNode | null => {
      for (const n of nodes) {
        if (n.name === name && n.type === 'file') return n
        if (n.children) {
          const found = findFileByNameDeep(n.children, name)
          if (found) return found
        }
      }
      return null
    }

    const updateFileByNameDeep = (nodes: FileNode[], name: string, update: Partial<FileNode>): FileNode[] => {
      return nodes.map(n => {
        if (n.name === name && n.type === 'file') {
          return { ...n, ...update, id: n.id }
        }
        if (n.children) {
          return { ...n, children: updateFileByNameDeep(n.children, name, update) }
        }
        return n
      })
    }

    // Use functional updater to read latest files, avoiding stale filesRef race condition
    // We build the merge inside a ref so we can use it in setFiles
    let merged = [...filesRef.current]

    // Ensure a `src` folder exists in the tree — create one if not present
    let srcIdx = merged.findIndex(f => f.name === 'src' && f.type === 'folder')
    if (srcIdx < 0) {
      merged.push({
        id: `folder-src-${Date.now()}`,
        name: 'src',
        type: 'folder',
        isExpanded: true,
        children: [],
      })
      srcIdx = merged.length - 1
    }

    for (const genFile of processedFiles) {
      let name = genFile.name

      // Normalize: strip leading `src/` — we always insert into the src folder node
      if (name.startsWith('src/')) {
        name = name.slice(4)
      }

      if (name.includes('/')) {
        // Path-like name (e.g. "components/Card.tsx") — insert inside `src`
        const si = merged.findIndex(f => f.name === 'src' && f.type === 'folder')
        const srcFolder = merged[si]
        merged[si] = {
          ...srcFolder,
          children: insertFileAtPath(srcFolder.children || [], name, genFile),
        }
      } else {
        // Bare name (e.g. "App.tsx") — try deep match first
        const existingFile = findFileByNameDeep(merged, name)
        if (existingFile) {
          merged = updateFileByNameDeep(merged, name, { content: genFile.content, language: genFile.language })
        } else {
          // New file — add into src/
          const si = merged.findIndex(f => f.name === 'src' && f.type === 'folder')
          const srcFolder = merged[si]
          merged[si] = {
            ...srcFolder,
            children: [...(srcFolder.children || []), { ...genFile, name }],
          }
        }
      }
    }

    const finalFiles = merged.length > 0 ? merged : processedFiles

    // Use setFiles with the computed finalFiles — filesRef is already up-to-date
    // because handleCodeChange now syncs it inside the functional updater
    setFiles(finalFiles)
    // Immediately sync ref so downstream code and future calls see the latest
    filesRef.current = finalFiles

    // Update project state in the same render batch (no setTimeout)
    const currentProject = projectRef.current
    if (currentProject) {
      setProject(prev => prev ? { ...prev, files: finalFiles } : prev)
      if (currentProject.id !== 'local') {
        // Save after a microtask to ensure state has flushed
        Promise.resolve().then(() => {
          immediateSave(currentProject.id, finalFiles)
        })
      }
    }

    // Preserve the user's current active file if it still exists in the merged tree.
    // Only switch to App.tsx / index.tsx when there's no active file (first generation).
    const currentActive = activeFileRef.current
    if (currentActive) {
      const stillExists = findFileByNameDeep(finalFiles, currentActive.name)
      if (stillExists) {
        // Re-set activeFile with potentially updated content from the merge
        setActiveFile(stillExists)
        activeFileRef.current = stillExists
      } else {
        // Current file was removed — fall back to App.tsx / index.tsx
        const mainFile = findFileByNameDeep(finalFiles, 'App.tsx') ||
                         findFileByNameDeep(finalFiles, 'index.tsx') ||
                         findFirstFile(finalFiles)
        if (mainFile) {
          setActiveFile(mainFile)
          activeFileRef.current = mainFile
        }
      }
    } else {
      // No active file — pick App.tsx / index.tsx / first file
      const mainFile = findFileByNameDeep(finalFiles, 'App.tsx') ||
                       findFileByNameDeep(finalFiles, 'index.tsx') ||
                       findFirstFile(finalFiles)
      if (mainFile) {
        setActiveFile(mainFile)
        activeFileRef.current = mainFile
      }
    }

    toast.success('Project files applied successfully')

    // Show preview immediately — WebContainer handles deps + dev server internally
    setTimeout(() => {
      setPreviewVisible(true)
    }, 300)
  }, [immediateSave])

  // Handle AI file generation
  const handleFilesGenerated = useCallback((newFiles: any[]) => {
    // Helper to process files and ensure IDs
    const processFiles = (items: any[]): FileNode[] => {
      return items.map(item => ({
        id: item.id || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        type: item.type,
        content: item.content,
        language: item.language,
        children: item.children ? processFiles(item.children) : undefined,
        isExpanded: item.type === 'folder' // Auto expand generated folders
      }))
    }

    const processedFiles = processFiles(newFiles)

    // Collect flat file list for streaming
    const collectStreamingFiles = (nodes: FileNode[]): StreamingFile[] => {
      const result: StreamingFile[] = []
      for (const node of nodes) {
        if (node.type === 'file' && node.content) {
          result.push({
            id: node.id,
            name: node.name,
            content: node.content,
            language: node.language || 'text',
            type: 'file',
          })
        }
        if (node.children) result.push(...collectStreamingFiles(node.children))
      }
      return result
    }

    const filesToStream = collectStreamingFiles(processedFiles)

    if (filesToStream.length > 0) {
      // Start streaming animation — store processedFiles for later
      streamingProcessedRef.current = processedFiles
      setStreamingFiles(filesToStream)
      toast.info(`Writing ${filesToStream.length} files...`)
    } else {
      // No streamable files — apply directly
      applyGeneratedFiles(processedFiles)
    }
  }, [applyGeneratedFiles])

  // Handle streaming completion
  const handleStreamingComplete = useCallback(() => {
    setStreamingFiles(null)

    // Check if this was a single-file AI update (needs diff review)
    if (pendingAfterStreamRef.current) {
      const pending = pendingAfterStreamRef.current
      pendingAfterStreamRef.current = null
      setPendingChange(pending)
      toast.info('Review AI changes — Accept or Reject')
      return
    }

    // Multi-file generation — apply all files
    const processedFiles = streamingProcessedRef.current
    applyGeneratedFiles(processedFiles)
  }, [applyGeneratedFiles])

  // Cancel streaming — apply files immediately
  const handleStreamingCancel = useCallback(() => {
    setStreamingFiles(null)

    if (pendingAfterStreamRef.current) {
      const pending = pendingAfterStreamRef.current
      pendingAfterStreamRef.current = null
      setPendingChange(pending)
      toast.info('Review AI changes — Accept or Reject')
      return
    }

    const processedFiles = streamingProcessedRef.current
    applyGeneratedFiles(processedFiles)
    toast.info('Streaming skipped — files applied')
  }, [applyGeneratedFiles])

  // Handle AI fix for preview errors — called when user clicks "Fix with AI" in preview
  const handlePreviewAIFix = useCallback(async (errorLog: string) => {
    // Collect project file info for context
    const currentFiles = filesRef.current
    const projectFiles: { name: string; content: string; language: string }[] = []
    const collectFiles = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'file' && node.content) {
          projectFiles.push({ name: node.name, content: node.content, language: node.language || 'text' })
        }
        if (node.children) collectFiles(node.children)
      })
    }
    collectFiles(currentFiles)

    toast.info('AI is analyzing the error...')

    try {
      const result = await callMistralAI({
        message: `Fix the following build/runtime error in my project.\n\nError log:\n\`\`\`\n${errorLog.slice(-3000)}\n\`\`\`\n\nPlease fix the problematic file(s) and return the corrected code.`,
        mode: 'fix' as any,
        context: {
          projectFiles: projectFiles.slice(0, 5),
        },
      })

      const responseText = result.response || ''

      // Parse fixed files from the AI response
      const fileService = new FileGenerationService()
      const parsedFiles = fileService.parseFilesFromPrompt(responseText)

      if (parsedFiles.length > 0) {
        const fixedFiles: FileNode[] = parsedFiles.map(f => ({
          id: `fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: f.path,
          content: f.content,
          language: f.language || 'typescript',
          type: 'file' as const,
        }))

        applyGeneratedFiles(fixedFiles)
        toast.success(`AI fixed ${parsedFiles.length} file(s) — check the preview`)
      } else {
        toast.error('AI could not determine a fix. Check the terminal for details.')
      }
    } catch (err: any) {
      toast.error(`AI fix failed: ${err.message}`)
    }
  }, [applyGeneratedFiles])

  // Start a coding session when project loads
  useEffect(() => {
    if (!project || project.id === 'local') return
    const firebaseUid = user?.uid
    if (!firebaseUid) return

    const startSession = async () => {
      try {
        const session = await createSession(firebaseUid, project.id, project.name)
        setSessionId(session.id)
        setSessionStart(session.started_at)
      } catch (err) {
        console.error('Failed to start session:', err)
      }
    }
    startSession()

    // End session on unmount
    return () => {
      if (sessionId) {
        endSession(sessionId).catch(() => {})
      }
    }
  }, [project?.id, user?.uid])

  // Handle AI code change tracking
  const handleAICodeChange = useCallback((change: CodeChange) => {
    setSessionChanges(prev => {
      const next = [...prev, change]
      setSessionSkills(extractSkillsFromChanges(next))
      return next
    })
    // Persist change to session
    if (sessionId) {
      addChangeToSession(sessionId, change).catch(() => {})
    }
  }, [sessionId])

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#09090f] text-white/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500/30 border-t-violet-500 mx-auto mb-3"></div>
          <p className="text-[13px] text-white/30">Loading CodePath AI IDE...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#09090f] text-white/70">
      {/* Header */}
      <EnhancedIDEHeader 
        project={project}
        aiPanelVisible={aiPanelVisible}
        previewVisible={previewVisible}
        onToggleAI={() => setAiPanelVisible(!aiPanelVisible)}
        onTogglePreview={() => setPreviewVisible(!previewVisible)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" className="flex-1">
          {/* File Explorer */}
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <EnhancedFileExplorer
              files={files}
              onFileSelect={handleFileSelect}
              onFileChange={handleFileChange}
              activeFile={activeFile?.id}
              className="h-full"
            />
          </Panel>

          <PanelResizeHandle className="w-px bg-white/[0.06] hover:bg-violet-500/30 hover:w-0.5 transition-all duration-150" />

          {/* Code Editor + Bottom Panels */}
          <Panel defaultSize={50} minSize={30}>
            {/* Streaming code writer — shown when AI is generating files */}
            {streamingFiles ? (
              <StreamingCodeWriter
                files={streamingFiles}
                onComplete={handleStreamingComplete}
                onCancel={handleStreamingCancel}
                className="h-full"
                speed={12}
              />
            ) : selectedDiffChange ? (
              <DiffView
                change={selectedDiffChange}
                onClose={() => setSelectedDiffChange(null)}
                className="h-full"
              />
            ) : (
              <div className="h-full flex flex-col">
                {/* Editor (top) + Preview (right split) when preview is visible */}
                <div className="flex-1 min-h-0 flex">
                  {/* Code Editor — always visible */}
                  <div className={cn("min-w-0 h-full flex-1")}>
                    {activeFile ? (
                      <EnhancedCodeEditor
                        file={activeFile}
                        onFileChange={handleCodeChange}
                        onExecute={handleExecute}
                        className="h-full"
                        pendingChange={pendingChange}
                        onAcceptChange={handleAcceptChange}
                        onRejectChange={handleRejectChange}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/40">
                        <div className="text-center">
                          <p className="text-sm">No file selected</p>
                          <p className="text-xs mt-2">Select a file from the explorer or generate code</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Live Preview — equal size with editor, keep mounted so iframe doesn't reload */}
                  <div
                    className={cn(
                      "h-full border-l border-white/[0.06] transition-all duration-200",
                      previewVisible && files.length > 0
                        ? "flex-1 opacity-100"
                        : "w-0 min-w-0 overflow-hidden opacity-0 pointer-events-none border-l-0"
                    )}
                  >
                    {files.length > 0 && <PreviewPanel files={files} onRequestAIFix={handlePreviewAIFix} />}
                  </div>
                </div>
                
                {/* Bottom Panel with tabs */}
                <div className="h-48 border-t border-white/[0.06] flex flex-col">
                  {/* Tab bar */}
                  <div className="flex items-center bg-[#0a0a12] border-b border-white/[0.06] px-1">
                    {(['output', 'timeline', 'skills'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setBottomTab(tab)}
                        className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors
                          ${bottomTab === tab
                            ? 'text-violet-400 border-b border-violet-500'
                            : 'text-white/25 hover:text-white/40'
                          }`}
                        title={`Switch to ${tab} tab`}
                      >
                        {tab === 'output' && 'Output'}
                        {tab === 'timeline' && `Timeline (${sessionChanges.length})`}
                        {tab === 'skills' && `Skills (${sessionSkills.length})`}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 min-h-0">
                    {bottomTab === 'output' && (
                      <OutputPanel
                        output={output}
                        isRunning={isExecuting}
                        className="h-full"
                      />
                    )}
                    {bottomTab === 'timeline' && (
                      <SessionTimeline
                        changes={sessionChanges}
                        sessionStart={sessionStart}
                        onViewDiff={(change) => {
                          setSelectedDiffChange(change)
                        }}
                        className="h-full"
                      />
                    )}
                    {bottomTab === 'skills' && (
                      <SkillSummary
                        skills={sessionSkills}
                        userChanges={sessionChanges.filter(c => c.source === 'user').length}
                        aiChanges={sessionChanges.filter(c => c.source !== 'user').length}
                        sessionDuration={
                          sessionStart
                            ? Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000)
                            : 0
                        }
                        className="h-full"
                      />
                    )}

                  </div>
                </div>
              </div>
            )}
          </Panel>

          {/* AI Panel */}
          {aiPanelVisible && (
            <>
              <PanelResizeHandle className="w-px bg-white/[0.06] hover:bg-violet-500/30 hover:w-0.5 transition-all duration-150" />
              <Panel defaultSize={30} minSize={20} maxSize={40}>
              <DualAISystem
                  code={activeFile?.content || ''}
                  language={activeFile?.language || 'javascript'}
                  files={files}
                  onCodeUpdate={handleAICodeUpdate}
                  onFilesGenerated={handleFilesGenerated}
                  onCodeChange={handleAICodeChange}
                  initialPrompt={project?.prompt || undefined}
                  activeFileName={activeFile?.name}
                  activeFileId={activeFile?.id}
                  className="h-full"
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar
        activePath={activeFile?.name ?? ''}
        language={activeFile?.language ?? 'javascript'}
        isRunning={isExecuting}
        changeCount={sessionChanges.length}
        sessionStart={sessionStart}
        className="h-6"
      />
    </div>
  )
}
