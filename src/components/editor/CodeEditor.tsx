import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { X, Circle } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useSettingsStore } from '@/store/settingsStore';

// Custom Monaco theme with vibrant colors
const defineNeuralTheme = (monaco: any) => {
  monaco.editor.defineTheme('neural-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // Comments - muted gray-green
      { token: 'comment', foreground: '5C7A6B', fontStyle: 'italic' },
      { token: 'comment.doc', foreground: '5C7A6B', fontStyle: 'italic' },
      { token: 'comment.line', foreground: '5C7A6B', fontStyle: 'italic' },
      { token: 'comment.block', foreground: '5C7A6B', fontStyle: 'italic' },
      
      // Keywords - vibrant purple
      { token: 'keyword', foreground: 'C792EA', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: 'C792EA', fontStyle: 'bold' },
      { token: 'keyword.operator', foreground: '89DDFF' },
      { token: 'keyword.other', foreground: 'C792EA' },
      
      // Identifiers & Variables - cyan blue
      { token: 'identifier', foreground: '82AAFF' },
      { token: 'variable', foreground: '82AAFF' },
      { token: 'variable.other', foreground: '82AAFF' },
      { token: 'variable.parameter', foreground: 'FFCB6B' },
      { token: 'variable.language', foreground: 'FF5370' },
      
      // Strings - bright lime green
      { token: 'string', foreground: 'C3E88D' },
      { token: 'string.quoted', foreground: 'C3E88D' },
      { token: 'string.template', foreground: 'C3E88D' },
      { token: 'string.regex', foreground: 'C3E88D' },
      
      // Numbers - coral orange
      { token: 'number', foreground: 'F78C6C' },
      { token: 'number.float', foreground: 'F78C6C' },
      { token: 'number.hex', foreground: 'F78C6C' },
      
      // Types - golden yellow
      { token: 'type', foreground: 'FFCB6B' },
      { token: 'type.identifier', foreground: 'FFCB6B' },
      { token: 'type.class', foreground: 'FFCB6B', fontStyle: 'bold' },
      { token: 'type.interface', foreground: 'FFCB6B' },
      
      // Functions - bright cyan
      { token: 'function', foreground: '00D4FF' },
      { token: 'function.name', foreground: '00D4FF' },
      { token: 'function.call', foreground: '82AAFF' },
      { token: 'function.method', foreground: '00D4FF' },
      
      // Operators - sky blue
      { token: 'operator', foreground: '89DDFF' },
      { token: 'operator.arithmetic', foreground: '89DDFF' },
      { token: 'operator.logical', foreground: '89DDFF' },
      
      // Constants & Special - hot pink
      { token: 'constant', foreground: 'FF5370' },
      { token: 'constant.language', foreground: 'FF5370', fontStyle: 'bold' },
      { token: 'constant.numeric', foreground: 'F78C6C' },
      
      // Tags (HTML/XML) - red
      { token: 'tag', foreground: 'FF5370' },
      { token: 'tag.name', foreground: 'FF5370' },
      { token: 'tag.attribute', foreground: 'FFCB6B' },
      { token: 'attribute.name', foreground: 'FFCB6B' },
      { token: 'attribute.value', foreground: 'C3E88D' },
      
      // CSS Specific
      { token: 'css.tag', foreground: 'FF5370' },
      { token: 'css.class', foreground: 'FFCB6B' },
      { token: 'css.id', foreground: 'C792EA' },
      { token: 'css.property', foreground: '82AAFF' },
      { token: 'css.value', foreground: 'C3E88D' },
      
      // JSON
      { token: 'key', foreground: '82AAFF' },
      { token: 'string.key', foreground: '82AAFF' },
      { token: 'string.value', foreground: 'C3E88D' },
      
      // Meta & Punctuation
      { token: 'meta', foreground: 'ABB2BF' },
      { token: 'punctuation', foreground: '89DDFF' },
      { token: 'delimiter', foreground: '89DDFF' },
      
      // Storage & Modifiers
      { token: 'storage', foreground: 'C792EA', fontStyle: 'bold' },
      { token: 'storage.type', foreground: 'C792EA', fontStyle: 'bold' },
      { token: 'storage.modifier', foreground: 'C792EA', fontStyle: 'bold' },
      
      // Support (built-ins)
      { token: 'support', foreground: '00D4FF' },
      { token: 'support.function', foreground: '00D4FF' },
      { token: 'support.class', foreground: 'FFCB6B' },
      { token: 'support.type', foreground: 'FFCB6B' },
      
      // Invalid
      { token: 'invalid', foreground: 'FF0000', fontStyle: 'underline' },
      { token: 'invalid.illegal', foreground: 'FF0000', fontStyle: 'underline' },
    ],
    colors: {
      'editor.background': '#0a0f0d',
      'editor.foreground': '#e2e8f0',
      'editor.lineHighlightBackground': '#00ff9d10',
      'editor.selectionBackground': '#00ff9d40',
      'editor.selectionHighlightBackground': '#00ff9d20',
      'editor.inactiveSelectionBackground': '#00ff9d15',
      'editorCursor.foreground': '#00ff9d',
      'editorCursor.background': '#0a0f0d',
      'editorLineNumber.foreground': '#3d4f44',
      'editorLineNumber.activeForeground': '#00ff9d',
      'editorIndentGuide.background': '#1a2a22',
      'editorIndentGuide.activeBackground': '#00ff9d40',
      'editorWhitespace.foreground': '#2d3d35',
      'editorRuler.foreground': '#1a2a22',
      'editorCodeLens.foreground': '#5C7A6B',
      'editorBracketMatch.background': '#00ff9d20',
      'editorBracketMatch.border': '#00ff9d60',
      'editorOverviewRuler.border': '#1a2a22',
      'editorGutter.background': '#0a0f0d',
      'editorGutter.modifiedBackground': '#00ff9d',
      'editorGutter.addedBackground': '#00ff9d',
      'editorGutter.deletedBackground': '#FF5370',
      'editor.findMatchBackground': '#00ff9d40',
      'editor.findMatchHighlightBackground': '#00ff9d20',
      'editor.findRangeHighlightBackground': '#00ff9d15',
      'editor.hoverHighlightBackground': '#00ff9d15',
      'editor.wordHighlightBackground': '#00ff9d20',
      'editor.wordHighlightStrongBackground': '#00ff9d30',
      'editorSuggestWidget.background': '#111916',
      'editorSuggestWidget.border': '#1a2a22',
      'editorSuggestWidget.foreground': '#e2e8f0',
      'editorSuggestWidget.highlightForeground': '#00ff9d',
      'editorSuggestWidget.selectedBackground': '#00ff9d20',
      'editorWidget.background': '#111916',
      'editorWidget.border': '#1a2a22',
      'editorHoverWidget.background': '#111916',
      'editorHoverWidget.border': '#1a2a22',
      'peekView.border': '#00ff9d',
      'peekViewEditor.background': '#0a0f0d',
      'peekViewEditor.matchHighlightBackground': '#00ff9d30',
      'peekViewResult.background': '#111916',
      'peekViewResult.matchHighlightBackground': '#00ff9d30',
      'peekViewTitle.background': '#111916',
    },
  });
};

export const CodeEditor: React.FC = () => {
  const { tabs, activeTab, closeTab, setActiveTab, updateTabContent } = useEditorStore();
  const { editor: editorSettings } = useSettingsStore();
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorMount = useCallback((_: any, monaco: any) => {
    defineNeuralTheme(monaco);
    monaco.editor.setTheme('neural-dark');
    setIsEditorReady(true);
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (activeTab && value !== undefined) {
        updateTabContent(activeTab, value);
      }
    },
    [activeTab, updateTabContent]
  );

  const activeTabData = tabs.find((t) => t.id === activeTab);

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neural-bg">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-forge/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to CodeMentor</h2>
          <p className="text-gray-400 mb-6">Open a file from the explorer to start coding</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-neural-panel rounded">Ctrl+P</kbd>
              Quick Open
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-neural-panel rounded">Ctrl+Shift+P</kbd>
              Command Palette
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neural-bg">
      {/* Tabs */}
      <div className="flex items-center bg-neural-panel border-b border-neural-border overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group flex items-center gap-2 px-4 py-2 text-sm cursor-pointer border-r border-neural-border transition-colors min-w-fit ${
              tab.isActive
                ? 'bg-neural-bg text-white'
                : 'bg-neural-panel text-gray-400 hover:text-gray-200 hover:bg-neural-panel/80'
            }`}
          >
            {/* File Icon */}
            <span className={`w-2 h-2 rounded-full ${
              tab.language === 'typescript' || tab.language === 'javascript'
                ? 'bg-yellow-400'
                : tab.language === 'css'
                ? 'bg-blue-400'
                : tab.language === 'json'
                ? 'bg-orange-400'
                : 'bg-gray-400'
            }`} />

            {/* Filename */}
            <span className="truncate max-w-[150px]">{tab.name}</span>

            {/* Modified Indicator */}
            {tab.isModified && (
              <Circle className="w-2 h-2 fill-current" />
            )}

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {activeTabData && (
          <Editor
            height="100%"
            language={activeTabData.language}
            value={activeTabData.content}
            onChange={handleChange}
            onMount={handleEditorMount}
            options={{
              fontSize: editorSettings.fontSize,
              fontFamily: editorSettings.fontFamily,
              lineHeight: editorSettings.lineHeight,
              tabSize: editorSettings.tabSize,
              insertSpaces: editorSettings.useSpaces,
              wordWrap: editorSettings.wordWrap,
              minimap: { enabled: editorSettings.minimap },
              lineNumbers: editorSettings.lineNumbers,
              renderWhitespace: editorSettings.renderWhitespace,
              bracketPairColorization: { enabled: editorSettings.bracketPairColorization },
              smoothScrolling: editorSettings.smoothScrolling,
              cursorStyle: editorSettings.cursorStyle,
              cursorBlinking: editorSettings.cursorBlinking,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              folding: true,
              foldingHighlight: true,
              showFoldingControls: 'always',
              unfoldOnClickAfterEndOfLine: true,
              guides: {
                bracketPairs: true,
                indentation: true,
              },
              suggest: {
                showKeywords: true,
                showSnippets: true,
                preview: true,
              },
              quickSuggestions: true,
              parameterHints: { enabled: true },
              hover: { enabled: true },
              formatOnPaste: true,
              formatOnType: true,
            }}
            theme="neural-dark"
            loading={
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading editor...</div>
              </div>
            }
          />
        )}

        {/* AI Inline Suggestions Overlay */}
        {isEditorReady && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <div className="glass px-3 py-1.5 rounded-full text-xs text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forge animate-pulse" />
              AI suggestions active
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
