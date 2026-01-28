import { useState, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import EnhancedFileExplorer from '@/components/ide/EnhancedFileExplorer'
import EnhancedCodeEditor from '@/components/editor/EnhancedCodeEditor'
import DualAISystem from '@/components/ai/DualAISystem'
import OutputPanel from '@/components/editor/OutputPanel'
import StatusBar from '@/components/ide/StatusBar'
import EnhancedIDEHeader from './EnhancedIDEHeader'
import { toast } from 'sonner'

import PreviewPanel from '@/components/editor/PreviewPanel'

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

interface Project {
  id: string
  name: string
  template: string
  description: string
  files: FileNode[]
}

export default function EnhancedIDELayout() {
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<FileNode[]>([])
  const [activeFile, setActiveFile] = useState<FileNode | null>(null)
  const [output, setOutput] = useState<string>('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [aiPanelVisible, setAiPanelVisible] = useState(true)
  const [previewVisible, setPreviewVisible] = useState(false)

  // Load project from localStorage or create default
  useEffect(() => {
    const loadProject = () => {
      try {
        const savedProject = localStorage.getItem('currentProject')
        if (savedProject) {
          const projectData = JSON.parse(savedProject)
          setProject(projectData)
          setFiles(projectData.files || [])
          
          // Set first file as active
          const firstFile = findFirstFile(projectData.files || [])
          if (firstFile) {
            setActiveFile(firstFile)
          }
        } else {
          // Create default project if none exists
          const defaultProject: Project = {
            id: 'default',
            name: 'Welcome Project',
            template: 'default',
            description: 'A starter project to get you coding',
            files: [
              {
                id: 'welcome',
                name: 'welcome.js',
                type: 'file',
                language: 'javascript',
                content: `// Welcome to CodePath AI IDE!\n// This is your enhanced coding environment with AI assistance.\n\nconsole.log('Hello, World!');\nconsole.log('Start coding and let AI help you along the way.');\n\n// Try our features:\n// 1. File Explorer - Right-click to create, rename, delete files\n// 2. Code Editor - Premium Monaco editor with VS Code Dark+ theme\n// 3. AI Assistant - Explain code or generate new code\n// 4. Project Templates - Start with pre-built templates\n\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('Developer'));`
              },
              {
                id: 'readme',
                name: 'README.md',
                type: 'file',
                language: 'markdown',
                content: `# Welcome to CodePath AI IDE\n\n## Features\n\n### 🎨 Enhanced Dark Theme\n- VS Code Dark+ theme with premium styling\n- Custom syntax highlighting\n- Professional color scheme\n\n### 📁 Advanced File Explorer\n- Tree structure with folder navigation\n- Context menus for file operations\n- Search functionality\n- File type icons\n\n### 🤖 Dual AI System\n- **Explain Mode**: Get detailed code analysis\n- **Generate Mode**: Create code from descriptions\n- Both work simultaneously\n\n### 🚀 Premium Editor\n- Monaco Editor integration\n- Multiple themes and customization\n- Auto-save and formatting\n- Search and replace\n\n## Getting Started\n\n1. **Create a Project**: Use our project templates\n2. **Explore Files**: Navigate your project structure\n3. **Code with AI**: Use the AI assistant for help\n4. **Run Your Code**: Execute and see output\n\nHappy Coding! 🚀`
              }
            ]
          }
          setProject(defaultProject)
          setFiles(defaultProject.files)
          setActiveFile(defaultProject.files[0])
        }
      } catch (error) {
        console.error('Error loading project:', error)
        toast.error('Failed to load project')
      }
    }

    loadProject()
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
    setActiveFile(file)
    toast.info(`Opened ${file.name}`)
  }

  // Handle file changes
  const handleFileChange = (updatedFiles: FileNode[]) => {
    setFiles(updatedFiles)
    
    // Update project in localStorage
    if (project) {
      const updatedProject = { ...project, files: updatedFiles }
      setProject(updatedProject)
      localStorage.setItem('currentProject', JSON.stringify(updatedProject))
    }
  }

  // Handle code changes
  const handleCodeChange = (content: string) => {
    if (activeFile) {
      const updatedFile = { ...activeFile, content }
      setActiveFile(updatedFile)
      
      // Update file in project structure
      const updateFileContent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === activeFile.id) {
            return updatedFile
          }
          if (node.children) {
            return { ...node, children: updateFileContent(node.children) }
          }
          return node
        })
      }
      
      const updatedFiles = updateFileContent(files)
      setFiles(updatedFiles)
      
      // Update project in localStorage
      if (project) {
        const updatedProject = { ...project, files: updatedFiles }
        setProject(updatedProject)
        localStorage.setItem('currentProject', JSON.stringify(updatedProject))
      }
    }
  }

  // Handle code execution
  const handleExecute = async (code: string, language: string) => {
    setIsExecuting(true)
    setOutput('')
    
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let result = ''
      
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          try {
            // Simple JavaScript execution simulation
            const logs: string[] = []
            const originalConsole = { ...console }
            
            console.log = (...args) => {
              logs.push(args.map(arg => String(arg)).join(' '))
            }
            
            // Create a safe execution context
            const func = new Function(code)
            func()
            
            // Restore console
            Object.assign(console, originalConsole)
            
            result = logs.join('\\n') || 'Code executed successfully (no output)'
          } catch (error) {
            result = `Error: ${error.message}`
          }
          break
          
        case 'python':
          result = `Python execution would require a backend service\\nSimulated output:\\n${code.split('\\n').length} lines processed`
          break
          
        case 'typescript':
          result = `TypeScript compilation required\\nSimulated output:\\n${code.split('\\n').length} lines processed`
          break
          
        default:
          result = `Execution not implemented for ${language}\\nCode length: ${code.length} characters`
      }
      
      setOutput(result)
      toast.success('Code executed successfully')
    } catch (error) {
      setOutput(`Error executing code: ${error}`)
      toast.error('Code execution failed')
    } finally {
      setIsExecuting(false)
    }
  }

  // Handle AI code update
  const handleAICodeUpdate = (newCode: string) => {
    if (activeFile) {
      handleCodeChange(newCode)
      toast.success('AI code applied to editor')
    }
  }

  // Handle AI file generation
  const handleFilesGenerated = (newFiles: any[]) => {
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
    setFiles(processedFiles)

    // Update project
    if (project) {
      const updatedProject = { ...project, files: processedFiles }
      setProject(updatedProject)
      localStorage.setItem('currentProject', JSON.stringify(updatedProject))
    }

    // Set first file as active (e.g. App.tsx or index.tsx or README)
    const findFileByName = (nodes: FileNode[], name: string): FileNode | null => {
      for (const node of nodes) {
        if (node.name === name) return node
        if (node.children) {
          const found = findFileByName(node.children, name)
          if (found) return found
        }
      }
      return null
    }

    const mainFile = findFileByName(processedFiles, 'App.tsx') || 
                     findFileByName(processedFiles, 'index.tsx') || 
                     findFirstFile(processedFiles)
    
    if (mainFile) {
      setActiveFile(mainFile)
    }
    
    toast.success('Project structure generated successfully')
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading CodePath AI IDE...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-white">
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

          <PanelResizeHandle className="w-1 bg-white/10 hover:bg-white/20 transition-colors" />

          {/* Code Editor */}
          <Panel defaultSize={50} minSize={30}>
            {previewVisible ? (
              <PreviewPanel files={files} />
            ) : (
              <div className="h-full flex flex-col">
                <EnhancedCodeEditor
                  file={activeFile}
                  onFileChange={handleCodeChange}
                  onExecute={handleExecute}
                  className="flex-1"
                />
                
                {/* Output Panel */}
                <OutputPanel
                  output={output}
                  isRunning={isExecuting}
                  className="h-48 border-t border-white/10"
                />
              </div>
            )}
          </Panel>

          {/* AI Panel */}
          {aiPanelVisible && (
            <>
              <PanelResizeHandle className="w-1 bg-white/10 hover:bg-white/20 transition-colors" />
              <Panel defaultSize={30} minSize={20} maxSize={40}>
                <DualAISystem
                  code={activeFile?.content || ''}
                  language={activeFile?.language || 'javascript'}
                  files={files}
                  onCodeUpdate={handleAICodeUpdate}
                  onFilesGenerated={handleFilesGenerated}
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
        className="h-6"
      />
    </div>
  )
}
