import { useState, useEffect } from 'react'
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

interface CodeExplanation {
  overview: string
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
}

interface DualAISystemProps {
  code: string
  language: string
  onCodeUpdate: (code: string) => void
  className?: string
}

// Mock AI service for demonstration
const mockExplainAI = async (code: string, language: string): Promise<CodeExplanation> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
  
  // Generate mock explanation based on code content
  const hasFunctions = code.includes('function') || code.includes('def') || code.includes('class')
  const hasLoops = code.includes('for') || code.includes('while')
  const hasConditionals = code.includes('if') || code.includes('switch')
  
  return {
    overview: `This ${language} code ${hasFunctions ? 'defines functions and' : ''} ${hasLoops ? 'uses loops to' : ''} ${hasConditionals ? 'implements conditional logic to' : ''} solve a specific problem. The code demonstrates ${language.toLowerCase()} programming concepts and best practices.`,
    functions: hasFunctions ? [
      {
        name: 'mainFunction',
        description: 'The primary function that orchestrates the program logic',
        parameters: ['param1', 'param2'],
        returnType: 'void'
      },
      {
        name: 'helperFunction',
        description: 'A utility function that performs a specific task',
        parameters: ['input'],
        returnType: 'string'
      }
    ] : [],
    complexity: hasLoops && hasConditionals ? 'O(n log n)' : hasLoops ? 'O(n)' : 'O(1)',
    bestPractices: [
      'Uses meaningful variable names',
      'Implements proper error handling',
      'Follows ${language} conventions',
      'Includes comprehensive comments'
    ],
    improvements: [
      'Consider adding input validation',
      'Implement unit tests for better coverage',
      'Add logging for debugging purposes',
      'Optimize performance for large datasets'
    ],
    relatedConcepts: [
      'Data structures',
      'Algorithm optimization',
      'Design patterns',
      'Code refactoring'
    ]
  }
}

const mockGenerateAI = async (prompt: string, language: string): Promise<CodeGeneration> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
  
  // Generate mock code based on prompt and language
  const codeTemplates = {
    'javascript': `// Generated JavaScript code based on your request
function ${prompt.toLowerCase().replace(/\\s+/g, '_')}() {
  // Implementation here
  console.log('Generated function executed');
  return true;
}

// Usage example
${prompt.toLowerCase().replace(/\\s+/g, '_')}();`,
    
    'python': `# Generated Python code based on your request
def ${prompt.toLowerCase().replace(/\\s+/g, '_')}():
    \"\"\n    Generated function for: ${prompt}
    \"\"\n    # Implementation here
    print("Generated function executed")
    return True

# Usage example
if __name__ == "__main__":
    ${prompt.toLowerCase().replace(/\\s+/g, '_')}()`,
    
    'typescript': `// Generated TypeScript code based on your request
function ${prompt.toLowerCase().replace(/\\s+/g, '_')}(): boolean {
  // Implementation here
  console.log('Generated function executed');
  return true;
}

// Usage example
${prompt.toLowerCase().replace(/\\s+/g, '_')}();`
  }
  
  return {
    code: codeTemplates[language as keyof typeof codeTemplates] || codeTemplates.javascript,
    language: language,
    explanation: `This code was generated to fulfill your request: "${prompt}". It includes proper error handling, type safety, and follows ${language} best practices.`,
    usage: 'Simply call the generated function with appropriate parameters. The function is self-contained and ready to use.',
    dependencies: [],
    testing: 'Add unit tests to verify the function works as expected. Consider edge cases and error scenarios.',
    documentation: 'Document the function parameters, return values, and any important implementation details.'
  }
}

export default function DualAISystem({ code, language, onCodeUpdate, className }: DualAISystemProps) {
  const [activeTab, setActiveTab] = useState<'explain' | 'generate'>('explain')
  const [explanation, setExplanation] = useState<CodeExplanation | null>(null)
  const [generatedCode, setGeneratedCode] = useState<CodeGeneration | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [explainDepth, setExplainDepth] = useState<'basic' | 'detailed' | 'expert'>('detailed')
  const [generateStyle, setGenerateStyle] = useState<'simple' | 'production' | 'optimized'>('production')

  // Explain the current code
  const handleExplain = async () => {
    if (!code.trim()) {
      toast.error('No code to explain')
      return
    }

    setIsExplaining(true)
    try {
      const result = await mockExplainAI(code, language)
      setExplanation(result)
      toast.success('Code explanation generated successfully')
    } catch (error) {
      toast.error('Failed to generate explanation')
    } finally {
      setIsExplaining(false)
    }
  }

  // Generate new code
  const handleGenerate = async () => {
    if (!generationPrompt.trim()) {
      toast.error('Please enter what you want to generate')
      return
    }

    setIsGenerating(true)
    try {
      const result = await mockGenerateAI(generationPrompt, language)
      setGeneratedCode(result)
      toast.success('Code generated successfully')
    } catch (error) {
      toast.error('Failed to generate code')
    } finally {
      setIsGenerating(false)
    }
  }

  // Apply generated code to editor
  const handleApplyGeneratedCode = () => {
    if (generatedCode) {
      onCodeUpdate(generatedCode.code)
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
    { name: 'Function Template', prompt: 'Create a function with error handling and logging', icon: <FileCode className="w-4 h-4" /> },
    { name: 'API Endpoint', prompt: 'Create a REST API endpoint with validation', icon: <Globe className="w-4 h-4" /> },
    { name: 'Data Class', prompt: 'Create a data class with methods', icon: <Database className="w-4 h-4" /> },
    { name: 'Loop Template', prompt: 'Create a loop with proper error handling', icon: <Terminal className="w-4 h-4" /> },
    { name: 'Mobile Component', prompt: 'Create a mobile UI component', icon: <Smartphone className="w-4 h-4" /> },
    { name: 'Game Logic', prompt: 'Create basic game logic', icon: <Gamepad2 className="w-4 h-4" /> }
  ]

  return (
    <div className={cn("flex flex-col h-full bg-slate-900 text-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
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
        <div className="p-4 bg-slate-800 border-b border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Explanation Depth</label>
              <select
                value={explainDepth}
                onChange={(e) => setExplainDepth(e.target.value as any)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded px-3 py-2"
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
        <TabsList className="bg-slate-800 border-b border-slate-700 p-2">
          <TabsTrigger value="explain" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Explain Code</span>
            {explanation && <Badge variant="secondary" className="ml-2">Ready</Badge>}
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4" />
            <span>Generate Code</span>
            {generatedCode && <Badge variant="secondary" className="ml-2">Ready</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Explain Tab */}
        <TabsContent value="explain" className="flex-1 p-0 m-0">
          <div className="flex flex-col h-full">
            {/* Code Preview */}
            <div className="p-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300">Current Code</h3>
                <Badge variant="outline" className="text-slate-400 border-slate-600">
                  {language.toUpperCase()}
                </Badge>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                  {code || 'No code to explain'}
                </pre>
              </div>
            </div>

            {/* Explain Button */}
            <div className="p-4 border-b border-slate-700">
              <Button
                onClick={handleExplain}
                disabled={isExplaining || !code.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isExplaining ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing Code...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Brain className="w-4 h-4 mr-2" />
                    Explain This Code
                  </div>
                )}
              </Button>
            </div>

            {/* Explanation Results */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {explanation ? (
                  <div className="space-y-4">
                    {/* Overview */}
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
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
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Code className="w-4 h-4 mr-2 text-blue-400" />
                            Functions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {explanation.functions.map((func, index) => (
                            <div key={index} className="bg-slate-900 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-mono text-green-400">{func.name}</h4>
                                <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
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
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-orange-400" />
                          Time Complexity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary" className="text-slate-300 bg-slate-700">
                          {explanation.complexity}
                        </Badge>
                      </CardContent>
                    </Card>

                    {/* Best Practices */}
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
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
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
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
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                          Related Concepts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {explanation.relatedConcepts.map((concept, index) => (
                            <Badge key={index} variant="outline" className="text-slate-300 border-slate-600">
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
        <TabsContent value="generate" className="flex-1 p-0 m-0">
          <div className="flex flex-col h-full">
            {/* Generation Input */}
            <div className="p-4 bg-slate-800 border-b border-slate-700">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">What do you want to generate?</label>
                  <Textarea
                    placeholder="Describe the code you want to generate... For example: 'Create a function that validates email addresses' or 'Generate a REST API endpoint for user authentication'"
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-[80px]"
                  />
                </div>
                
                {/* Quick Templates */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Quick Templates</label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickTemplates.map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
                        onClick={() => setGenerationPrompt(template.prompt)}
                      >
                        {template.icon}
                        <span className="ml-2">{template.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
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
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {generatedCode ? (
                  <div className="space-y-4">
                    {/* Generated Code */}
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center">
                            <Code className="w-4 h-4 mr-2 text-green-400" />
                            Generated Code
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
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
                        <div className="bg-slate-900 rounded-lg p-3">
                          <pre className="text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto">
                            {generatedCode.code}
                          </pre>
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
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
                          Explanation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-300">{generatedCode.explanation}</p>
                      </CardContent>
                    </Card>

                    {/* Usage */}
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
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
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
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
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Testing Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-300">{generatedCode.testing}</p>
                      </CardContent>
                    </Card>

                    {/* Documentation */}
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
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
      <div className="p-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
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