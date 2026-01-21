import { useRef, useEffect, useState } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
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
  Wand2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

export default function EnhancedCodeEditor({
  file,
  onFileChange,
  onExecute,
  onFormat,
  className
}: EnhancedCodeEditorProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [fontSize, setFontSize] = useState(14)
  const [tabSize, setTabSize] = useState(2)
  const [theme, setTheme] = useState('vs-dark')
  const [wordWrap, setWordWrap] = useState('on')
  const [minimapEnabled, setMinimapEnabled] = useState(true)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [showFoldingControls, setShowFoldingControls] = useState(true')
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
          'editor.background': '#1E1E1E',
          'editor.foreground': '#D4D4D4',
          'editorLineNumber.foreground': '#858585',
          'editor.selectionBackground': '#264F78',
          'editor.selectionHighlightBackground': '#264F7840',
          'editor.wordHighlightBackground': '#575757B8',
          'editor.wordHighlightStrongBackground': '#004972B8',
          'editor.findMatchBackground': '#515C6A',
          'editor.findMatchHighlightBackground': '#EA5C0055',
          'editor.findRangeHighlightBackground': '#3A3D4160',
          'editor.hoverHighlightBackground': '#264F7840',
          'editor.lineHighlightBackground': '#FFFFFF0F',
          'editor.rangeHighlightBackground': '#FFFFFF0B',
          'editorCursor.foreground': '#D4D4D4',
          'editorBracketMatch.background': '#006400',
          'editorBracketMatch.border': '#888888',
          'editorGutter.background': '#1E1E1E',
          'editorIndentGuide.background': '#404040',
          'editorIndentGuide.activeBackground': '#707070',
          'editorRuler.foreground': '#5A5A5A',
          'editorWidget.background': '#2D2D30',
          'editorWidget.border': '#5A5A5A',
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

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

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
          'editor.background': '#1E1E1E',
          'editor.foreground': '#D4D4D4',
          'editorLineNumber.foreground': '#858585',
          'editor.selectionBackground': '#264F78',
          'editor.selectionHighlightBackground': '#264F7840',
          'editor.wordHighlightBackground': '#575757B8',
          'editor.wordHighlightStrongBackground': '#004972B8',
          'editor.findMatchBackground': '#515C6A',
          'editor.findMatchHighlightBackground': '#EA5C0055',
          'editor.findRangeHighlightBackground': '#3A3D4160',
          'editor.hoverHighlightBackground': '#264F7840',
          'editor.lineHighlightBackground': '#FFFFFF0F',
          'editor.rangeHighlightBackground': '#FFFFFF0B',
          'editorCursor.foreground': '#D4D4D4',
          'editorBracketMatch.background': '#006400',
          'editorBracketMatch.border': '#888888',
          'editorGutter.background': '#1E1E1E',
          'editorIndentGuide.background': '#404040',
          'editorIndentGuide.activeBackground': '#707070',
          'editorRuler.foreground': '#5A5A5A',
          'editorWidget.background': '#2D2D30',
          'editorWidget.border': '#5A5A5A',
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
      <div className={cn("flex items-center justify-center h-full bg-slate-900 text-slate-400", className)}>
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No file selected</p>
          <p className="text-sm mt-2">Select a file from the explorer to start editing</p>
        </div>
      </div>
    )
  }

  const currentTheme = theme === 'custom-dark' ? 'custom-dark' : theme
  const currentLanguage = languageMap[file.language] || file.language || 'plaintext'

  return (
    <div className={cn("flex flex-col h-full bg-slate-900", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-slate-300">
            <Code className="w-4 h-4" />
            <span>{file.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500">{currentLanguage}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Format */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={handleFormat}
          >
            <Wand2 className="w-4 h-4" />
          </Button>

          {/* Copy */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
          </Button>

          {/* Download */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>

          {/* Execute */}
          {onExecute && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
              onClick={handleExecute}
            >
              <Play className="w-4 h-4" />
            </Button>
          )}

          {/* Save */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-green-400 hover:text-green-300 hover:bg-slate-700"
            onClick={handleSave}
          >
            <Save className="w-4 h-4" />
          </Button>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => setIsFullScreen(!isFullScreen)}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="p-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-8 text-sm"
            />
            <Input
              placeholder="Replace..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-8 text-sm"
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-slate-400 hover:text-white hover:bg-slate-700"
              onClick={handleSearch}
            >
              Find
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-slate-400 hover:text-white hover:bg-slate-700"
              onClick={handleReplace}
            >
              Replace
            </Button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 bg-slate-800 border-b border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1"
              >
                {themeOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1"
              >
                {fontSizeOptions.map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tab Size</label>
              <select
                value={tabSize}
                onChange={(e) => setTabSize(Number(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1"
              >
                {tabSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Word Wrap</label>
              <select
                value={wordWrap}
                onChange={(e) => setWordWrap(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
                <option value="wordWrapColumn">Column</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-3">
            <label className="flex items-center text-xs text-slate-400">
              <input
                type="checkbox"
                checked={minimapEnabled}
                onChange={(e) => setMinimapEnabled(e.target.checked)}
                className="mr-2"
              />
              Minimap
            </label>
            <label className="flex items-center text-xs text-slate-400">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="mr-2"
              />
              Line Numbers
            </label>
            <label className="flex items-center text-xs text-slate-400">
              <input
                type="checkbox"
                checked={showFoldingControls}
                onChange={(e) => setShowFoldingControls(e.target.checked)}
                className="mr-2"
              />
              Code Folding
            </label>
            <label className="flex items-center text-xs text-slate-400">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="mr-2"
              />
              Auto Save
            </label>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={currentLanguage}
          value={file.content}
          theme={currentTheme}
          onChange={(value) => {
            if (value !== undefined) {
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

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Ln {editorRef.current?.getPosition()?.lineNumber || 1}, Col {editorRef.current?.getPosition()?.column || 1}</span>
          <span>{file.language.toUpperCase()}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center space-x-2">
          {autoSave && <span className="text-green-400">Auto Save</span>}
          <span>{theme === 'custom-dark' ? 'VS Code Dark+' : theme.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}