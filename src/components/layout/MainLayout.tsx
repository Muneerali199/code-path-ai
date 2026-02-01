import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { Terminal } from './Terminal';
import { PreviewPanel } from './PreviewPanel';
import { DualAIPanel } from '../ai/DualAIPanel';
import { CodeEditor } from '../editor/CodeEditor';
import { useEditorStore } from '@/store/editorStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useWebsiteCreation } from '@/hooks/useWebsiteCreation';

export const MainLayout: React.FC = () => {
  // Initialize website creation if coming from dashboard
  useWebsiteCreation();

  const {
    sidebarVisible,
    sidebarWidth,
    aiPanelVisible,
    aiPanelWidth,
    terminalVisible,
    terminalHeight,
    previewVisible,
    previewWidth,
  } = useEditorStore();

  const themeContext = useTheme();

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        {sidebarVisible && (
          <div
            className="flex-shrink-0 border-r border-neural-border"
            style={{ width: sidebarWidth }}
          >
            <Sidebar />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs & Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <CodeEditor />
          </div>

          {/* Terminal */}
          {terminalVisible && (
            <div
              className="border-t border-neural-border"
              style={{ height: terminalHeight }}
            >
              <Terminal />
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {previewVisible && (
          <div
            className="flex-shrink-0 border-l border-neural-border"
            style={{ width: previewWidth }}
          >
            <PreviewPanel />
          </div>
        )}

        {/* AI Panel */}
        {aiPanelVisible && (
          <div
            className="flex-shrink-0 border-l border-neural-border"
            style={{ width: aiPanelWidth }}
          >
            <DualAIPanel />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};
