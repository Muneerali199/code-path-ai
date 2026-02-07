import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RefreshCw,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  X,
  Play,
  Loader2,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { DependencyPanel } from '@/components/editor/DependencyPanel';
import {
  detectDependencies,
  resolveDependencies,
  generatePreviewHTML,
  extractDepsFromPackageJson,
  type Dependency,
} from '@/services/dependencyService';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceSizes: Record<DeviceType, { width: number; height: number }> = {
  desktop: { width: 100, height: 100 }, // percentage
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

export const PreviewPanel: React.FC = () => {
  const { togglePreview, previewWidth, tabs, activeTab } = useEditorStore();
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [url, setUrl] = useState('http://localhost:5173');
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dependency state
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [importMap, setImportMap] = useState<Record<string, string>>({});
  const [depsReady, setDepsReady] = useState(false);
  const [autoInstalled, setAutoInstalled] = useState(false);

  // Get all project files for dependency detection
  const allFiles = tabs.map((t) => ({
    path: t.path || t.name,
    content: t.content,
    language: t.language,
  }));

  // Detect dependencies when files change
  useEffect(() => {
    if (tabs.length === 0) return;

    const detectedPkgs = detectDependencies(allFiles);
    const pkgJsonDeps = extractDepsFromPackageJson(allFiles);
    const allPkgs = [...new Set([...detectedPkgs, ...pkgJsonDeps])];

    if (allPkgs.length > 0) {
      setDependencies(
        allPkgs.map((name) => ({
          name,
          version: 'latest',
          status: 'pending' as const,
        }))
      );
      setDepsReady(false);
      setAutoInstalled(false);
    } else {
      setDependencies([]);
      setDepsReady(true);
    }
  }, [tabs.length]);

  // Auto-install dependencies when detected
  useEffect(() => {
    if (dependencies.length > 0 && !autoInstalled && !isInstalling) {
      handleInstallDeps();
      setAutoInstalled(true);
    }
  }, [dependencies.length, autoInstalled]);

  const handleInstallDeps = useCallback(async () => {
    if (dependencies.length === 0 || isInstalling) return;

    setIsInstalling(true);
    const pkgNames = dependencies.map((d) => d.name);

    try {
      const result = await resolveDependencies(pkgNames, (dep) => {
        setDependencies((prev) =>
          prev.map((d) => (d.name === dep.name ? dep : d))
        );
      });

      setImportMap(result.importMap);
      setDepsReady(result.ready);
      setDependencies(result.dependencies);
    } catch (error) {
      console.error('Failed to install dependencies:', error);
    } finally {
      setIsInstalling(false);
    }
  }, [dependencies, isInstalling]);

  // Generate preview content using the dependency service
  const generatePreviewContent = useCallback(() => {
    const activeTabData = tabs.find((t) => t.id === activeTab);
    if (!activeTabData) return '';

    const content = activeTabData.content;

    // Check if it's raw HTML content
    if (content?.includes('<!DOCTYPE html>') || content?.includes('<html')) {
      return content;
    }

    // Use dependency service to generate full preview with import maps
    if (depsReady || dependencies.length === 0) {
      return generatePreviewHTML(allFiles, importMap);
    }

    // Show loading state while deps are being installed
    return `<!DOCTYPE html>
<html><head><style>
  body { background: #0a0f0d; color: #fff; font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  .loader { text-align: center; }
  .spinner { width: 40px; height: 40px; border: 3px solid rgba(139,92,246,0.2); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style></head><body>
  <div class="loader">
    <div class="spinner"></div>
    <p style="color:#8b5cf6;">Installing dependencies...</p>
    <p style="color:#666;font-size:12px;margin-top:8px;">${dependencies.filter(d => d.status === 'installed').length}/${dependencies.length} packages resolved</p>
  </div>
</body></html>`;
  }, [tabs, activeTab, depsReady, importMap, dependencies, allFiles]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice);
    if (newDevice === 'desktop') {
      setScale(1);
    } else {
      const containerWidth = containerRef.current?.clientWidth || previewWidth;
      const targetWidth = deviceSizes[newDevice].width;
      const newScale = Math.min(1, (containerWidth - 40) / targetWidth);
      setScale(newScale);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [activeTab, tabs]);

  return (
    <div className="h-full flex flex-col bg-neural-panel">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neural-border bg-neural-bg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDeviceChange('desktop')}
            className={`p-1 rounded transition-colors ${
              device === 'desktop' ? 'text-forge bg-forge/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeviceChange('tablet')}
            className={`p-1 rounded transition-colors ${
              device === 'tablet' ? 'text-forge bg-forge/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeviceChange('mobile')}
            className={`p-1 rounded transition-colors ${
              device === 'mobile' ? 'text-forge bg-forge/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors ${
              isLoading ? 'animate-spin' : ''
            }`}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={togglePreview}
            className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            title="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* URL Bar */}
      <div className="px-3 py-2 border-b border-neural-border bg-neural-panel">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-neural-input border border-neural-border rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-300 focus:outline-none"
              title="Preview URL"
              placeholder="http://localhost:5173"
            />
          </div>
          <button
            onClick={() => window.open(url, '_blank')}
            className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#1a1a1a] relative"
      >
        <div
          className="min-h-full flex items-center justify-center p-4"
          style={{
            transform: device !== 'desktop' ? `scale(${scale})` : 'none',
            transformOrigin: 'center top',
          }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={generatePreviewContent()}
            className="bg-white rounded-lg shadow-2xl"
            style={{
              width: device === 'desktop' ? '100%' : `${deviceSizes[device].width}px`,
              height: device === 'desktop' ? '100%' : `${deviceSizes[device].height}px`,
              minHeight: '400px',
              border: 'none',
            }}
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neural-bg/80">
            <div className="flex items-center gap-3 px-4 py-3 bg-neural-panel border border-neural-border rounded-lg">
              <RefreshCw className="w-5 h-5 text-forge animate-spin" />
              <span className="text-sm text-gray-300">Refreshing preview...</span>
            </div>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="px-3 py-2 border-t border-neural-border bg-neural-panel">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{device.charAt(0).toUpperCase() + device.slice(1)} View</span>
          <div className="flex items-center gap-3">
            {depsReady && dependencies.length > 0 && (
              <span className="text-emerald-400/60">
                {dependencies.length} deps loaded
              </span>
            )}
            <span>{Math.round(scale * 100)}% scale</span>
          </div>
        </div>
      </div>

      {/* Dependency Panel */}
      <DependencyPanel
        dependencies={dependencies}
        isInstalling={isInstalling}
        onInstall={handleInstallDeps}
        onRetry={handleInstallDeps}
        compact
      />
    </div>
  );
};
