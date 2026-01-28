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
  description: string
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
    <div className="bg-[#09090b] border-b border-white/10 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left Section - Logo and Project Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-white">Trae AI</h1>
              <p className="text-xs text-slate-400">Enhanced IDE</p>
            </div>
          </div>

          {/* Project Info */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="h-6 w-px bg-slate-600"></div>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-white">{project.name}</p>
                <p className="text-xs text-slate-400">{project.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-slate-300 border-slate-600">
              {project.template}
            </Badge>
          </div>
        </div>

        {/* Center Section - Menu Items */}
        <div className="hidden lg:flex items-center space-x-2">
          {/* File Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                File
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuLabel>File Operations</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={handleNewFile} className="hover:bg-slate-700 focus:bg-slate-700">
                <Plus className="w-4 h-4 mr-2" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNewFolder} className="hover:bg-slate-700 focus:bg-slate-700">
                <FileText className="w-4 h-4 mr-2" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={handleSaveProject} className="hover:bg-slate-700 focus:bg-slate-700">
                <Save className="w-4 h-4 mr-2" />
                Save Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportProject} className="hover:bg-slate-700 focus:bg-slate-700">
                <Download className="w-4 h-4 mr-2" />
                Export Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                Edit
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuLabel>Edit Operations</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={() => setShowSearch(true)} className="hover:bg-slate-700 focus:bg-slate-700">
                <Search className="w-4 h-4 mr-2" />
                Find
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFormatCode} className="hover:bg-slate-700 focus:bg-slate-700">
                <Palette className="w-4 h-4 mr-2" />
                Format Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                View
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={onToggleAI} className="hover:bg-slate-700 focus:bg-slate-700">
                <Brain className="w-4 h-4 mr-2" />
                {aiPanelVisible ? 'Hide AI Panel' : 'Show AI Panel'}
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700">
                <Terminal className="w-4 h-4 mr-2" />
                Toggle Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Run Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                Run
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuLabel>Run Options</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={handleRunCode} className="hover:bg-slate-700 focus:bg-slate-700">
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700">
                <Terminal className="w-4 h-4 mr-2" />
                Run in Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Templates Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                Templates
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white w-64">
              <DropdownMenuLabel>Project Templates</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              {templateCategories.map((category, index) => (
                <div key={index}>
                  <DropdownMenuLabel className="text-xs text-slate-400 flex items-center">
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                  </DropdownMenuLabel>
                  {category.templates.map((template, templateIndex) => (
                    <DropdownMenuItem key={templateIndex} className="hover:bg-slate-700 focus:bg-slate-700 text-sm pl-8">
                      {template}
                    </DropdownMenuItem>
                  ))}
                  {index < templateCategories.length - 1 && <DropdownMenuSeparator className="bg-slate-700" />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <Popover open={showSearch} onOpenChange={setShowSearch}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700">
                <Search className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-slate-800 border-slate-700 p-3" side="bottom" align="end">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search in project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-8 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="sm" onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                  Search
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                <span className="mr-2">{languageOptions.find(lang => lang.value === selectedLanguage)?.icon}</span>
                <span className="hidden md:inline">{languageOptions.find(lang => lang.value === selectedLanguage)?.label}</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white max-h-64 overflow-y-auto">
              <DropdownMenuRadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage}>
                {languageOptions.map((lang) => (
                  <DropdownMenuRadioItem key={lang.value} value={lang.value} className="hover:bg-slate-700 focus:bg-slate-700">
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
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700">
                <Palette className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuRadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
                {themeOptions.map((theme) => (
                  <DropdownMenuRadioItem key={theme.value} value={theme.value} className="hover:bg-slate-700 focus:bg-slate-700">
                    <div>
                      <div className="font-medium">{theme.name}</div>
                      <div className="text-xs text-slate-400">{theme.description}</div>
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
              "flex items-center space-x-2",
              previewVisible ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" : "border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
            )}
          >
            <Play className="w-4 h-4" />
            <span className="hidden md:inline">Preview</span>
          </Button>

          {/* AI Toggle */}
          <Button
            variant={aiPanelVisible ? "default" : "outline"}
            size="sm"
            onClick={onToggleAI}
            className={cn(
              "flex items-center space-x-2",
              aiPanelVisible ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : "border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
            )}
          >
            <Brain className="w-4 h-4" />
            <span className="hidden md:inline">AI</span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700">
            <Settings className="w-4 h-4" />
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarImage src={profile?.avatar_url || user?.photoURL || undefined} alt={profile?.full_name || user?.displayName || "User"} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {(profile?.full_name || user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-slate-800 border-slate-700 text-white p-0" align="end">
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src={profile?.avatar_url || user?.photoURL || undefined} alt={profile?.full_name || user?.displayName || "User"} />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {(profile?.full_name || user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-medium leading-none truncate">{profile?.full_name || user?.displayName || "User"}</p>
                    <p className="text-xs leading-none text-slate-400 truncate mt-1">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-1">
                <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer py-2.5">
                  <Palette className="mr-3 h-4 w-4 text-slate-400" />
                  <span>Theme</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer py-2.5">
                  <Settings className="mr-3 h-4 w-4 text-slate-400" />
                  <span>Cloud Agent Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer py-2.5">
                  <HelpCircle className="mr-3 h-4 w-4 text-slate-400" />
                  <span>Documentation</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-slate-700 my-0" />
              
              <div className="p-1">
                <DropdownMenuItem className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer py-2.5">
                  <Download className="mr-3 h-4 w-4 text-slate-400" />
                  <span>Download Trae Windows</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-slate-700 my-0" />

              <div className="p-1">
                <DropdownMenuItem onClick={handleSignOut} className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer py-2.5 text-red-400 hover:text-red-300 focus:text-red-300">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden mt-2 pt-2 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 hover:text-white hover:bg-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              New File
            </Button>
            <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 hover:text-white hover:bg-slate-700">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 hover:text-white hover:bg-slate-700">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
            <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 hover:text-white hover:bg-slate-700">
              <Brain className="w-4 h-4 mr-2" />
              AI
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
