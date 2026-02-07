import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Search, 
  Settings, 
  Terminal, 
  FileText,
  Globe,
  Smartphone,
  Database,
  Gamepad2,
  Brain,
  Zap,
  Palette,
  Star,
  Menu,
  X,
  ChevronDown,
  Plus,
  Save,
  Play,
  Copy,
  Download,
  User,
  LogOut,
  HelpCircle,
  LayoutDashboard
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface Project {
  id: string
  name: string
  template: string
  description: string | null
  prompt?: string | null
  files: any[]
}

interface EnhancedIDEHeaderProps {
  project: Project
  aiPanelVisible: boolean
  previewVisible: boolean
  onToggleAI: () => void
  onTogglePreview: () => void
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'csharp', label: 'C#', icon: '🎯' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'swift', label: 'Swift', icon: '🦉' },
  { value: 'kotlin', label: 'Kotlin', icon: '🟣' },
  { value: 'dart', label: 'Dart', icon: '🎯' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'css', label: 'CSS', icon: '🎨' },
  { value: 'json', label: 'JSON', icon: '📋' },
  { value: 'markdown', label: 'Markdown', icon: '📝' },
  { value: 'sql', label: 'SQL', icon: '🗄️' },
  { value: 'yaml', label: 'YAML', icon: '📄' },
  { value: 'dockerfile', label: 'Dockerfile', icon: '🐳' }
]

const themeOptions = [
  { value: 'vs-dark', label: 'VS Code Dark', description: 'Default dark theme' },
  { value: 'custom-dark', label: 'Custom Dark+', description: 'Enhanced dark theme' },
  { value: 'hc-black', label: 'High Contrast', description: 'High contrast dark theme' },
  { value: 'vs', label: 'Light', description: 'Light theme' }
]

const templateCategories = [
  { name: 'Web Development', icon: <Globe className="w-4 h-4" />, templates: ['React', 'Vue', 'Angular', 'Next.js', 'Svelte'] },
  { name: 'Mobile Development', icon: <Smartphone className="w-4 h-4" />, templates: ['React Native', 'Flutter', 'Ionic', 'NativeScript'] },
  { name: 'Backend Development', icon: <Database className="w-4 h-4" />, templates: ['Node.js', 'Express', 'Django', 'Flask', 'Spring Boot'] },
  { name: 'Game Development', icon: <Gamepad2 className="w-4 h-4" />, templates: ['Unity', 'Unreal Engine', 'Godot', 'Phaser'] },
  { name: 'Data Science', icon: <Brain className="w-4 h-4" />, templates: ['Jupyter', 'Pandas', 'NumPy', 'Scikit-learn'] },
  { name: 'AI/ML', icon: <Zap className="w-4 h-4" />, templates: ['TensorFlow', 'PyTorch', 'Keras', 'OpenAI'] }
]

export default function EnhancedIDEHeader({ project, aiPanelVisible, previewVisible, onToggleAI, onTogglePreview }: EnhancedIDEHeaderProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [selectedTheme, setSelectedTheme] = useState('custom-dark')
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSaveProject = () => {
    toast.success('Project saved successfully')
  }

  const handleExportProject = () => {
    toast.success('Project exported successfully')
  }

  const handleShareProject = () => {
    toast.success('Share link copied to clipboard')
  }

  const handleNewFile = () => {
    toast.info('New file functionality would be implemented here')
  }

  const handleNewFolder = () => {
    toast.info('New folder functionality would be implemented here')
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery}`)
      setShowSearch(false)
    }
  }

  const handleRunCode = () => {
    toast.info('Code execution functionality would be implemented here')
  }

  const handleFormatCode = () => {
    toast.info('Code formatting functionality would be implemented here')
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
    toast.success('Logged out successfully')
  }

  return (
    <div className="bg-[#0a0a12] border-b border-white/[0.06] px-3 py-1.5">
      <div className="flex items-center justify-between">
        {/* Left Section - Logo and Project Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-[13px] font-semibold text-white/90 leading-none">CodePath AI</h1>
              <p className="text-[9px] text-white/25 mt-0.5 tracking-wider uppercase">IDE</p>
            </div>
          </div>

          {/* Project Info */}
          <div className="hidden lg:flex items-center space-x-2.5">
            <div className="h-5 w-px bg-white/[0.06]"></div>
            <div className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-white/25" />
              <div>
                <p className="text-[12px] font-medium text-white/70 leading-none truncate max-w-[200px]" title={project.name}>
                  {project.name}
                </p>
                {project.id !== 'local' && (
                  <p className="text-[9px] text-white/20 mt-0.5 font-mono">{project.id.slice(0, 8)}</p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] text-white/30 border-white/[0.08] py-0 h-5">
              {project.template}
            </Badge>
            {project.id === 'local' && (
              <Badge variant="outline" className="text-[10px] text-yellow-400/50 border-yellow-400/20 py-0 h-5">
                local
              </Badge>
            )}
          </div>
        </div>

        {/* Center Section - Menu Items */}
        <div className="hidden lg:flex items-center space-x-0.5">
          {/* File Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/70 hover:bg-white/[0.05] h-7 px-2.5 text-[12px]">
                File
                <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#12121e] border-white/[0.08] text-white/80 shadow-2xl shadow-black/50">
              <DropdownMenuLabel className="text-[10px] text-white/25 uppercase tracking-wider">File Operations</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem onClick={handleNewFile} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                <Plus className="w-3.5 h-3.5 mr-2 text-white/30" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNewFolder} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                <FileText className="w-3.5 h-3.5 mr-2 text-white/30" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem onClick={handleSaveProject} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                <Save className="w-3.5 h-3.5 mr-2 text-white/30" />
                Save Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportProject} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                <Download className="w-3.5 h-3.5 mr-2 text-white/30" />
                Export Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/70 hover:bg-white/[0.05] h-7 px-2.5 text-[12px]">
                Edit
                <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#12121e] border-white/[0.08] text-white/80 shadow-2xl shadow-black/50">
              <DropdownMenuLabel className="text-[10px] text-white/25 uppercase tracking-wider">Edit Operations</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem onClick={() => setShowSearch(true)} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                <Search className="w-3.5 h-3.5 mr-2 text-white/30" />
                Find
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFormatCode} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                <Palette className="w-3.5 h-3.5 mr-2 text-white/30" />
                Format Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/70 hover:bg-white/[0.05] h-7 px-2.5 text-[12px]">
                View
                <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#12121e] border-white/[0.08] text-white/80 shadow-2xl shadow-black/50">
              <DropdownMenuLabel className="text-[10px] text-white/25 uppercase tracking-wider">View Options</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem onClick={onToggleAI} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                <Brain className="w-3.5 h-3.5 mr-2 text-white/30" />
                {aiPanelVisible ? 'Hide AI Panel' : 'Show AI Panel'}
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                <Terminal className="w-3.5 h-3.5 mr-2 text-white/30" />
                Toggle Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Run Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/70 hover:bg-white/[0.05] h-7 px-2.5 text-[12px]">
                Run
                <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#12121e] border-white/[0.08] text-white/80 shadow-2xl shadow-black/50">
              <DropdownMenuLabel className="text-[10px] text-white/25 uppercase tracking-wider">Run Options</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem onClick={handleRunCode} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                <Play className="w-3.5 h-3.5 mr-2 text-white/30" />
                Run Code
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                <Terminal className="w-3.5 h-3.5 mr-2 text-white/30" />
                Run in Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Templates Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/70 hover:bg-white/[0.05] h-7 px-2.5 text-[12px]">
                Templates
                <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#12121e] border-white/[0.08] text-white/80 shadow-2xl shadow-black/50 w-64">
              <DropdownMenuLabel className="text-[10px] text-white/25 uppercase tracking-wider">Project Templates</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              {templateCategories.map((category, index) => (
                <div key={index}>
                  <DropdownMenuLabel className="text-[10px] text-white/30 flex items-center">
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                  </DropdownMenuLabel>
                  {category.templates.map((template, templateIndex) => (
                    <DropdownMenuItem key={templateIndex} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px] pl-8">
                      {template}
                    </DropdownMenuItem>
                  ))}
                  {index < templateCategories.length - 1 && <DropdownMenuSeparator className="bg-white/[0.06]" />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-1">
          {/* Search */}
          <Popover open={showSearch} onOpenChange={setShowSearch}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/25 hover:text-white/60 hover:bg-white/[0.05] h-7 w-7 p-0">
                <Search className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-[#12121e] border-white/[0.08] p-2.5 shadow-2xl shadow-black/50" side="bottom" align="end">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search in project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white/80 placeholder-white/20 h-7 text-[12px]"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="sm" onClick={handleSearch} className="bg-violet-600 hover:bg-violet-700 h-7 px-3 text-[12px]">
                  Search
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/60 hover:bg-white/[0.05] h-7 px-2 text-[11px]">
                <span className="mr-1.5">{languageOptions.find(lang => lang.value === selectedLanguage)?.icon}</span>
                <span className="hidden md:inline">{languageOptions.find(lang => lang.value === selectedLanguage)?.label}</span>
                <ChevronDown className="w-2.5 h-2.5 ml-1 opacity-40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#12121e] border-white/[0.08] text-white/80 max-h-64 overflow-y-auto shadow-2xl shadow-black/50">
              <DropdownMenuRadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage}>
                {languageOptions.map((lang) => (
                  <DropdownMenuRadioItem key={lang.value} value={lang.value} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                    <span className="mr-2">{lang.icon}</span>
                    {lang.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/25 hover:text-white/60 hover:bg-white/[0.05] h-7 w-7 p-0">
                <Palette className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#12121e] border-white/[0.08] text-white/80 shadow-2xl shadow-black/50">
              <DropdownMenuRadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
                {themeOptions.map((theme) => (
                  <DropdownMenuRadioItem key={theme.value} value={theme.value} className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]">
                    <div>
                      <div className="font-medium text-white/70">{theme.name}</div>
                      <div className="text-[10px] text-white/25">{theme.description}</div>
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Preview Toggle */}
          <Button
            variant={previewVisible ? "default" : "outline"}
            size="sm"
            onClick={onTogglePreview}
            className={cn(
              "flex items-center space-x-1.5 h-7 px-2.5 text-[11px]",
              previewVisible ? "bg-emerald-600/80 hover:bg-emerald-600 text-white border-0" : "border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.05]"
            )}
          >
            <Play className="w-3 h-3" />
            <span className="hidden md:inline">Preview</span>
          </Button>

          {/* AI Toggle */}
          <Button
            variant={aiPanelVisible ? "default" : "outline"}
            size="sm"
            onClick={onToggleAI}
            className={cn(
              "flex items-center space-x-1.5 h-7 px-2.5 text-[11px]",
              aiPanelVisible ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0" : "border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.05]"
            )}
          >
            <Brain className="w-3 h-3" />
            <span className="hidden md:inline">AI</span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="text-white/25 hover:text-white/60 hover:bg-white/[0.05] h-7 w-7 p-0">
            <Settings className="w-3.5 h-3.5" />
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-1 h-7 w-7 rounded-full p-0">
                <Avatar className="h-6 w-6 border border-white/[0.08]">
                  <AvatarImage src={profile?.avatar_url || user?.photoURL || undefined} alt={profile?.full_name || user?.displayName || "User"} />
                  <AvatarFallback className="bg-violet-600/80 text-white text-[10px]">
                    {(profile?.full_name || user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#12121e] border-white/[0.08] text-white/80 p-0 shadow-2xl shadow-black/50" align="end">
              <div className="p-3 border-b border-white/[0.06]">
                <div className="flex items-center space-x-2.5">
                  <Avatar className="h-8 w-8 border border-white/[0.08]">
                    <AvatarImage src={profile?.avatar_url || user?.photoURL || undefined} alt={profile?.full_name || user?.displayName || "User"} />
                    <AvatarFallback className="bg-violet-600/80 text-white text-[11px]">
                      {(profile?.full_name || user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-[12px] font-medium leading-none truncate text-white/80">{profile?.full_name || user?.displayName || "User"}</p>
                    <p className="text-[10px] leading-none text-white/25 truncate mt-1">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-1">
                <DropdownMenuItem className="hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer py-2 text-[12px]">
                  <Palette className="mr-2.5 h-3.5 w-3.5 text-white/25" />
                  <span>Theme</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer py-2 text-[12px]">
                  <Settings className="mr-2.5 h-3.5 w-3.5 text-white/25" />
                  <span>Cloud Agent Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer py-2 text-[12px]">
                  <HelpCircle className="mr-2.5 h-3.5 w-3.5 text-white/25" />
                  <span>Documentation</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-white/[0.06] my-0" />
              
              <div className="p-1">
                <DropdownMenuItem className="hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer py-2 text-[12px]">
                  <Download className="mr-2.5 h-3.5 w-3.5 text-white/25" />
                  <span>Download Desktop App</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-white/[0.06] my-0" />

              <div className="p-1">
                <DropdownMenuItem onClick={handleSignOut} className="hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer py-2 text-red-400/70 hover:text-red-400 focus:text-red-400 text-[12px]">
                  <LogOut className="mr-2.5 h-3.5 w-3.5" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white/25 hover:text-white/60 hover:bg-white/[0.05] h-7 w-7 p-0"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden mt-1.5 pt-1.5 border-t border-white/[0.06]">
          <div className="grid grid-cols-2 gap-1.5">
            <Button variant="outline" size="sm" className="text-white/40 border-white/[0.08] hover:text-white/70 hover:bg-white/[0.05] h-7 text-[11px]">
              <FileText className="w-3 h-3 mr-1.5" />
              New File
            </Button>
            <Button variant="outline" size="sm" className="text-white/40 border-white/[0.08] hover:text-white/70 hover:bg-white/[0.05] h-7 text-[11px]">
              <Save className="w-3 h-3 mr-1.5" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="text-white/40 border-white/[0.08] hover:text-white/70 hover:bg-white/[0.05] h-7 text-[11px]">
              <Play className="w-3 h-3 mr-1.5" />
              Run
            </Button>
            <Button variant="outline" size="sm" className="text-white/40 border-white/[0.08] hover:text-white/70 hover:bg-white/[0.05] h-7 text-[11px]">
              <Brain className="w-3 h-3 mr-1.5" />
              AI
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
