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
  className?: string
}

// Mock AI service for demonstration
const mockExplainAI = async (code: string, language: string, files?: any[]): Promise<CodeExplanation> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
  
  // Flatten file tree to count files (mock analysis)
  let fileCount = 0
  if (files) {
    const countFiles = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.type === 'file') fileCount++
        if (node.children) countFiles(node.children)
      })
    }
    countFiles(files)
  }

  // Generate mock explanation based on code content and context
  const hasFunctions = code.includes('function') || code.includes('def') || code.includes('class')
  const hasLoops = code.includes('for') || code.includes('while')
  const hasConditionals = code.includes('if') || code.includes('switch')
  
  return {
    overview: `This ${language} code is part of a project with ${fileCount} files. It ${hasFunctions ? 'defines functions and' : ''} ${hasLoops ? 'uses loops to' : ''} ${hasConditionals ? 'implements conditional logic to' : ''} solve a specific problem. The code demonstrates ${language.toLowerCase()} programming concepts and best practices within the application context.`,
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
  
  // Check for project generation prompts
  const isProjectRequest = /create|project|app|boilerplate|react|todo/i.test(prompt)
  
  if (isProjectRequest) {
    return {
      code: '// Project structure generated. See File Explorer.',
      language: 'text',
      explanation: 'I have generated a complete project structure based on your request. You can find the new files in the File Explorer.',
      usage: 'Navigate through the generated files in the explorer to see the implementation.',
      dependencies: ['react', 'react-dom', 'lucide-react'],
      testing: 'Run npm test to execute the generated test suite.',
      documentation: 'Check README.md for project documentation.',
      files: [
        {
          name: 'package.json',
          type: 'file',
          language: 'json',
          content: `{\n  "name": "generated-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "lucide-react": "^0.300.0",\n    "tailwindcss": "^3.4.0",\n    "clsx": "^2.1.0",\n    "tailwind-merge": "^2.2.0"\n  }\n}`
        },
        {
          name: 'README.md',
          type: 'file',
          language: 'markdown',
          content: `# Generated React Project\n\nThis project was generated by the AI Assistant.\n\n## Scripts\n\n- \`npm start\`: Runs the app in development mode.\n- \`npm test\`: Launches the test runner.\n- \`npm run build\`: Builds the app for production.\n\n## Structure\n\n- \`src/components\`: Reusable UI components\n- \`src/hooks\`: Custom React hooks\n- \`src/utils\`: Utility functions`
        },
        {
          name: 'src',
          type: 'folder',
          language: '',
          content: '',
          children: [
            {
              name: 'App.tsx',
              type: 'file',
              language: 'typescript',
              content: `import React from 'react';\nimport { Header } from './components/Header';\nimport { Footer } from './components/Footer';\nimport { Card } from './components/Card';\nimport { Button } from './components/Button';\nimport { useTheme } from './hooks/useTheme';\n\nexport default function App() {\n  const { theme, toggleTheme } = useTheme();\n  \n  return (\n    <div className={\`min-h-screen flex flex-col \${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}\`}>\n      <Header theme={theme} onToggleTheme={toggleTheme} />\n      \n      <main className="flex-1 container mx-auto p-8">\n        <div className="max-w-4xl mx-auto space-y-8">\n          <section className="text-center space-y-4">\n            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">\n              Welcome to Your App\n            </h1>\n            <p className="text-lg opacity-80">\n              This is a starter template generated by AI with a complete component structure.\n            </p>\n            <div className="flex justify-center gap-4">\n              <Button variant="primary">Get Started</Button>\n              <Button variant="outline">Learn More</Button>\n            </div>\n          </section>\n\n          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n            <Card \n              title="Feature One" \n              description="This is a sample card component to demonstrate the layout."\n              icon="Zap"\n            />\n            <Card \n              title="Feature Two" \n              description="Components are modular and easy to customize."\n              icon="Code"\n            />\n            <Card \n              title="Feature Three" \n              description="Includes dark mode support out of the box."\n              icon="Moon"\n            />\n          </div>\n        </div>\n      </main>\n\n      <Footer />\n    </div>\n  );\n}`
            },
            {
              name: 'index.tsx',
              type: 'file',
              language: 'typescript',
              content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nconst root = ReactDOM.createRoot(document.getElementById('root')!);\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`
            },
            {
              name: 'index.css',
              type: 'file',
              language: 'css',
              content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',\n    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',\n    sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\ncode {\n  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',\n    monospace;\n}`
            },
            {
              name: 'components',
              type: 'folder',
              language: '',
              content: '',
              children: [
                {
                  name: 'Button.tsx',
                  type: 'file',
                  language: 'typescript',
                  content: `import React from 'react';\nimport { cn } from '../utils/cn';\n\ninterface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';\n  size?: 'sm' | 'md' | 'lg';\n}\n\nexport const Button: React.FC<ButtonProps> = ({ \n  children, \n  className, \n  variant = 'primary', \n  size = 'md', \n  ...props \n}) => {\n  const variants = {\n    primary: 'bg-blue-600 text-white hover:bg-blue-700',\n    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',\n    outline: 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50',\n    ghost: 'hover:bg-slate-100 text-slate-700'\n  };\n\n  const sizes = {\n    sm: 'px-3 py-1.5 text-sm',\n    md: 'px-4 py-2 text-base',\n    lg: 'px-6 py-3 text-lg'\n  };\n\n  return (\n    <button \n      className={cn(\n        'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',\n        variants[variant],\n        sizes[size],\n        className\n      )} \n      {...props}\n    >\n      {children}\n    </button>\n  );\n};`
                },
                {
                  name: 'Card.tsx',
                  type: 'file',
                  language: 'typescript',
                  content: `import React from 'react';\nimport { Zap, Code, Moon, Star, Box } from 'lucide-react';\n\ninterface CardProps {\n  title: string;\n  description: string;\n  icon?: string;\n}\n\nconst icons: Record<string, any> = {\n  Zap,\n  Code,\n  Moon,\n  Star,\n  Box\n};\n\nexport const Card: React.FC<CardProps> = ({ title, description, icon = 'Box' }) => {\n  const Icon = icons[icon] || Box;\n  \n  return (\n    <div className="bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">\n      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">\n        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />\n      </div>\n      <h3 className="text-xl font-semibold mb-2">{title}</h3>\n      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">\n        {description}\n      </p>\n    </div>\n  );\n};`
                },
                {
                  name: 'Header.tsx',
                  type: 'file',
                  language: 'typescript',
                  content: `import React from 'react';\nimport { Moon, Sun, Github } from 'lucide-react';\nimport { Button } from './Button';\n\ninterface HeaderProps {\n  theme: 'light' | 'dark';\n  onToggleTheme: () => void;\n}\n\nexport const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {\n  return (\n    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">\n      <div className="container mx-auto px-4 h-16 flex items-center justify-between">\n        <div className="flex items-center gap-2">\n          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">\n            <span className="text-white font-bold text-xl">A</span>\n          </div>\n          <span className="font-bold text-xl">AppBase</span>\n        </div>\n        \n        <nav className="hidden md:flex items-center gap-6">\n          <a href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">Features</a>\n          <a href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">Docs</a>\n          <a href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">Pricing</a>\n          <a href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">About</a>\n        </nav>\n\n        <div className="flex items-center gap-2">\n          <Button \n            variant="ghost" \n            size="sm" \n            onClick={onToggleTheme}\n            className="w-10 h-10 p-0 rounded-full"\n          >\n            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}\n          </Button>\n          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">\n            <Github className="w-4 h-4" />\n            GitHub\n          </Button>\n        </div>\n      </div>\n    </header>\n  );\n};`
                },
                {
                  name: 'Footer.tsx',
                  type: 'file',
                  language: 'typescript',
                  content: `import React from 'react';\n\nexport const Footer: React.FC = () => {\n  return (\n    <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-12">\n      <div className="container mx-auto px-4 text-center text-slate-500 text-sm">\n        <p>© {new Date().getFullYear()} Generated App. All rights reserved.</p>\n        <div className="mt-4 flex justify-center gap-4">\n          <a href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Privacy Policy</a>\n          <a href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Terms of Service</a>\n          <a href="#" className="hover:text-slate-800 dark:hover:text-slate-200">Contact</a>\n        </div>\n      </div>\n    </footer>\n  );\n};`
                }
              ]
            },
            {
              name: 'hooks',
              type: 'folder',
              language: '',
              content: '',
              children: [
                {
                  name: 'useTheme.ts',
                  type: 'file',
                  language: 'typescript',
                  content: `import { useState, useEffect } from 'react';\n\nexport const useTheme = () => {\n  const [theme, setTheme] = useState<'light' | 'dark'>('light');\n\n  useEffect(() => {\n    // Check system preference\n    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {\n      setTheme('dark');\n    }\n  }, []);\n\n  const toggleTheme = () => {\n    setTheme(prev => prev === 'light' ? 'dark' : 'light');\n  };\n\n  return { theme, toggleTheme };\n};`
                }
              ]
            },
            {
              name: 'utils',
              type: 'folder',
              language: '',
              content: '',
              children: [
                {
                  name: 'cn.ts',
                  type: 'file',
                  language: 'typescript',
                  content: `import { type ClassValue, clsx } from 'clsx';\nimport { twMerge } from 'tailwind-merge';\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}`
                }
              ]
            }
          ]
        }
      ]
    }
  }

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

export default function DualAISystem({ code, language, files, onCodeUpdate, onFilesGenerated, className }: DualAISystemProps) {
  const [activeTab, setActiveTab] = useState<'explain' | 'generate'>('explain')
  const [explanation, setExplanation] = useState<CodeExplanation | null>(null)
  const [generatedCode, setGeneratedCode] = useState<CodeGeneration | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [explainDepth, setExplainDepth] = useState<'basic' | 'detailed' | 'expert'>('detailed')
  const [generateStyle, setGenerateStyle] = useState<'simple' | 'production' | 'optimized'>('production')
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

  useEffect(() => {
    // If a generation prompt is provided from project creation, trigger generation automatically
    const savedProject = localStorage.getItem('currentProject')
    if (savedProject) {
      try {
        const projectData = JSON.parse(savedProject)
        // Check if this is a fresh project creation that hasn't been processed yet
        if (projectData.description && !projectData.hasGeneratedInitialCode) {
          setGenerationPrompt(projectData.description)
          setActiveTab('generate')
          
          // Mark as processed so we don't regenerate on every reload
          projectData.hasGeneratedInitialCode = true
          localStorage.setItem('currentProject', JSON.stringify(projectData))
          
          // Trigger generation after a short delay to ensure UI is ready
          setTimeout(() => {
            handleGenerate(projectData.description)
          }, 500)
        }
      } catch (e) {
        console.error("Error parsing project data", e)
      }
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
      const result = await mockExplainAI(code, language, files)
      setExplanation(result)
      toast.success('Code explanation generated successfully')
    } catch (error) {
      toast.error('Failed to generate explanation')
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
      const result = await mockGenerateAI(promptToUse, language)
      setGeneratedCode(result)
      
      if (result.files && onFilesGenerated) {
        onFilesGenerated(result.files)
        toast.success('Project files created')
      } else {
        toast.success('Code generated successfully')
      }
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
        <TabsContent value="explain" className="flex-1 p-0 m-0">
          <div className="flex flex-col h-full">
            {/* Code Preview */}
            <div className="p-4 bg-[#09090b] border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300">Current Code</h3>
                <Badge variant="outline" className="text-slate-400 border-white/10">
                  {language.toUpperCase()}
                </Badge>
              </div>
              <div className="h-48 overflow-hidden rounded-md border border-white/10">
                <Editor
                  height="100%"
                  language={language || 'javascript'}
                  value={code || '// No code to explain'}
                  theme="custom-dark"
                  onMount={handleEditorDidMount}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 12,
                    lineNumbers: 'off',
                    folding: false,
                    renderLineHighlight: 'none',
                    fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                  }}
                />
              </div>
            </div>

            {/* Explain Button */}
            <div className="p-4 border-b border-white/10">
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
        <TabsContent value="generate" className="flex-1 p-0 m-0">
          <div className="flex flex-col h-full">
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
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
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