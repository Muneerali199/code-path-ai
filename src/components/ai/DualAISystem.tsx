import { useState, useEffect, useRef } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  Code, 
  Zap, 
  Copy, 
  Download, 
  RefreshCw, 
  Settings,
  MessageSquare,
  Sparkles,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Wand2,
  BookOpen,
  FileCode,
  Terminal,
  Palette,
  Globe,
  Smartphone,
  Database,
  Gamepad2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { extractSkills, type CodeChange } from '@/services/sessionService'
import { callMistralAI } from '@/services/aiService'
import { FileGenerationService } from '@/services/fileGeneration'

interface StructuredExplanation {
  whatHappened: string
  why: string
  remember: string[]
  concepts: string[]
}

interface CodeExplanation {
  overview: string
  structured: StructuredExplanation
  functions: Array<{
    name: string
    description: string
    parameters: string[]
    returnType: string
  }>
  complexity: string
  bestPractices: string[]
  improvements: string[]
  relatedConcepts: string[]
}

interface CodeGeneration {
  code: string
  language: string
  explanation: string
  usage: string
  dependencies: string[]
  testing: string
  documentation: string
  files?: Array<{
    name: string
    content: string
    language: string
    type: 'file' | 'folder'
  }>
}

interface DualAISystemProps {
  code: string
  language: string
  files?: any[]
  onCodeUpdate: (code: string) => void
  onFilesGenerated?: (files: any[]) => void
  onCodeChange?: (change: CodeChange) => void
  initialPrompt?: string
  activeFileName?: string
  activeFileId?: string
  className?: string
}

// Real AI service for code explanation
const realExplainAI = async (code: string, language: string, files?: any[], fileName?: string): Promise<CodeExplanation> => {
  // Collect project file info for context
  const projectFiles: { name: string; content: string; language: string }[] = [];
  if (files) {
    const collectFiles = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.type === 'file' && node.content) {
          projectFiles.push({ name: node.name, content: node.content, language: node.language || 'text' });
        }
        if (node.children) collectFiles(node.children);
      });
    };
    collectFiles(files);
  }

  const result = await callMistralAI({
    message: `Analyze this ${language} code from file "${fileName || 'unknown'}". Provide a thorough analysis.`,
    mode: 'analyze',
    context: {
      currentFile: fileName || 'unknown',
      currentFileContent: code?.slice(0, 3000), // Limit code size for speed
      projectFiles: projectFiles.slice(0, 2), // Only 2 files for context
    },
  });

  // Parse the JSON response from Mistral
  try {
    const responseText = result.response.trim();
    // Try to extract JSON from response (may have markdown wrapping)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        overview: parsed.overview || 'Analysis complete.',
        structured: {
          whatHappened: parsed.structured?.whatHappened || parsed.overview || '',
          why: parsed.structured?.why || '',
          remember: parsed.structured?.remember || [],
          concepts: parsed.structured?.concepts || extractSkills(code),
        },
        functions: (parsed.functions || []).map((f: any) => ({
          name: f.name || 'unknown',
          description: f.description || '',
          parameters: f.parameters || [],
          returnType: f.returnType || 'void',
        })),
        complexity: parsed.complexity || 'N/A',
        bestPractices: parsed.bestPractices || [],
        improvements: parsed.improvements || [],
        relatedConcepts: parsed.relatedConcepts || [],
      };
    }
  } catch (e) {
    console.warn('Failed to parse structured response, using fallback:', e);
  }

  // Fallback: return the raw response as overview
  return {
    overview: result.response,
    structured: {
      whatHappened: result.response.slice(0, 300),
      why: 'See the full analysis above for details.',
      remember: ['Review the generated analysis for key insights'],
      concepts: extractSkills(code),
    },
    functions: [],
    complexity: 'See analysis',
    bestPractices: ['See full analysis above'],
    improvements: ['See full analysis above'],
    relatedConcepts: extractSkills(code),
  };
}

// Real AI service for code generation and improvement
const realGenerateAI = async (prompt: string, language: string, currentCode?: string, fileName?: string, files?: any[]): Promise<CodeGeneration> => {
  // Determine if user is improving existing code or generating new
  const hasExistingCode = currentCode && currentCode.trim().length > 0;
  const mode = hasExistingCode ? 'improve' : 'create';

  // Collect project file info for context
  const projectFiles: { name: string; content: string; language: string }[] = [];
  if (files) {
    const collectFiles = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.type === 'file' && node.content) {
          projectFiles.push({ name: node.name, content: node.content, language: node.language || 'text' });
        }
        if (node.children) collectFiles(node.children);
      });
    };
    collectFiles(files);
  }

  const messageText = hasExistingCode
    ? `I have this file "${fileName || 'untitled'}" (${language}). Here is my request: ${prompt}`
    : prompt;

  const result = await callMistralAI({
    message: messageText,
    mode,
    context: {
      currentFile: fileName || undefined,
      currentFileContent: currentCode?.slice(0, 3000) || undefined,
      projectFiles: projectFiles.slice(0, 3),
    },
  });

  const responseText = result.response || '';

  // Parse files from the response using FileGenerationService
  const fileService = new FileGenerationService();
  const parsedFiles = fileService.parseFilesFromPrompt(responseText);

  if (parsedFiles.length > 0) {
    // Multi-file response — use first file as main code, create file list
    const generatedFiles = parsedFiles.map(f => ({
      name: f.path,
      content: f.content,
      language: f.language,
      type: 'file' as const,
    }));

    return {
      code: parsedFiles[0].content,
      language: parsedFiles[0].language || language,
      explanation: responseText.split('```')[0].trim() || `Generated ${parsedFiles.length} file(s) based on your request.`,
      usage: `${parsedFiles.length} file(s) generated: ${parsedFiles.map(f => f.path).join(', ')}`,
      dependencies: [],
      testing: 'Review the generated code and add tests as needed.',
      documentation: 'See the explanation above for details about the generated code.',
      files: generatedFiles,
    };
  }

  // Single response (no code blocks detected) — return as-is
  return {
    code: responseText,
    language,
    explanation: 'AI generated the response above.',
    usage: 'Review and apply the generated code.',
    dependencies: [],
    testing: 'Add appropriate tests for the generated code.',
    documentation: 'See the response for implementation details.',
  };
}

export default function DualAISystem({ code, language, files, onCodeUpdate, onFilesGenerated, onCodeChange, initialPrompt, activeFileName, activeFileId, className }: DualAISystemProps) {
  const [activeTab, setActiveTab] = useState<'explain' | 'generate'>(initialPrompt ? 'generate' : 'explain')
  const [explanation, setExplanation] = useState<CodeExplanation | null>(null)
  const [generatedCode, setGeneratedCode] = useState<CodeGeneration | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState(initialPrompt || '')
  const [showSettings, setShowSettings] = useState(false)
  const [explainDepth, setExplainDepth] = useState<'basic' | 'detailed' | 'expert'>('detailed')
  const [generateStyle, setGenerateStyle] = useState<'simple' | 'production' | 'optimized'>('production')
  const hasAutoGenerated = useRef(false)
  const monacoRef = useRef<Monaco | null>(null)

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    monacoRef.current = monaco
    // Define custom VS Code Dark+ theme (matching EnhancedCodeEditor)
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
      ],
      colors: {
        'editor.background': '#1a1a1c', // Slightly lighter than main bg for contrast
        'editor.foreground': '#D4D4D4',
      }
    })
    monaco.editor.setTheme('custom-dark')
  }

  // Keep refs for callback props to avoid stale closures in auto-generate useEffect
  const onFilesGeneratedRef = useRef(onFilesGenerated)
  const onCodeUpdateRef = useRef(onCodeUpdate)
  const codeRef = useRef(code)
  const languageRef = useRef(language)
  const filesRef = useRef(files)
  const activeFileNameRef = useRef(activeFileName)
  onFilesGeneratedRef.current = onFilesGenerated
  onCodeUpdateRef.current = onCodeUpdate
  codeRef.current = code
  languageRef.current = language
  filesRef.current = files
  activeFileNameRef.current = activeFileName

  // Auto-generate code when an initialPrompt is provided (from Dashboard prompt)
  const initialPromptRef = useRef(initialPrompt)
  useEffect(() => {
    if (initialPromptRef.current && !hasAutoGenerated.current) {
      hasAutoGenerated.current = true
      const prompt = initialPromptRef.current
      setGenerationPrompt(prompt)
      setActiveTab('generate')
      // Delay to ensure component is fully mounted and project is loaded
      const timer = setTimeout(async () => {
        setIsGenerating(true)
        try {
          // Use refs to get the LATEST props (not stale closure values)
          const result = await realGenerateAI(
            prompt,
            languageRef.current,
            codeRef.current,
            activeFileNameRef.current,
            filesRef.current
          )
          setGeneratedCode(result)
          if (result.files && result.files.length > 0 && onFilesGeneratedRef.current) {
            onFilesGeneratedRef.current(result.files)
          } else if (result.code && result.code.trim()) {
            onCodeUpdateRef.current(result.code)
          }
        } catch (error) {
          console.error('[AI Auto-Generate Error]:', error)
          toast.error(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
          setIsGenerating(false)
        }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [])

  // Explain the current code
  const handleExplain = async () => {
    if (!code.trim()) {
      toast.error('No code to explain')
      return
    }

    setIsExplaining(true)
    try {
      const result = await realExplainAI(code, language, files, activeFileName)
      setExplanation(result)
      toast.success('Code analysis complete')
    } catch (error) {
      console.error('[AI Explain Error]:', error)
      toast.error(`Explain failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExplaining(false)
    }
  }

  // Generate new code
  const handleGenerate = async (promptOverride?: string) => {
    const promptToUse = promptOverride || generationPrompt
    if (!promptToUse.trim()) {
      toast.error('Please enter what you want to generate')
      return
    }

    setIsGenerating(true)
    try {
      const result = await realGenerateAI(promptToUse, language, code, activeFileName, files)
      setGeneratedCode(result)
      
      if (result.files && result.files.length > 0 && onFilesGenerated) {
        // Multi-file: trigger streaming for all files
        onFilesGenerated(result.files)
      } else if (result.code && result.code.trim()) {
        // Single-file: auto-apply to trigger streaming + diff
        onCodeUpdate(result.code)
      }
    } catch (error) {
      console.error('[AI Generate Error]:', error)
      toast.error(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Apply generated code to editor
  const handleApplyGeneratedCode = () => {
    if (generatedCode) {
      const beforeCode = code
      onCodeUpdate(generatedCode.code)
      // Emit change event for session tracking
      if (onCodeChange) {
        onCodeChange({
          id: `change-${Date.now()}`,
          timestamp: new Date().toISOString(),
          fileId: activeFileId || 'unknown',
          fileName: activeFileName || 'untitled',
          before: beforeCode,
          after: generatedCode.code,
          source: 'ai-generate',
          description: generationPrompt || 'AI generated code applied',
          concepts: extractSkills(generatedCode.code),
        })
      }
      toast.success('Generated code applied to editor')
    }
  }

  // Copy code to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  // Download code
  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('File downloaded successfully')
  }

  // Quick generation templates
  const quickTemplates = [
    { name: 'Add Feature', prompt: 'Add a new feature to this application that...', icon: <Zap className="w-4 h-4" /> },
    { name: 'Fix Bug', prompt: 'Fix the bug where...', icon: <AlertCircle className="w-4 h-4" /> },
    { name: 'Optimize', prompt: 'Optimize the current code for better performance', icon: <Settings className="w-4 h-4" /> },
    { name: 'Add Tests', prompt: 'Generate unit tests for this component', icon: <CheckCircle className="w-4 h-4" /> },
    { name: 'Refactor', prompt: 'Refactor this code to use best practices', icon: <RefreshCw className="w-4 h-4" /> },
    { name: 'Documentation', prompt: 'Add detailed documentation to this file', icon: <BookOpen className="w-4 h-4" /> }
  ]

  return (
    <div className={cn("flex flex-col h-full bg-[#09090b] text-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#09090b] border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <p className="text-sm text-slate-400">Dual AI System - Explain & Generate</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-[#09090b] border-b border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Explanation Depth</label>
              <select
                value={explainDepth}
                onChange={(e) => setExplainDepth(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded px-3 py-2 focus:bg-white/10"
                title="Explanation Depth"
              >
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Generation Style</label>
              <select
                value={generateStyle}
                onChange={(e) => setGenerateStyle(e.target.value as any)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded px-3 py-2"
                title="Generation Style"
              >
                <option value="simple">Simple</option>
                <option value="production">Production Ready</option>
                <option value="optimized">Optimized</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-[#09090b] border-b border-white/10 p-2">
          <TabsTrigger value="explain" className="flex items-center space-x-2 data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <BookOpen className="w-4 h-4" />
            <span>Explain Code</span>
            {explanation && <Badge variant="secondary" className="ml-2">Ready</Badge>}
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center space-x-2 data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <Wand2 className="w-4 h-4" />
            <span>Generate Code</span>
            {generatedCode && <Badge variant="secondary" className="ml-2">Ready</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Explain Tab */}
        <TabsContent value="explain" className="flex-1 p-0 m-0 min-h-0">
          <div className="flex flex-col h-full min-h-0">
            {/* Context file chip + Explain button */}
            <div className="px-3 py-2.5 bg-[#09090b] border-b border-white/10">
              {/* File context — Copilot-style compact chip */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] text-white/25 uppercase tracking-wider">Context</span>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
                  <FileCode className="w-3 h-3 text-blue-400/70" />
                  <span className="text-[11px] text-white/50 font-mono truncate max-w-[140px]">{activeFileName || 'untitled'}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-white/25 border-white/10">
                    {language.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleExplain}
                disabled={isExplaining || !code.trim()}
                size="sm"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-8 text-xs"
              >
                {isExplaining ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 mr-1.5" />
                    Explain This Code
                  </div>
                )}
              </Button>
            </div>

            {/* Explanation Results */}
            <ScrollArea className="flex-1 overflow-hidden w-full">
              <div className="p-4 space-y-4 pr-4">
                {explanation ? (
                  <div className="space-y-4">
                    {/* Structured Explanation — concise "proof" format */}
                    <Card className="bg-violet-500/[0.06] border-violet-500/20">
                      <CardContent className="p-4 space-y-3">
                        {/* What happened */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-[11px] font-semibold text-yellow-300/80 uppercase tracking-wider">What happened</span>
                          </div>
                          <p className="text-[12px] text-slate-300 leading-relaxed">{explanation.structured.whatHappened}</p>
                        </div>
                        <Separator className="bg-white/[0.06]" />
                        {/* Why */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Brain className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[11px] font-semibold text-blue-300/80 uppercase tracking-wider">Why</span>
                          </div>
                          <p className="text-[12px] text-slate-300 leading-relaxed">{explanation.structured.why}</p>
                        </div>
                        <Separator className="bg-white/[0.06]" />
                        {/* What to remember */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Star className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[11px] font-semibold text-emerald-300/80 uppercase tracking-wider">Remember</span>
                          </div>
                          <ul className="space-y-1">
                            {explanation.structured.remember.map((item, i) => (
                              <li key={i} className="text-[12px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                <span className="text-emerald-400/60 mt-0.5">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Separator className="bg-white/[0.06]" />
                        {/* Concepts */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-[11px] font-semibold text-violet-300/80 uppercase tracking-wider">Concepts</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {explanation.structured.concepts.map((concept, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 text-violet-300 border-violet-500/25 bg-violet-500/10">
                                {concept}
                              </Badge>
                            ))}
                            {explanation.structured.concepts.length === 0 && (
                              <span className="text-[10px] text-white/20">Write some code to see concepts detected</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Overview */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center text-gray-200">
                          <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
                          Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 text-sm">{explanation.overview}</p>
                      </CardContent>
                    </Card>

                    {/* Functions */}
                    {explanation.functions.length > 0 && (
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center text-gray-200">
                            <Code className="w-4 h-4 mr-2 text-blue-400" />
                            Functions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {explanation.functions.map((func, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-mono text-green-400">{func.name}</h4>
                                <Badge variant="outline" className="text-xs text-slate-400 border-white/10">
                                  {func.returnType}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-300 mb-2">{func.description}</p>
                              {func.parameters.length > 0 && (
                                <div>
                                  <p className="text-xs text-slate-400 mb-1">Parameters:</p>
                                  <ul className="text-xs text-slate-300 space-y-1">
                                    {func.parameters.map((param, paramIndex) => (
                                      <li key={paramIndex} className="flex items-center">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                        {param}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Complexity */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center text-gray-200">
                          <Clock className="w-4 h-4 mr-2 text-orange-400" />
                          Time Complexity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary" className="text-slate-300 bg-white/10">
                          {explanation.complexity}
                        </Badge>
                      </CardContent>
                    </Card>

                    {/* Best Practices */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center text-gray-200">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Best Practices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {explanation.bestPractices.map((practice, index) => (
                            <li key={index} className="flex items-start text-sm text-slate-300">
                              <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              {practice}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Improvements */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center text-gray-200">
                          <AlertCircle className="w-4 h-4 mr-2 text-yellow-400" />
                          Suggested Improvements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {explanation.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start text-sm text-slate-300">
                              <AlertCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Related Concepts */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center text-gray-200">
                          <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                          Related Concepts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {explanation.relatedConcepts.map((concept, index) => (
                            <Badge key={index} variant="outline" className="text-slate-300 border-white/10">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Click "Explain This Code" to get AI-powered analysis</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="flex-1 p-0 m-0 min-h-0">
          <div className="flex flex-col h-full min-h-0">
            {/* Generation Input */}
            <div className="p-4 bg-[#09090b] border-b border-white/10">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">What do you want to generate?</label>
                  <Textarea
                    placeholder="Describe the code you want to generate... For example: 'Create a function that validates email addresses' or 'Generate a REST API endpoint for user authentication'"
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder-slate-400 min-h-[80px] focus:bg-white/10"
                  />
                </div>
                
                {/* Quick Templates - Only show if no code generated yet */}
                {!generatedCode && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Quick Templates</label>
                    <div className="grid grid-cols-2 gap-2">
                      {quickTemplates.map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                          onClick={() => setGenerationPrompt(template.prompt)}
                        >
                          {template.icon}
                          <span className="ml-2">{template.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !generationPrompt.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Code...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Code
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Generated Code Results */}
            <ScrollArea className="flex-1 overflow-hidden w-full">
              <div className="p-4 space-y-4 pr-4">
                {generatedCode ? (
                  <div className="space-y-4">
                    {/* Generated Code */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center text-gray-200">
                            <Code className="w-4 h-4 mr-2 text-green-400" />
                            Generated Code
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-slate-400 border-white/10">
                              {generatedCode.language.toUpperCase()}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                              onClick={() => handleCopy(generatedCode.code)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                              onClick={() => handleDownload(generatedCode.code, `generated_${Date.now()}.${generatedCode.language}`)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 overflow-hidden rounded-md border border-white/10 mb-3">
                          <Editor
                            height="100%"
                            language={generatedCode.language || 'javascript'}
                            value={generatedCode.code}
                            theme="custom-dark"
                            onMount={handleEditorDidMount}
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              fontSize: 12,
                              fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                            }}
                          />
                        </div>
                        <Button
                          onClick={handleApplyGeneratedCode}
                          className="w-full mt-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Apply to Editor
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Explanation */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center text-gray-200">
                          <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
                          Explanation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-300">{generatedCode.explanation}</p>
                      </CardContent>
                    </Card>

                    {/* Usage */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center text-gray-200">
                          <Terminal className="w-4 h-4 mr-2 text-yellow-400" />
                          Usage Instructions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-300">{generatedCode.usage}</p>
                      </CardContent>
                    </Card>

                    {/* Dependencies */}
                    {generatedCode.dependencies.length > 0 && (
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center text-gray-200">
                            <Database className="w-4 h-4 mr-2 text-purple-400" />
                            Dependencies
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {generatedCode.dependencies.map((dep, index) => (
                              <li key={index} className="text-sm text-slate-300 flex items-center">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                {dep}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Testing */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center text-gray-200">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Testing Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-300">{generatedCode.testing}</p>
                      </CardContent>
                    </Card>

                    {/* Documentation */}
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center text-gray-200">
                          <BookOpen className="w-4 h-4 mr-2 text-orange-400" />
                          Documentation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-300">{generatedCode.documentation}</p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Describe what you want to generate and click "Generate Code"</p>
                    <p className="text-xs text-slate-500 mt-2">Try the quick templates above for inspiration</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="p-3 bg-[#09090b] border-t border-white/10 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span>AI Assistant - Powered by Advanced Language Models</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}