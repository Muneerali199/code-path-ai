import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const [history, setHistory] = useState<Array<{ id: string; title: string; category: string; date: string }>>([]);
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleRecommendationClick = (recommendation: string) => {
    // For website category, navigate to editor to create website
    if (selectedCategory === 'websites') {
      localStorage.setItem('websitePrompt', recommendation);
      navigate('/editor');
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
    handleSendMessageWithText(inputValue);
  };

  const handleNewTask = () => {
    setMessages([]);
    setInputValue('');
    setSelectedCategory('all');
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#111111] border-r border-gray-800/50 transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="p-4 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-sm font-bold">C</span>
            </div>
            <span className="font-semibold text-lg">CodePath AI</span>
          </div>

          {/* New Task Button */}
          <button 
            onClick={handleNewTask}
            className="w-full py-3 px-4 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl font-medium mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>

          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-gray-700"
            />
          </div>

          {/* Gallery Link */}
          <button className="w-full py-2.5 px-4 text-left text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-xl transition-colors flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Gallery
          </button>

          {/* Task History */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Task History</h3>
            {history.length === 0 ? (
              <p className="text-gray-600 text-sm px-2">No Task History</p>
            ) : (
              <div className="space-y-1">
                {history.map((item) => (
                  <button 
                    key={item.id} 
                    className="w-full p-2 text-left text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors truncate"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-gray-800 pt-4 mt-4 space-y-1">
            <button className="w-full py-2.5 px-4 text-left text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-xl transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-2.5 px-4 text-left text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="h-14 border-b border-gray-800/50 flex items-center justify-between px-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <button className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Download
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-medium">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="h-[calc(100vh-56px)] flex flex-col">
          {!hasMessages ? (
            /* Welcome Screen */
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Greeting */}
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
                  {getGreeting()}, how can I help you today?
                </h1>

                {/* Category Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {[
                    { id: 'schedules', label: 'Schedules', icon: '📅' },
                    { id: 'websites', label: 'Websites', icon: '🌐' },
                    { id: 'research', label: 'Research', icon: '🔍' },
                    { id: 'videos', label: 'Videos', icon: '🎥' },
                    { id: 'more', label: 'More', icon: '' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id as Category)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === cat.id
                          ? 'bg-white text-black'
                          : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222] border border-gray-800'
                      }`}
                    >
                      {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Recommendations */}
                {selectedCategory !== 'all' && selectedCategory !== 'videos' && selectedCategory !== 'more' && (
                  <div className="grid gap-3 mb-12">
                    {getCurrentRecommendations().map((rec, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecommendationClick(rec)}
                        className="w-full p-4 bg-[#111] border border-gray-800/50 rounded-xl hover:border-gray-700 hover:bg-[#151515] transition-all text-left group"
                      >
                        <p className="text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                          {rec}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-xs font-bold">AI</span>
                      </div>
                    )}
                    <div
                      className={`max-w-2xl px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-[#1a1a1a] border border-gray-800'
                          : 'bg-transparent'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="leading-relaxed text-gray-100">{message.content}</p>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-4 mb-2 text-white" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-3 mb-2 text-gray-200" {...props} />,
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4">
                                  <table className="min-w-full border border-gray-700 rounded-lg" {...props} />
                                </div>
                              ),
                              thead: ({ node, ...props }) => <thead className="bg-[#1a1a1a]" {...props} />,
                              th: ({ node, ...props }) => <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200 border-b border-gray-700" {...props} />,
                              td: ({ node, ...props }) => <td className="px-4 py-2 text-sm text-gray-300 border-b border-gray-800" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
                              li: ({ node, ...props }) => <li className="text-gray-300" {...props} />,
                              p: ({ node, ...props }) => <p className="leading-relaxed text-gray-100 my-2" {...props} />,
                              code: ({ node, inline, ...props }: any) => 
                                inline ? (
                                  <code className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-purple-400 text-sm" {...props} />
                                ) : (
                                  <code className="block bg-[#0d0d0d] p-4 rounded-lg text-sm overflow-x-auto my-2" {...props} />
                                ),
                              strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                              em: ({ node, ...props }) => <em className="italic text-gray-300" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                      <span className="text-xs font-bold">AI</span>
                    </div>
                    <div className="flex items-center gap-1 py-3">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-800/50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Enter your task and submit it to CodePath Agent."
                  className="w-full px-5 py-4 pr-24 bg-[#111] border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 transition-colors"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2 bg-white text-black rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-center text-xs text-gray-600 mt-3">
                Auto • Powered by CodePath AI
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
