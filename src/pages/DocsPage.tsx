import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Zap, 
  Book, 
  Rocket, 
  Terminal, 
  Brain, 
  Package, 
  Settings, 
  Users, 
  FileCode, 
  GitBranch, 
  Server, 
  Cloud, 
  Database,
  Search,
  ChevronRight,
  Home,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export default function DocsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Rocket,
      items: [
        { id: 'introduction', title: 'Introduction' },
        { id: 'installation', title: 'Installation' },
        { id: 'quick-start', title: 'Quick Start' },
      ]
    },
    {
      id: 'core-concepts',
      title: 'Core Concepts',
      icon: Brain,
      items: [
        { id: 'dual-ai', title: 'Dual AI System' },
        { id: 'workspace', title: 'Workspace' },
        { id: 'project-structure', title: 'Project Structure' },
      ]
    },
    {
      id: 'features',
      title: 'Features',
      icon: Zap,
      items: [
        { id: 'code-generation', title: 'Code Generation' },
        { id: 'real-time-collab', title: 'Real-time Collaboration' },
        { id: 'version-control', title: 'Version Control' },
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: Package,
      items: [
        { id: 'mcp-servers', title: 'MCP Servers' },
        { id: 'github', title: 'GitHub Integration' },
        { id: 'vscode', title: 'VS Code Extension' },
      ]
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: Terminal,
      items: [
        { id: 'rest-api', title: 'REST API' },
        { id: 'websockets', title: 'WebSockets' },
        { id: 'authentication', title: 'Authentication' },
      ]
    },
    {
      id: 'deployment',
      title: 'Deployment',
      icon: Cloud,
      items: [
        { id: 'self-hosting', title: 'Self-hosting' },
        { id: 'cloud-deployment', title: 'Cloud Deployment' },
        { id: 'environment', title: 'Environment Variables' },
      ]
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    document.querySelectorAll('[data-section]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => copyToClipboard(code, id)}
          className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-colors"
        >
          {copiedCode === id ? (
            <Check className="w-4 h-4 text-neon-green" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      <pre className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 overflow-x-auto">
        <code className={`language-${language} text-sm text-gray-300`}>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm">Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-800" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-dark flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-black" />
                </div>
                <span className="font-display font-bold text-lg">CodePath Docs</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-neon-green/50 transition-colors"
                />
              </div>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 rounded-lg bg-neon-green text-black font-semibold text-sm hover:bg-neon-green/90 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 flex">
        {/* Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-20 bottom-0 w-64 border-r border-gray-800 overflow-y-auto">
          <nav className="p-6 space-y-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-neon-green" />
                    <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                  </div>
                  <ul className="space-y-1 ml-6">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={`block py-1.5 text-sm transition-colors ${
                            activeSection === item.id
                              ? 'text-neon-green font-medium'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 px-4 sm:px-6 lg:px-12 py-12 max-w-4xl">
          {/* Introduction */}
          <section id="introduction" data-section="introduction" className="mb-16">
            <h1 className="text-4xl sm:text-5xl font-black mb-6 gradient-text">
              Welcome to CodePath
            </h1>
            <p className="text-lg text-gray-400 mb-6 leading-relaxed">
              CodePath is an AI-powered development platform that combines the intelligence of dual AI agents 
              with seamless integrations to accelerate your development workflow. Build, collaborate, and deploy 
              faster than ever before.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: Brain, label: 'Dual AI System', desc: 'Forge + Sage' },
                { icon: Zap, label: 'Real-time', desc: 'Live collaboration' },
                { icon: Package, label: '50+ MCP Servers', desc: 'One-click integrations' },
              ].map((feature) => (
                <div key={feature.label} className="p-4 rounded-xl glass-dark border border-gray-800">
                  <feature.icon className="w-8 h-8 text-neon-green mb-2" />
                  <h3 className="font-semibold text-white mb-1">{feature.label}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Installation */}
          <section id="installation" data-section="installation" className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-neon-green" />
              Installation
            </h2>
            <p className="text-gray-400 mb-6">
              Get started with CodePath in minutes. Choose your preferred installation method:
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">NPM Installation</h3>
                <CodeBlock
                  id="npm-install"
                  language="bash"
                  code={`npm install -g @codepath/cli\ncodepath init my-project\ncd my-project\ncodepath dev`}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">Docker Installation</h3>
                <CodeBlock
                  id="docker-install"
                  language="bash"
                  code={`docker pull codepath/platform:latest\ndocker run -p 3000:3000 -p 3001:3001 codepath/platform`}
                />
              </div>

              <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/30">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-neon-green mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Quick Tip</h4>
                    <p className="text-sm text-gray-300">
                      Use our cloud platform at{' '}
                      <a href="https://app.codepath.dev" className="text-neon-green hover:underline">
                        app.codepath.dev
                      </a>{' '}
                      for instant access without installation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Start */}
          <section id="quick-start" data-section="quick-start" className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8 text-neon-green" />
              Quick Start
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon-green text-black text-sm font-bold">1</span>
                  Create Your First Project
                </h3>
                <p className="text-gray-400 mb-4">
                  Initialize a new project with your preferred framework:
                </p>
                <CodeBlock
                  id="create-project"
                  language="bash"
                  code={`codepath create my-app --template react-ts\ncd my-app`}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon-green text-black text-sm font-bold">2</span>
                  Configure AI Agents
                </h3>
                <p className="text-gray-400 mb-4">
                  Set up your API keys in <code className="px-2 py-1 bg-gray-900 rounded text-neon-green">.env</code>:
                </p>
                <CodeBlock
                  id="configure-env"
                  language="bash"
                  code={`OPENAI_API_KEY=your_openai_key\nANTHROPIC_API_KEY=your_anthropic_key\nMISTRAL_API_KEY=your_mistral_key`}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon-green text-black text-sm font-bold">3</span>
                  Start Development
                </h3>
                <p className="text-gray-400 mb-4">
                  Launch the development server and start building:
                </p>
                <CodeBlock
                  id="start-dev"
                  language="bash"
                  code={`codepath dev`}
                />
                <p className="text-sm text-gray-500 mt-3">
                  Visit <code className="text-neon-green">http://localhost:3000</code> to access your workspace.
                </p>
              </div>
            </div>
          </section>

          {/* Dual AI System */}
          <section id="dual-ai" data-section="dual-ai" className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Brain className="w-8 h-8 text-neon-green" />
              Dual AI System
            </h2>
            <p className="text-gray-400 mb-6">
              CodePath's unique dual AI architecture combines two specialized agents working in harmony:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-6 rounded-xl glass-dark border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Forge AI</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  The builder. Forge AI generates complete, production-ready code based on your requirements.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5" />
                    Full-stack code generation
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5" />
                    Component scaffolding
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5" />
                    API endpoint creation
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl glass-dark border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Sage AI</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  The reviewer. Sage AI analyzes, optimizes, and ensures code quality and best practices.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5" />
                    Code review & optimization
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5" />
                    Bug detection
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5" />
                    Performance improvements
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-gray-800">
              <h4 className="font-semibold text-white mb-3">How They Work Together</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                When you request a feature, Forge AI generates the initial implementation. Sage AI then reviews 
                the code, suggests improvements, and ensures it follows best practices. This continuous feedback 
                loop results in higher quality code with fewer bugs and better performance.
              </p>
            </div>
          </section>

          {/* MCP Servers */}
          <section id="mcp-servers" data-section="mcp-servers" className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Server className="w-8 h-8 text-neon-green" />
              MCP Servers
            </h2>
            <p className="text-gray-400 mb-6">
              Model Context Protocol servers enable seamless integrations with your favorite development tools:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { name: 'GitHub', desc: 'Repository management', icon: GitBranch },
                { name: 'AWS', desc: 'Cloud infrastructure', icon: Cloud },
                { name: 'MongoDB', desc: 'Database operations', icon: Database },
                { name: 'Stripe', desc: 'Payment processing', icon: Server },
                { name: 'Vercel', desc: 'Instant deployment', icon: Rocket },
                { name: 'Figma', desc: 'Design integration', icon: FileCode },
              ].map((server) => (
                <div key={server.name} className="p-4 rounded-xl glass-dark border border-gray-800 hover:border-neon-green/30 transition-colors group">
                  <server.icon className="w-6 h-6 text-neon-green mb-2" />
                  <h3 className="font-semibold text-white mb-1">{server.name}</h3>
                  <p className="text-sm text-gray-500">{server.desc}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-white">Configure MCP Servers</h3>
              <CodeBlock
                id="mcp-config"
                language="json"
                code={`{
  "mcpServers": {
    "github": {
      "enabled": true,
      "token": "your_github_token"
    },
    "aws": {
      "enabled": true,
      "region": "us-east-1",
      "credentials": "~/.aws/credentials"
    }
  }
}`}
              />
            </div>
          </section>

          {/* API Reference */}
          <section id="rest-api" data-section="rest-api" className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Terminal className="w-8 h-8 text-neon-green" />
              REST API
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">Chat Endpoint</h3>
                <p className="text-gray-400 mb-4">Send messages to AI agents for code generation and assistance.</p>
                <CodeBlock
                  id="chat-endpoint"
                  language="javascript"
                  code={`POST /api/ai/chat

// Request
{
  "message": "Create a React login component",
  "provider": "mistral",
  "mode": "create",
  "enableResearch": false
}

// Response
{
  "response": "// Generated code...",
  "provider": "mistral",
  "mode": "create"
}`}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">File Management</h3>
                <p className="text-gray-400 mb-4">Manage project files and directories.</p>
                <CodeBlock
                  id="file-endpoint"
                  language="javascript"
                  code={`POST /api/file-manager/create

{
  "path": "/src/components/Button.tsx",
  "content": "export const Button = () => { ... }"
}

GET /api/file-manager/read?path=/src/App.tsx

PUT /api/file-manager/update
{
  "path": "/src/App.tsx",
  "content": "updated content"
}`}
                />
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" data-section="authentication" className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-neon-green" />
              Authentication
            </h2>
            <p className="text-gray-400 mb-6">
              CodePath uses Firebase Authentication for secure user management:
            </p>

            <CodeBlock
              id="auth-example"
              language="typescript"
              code={`import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Sign in
const { user } = await signInWithEmailAndPassword(
  auth,
  email,
  password
);

// Get ID token for API requests
const token = await user.getIdToken();

// Use token in API requests
fetch('/api/endpoint', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});`}
            />
          </section>

          {/* Deployment */}
          <section id="cloud-deployment" data-section="cloud-deployment" className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Cloud className="w-8 h-8 text-neon-green" />
              Cloud Deployment
            </h2>
            <p className="text-gray-400 mb-6">
              Deploy your CodePath projects to popular cloud platforms:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">Vercel</h3>
                <CodeBlock
                  id="vercel-deploy"
                  language="bash"
                  code={`npm install -g vercel\nvercel login\nvercel --prod`}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-white">Docker</h3>
                <CodeBlock
                  id="docker-deploy"
                  language="bash"
                  code={`docker build -t my-codepath-app .\ndocker run -p 3000:3000 my-codepath-app`}
                />
              </div>

              <div className="p-6 rounded-xl glass-dark border border-gray-800">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-neon-green" />
                  Deployment Checklist
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-neon-green mt-0.5" />
                    Configure environment variables
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-neon-green mt-0.5" />
                    Set up database connections
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-neon-green mt-0.5" />
                    Enable HTTPS/SSL certificates
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-neon-green mt-0.5" />
                    Configure CORS for API
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-neon-green mt-0.5" />
                    Set up monitoring and logging
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Environment Variables */}
          <section id="environment" data-section="environment" className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Settings className="w-8 h-8 text-neon-green" />
              Environment Variables
            </h2>
            <p className="text-gray-400 mb-6">
              Complete reference for all environment variables:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-white font-semibold">Variable</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Description</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Required</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {[
                    { name: 'OPENAI_API_KEY', desc: 'OpenAI API key for GPT models', required: 'Optional' },
                    { name: 'ANTHROPIC_API_KEY', desc: 'Anthropic API key for Claude', required: 'Optional' },
                    { name: 'MISTRAL_API_KEY', desc: 'Mistral AI API key', required: 'Optional' },
                    { name: 'DEEPSEEK_API_KEY', desc: 'DeepSeek API key', required: 'Optional' },
                    { name: 'RESEARCH_API_KEY', desc: 'Research API key (You.com)', required: 'Optional' },
                    { name: 'VITE_FIREBASE_API_KEY', desc: 'Firebase API key', required: 'Yes' },
                    { name: 'VITE_FIREBASE_PROJECT_ID', desc: 'Firebase project ID', required: 'Yes' },
                  ].map((env) => (
                    <tr key={env.name} className="border-b border-gray-800/50">
                      <td className="py-3 px-4">
                        <code className="text-neon-green">{env.name}</code>
                      </td>
                      <td className="py-3 px-4">{env.desc}</td>
                      <td className="py-3 px-4">
                        <span className={env.required === 'Yes' ? 'text-red-400' : 'text-gray-500'}>
                          {env.required}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-neon-green/10 to-blue-500/10 border border-gray-800 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Ready to Start Building?</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Join thousands of developers using CodePath to build better software faster.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3 rounded-xl bg-neon-green text-black font-bold hover:bg-neon-green/90 transition-colors"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl border border-gray-700 text-white hover:border-gray-600 transition-colors"
              >
                View Demo
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
