import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  LayoutDashboard, 
  Github, 
  Sparkles, 
  Shield, 
  FileText, 
  CheckSquare, 
  Settings, 
  AlertCircle,
  ChevronDown,
  Cpu,
  Palette,
  HelpCircle,
  Download,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/useAuth'

const AI_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B' },
  { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2' },
]

export default function CreateProject() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to start building')
      return
    }

    setIsSubmitting(true)
    
    // Simulate creation delay
    setTimeout(() => {
      const projectData = {
        id: Date.now().toString(),
        name: 'New AI Project',
        template: 'custom',
        description: prompt,
        model: selectedModel.id,
        files: [
          {
            name: 'README.md',
            content: `# New Project\n\nGenerated from prompt: ${prompt}\nModel: ${selectedModel.name}`,
            language: 'markdown'
          }
        ]
      }
      
      localStorage.setItem('currentProject', JSON.stringify(projectData))
      navigate('/app', { state: { project: projectData } })
      setIsSubmitting(false)
    }, 1000)
  }

  const handleQuickAction = (action: string) => {
    setPrompt(prev => {
      const prefix = action === 'audit' ? 'Run security audit on ' : 
                    action === 'improve' ? 'Improve AGENTS.md for ' : 
                    'Solve a TODO in '
      return prefix + (prev || 'this project')
    })
    const textarea = document.querySelector('textarea')
    if (textarea) textarea.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreate()
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
    toast.success('Logged out successfully')
  }

  return (
    <div className="dark flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-card">
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search agents..." 
              className="pl-9 bg-secondary border-none text-sm h-9 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary h-9 px-2">
            <Plus className="mr-2 h-4 w-4" />
            New Agent
          </Button>
          
          <div className="pt-2">
            <p className="text-xs text-muted-foreground font-medium px-2 mb-2">AGENTS</p>
            <div className="px-2 py-1.5 text-sm text-muted-foreground italic">
              No agents yet
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-border space-y-2">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary px-2">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          
          <div className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-secondary rounded-md transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || user?.photoURL || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {(profile?.full_name || user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.full_name || user?.displayName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">Free Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative bg-background">
        <div className="absolute top-6 right-6 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 ring-2 ring-border cursor-pointer hover:ring-primary/50 transition-all">
                <AvatarImage src={profile?.avatar_url || user?.photoURL || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {(profile?.full_name || user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-popover border-border text-popover-foreground p-0" align="end">
              <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={profile?.avatar_url || user?.photoURL || undefined} alt={profile?.full_name || user?.displayName || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {(profile?.full_name || user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-medium leading-none truncate">{profile?.full_name || user?.displayName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate mt-1">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-1">
                <DropdownMenuItem className="hover:bg-secondary focus:bg-secondary cursor-pointer py-2.5">
                  <Palette className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>Theme</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary focus:bg-secondary cursor-pointer py-2.5">
                  <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>Cloud Agent Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-secondary focus:bg-secondary cursor-pointer py-2.5">
                  <HelpCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>Documentation</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-border my-0" />
              
              <div className="p-1">
                <DropdownMenuItem className="hover:bg-secondary focus:bg-secondary cursor-pointer py-2.5">
                  <Download className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>Download Trae Windows</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-border my-0" />

              <div className="p-1">
                <DropdownMenuItem onClick={handleSignOut} className="hover:bg-secondary focus:bg-secondary cursor-pointer py-2.5 text-destructive hover:text-destructive focus:text-destructive">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
          {/* Repository Selector */}
          <div className="w-full mb-6">
            <Button variant="outline" className="bg-secondary border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground w-auto h-8 text-xs font-normal">
              <Github className="mr-2 h-3.5 w-3.5" />
              Select repository
              <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
            </Button>
          </div>

          {/* Main Input Area */}
          <div className="w-full bg-secondary border border-border rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
            <Textarea 
              placeholder="Ask CodePath to build, fix bugs, explore..." 
              className="w-full min-h-[120px] bg-transparent border-none resize-none p-6 text-lg focus-visible:ring-0 placeholder:text-muted-foreground text-foreground"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge variant="secondary" className="bg-secondary hover:bg-accent text-muted-foreground border-none h-6 px-2 text-xs cursor-pointer flex items-center gap-1.5 font-normal transition-colors">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      {selectedModel.name}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover border-border text-popover-foreground w-56">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Select Model</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    {AI_MODELS.map((model) => (
                      <DropdownMenuItem 
                        key={model.id}
                        onClick={() => setSelectedModel(model)}
                        className={`text-sm cursor-pointer hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground ${selectedModel.id === model.id ? 'bg-secondary text-foreground' : ''}`}
                      >
                        {model.name}
                        {selectedModel.id === model.id && <CheckSquare className="ml-auto h-3 w-3" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button 
                size="sm" 
                className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCreate}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Thinking...' : 'Generate'}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            <Button 
              variant="outline" 
              className="bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-accent h-8 text-xs transition-colors"
              onClick={() => handleQuickAction('audit')}
            >
              <Shield className="mr-2 h-3.5 w-3.5" />
              Run security audit
            </Button>
            <Button 
              variant="outline" 
              className="bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-accent h-8 text-xs transition-colors"
              onClick={() => handleQuickAction('improve')}
            >
              <FileText className="mr-2 h-3.5 w-3.5" />
              Improve AGENTS.md
            </Button>
            <Button 
              variant="outline" 
              className="bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-accent h-8 text-xs transition-colors"
              onClick={() => handleQuickAction('todo')}
            >
              <CheckSquare className="mr-2 h-3.5 w-3.5" />
              Solve a TODO
            </Button>
          </div>

          {/* Status / Auto Mode */}
          <Card className="mt-12 w-full bg-secondary/50 border-border p-4 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/10 rounded-md">
                <Cpu className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground mb-1">Running on Auto</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Usage limits reached. This Agent is running on Auto for free.
                </p>
                <div className="flex gap-4 mt-3">
                  <button className="text-xs text-muted-foreground hover:text-foreground underline decoration-muted-foreground/50 underline-offset-2">
                    Edit limits
                  </button>
                  <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                    Continue with Auto
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="p-4 text-center text-xs text-muted-foreground">
          Press Enter to generate · Shift + Enter for new line
        </div>
      </div>
    </div>
  )
}
