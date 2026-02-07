import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { prefetchRoute } from '@/hooks/usePrefetch';

// Heavy markdown renderer — only loaded when chat messages exist
const ReactMarkdown = lazy(() => import('react-markdown'));
let _remarkGfm: any[] = [];
import('remark-gfm').then(m => { _remarkGfm = [m.default] });
import { createProject, listProjects, getDefaultProjectFiles, type ProjectSummary } from '@/services/projectService';

type Category = 'all' | 'schedules' | 'websites' | 'research' | 'videos' | 'more';

const recommendations = {
  websites: [
    "Develop a premium e-commerce platform dedicated to selling custom crystal bracelets, featuring a Zen-inspired, minimalist UI/UX with a clean layout and calm colors.",
    "Help me create a personal profile page that can display a preview of my art portfolio and provide links to my social media platforms.",
    "Create a web dashboard that visualizes a 360° analysis of Tesla (TSLA) covering financial health, technical/market sentiment, and competitor comparisons.",
    "Design the official website for an AI company, incorporating Earth-themed elements with black, white, and gray colors.",
    "Create a virtual the Louvre tour where I can view major artworks, accompanied by audio explanations.",
    "Develop a casual, cartoon-style Gold Miner game from scratch featuring a swinging claw mechanic."
  ],
  schedules: [
    "At 10:00 each day, deliver a concise briefing on the most important tech and science news from the last 24 hours.",
    "Start my mornings at 9:00 by checking Gmail: compile a quick summary of all unread work emails since the previous night.",
    "Every Monday at 15:00, research and analyze the past week's trending videos on TikTok.",
    "When 14:50 rolls around on workdays, bring me fresh intel on $TSLA and $NVDA — current prices and trend signals.",
    "On the 25th of each month at 17:00, tap into my sales data on Notion and deliver a business growth analysis report."
  ],
  research: [
    "I currently have $100,000 and aim for a 10% annual return. Design a robust asset allocation strategy.",
    "Provide a comprehensive overview of the current open-source inference ecosystem and mainstream solutions.",
    "Research Temu's path of expansion in overseas markets and summarize the key factors behind its success.",
    "Write a literature review on 'Analyzing the Relationship between Construction Economics and Real Estate Economics'.",
    "I plan to develop an AI 3D modeling tool tailored for beginners. Analyze the target user personas and pain points."
  ]
};

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; title: string; category: string; date: string }>>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Load project history from Supabase
  useEffect(() => {
    const loadProjects = async () => {
      if (!user?.uid) return;
      try {
        const projectList = await listProjects(user.uid);
        setProjects(projectList);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadProjects();
  }, [user?.uid]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentRecommendations = () => {
    if (selectedCategory === 'websites') return recommendations.websites;
    if (selectedCategory === 'schedules') return recommendations.schedules;
    if (selectedCategory === 'research') return recommendations.research;
    return [];
  };

  const handleRecommendationClick = async (recommendation: string) => {
    // For website category, create project in Supabase and navigate to editor
    if (selectedCategory === 'websites') {
      if (!user?.uid) {
        // Fallback: use localStorage if not authenticated
        localStorage.setItem('websitePrompt', recommendation);
        navigate('/editor');
        return;
      }

      setIsCreatingProject(true);
      try {
        const newProject = await createProject(user.uid, {
          prompt: recommendation,
          description: recommendation,
          template: 'website',
          files: getDefaultProjectFiles(),
        });

        // Add to local project list immediately
        setProjects(prev => [{
          id: newProject.id,
          name: newProject.name,
          description: newProject.description,
          template: newProject.template,
          updated_at: newProject.updated_at,
          created_at: newProject.created_at,
        }, ...prev]);

        navigate(`/editor/${newProject.id}`);
      } catch (err) {
        console.error('Failed to create project:', err);
        // Fallback to localStorage approach
        localStorage.setItem('websitePrompt', recommendation);
        navigate('/editor');
      } finally {
        setIsCreatingProject(false);
      }
      return;
    }

    setInputValue(recommendation);
    // Auto send after clicking
    handleSendMessageWithText(recommendation);
  };

  const handleSendMessageWithText = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Check if this is a research query
    const isResearchQuery = selectedCategory === 'research' || 
      /research|find information|search for|tell me about|what is|latest news|current/.test(text.toLowerCase());

    // Add a "searching" message if it's a research query
    if (isResearchQuery) {
      const searchingMessage = {
        id: 'searching-' + Date.now().toString(),
        role: 'assistant' as const,
        content: '🔍 Searching the web for latest information...'
      };
      setMessages(prev => [...prev, searchingMessage]);
    }

    // Add to history
    const historyItem = {
      id: Date.now().toString(),
      title: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
      category: selectedCategory,
      date: new Date().toLocaleDateString()
    };
    setHistory(prev => [historyItem, ...prev]);

    try {
      const response = await fetch('http://localhost:3001/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          provider: 'mistral',
          enableResearch: isResearchQuery,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed');
      }

      const data = await response.json();
      const aiContent = data.response || 'Sorry, I couldn\'t process that request.';

      // Remove "searching" message if it exists
      if (isResearchQuery) {
        setMessages(prev => prev.filter(m => !m.id.startsWith('searching-')));
      }

      const aiMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: aiContent
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('API Error:', error);
      
      // Remove "searching" message if it exists
      if (isResearchQuery) {
        setMessages(prev => prev.filter(m => !m.id.startsWith('searching-')));
      }
      
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: 'Error: Failed to connect to AI API. Please check your network or try again later.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    // Detect if the user wants to CREATE / BUILD something → go to editor
    const isBuildPrompt = /\b(create|build|develop|design|make|code|implement|write|generate|setup|set up)\b/i.test(text) &&
      /\b(website|web app|webapp|app|application|page|landing|portfolio|dashboard|game|project|component|site|platform|tool|ui|interface)\b/i.test(text);

    if (isBuildPrompt || selectedCategory === 'websites') {
      handleBuildProject(text);
      return;
    }

    handleSendMessageWithText(text);
  };

  // Create a project from a prompt and navigate to editor
  const handleBuildProject = async (prompt: string) => {
    if (!user?.uid) {
      localStorage.setItem('websitePrompt', prompt);
      navigate('/editor');
      return;
    }

    setIsCreatingProject(true);
    setInputValue('');
    try {
      const newProject = await createProject(user.uid, {
        prompt,
        description: prompt,
        template: 'website',
        files: getDefaultProjectFiles(),
      });

      setProjects(prev => [{
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        template: newProject.template,
        updated_at: newProject.updated_at,
        created_at: newProject.created_at,
      }, ...prev]);

      navigate(`/editor/${newProject.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      // Fallback
      localStorage.setItem('websitePrompt', prompt);
      navigate('/editor');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleNewTask = () => {
    setMessages([]);
    setInputValue('');
    setSelectedCategory('all');
  };

  const hasMessages = messages.length > 0;

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  };

  return (
    <div className="min-h-screen bg-[#09090f] text-white flex page-enter">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#0c0c14] border-r border-white/[0.06] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 ${sidebarOpen ? 'w-[272px]' : 'w-0'} overflow-hidden`}>
        <div className="p-4 h-full flex flex-col w-[272px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-sm tracking-tight block">CodePath AI</span>
              <span className="text-[10px] text-white/25 font-medium tracking-wider uppercase block">Agent</span>
            </div>
          </div>

          {/* New Task Button */}
          <button 
            onClick={handleNewTask}
            className="w-full py-2.5 px-3.5 bg-gradient-to-r from-violet-600/15 to-purple-600/15 hover:from-violet-600/25 hover:to-purple-600/25 border border-violet-500/20 hover:border-violet-500/30 rounded-xl font-medium mb-4 flex items-center gap-2.5 transition-all duration-200 text-[13px] group"
          >
            <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            New Task
          </button>

          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[12px] focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.06] transition-all placeholder-white/20"
            />
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5 mb-4">
            <button 
              onClick={() => navigate('/editor')}
              className="w-full py-2 px-3 text-left text-white/50 hover:text-white/80 hover:bg-white/[0.05] rounded-lg transition-all duration-150 flex items-center gap-2.5 text-[13px]"
            >
              <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Code Editor
            </button>
            <button className="w-full py-2 px-3 text-left text-white/50 hover:text-white/80 hover:bg-white/[0.05] rounded-lg transition-all duration-150 flex items-center gap-2.5 text-[13px]">
              <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Gallery
            </button>
          </div>

          {/* Task History */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {/* Saved Projects */}
            <h3 className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.15em] mb-2 px-2">Projects</h3>
            {projects.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-white/15 text-[11px]">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-0.5 mb-4">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => navigate(`/editor/${proj.id}`)}
                    className="w-full px-2.5 py-2 text-left hover:bg-white/[0.04] rounded-md transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-violet-400/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-[12px] text-white/40 group-hover:text-white/70 truncate transition-colors">
                        {proj.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/15 mt-0.5 ml-5.5 truncate">
                      {new Date(proj.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Chat History */}
            <h3 className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.15em] mb-2 px-2">Chat History</h3>
            {history.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-white/15 text-[11px]">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {history.map((item) => (
                  <button 
                    key={item.id} 
                    className="w-full px-2.5 py-1.5 text-left text-[12px] text-white/35 hover:text-white/60 hover:bg-white/[0.04] rounded-md transition-all truncate"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-white/[0.06] pt-3 mt-3 space-y-0.5">
            <button 
              onClick={() => navigate('/profile')}
              onMouseEnter={() => prefetchRoute('/profile')}
              className="w-full py-2 px-3 text-left text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg transition-all duration-150 flex items-center gap-2.5 text-[13px]"
            >
              <svg className="w-4 h-4 text-violet-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </button>
            <button 
              onClick={() => navigate('/settings')}
              onMouseEnter={() => prefetchRoute('/settings')}
              className="w-full py-2 px-3 text-left text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg transition-all duration-150 flex items-center gap-2.5 text-[13px]"
            >
              <svg className="w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-2 px-3 text-left text-white/35 hover:text-red-400 hover:bg-red-500/[0.06] rounded-lg transition-all duration-150 flex items-center gap-2.5 text-[13px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'ml-[272px]' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="h-12 border-b border-white/[0.06] flex items-center justify-between px-4 bg-[#09090f]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-1.5 hover:bg-white/[0.05] rounded-md transition-colors"
            >
              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {hasMessages && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse"></div>
                <span className="text-[11px] text-white/25">Active session</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate('/editor')}
              className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-lg text-[11px] font-medium transition-all duration-200 shadow-lg shadow-violet-600/20"
            >
              Open Editor
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-semibold ring-2 ring-white/[0.06] ring-offset-1 ring-offset-[#09090f]">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="h-[calc(100vh-48px)] flex flex-col">
          {!hasMessages ? (
            /* Welcome Screen */
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-[720px] mx-auto px-6 py-16">
                {/* Greeting */}
                <div className="text-center mb-14">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/15 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></div>
                    <span className="text-[10px] font-semibold text-violet-300/70 tracking-widest uppercase">AI Ready</span>
                  </div>
                  <h1 className="text-[38px] md:text-[42px] font-bold tracking-tight mb-4 leading-[1.1]">
                    <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">{getGreeting()},</span>
                    <br />
                    <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">how can I help?</span>
                  </h1>
                  <p className="text-white/25 text-[13px] max-w-sm mx-auto leading-relaxed">
                    Build websites, research topics, automate schedules, and more with AI-powered assistance.
                  </p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {[
                    { id: 'websites', label: 'Websites', icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    )},
                    { id: 'schedules', label: 'Schedules', icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )},
                    { id: 'research', label: 'Research', icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    )},
                    { id: 'videos', label: 'Videos', icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                      </svg>
                    )},
                    { id: 'more', label: 'More', icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                    )}
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id as Category)}
                      className={`px-3.5 py-2 rounded-full text-[12px] font-medium transition-all duration-200 flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'bg-white text-[#09090f] shadow-lg shadow-white/10'
                          : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60 border border-white/[0.06]'
                      }`}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Recommendations */}
                {selectedCategory !== 'all' && selectedCategory !== 'videos' && selectedCategory !== 'more' && (
                  <div className="grid gap-2 mb-12">
                    {getCurrentRecommendations().map((rec, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecommendationClick(rec)}
                        className="w-full p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-violet-500/25 hover:bg-violet-500/[0.03] transition-all duration-200 text-left group"
                      >
                        <p className="text-white/40 group-hover:text-white/70 transition-colors leading-relaxed text-[13px]">
                          {rec}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Actions when 'all' */}
                {selectedCategory === 'all' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {[
                      { title: 'Build a Website', desc: 'Create with AI assistance', icon: (
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                        </svg>
                      ), cat: 'websites' as Category, color: 'from-blue-500/[0.08] to-cyan-500/[0.08] border-blue-500/15 hover:border-blue-400/30' },
                      { title: 'Research Topic', desc: 'Deep dive with web search', icon: (
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                      ), cat: 'research' as Category, color: 'from-emerald-500/[0.08] to-green-500/[0.08] border-emerald-500/15 hover:border-emerald-400/30' },
                      { title: 'Automate Tasks', desc: 'Set up smart schedules', icon: (
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                      ), cat: 'schedules' as Category, color: 'from-amber-500/[0.08] to-orange-500/[0.08] border-amber-500/15 hover:border-amber-400/30' },
                    ].map((item) => (
                      <button
                        key={item.title}
                        onClick={() => setSelectedCategory(item.cat)}
                        className={`p-5 rounded-xl bg-gradient-to-br ${item.color} border transition-all duration-200 text-left group hover:translate-y-[-1px]`}
                      >
                        <div className="mb-3">{item.icon}</div>
                        <h3 className="font-semibold text-[13px] text-white/80 mb-1">{item.title}</h3>
                        <p className="text-[11px] text-white/30">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-[720px] mx-auto space-y-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mr-3 flex-shrink-0 shadow-lg shadow-violet-500/20 mt-0.5">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-violet-500/10 border border-violet-500/15 rounded-2xl rounded-br-sm'
                          : 'bg-transparent'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="leading-relaxed text-white/85 text-[13px]">{message.content}</p>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          <Suspense fallback={<p className="text-white/40 text-[13px] animate-pulse">Rendering…</p>}>
                          <ReactMarkdown
                            remarkPlugins={_remarkGfm}
                            components={{
                              h2: ({ node, ...props }) => <h2 className="text-[16px] font-semibold mt-5 mb-2 text-white/90" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-[14px] font-semibold mt-4 mb-2 text-white/80" {...props} />,
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4 rounded-lg border border-white/[0.06]">
                                  <table className="min-w-full" {...props} />
                                </div>
                              ),
                              thead: ({ node, ...props }) => <thead className="bg-white/[0.03]" {...props} />,
                              th: ({ node, ...props }) => <th className="px-3 py-2 text-left text-[11px] font-semibold text-white/60 border-b border-white/[0.06]" {...props} />,
                              td: ({ node, ...props }) => <td className="px-3 py-2 text-[12px] text-white/50 border-b border-white/[0.04]" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2.5" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2.5" {...props} />,
                              li: ({ node, ...props }) => <li className="text-white/55 text-[13px] leading-relaxed" {...props} />,
                              p: ({ node, ...props }) => <p className="leading-[1.7] text-white/60 my-2 text-[13px]" {...props} />,
                              code: ({ node, inline, ...props }: any) => 
                                inline ? (
                                  <code className="bg-violet-500/10 px-1.5 py-0.5 rounded text-violet-300 text-[12px] font-mono" {...props} />
                                ) : (
                                  <code className="block bg-[#0a0a14] p-4 rounded-xl text-[12px] overflow-x-auto my-3 border border-white/[0.05] font-mono text-white/70" {...props} />
                                ),
                              strong: ({ node, ...props }) => <strong className="font-semibold text-white/85" {...props} />,
                              em: ({ node, ...props }) => <em className="italic text-white/50" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                          </Suspense>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mr-3 shadow-lg shadow-violet-500/20">
                      <svg className="w-3 h-3 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5 py-3">
                      <div className="w-1.5 h-1.5 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-white/[0.06] p-4 bg-[#09090f]/90 backdrop-blur-xl">
            <div className="max-w-[720px] mx-auto">
              <div className="relative group">
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      autoResizeTextarea();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Describe what you want to build..."
                    rows={1}
                    className="w-full px-4 py-3 pr-24 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white/85 text-[13px] placeholder-white/18 focus:outline-none focus:border-violet-500/30 transition-all duration-200 resize-none leading-relaxed"
                    style={{ minHeight: '48px' }}
                  />
                  <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                    <button className="p-2 text-white/15 hover:text-white/40 transition-colors rounded-lg hover:bg-white/[0.04]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                      </svg>
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl disabled:opacity-15 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-600/25 disabled:shadow-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center mt-2.5">
                <p className="text-[10px] text-white/12">
                  <kbd className="px-1 py-0.5 bg-white/[0.04] rounded text-[9px] text-white/20 font-mono">Enter</kbd> send · <kbd className="px-1 py-0.5 bg-white/[0.04] rounded text-[9px] text-white/20 font-mono">Shift+Enter</kbd> new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
