import React, { useState, useContext } from 'react';
import {
  Server,
  Database,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  FileText,
  Folder,
  Cpu,
  Wifi,
  Activity,
  MoreVertical,
  ArrowLeft,
} from 'lucide-react';
import { NavigationContext } from '@/App';

interface Project {
  id: string;
  name: string;
  path: string;
  status: 'indexed' | 'indexing' | 'error';
  filesCount: number;
  lastIndexed: string;
  size: string;
}

const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'my-app',
    path: '/home/user/projects/my-app',
    status: 'indexed',
    filesCount: 234,
    lastIndexed: '2 minutes ago',
    size: '12.4 MB',
  },
  {
    id: '2',
    name: 'api-server',
    path: '/home/user/projects/api-server',
    status: 'indexing',
    filesCount: 156,
    lastIndexed: 'Indexing...',
    size: '8.2 MB',
  },
  {
    id: '3',
    name: 'legacy-project',
    path: '/home/user/projects/legacy',
    status: 'error',
    filesCount: 0,
    lastIndexed: 'Failed',
    size: 'Unknown',
  },
];

const StatusBadge: React.FC<{ status: Project['status'] }> = ({ status }) => {
  const configs = {
    indexed: { icon: CheckCircle, color: 'text-forge', bg: 'bg-forge/10', label: 'Indexed' },
    indexing: { icon: RefreshCw, color: 'text-sage', bg: 'bg-sage/10', label: 'Indexing...' },
    error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Error' },
  };
  const config = configs[status];

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg}`}>
      <config.icon className={`w-3.5 h-3.5 ${config.color} ${status === 'indexing' ? 'animate-spin' : ''}`} />
      <span className={`text-xs ${config.color}`}>{config.label}</span>
    </div>
  );
};

export const MCPPage: React.FC = () => {
  const [projects] = useState<Project[]>(sampleProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'search' | 'tools'>('projects');
  const { navigate } = useContext(NavigationContext);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalProjects: projects.length,
    indexedProjects: projects.filter((p) => p.status === 'indexed').length,
    totalFiles: projects.reduce((acc, p) => acc + p.filesCount, 0),
    serverStatus: 'online' as const,
  };

  return (
    <div className="h-full flex flex-col bg-neural-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neural-border bg-neural-panel">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('editor')}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            title="Back to Editor"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-forge/10 flex items-center justify-center">
            <Server className="w-5 h-5 text-forge" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MCP Server</h1>
            <p className="text-sm text-gray-500">Model Context Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-forge/10 border border-forge/30">
            <Wifi className="w-4 h-4 text-forge" />
            <span className="text-sm text-forge">Connected</span>
          </div>
          <button
            onClick={() => navigate('settings')}
            className="p-2 rounded-lg bg-neural-input hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-neural-border">
        <div className="p-4 rounded-xl bg-neural-panel border border-neural-border">
          <div className="flex items-center gap-2 mb-2">
            <Folder className="w-4 h-4 text-sage" />
            <span className="text-sm text-gray-500">Projects</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalProjects}
          </div>
          <div className="text-xs text-forge">{stats.indexedProjects} indexed</div>
        </div>

        <div className="p-4 rounded-xl bg-neural-panel border border-neural-border">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-forge" />
            <span className="text-sm text-gray-500">Files</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalFiles.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Across all projects</div>
        </div>

        <div className="p-4 rounded-xl bg-neural-panel border border-neural-border">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-sync" />
            <span className="text-sm text-gray-500">Context Size</span>
          </div>
          <div className="text-2xl font-bold text-white">24.8 MB</div>
          <div className="text-xs text-gray-500">Indexed data</div>
        </div>

        <div className="p-4 rounded-xl bg-neural-panel border border-neural-border">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-500">Uptime</span>
          </div>
          <div className="text-2xl font-bold text-white">99.9%</div>
          <div className="text-xs text-gray-500">Last 30 days</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-neural-border">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'projects'
              ? 'bg-forge/10 text-forge'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-forge/10 text-forge'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Semantic Search
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'tools'
              ? 'bg-forge/10 text-forge'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Custom Tools
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neural-input border border-neural-border rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-forge/50"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forge text-neural-bg text-sm font-medium hover:bg-forge/90 transition-colors">
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>

            {/* Projects List */}
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-neural-panel border border-neural-border hover:border-forge/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-neural-input flex items-center justify-center">
                      <Folder className="w-5 h-5 text-sage" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{project.name}</span>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="text-sm text-gray-500">{project.path}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-sm font-medium text-white">{project.filesCount}</div>
                      <div className="text-xs text-gray-500">files</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-white">{project.size}</div>
                      <div className="text-xs text-gray-500">size</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-white">{project.lastIndexed}</div>
                      <div className="text-xs text-gray-500">last indexed</div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-sync/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-sync" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Semantic Search</h2>
              <p className="text-gray-500">Search your codebase using natural language</p>
            </div>

            <div className="relative mb-6">
              <input
                type="text"
                placeholder="e.g., 'Find authentication logic' or 'Where do we handle errors?'"
                className="w-full px-4 py-3 bg-neural-input border border-neural-border rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-sync/50"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-sync text-white text-sm font-medium hover:bg-sync/90 transition-colors">
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {['Find API routes', 'Error handling', 'User authentication', 'Database queries'].map((suggestion) => (
                <button
                  key={suggestion}
                  className="px-3 py-1.5 rounded-full bg-neural-input text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Code Analyzer', description: 'Analyze code complexity and quality', icon: Cpu },
              { name: 'Dependency Graph', description: 'Visualize module dependencies', icon: Database },
              { name: 'Test Generator', description: 'Generate unit tests automatically', icon: FileText },
              { name: 'Doc Generator', description: 'Generate documentation from code', icon: FileText },
              { name: 'Refactor Assistant', description: 'Suggest code improvements', icon: RefreshCw },
              { name: 'Security Scanner', description: 'Find security vulnerabilities', icon: Activity },
            ].map((tool) => (
              <div
                key={tool.name}
                className="p-4 rounded-xl bg-neural-panel border border-neural-border hover:border-forge/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-forge/10 flex items-center justify-center mb-3">
                  <tool.icon className="w-5 h-5 text-forge" />
                </div>
                <h3 className="font-medium text-white mb-1">{tool.name}</h3>
                <p className="text-sm text-gray-500">{tool.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
