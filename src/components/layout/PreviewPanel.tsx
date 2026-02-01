import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceSizes: Record<DeviceType, { width: number; height: number }> = {
  desktop: { width: 100, height: 100 }, // percentage
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

export const PreviewPanel: React.FC = () => {
  const { togglePreview, previewWidth, tabs, activeTab } = useEditorStore();
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [url, setUrl] = useState('http://localhost:3000');
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate preview content from active tab
  const generatePreviewContent = () => {
    const activeTabData = tabs.find((t) => t.id === activeTab);
    if (!activeTabData) return '';

    // Simple HTML preview for demo
    const content = activeTabData.content;
    
    // Check if it's HTML content
    if (content?.includes('<!DOCTYPE html>') || content?.includes('<html')) {
      return content;
    }

    // Wrap in HTML for React components
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      background: #0a0f0d; 
      color: #fff; 
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
    }
    .preview-container {
      max-width: 1200px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="preview-container">
    <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-4">
      <h2 class="text-emerald-400 font-medium">Live Preview</h2>
      <p class="text-gray-400 text-sm">Previewing: ${activeTabData.name}</p>
    </div>
    <pre class="bg-[#111916] p-4 rounded-lg overflow-auto text-sm font-mono text-gray-300">${content?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || 'No content to preview'}</pre>
  </div>
</body>
</html>`;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice);
    if (newDevice === 'desktop') {
      setScale(1);
    } else {
      // Calculate scale to fit
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
          <span>{Math.round(scale * 100)}% scale</span>
        </div>
      </div>
    </div>
  );
};
