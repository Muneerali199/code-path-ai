import React, { useState, useContext } from 'react';
import {
  Brain,
  Cpu,
  Zap,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  Settings,
  Plus,
  Star,
  Activity,
  MoreVertical,
  Search,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { NavigationContext } from '@/App';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  status: 'installed' | 'available' | 'downloading' | 'error';
  capabilities: string[];
  performance: {
    speed: number;
    quality: number;
    cost: number;
  };
  usage: {
    requests: number;
    tokens: number;
    cost: number;
  };
  size: string;
  version: string;
}

const sampleModels: AIModel[] = [
  {
    id: '1',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Most capable model for complex tasks',
    status: 'installed',
    capabilities: ['Code generation', 'Explanation', 'Debugging', 'Refactoring'],
    performance: { speed: 85, quality: 98, cost: 70 },
    usage: { requests: 1250, tokens: 450000, cost: 12.5 },
    size: 'Cloud',
    version: 'gpt-4-1106',
  },
  {
    id: '2',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Excellent for long-context coding tasks',
    status: 'installed',
    capabilities: ['Code generation', 'Analysis', 'Documentation'],
    performance: { speed: 80, quality: 95, cost: 75 },
    usage: { requests: 890, tokens: 320000, cost: 9.8 },
    size: 'Cloud',
    version: 'claude-3-opus',
  },
  {
    id: '3',
    name: 'CodeLlama 70B',
    provider: 'Meta',
    description: 'Open-source code-specialized model',
    status: 'available',
    capabilities: ['Code completion', 'Generation', 'Infilling'],
    performance: { speed: 90, quality: 85, cost: 30 },
    usage: { requests: 0, tokens: 0, cost: 0 },
    size: '40 GB',
    version: '70b-instruct',
  },
  {
    id: '4',
    name: 'StarCoder 2',
    provider: 'HuggingFace',
    description: 'Open-source code generation model',
    status: 'downloading',
    capabilities: ['Code completion', 'Generation'],
    performance: { speed: 95, quality: 80, cost: 20 },
    usage: { requests: 0, tokens: 0, cost: 0 },
    size: '15 GB',
    version: '15b',
  },
];

const PerformanceBar: React.FC<{ value: number; color: string; label: string }> = ({
  value,
  color,
  label,
}) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-500 w-12">{label}</span>
    <div className="flex-1 h-2 bg-neural-input rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
    <span className="text-xs text-white w-8 text-right">{value}</span>
  </div>
);

const StatusBadge: React.FC<{ status: AIModel['status'] }> = ({ status }) => {
  const configs = {
    installed: { icon: CheckCircle, color: 'text-forge', bg: 'bg-forge/10', label: 'Installed' },
    available: { icon: Download, color: 'text-sage', bg: 'bg-sage/10', label: 'Available' },
    downloading: { icon: Activity, color: 'text-sync', bg: 'bg-sync/10', label: 'Downloading...' },
    error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Error' },
  };
  const config = configs[status];

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg}`}>
      <config.icon className={`w-3.5 h-3.5 ${config.color} ${status === 'downloading' ? 'animate-pulse' : ''}`} />
      <span className={`text-xs ${config.color}`}>{config.label}</span>
    </div>
  );
};

export const ModelsPage: React.FC = () => {
  const [models] = useState<AIModel[]>(sampleModels);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'installed' | 'available'>('all');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const { navigate } = useContext(NavigationContext);

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalUsage = models.reduce((acc, m) => acc + m.usage.cost, 0);
  const totalRequests = models.reduce((acc, m) => acc + m.usage.requests, 0);

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
          <div className="w-10 h-10 rounded-xl bg-sync/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-sync" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Models</h1>
            <p className="text-sm text-gray-500">Manage your AI models and track usage</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('settings')}
            className="p-2 rounded-lg bg-neural-input hover:bg-white/5 text-gray-400 hover:text-white transition-colors mr-2"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sync text-white text-sm font-medium hover:bg-sync/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Model
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-neural-border">
        <div className="p-4 rounded-xl bg-neural-panel border border-neural-border">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-forge" />
            <span className="text-sm text-gray-500">Installed</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {models.filter((m) => m.status === 'installed').length}
          </div>
          <div className="text-xs text-gray-500">of {models.length} models</div>
        </div>

        <div className="p-4 rounded-xl bg-neural-panel border border-neural-border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-sage" />
            <span className="text-sm text-gray-500">Total Requests</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalRequests.toLocaleString()}</div>
          <div className="text-xs text-gray-500">This month</div>
        </div>

        <div className="p-4 rounded-xl bg-neural-panel border border-neural-border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-sync" />
            <span className="text-sm text-gray-500">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-white">${totalUsage.toFixed(2)}</div>
          <div className="text-xs text-gray-500">This month</div>
        </div>

        <div className="p-4 rounded-xl bg-neural-panel border border-neural-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-500">Avg Response</span>
          </div>
          <div className="text-2xl font-bold text-white">1.2s</div>
          <div className="text-xs text-gray-500">Last 24 hours</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-neural-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-sync/10 text-sync'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Models
          </button>
          <button
            onClick={() => setFilter('installed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'installed'
                ? 'bg-sync/10 text-sync'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Installed
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'available'
                ? 'bg-sync/10 text-sync'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Available
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-neural-input border border-neural-border rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-sync/50"
            />
          </div>
          <button className="p-2 rounded-lg bg-neural-input hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Models List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-3">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`flex items-center justify-between p-4 rounded-xl bg-neural-panel border transition-colors cursor-pointer ${
                selectedModel?.id === model.id
                  ? 'border-sync'
                  : 'border-neural-border hover:border-sync/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sync/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-sync" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{model.name}</span>
                    <StatusBadge status={model.status} />
                    {model.status === 'installed' && (
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{model.provider}</div>
                  <div className="text-xs text-gray-600 mt-1">{model.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Performance */}
                <div className="w-48 space-y-1">
                  <PerformanceBar value={model.performance.speed} color="#00d4ff" label="Speed" />
                  <PerformanceBar value={model.performance.quality} color="#00ff9d" label="Quality" />
                  <PerformanceBar value={model.performance.cost} color="#a855f7" label="Cost" />
                </div>

                {/* Usage */}
                {model.status === 'installed' && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{model.usage.requests.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">requests</div>
                    <div className="text-sm font-medium text-sync mt-1">${model.usage.cost.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">cost</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {model.status === 'available' && (
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sync text-white text-sm font-medium hover:bg-sync/90 transition-colors">
                      <Download className="w-4 h-4" />
                      Install
                    </button>
                  )}
                  {model.status === 'installed' && (
                    <>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
