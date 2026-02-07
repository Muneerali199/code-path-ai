import React, { useRef, useEffect, useState, useCallback } from 'react'
import Editor, { Monaco, DiffEditor } from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Save, 
  Copy, 
  Download, 
  Settings, 
  RotateCcw,
  FileText,
  Zap,
  Brain,
  Code,
  Palette,
  Maximize2,
  Minimize2,
  Terminal,
  FileJson,
  Search,
  Replace,
  Wand2,
  Check,
  X,
  GitCompare,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface PendingChange {
  originalCode: string
  newCode: string
  description?: string
  source: 'ai-generate' | 'ai-modify' | 'ai-improve'
}

interface EnhancedCodeEditorProps {
  file: {
    id: string
    name: string
    content: string
    language: string
  } | null
  onFileChange: (content: string) => void
  onExecute?: (code: string, language: string) => void
  onFormat?: () => void
  className?: string
  pendingChange?: PendingChange | null
  onAcceptChange?: () => void
  onRejectChange?: () => void
}

const languageMap: { [key: string]: string } = {
  'javascript': 'javascript',
  'typescript': 'typescript',
  'python': 'python',
  'java': 'java',
  'cpp': 'cpp',
  'csharp': 'csharp',
  'php': 'php',
  'ruby': 'ruby',
  'go': 'go',
  'rust': 'rust',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'dart': 'dart',
  'html': 'html',
  'css': 'css',
  'json': 'json',
  'xml': 'xml',
  'yaml': 'yaml',
  'markdown': 'markdown',
  'sql': 'sql',
  'shell': 'shell',
  'dockerfile': 'dockerfile',
  'text': 'plaintext'
}

const themeOptions = [
  { id: 'vs-dark', name: 'VS Code Dark', description: 'Default dark theme' },
  { id: 'hc-black', name: 'High Contrast', description: 'High contrast dark theme' },
  { id: 'custom-dark', name: 'Custom Dark', description: 'Custom dark theme with blue accents' }
]

const fontSizeOptions = [12, 14, 16, 18, 20, 24]
const tabSizeOptions = [2, 4, 8]

const EnhancedCodeEditor = React.memo(function EnhancedCodeEditor({
  file,
  onFileChange,
  onExecute,
  onFormat,
  className,
  pendingChange,
  onAcceptChange,
  onRejectChange,
}: EnhancedCodeEditorProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const fileRef = useRef(file)
  const prevFileIdRef = useRef(file.id)

  // Keep fileRef synced for use in onChange callback
  useEffect(() => { fileRef.current = file }, [file])

  // When switching to a different file, update editor value + language without remounting
  // Also sync content when the same file's content changes externally (e.g., after AI generation)
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    const isSwitchingFile = file.id !== prevFileIdRef.current

    if (isSwitchingFile) {
      prevFileIdRef.current = file.id
      const model = editor.getModel()
      if (model) {
        // Update language
        monaco.editor.setModelLanguage(model, file.language || 'javascript')
        // Update value
        const currentVal = editor.getValue()
        if (currentVal !== (file.content || '')) {
          editor.setValue(file.content || '')
        }
        // Reset cursor to top
        editor.setPosition({ lineNumber: 1, column: 1 })
        editor.revealLine(1)
      }
    } else {
      // Same file — sync content if it changed externally (e.g., AI applied changes)
      const currentVal = editor.getValue()
      if (currentVal !== (file.content || '')) {
        // Preserve cursor position when syncing content
        const position = editor.getPosition()
        editor.setValue(file.content || '')
        if (position) editor.setPosition(position)
      }
    }
  }, [file.id, file.content, file.language])

  const [fontSize, setFontSize] = useState(14)
  const [tabSize, setTabSize] = useState(2)
  const [theme, setTheme] = useState('vs-dark')
  const [wordWrap, setWordWrap] = useState('on')
  const [minimapEnabled, setMinimapEnabled] = useState(true)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [showFoldingControls, setShowFoldingControls] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    if (monacoRef.current) {
      // Define custom VS Code Dark+ theme
      monacoRef.current.editor.defineTheme('custom-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'C586C0' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'function', foreground: 'DCDCAA' },
          { token: 'variable', foreground: '9CDCFE' },
          { token: 'type', foreground: '4EC9B0' },
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'delimiter', foreground: 'D4D4D4' },
          { token: 'regexp', foreground: 'D16969' },
          { token: 'annotation', foreground: '4EC9B0' },
          { token: 'tag', foreground: '569CD6' },
          { token: 'attribute.name', foreground: '9CDCFE' },
          { token: 'attribute.value', foreground: 'CE9178' },
          { token: 'metatag', foreground: '569CD6' },
        ],
        colors: {
          'editor.background': '#0d0d15',
          'editor.foreground': '#D4D4D4',
          'editorLineNumber.foreground': '#3a3a52',
          'editorLineNumber.activeForeground': '#6e6e8a',
          'editor.selectionBackground': '#3a2d6e80',
          'editor.lineHighlightBackground': '#ffffff06',
          'editorCursor.foreground': '#a78bfa',
          'editorBracketMatch.background': '#7c3aed20',
          'editorBracketMatch.border': '#7c3aed60',
          'editorGutter.background': '#0d0d15',
          'editorIndentGuide.background': '#ffffff08',
          'editorIndentGuide.activeBackground': '#ffffff15',
          'editorWidget.background': '#12121e',
          'editorWidget.border': '#ffffff10',
          'scrollbarSlider.background': '#ffffff10',
          'scrollbarSlider.hoverBackground': '#ffffff18',
          'scrollbarSlider.activeBackground': '#ffffff20',
          'input.background': '#3C3C3C',
          'input.border': '#5A5A5A',
          'input.foreground': '#CCCCCC',
          'inputOption.activeBorder': '#007ACC',
          'inputValidation.errorBackground': '#5A1D1D',
          'inputValidation.errorBorder': '#BE1100',
          'inputValidation.infoBackground': '#053B70',
          'inputValidation.infoBorder': '#007ACC',
          'inputValidation.warningBackground': '#352A05',
          'inputValidation.warningBorder': '#B89500',
          'scrollbar.shadow': '#00000033',
          'scrollbarSlider.background': '#79797966',
          'scrollbarSlider.hoverBackground': '#646464B3',
          'scrollbarSlider.activeBackground': '#646464B3',
          'badge.background': '#4D4D4D',
          'badge.foreground': '#F8F8F8',
          'progressBar.background': '#007ACC',
          'list.activeSelectionBackground': '#094771',
          'list.activeSelectionForeground': '#FFFFFF',
          'list.inactiveSelectionBackground': '#37373D',
          'list.hoverBackground': '#2A2D2E',
          'list.focusBackground': '#062F4A',
          'tree.indentGuidesStroke': '#585858',
          'menu.background': '#252526',
          'menu.foreground': '#CCCCCC',
          'menu.selectionBackground': '#094771',
          'menu.selectionForeground': '#FFFFFF',
          'menu.selectionBorder': '#094771',
          'menu.separatorBackground': '#454545',
          'sideBar.background': '#252526',
          'sideBar.foreground': '#CCCCCC',
          'sideBarSectionHeader.background': '#00000033',
          'sideBarSectionHeader.foreground': '#CCCCCC',
          'sideBarTitle.foreground': '#BBBBBB',
          'statusBar.background': '#007ACC',
          'statusBar.foreground': '#FFFFFF',
          'statusBar.debuggingBackground': '#FCB653',
          'statusBar.debuggingForeground': '#000000',
          'statusBar.noFolderBackground': '#68217A',
          'statusBarItem.hoverBackground': '#FFFFFF1F',
          'statusBarItem.remoteBackground': '#16825D',
          'statusBarItem.remoteForeground': '#FFFFFF',
          'titleBar.activeBackground': '#3C3C3C',
          'titleBar.activeForeground': '#CCCCCC',
          'titleBar.inactiveBackground': '#323233',
          'titleBar.inactiveForeground': '#CCCCCC',
          'tab.activeBackground': '#1E1E1E',
          'tab.activeForeground': '#FFFFFF',
          'tab.activeBorder': '#1E1E1E',
          'tab.inactiveBackground': '#2D2D30',
          'tab.inactiveForeground': '#FFFFFF80',
          'tab.hoverBackground': '#2D2D30',
          'tab.unfocusedHoverBackground': '#2D2D30',
          'tab.border': '#252526',
          'panel.background': '#2D2D30',
          'panel.border': '#80808059',
          'panelTitle.activeForeground': '#E7E7E7',
          'panelTitle.inactiveForeground': '#E7E7E799',
          'panelTitle.activeBorder': '#E7E7E7',
          'terminal.background': '#1E1E1E',
          'terminal.foreground': '#CCCCCC',
          'terminal.ansiBlack': '#000000',
          'terminal.ansiRed': '#CD3131',
          'terminal.ansiGreen': '#0DBC79',
          'terminal.ansiYellow': '#E5E510',
          'terminal.ansiBlue': '#2472C8',
          'terminal.ansiMagenta': '#BC3FBC',
          'terminal.ansiCyan': '#11A8CD',
          'terminal.ansiWhite': '#E5E5E5',
          'terminal.ansiBrightBlack': '#666666',
          'terminal.ansiBrightRed': '#F14C4C',
          'terminal.ansiBrightGreen': '#23D18B',
          'terminal.ansiBrightYellow': '#F5F543',
          'terminal.ansiBrightBlue': '#3B8EEA',
          'terminal.ansiBrightMagenta': '#D670D6',
          'terminal.ansiBrightCyan': '#29B8DB',
          'terminal.ansiBrightWhite': '#E5E5E5',
        }
      })

      // Set the custom theme
      monacoRef.current.editor.setTheme('custom-dark')
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when content changes to simulate streaming
    if (editorRef.current && file) {
      const model = editorRef.current.getModel();
      if (model) {
        const lineCount = model.getLineCount();
        editorRef.current.revealLine(lineCount);
      }
    }
  }, [file?.content]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Ensure the editor has the correct content on mount
    // (critical when re-mounting after streaming animation)
    const currentContent = fileRef.current?.content || ''
    const editorContent = editor.getValue()
    if (editorContent !== currentContent) {
      editor.setValue(currentContent)
    }

    // Set up the custom theme
    if (monaco) {
      monaco.editor.defineTheme('custom-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'C586C0' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'function', foreground: 'DCDCAA' },
          { token: 'variable', foreground: '9CDCFE' },
          { token: 'type', foreground: '4EC9B0' },
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'delimiter', foreground: 'D4D4D4' },
          { token: 'regexp', foreground: 'D16969' },
          { token: 'annotation', foreground: '4EC9B0' },
          { token: 'tag', foreground: '569CD6' },
          { token: 'attribute.name', foreground: '9CDCFE' },
          { token: 'attribute.value', foreground: 'CE9178' },
          { token: 'metatag', foreground: '569CD6' },
        ],
        colors: {
          'editor.background': '#0d0d15',
          'editor.foreground': '#D4D4D4',
          'editorLineNumber.foreground': '#3a3a52',
          'editorLineNumber.activeForeground': '#6e6e8a',
          'editor.selectionBackground': '#3a2d6e80',
          'editor.selectionHighlightBackground': '#3a2d6e40',
          'editor.wordHighlightBackground': '#3a2d6e50',
          'editor.wordHighlightStrongBackground': '#4a3d7e50',
          'editor.findMatchBackground': '#5a4d8e50',
          'editor.findMatchHighlightBackground': '#7c3aed30',
          'editor.findRangeHighlightBackground': '#3a2d6e20',
          'editor.hoverHighlightBackground': '#3a2d6e30',
          'editor.lineHighlightBackground': '#ffffff06',
          'editor.rangeHighlightBackground': '#ffffff08',
          'editorCursor.foreground': '#a78bfa',
          'editorBracketMatch.background': '#7c3aed20',
          'editorBracketMatch.border': '#7c3aed60',
          'editorGutter.background': '#0d0d15',
          'editorIndentGuide.background': '#ffffff08',
          'editorIndentGuide.activeBackground': '#ffffff15',
          'editorRuler.foreground': '#ffffff10',
          'editorWidget.background': '#12121e',
          'editorWidget.border': '#ffffff10',
          'input.background': '#0a0a14',
          'input.border': '#ffffff10',
          'input.foreground': '#CCCCCC',
          'inputOption.activeBorder': '#7c3aed',
          'scrollbar.shadow': '#00000040',
          'scrollbarSlider.background': '#ffffff10',
          'scrollbarSlider.hoverBackground': '#ffffff18',
          'scrollbarSlider.activeBackground': '#ffffff20',
          'badge.background': '#4D4D4D',
          'badge.foreground': '#F8F8F8',
          'progressBar.background': '#007ACC',
          'list.activeSelectionBackground': '#094771',
          'list.activeSelectionForeground': '#FFFFFF',
          'list.inactiveSelectionBackground': '#37373D',
          'list.hoverBackground': '#2A2D2E',
          'list.focusBackground': '#062F4A',
          'tree.indentGuidesStroke': '#585858',
          'menu.background': '#252526',
          'menu.foreground': '#CCCCCC',
          'menu.selectionBackground': '#094771',
          'menu.selectionForeground': '#FFFFFF',
          'menu.selectionBorder': '#094771',
          'menu.separatorBackground': '#454545',
          'sideBar.background': '#252526',
          'sideBar.foreground': '#CCCCCC',
          'sideBarSectionHeader.background': '#00000033',
          'sideBarSectionHeader.foreground': '#CCCCCC',
          'sideBarTitle.foreground': '#BBBBBB',
          'statusBar.background': '#007ACC',
          'statusBar.foreground': '#FFFFFF',
          'statusBar.debuggingBackground': '#FCB653',
          'statusBar.debuggingForeground': '#000000',
          'statusBar.noFolderBackground': '#68217A',
          'statusBarItem.hoverBackground': '#FFFFFF1F',
          'statusBarItem.remoteBackground': '#16825D',
          'statusBarItem.remoteForeground': '#FFFFFF',
          'titleBar.activeBackground': '#3C3C3C',
          'titleBar.activeForeground': '#CCCCCC',
          'titleBar.inactiveBackground': '#323233',
          'titleBar.inactiveForeground': '#CCCCCC',
          'tab.activeBackground': '#1E1E1E',
          'tab.activeForeground': '#FFFFFF',
          'tab.activeBorder': '#1E1E1E',
          'tab.inactiveBackground': '#2D2D30',
          'tab.inactiveForeground': '#FFFFFF80',
          'tab.hoverBackground': '#2D2D30',
          'tab.unfocusedHoverBackground': '#2D2D30',
          'tab.border': '#252526',
          'panel.background': '#2D2D30',
          'panel.border': '#80808059',
          'panelTitle.activeForeground': '#E7E7E7',
          'panelTitle.inactiveForeground': '#E7E7E799',
          'panelTitle.activeBorder': '#E7E7E7',
          'terminal.background': '#1E1E1E',
          'terminal.foreground': '#CCCCCC',
          'terminal.ansiBlack': '#000000',
          'terminal.ansiRed': '#CD3131',
          'terminal.ansiGreen': '#0DBC79',
          'terminal.ansiYellow': '#E5E510',
          'terminal.ansiBlue': '#2472C8',
          'terminal.ansiMagenta': '#BC3FBC',
          'terminal.ansiCyan': '#11A8CD',
          'terminal.ansiWhite': '#E5E5E5',
          'terminal.ansiBrightBlack': '#666666',
          'terminal.ansiBrightRed': '#F14C4C',
          'terminal.ansiBrightGreen': '#23D18B',
          'terminal.ansiBrightYellow': '#F5F543',
          'terminal.ansiBrightBlue': '#3B8EEA',
          'terminal.ansiBrightMagenta': '#D670D6',
          'terminal.ansiBrightCyan': '#29B8DB',
          'terminal.ansiBrightWhite': '#E5E5E5',
        }
      })

      monaco.editor.setTheme('custom-dark')
    }

    // Configure editor options
    editor.updateOptions({
      fontSize,
      tabSize,
      wordWrap,
      minimap: { enabled: minimapEnabled },
      lineNumbers: showLineNumbers ? 'on' : 'off',
      folding: showFoldingControls,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      bracketPairColorization: {
        enabled: true,
        independentColorPoolPerBracketType: true
      },
      guides: {
        indentation: true,
        highlightActiveIndentation: true
      },
      renderLineHighlight: 'line',
      renderWhitespace: 'selection',
      fontLigatures: true,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showVariables: true
      }
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onExecute && file) {
        onExecute(file.content, file.language)
      }
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      setShowSearch(true)
    })

    // Auto-save functionality
    if (autoSave) {
      const autoSaveInterval = setInterval(() => {
        if (editorRef.current && file) {
          const currentContent = editorRef.current.getValue()
          if (currentContent !== file.content) {
            onFileChange(currentContent)
          }
        }
      }, 2000)

      return () => clearInterval(autoSaveInterval)
    }
  }

  const handleSave = () => {
    if (editorRef.current && file) {
      const content = editorRef.current.getValue()
      onFileChange(content)
      toast.success('File saved successfully')
    }
  }

  const handleCopy = () => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection()
      if (selection) {
        const selectedText = editorRef.current.getModel().getValueInRange(selection)
        navigator.clipboard.writeText(selectedText)
        toast.success('Code copied to clipboard')
      } else {
        const fullContent = editorRef.current.getValue()
        navigator.clipboard.writeText(fullContent)
        toast.success('Full file copied to clipboard')
      }
    }
  }

  const handleDownload = () => {
    if (file) {
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('File downloaded successfully')
    }
  }

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run()
      toast.success('Code formatted')
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to the original content?')) {
      // Reset to original content would be implemented based on your needs
      toast.info('Reset functionality would be implemented here')
    }
  }

  const handleSearch = () => {
    if (editorRef.current && searchTerm) {
      const model = editorRef.current.getModel()
      if (model) {
        const found = model.findMatches(searchTerm)
        if (found.length > 0) {
          editorRef.current.setSelection(found[0].range)
          editorRef.current.revealRangeInCenter(found[0].range)
        }
      }
    }
  }

  const handleReplace = () => {
    if (editorRef.current && searchTerm && replaceTerm) {
      const model = editorRef.current.getModel()
      if (model) {
        const found = model.findMatches(searchTerm)
        if (found.length > 0) {
          editorRef.current.executeEdits('replace', [
            {
              range: found[0].range,
              text: replaceTerm
            }
          ])
        }
      }
    }
  }

  const handleExecute = () => {
    if (onExecute && file) {
      onExecute(file.content, file.language)
    }
  }

  if (!file) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-[#0d0d15] text-white/30", className)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <FileText className="w-7 h-7 text-white/15" />
          </div>
          <p className="text-[15px] font-medium text-white/40 mb-1.5">No file selected</p>
          <p className="text-[12px] text-white/20">Select a file from the explorer to start editing</p>
        </div>
      </div>
    )
  }

  const currentTheme = theme === 'custom-dark' ? 'custom-dark' : theme
  const currentLanguage = languageMap[file.language] || file.language || 'plaintext'

  return (
    <div className={cn("flex flex-col h-full bg-[#0d0d15]", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e0e16] border-b border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-[12px]">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04]">
              <Code className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-white/70 font-medium">{file.name}</span>
            </div>
            <span className="text-white/15">|</span>
            <span className="text-white/30 text-[11px]">{currentLanguage}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-0.5">
          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white/25 hover:text-white/60 hover:bg-white/[0.06] rounded-md"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-3.5 h-3.5" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white/25 hover:text-white/60 hover:bg-white/[0.06] rounded-md"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-4 bg-white/[0.06] mx-1"></div>

          {/* Format */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white/25 hover:text-white/60 hover:bg-white/[0.06] rounded-md"
            onClick={handleFormat}
          >
            <Wand2 className="w-3.5 h-3.5" />
          </Button>

          {/* Copy */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white/25 hover:text-white/60 hover:bg-white/[0.06] rounded-md"
            onClick={handleCopy}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>

          {/* Download */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white/25 hover:text-white/60 hover:bg-white/[0.06] rounded-md"
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-4 bg-white/[0.06] mx-1"></div>

          {/* Execute */}
          {onExecute && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/[0.08] rounded-md gap-1 text-[11px]"
              onClick={handleExecute}
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Run</span>
            </Button>
          )}

          {/* Save */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white/25 hover:text-emerald-400 hover:bg-white/[0.06] rounded-md"
            onClick={handleSave}
          >
            <Save className="w-3.5 h-3.5" />
          </Button>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white/25 hover:text-white/60 hover:bg-white/[0.06] rounded-md"
            onClick={() => setIsFullScreen(!isFullScreen)}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="px-3 py-2 bg-[#0e0e16] border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.04] border-white/[0.06] text-white/80 placeholder-white/20 h-7 text-[12px] focus:bg-white/[0.06] focus:border-violet-500/30 rounded-md"
            />
            <Input
              placeholder="Replace..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="bg-white/[0.04] border-white/[0.06] text-white/80 placeholder-white/20 h-7 text-[12px] focus:bg-white/[0.06] focus:border-violet-500/30 rounded-md"
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 text-white/30 hover:text-white/70 hover:bg-white/[0.06] text-[11px] rounded-md"
              onClick={handleSearch}
            >
              Find
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 text-white/30 hover:text-white/70 hover:bg-white/[0.06] text-[11px] rounded-md"
              onClick={handleReplace}
            >
              Replace
            </Button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-3 py-2.5 bg-[#0e0e16] border-b border-white/[0.06]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] text-white/30 mb-1 uppercase tracking-wider font-medium">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.06] text-white/70 text-[11px] rounded-md px-2 py-1.5 focus:bg-white/[0.06] focus:border-violet-500/30 focus:outline-none"
              >
                {themeOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1 uppercase tracking-wider font-medium">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/[0.06] text-white/70 text-[11px] rounded-md px-2 py-1.5 focus:bg-white/[0.06] focus:border-violet-500/30 focus:outline-none"
              >
                {fontSizeOptions.map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1 uppercase tracking-wider font-medium">Tab Size</label>
              <select
                value={tabSize}
                onChange={(e) => setTabSize(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/[0.06] text-white/70 text-[11px] rounded-md px-2 py-1.5 focus:bg-white/[0.06] focus:border-violet-500/30 focus:outline-none"
              >
                {tabSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-white/30 mb-1 uppercase tracking-wider font-medium">Word Wrap</label>
              <select
                value={wordWrap}
                onChange={(e) => setWordWrap(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.06] text-white/70 text-[11px] rounded-md px-2 py-1.5 focus:bg-white/[0.06] focus:border-violet-500/30 focus:outline-none"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
                <option value="wordWrapColumn">Column</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-5 mt-2.5">
            <label className="flex items-center text-[11px] text-white/35 cursor-pointer hover:text-white/50 transition-colors">
              <input
                type="checkbox"
                checked={minimapEnabled}
                onChange={(e) => setMinimapEnabled(e.target.checked)}
                className="mr-1.5 accent-violet-500"
              />
              Minimap
            </label>
            <label className="flex items-center text-[11px] text-white/35 cursor-pointer hover:text-white/50 transition-colors">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="mr-1.5 accent-violet-500"
              />
              Lines
            </label>
            <label className="flex items-center text-[11px] text-white/35 cursor-pointer hover:text-white/50 transition-colors">
              <input
                type="checkbox"
                checked={showFoldingControls}
                onChange={(e) => setShowFoldingControls(e.target.checked)}
                className="mr-1.5 accent-violet-500"
              />
              Folding
            </label>
            <label className="flex items-center text-[11px] text-white/35 cursor-pointer hover:text-white/50 transition-colors">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="mr-1.5 accent-violet-500"
              />
              Auto Save
            </label>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {/* Accept/Reject bar when pending AI change */}
        {pendingChange && (
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-violet-900/40 border-b border-violet-500/30">
            <div className="flex items-center gap-2 text-sm">
              <GitCompare className="w-4 h-4 text-violet-400" />
              <span className="text-violet-200 font-medium">AI Changes</span>
              {pendingChange.description && (
                <span className="text-white/50 text-xs ml-2">— {pendingChange.description}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onRejectChange}
                className="h-7 px-3 text-xs text-red-300 hover:text-red-200 hover:bg-red-500/20 border border-red-500/30"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={onAcceptChange}
                className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Accept Changes
              </Button>
            </div>
          </div>
        )}

        {/* Diff Editor or Regular Editor */}
        {pendingChange ? (
          <div className="flex-1">
            <DiffEditor
              height="100%"
              language={currentLanguage}
              original={pendingChange.originalCode}
              modified={pendingChange.newCode}
              theme={currentTheme}
              options={{
                fontSize,
                readOnly: true,
                renderSideBySide: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                minimap: { enabled: false },
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                renderIndicators: true,
                originalEditable: false,
                diffWordWrap: 'on',
              }}
            />
          </div>
        ) : (
          <div className="flex-1">
            <Editor
              height="100%"
              language={currentLanguage}
              defaultValue={file.content || ''}
              theme={currentTheme}
              onChange={(value) => {
                // Skip if value is same as the current file content (prevents mount-triggered onChange)
                if (value !== undefined && value !== fileRef.current.content) {
                  onFileChange(value)
                }
              }}
              onMount={handleEditorDidMount}
              options={{
                fontSize,
                tabSize,
                wordWrap,
                minimap: { enabled: minimapEnabled },
                lineNumbers: showLineNumbers ? 'on' : 'off',
                folding: showFoldingControls,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                readOnly: false,
                bracketPairColorization: {
                  enabled: true,
                  independentColorPoolPerBracketType: true
                },
                guides: {
                  indentation: true,
                  highlightActiveIndentation: true
                },
                renderLineHighlight: 'line',
                renderWhitespace: 'selection',
                fontLigatures: true,
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                suggest: {
                  showKeywords: true,
                  showSnippets: true,
                  showClasses: true,
                  showFunctions: true,
                  showVariables: true
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#0a0a12] border-t border-white/[0.06] text-[10px] text-white/25">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1">
            <span className="text-white/15">Ln</span>
            <span className="text-white/40">{editorRef.current?.getPosition()?.lineNumber || 1}</span>
            <span className="text-white/15">Col</span>
            <span className="text-white/40">{editorRef.current?.getPosition()?.column || 1}</span>
          </span>
          <span className="text-white/15">|</span>
          <span className="text-white/40">{file.language.toUpperCase()}</span>
          <span className="text-white/15">|</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center space-x-3">
          {autoSave && (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500/80"></span>
              <span className="text-emerald-400/50">Auto Save</span>
            </span>
          )}
          <span>{theme === 'custom-dark' ? 'Dark+' : theme}</span>
        </div>
      </div>
    </div>
  )
})

export default EnhancedCodeEditor