import { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import CodeEditor from '@/components/editor/CodeEditor';
import OutputPanel from '@/components/editor/OutputPanel';
import GuideAIChat from '@/components/chat/GuideAIChat';
import IDEHeader from './IDEHeader';

const DEFAULT_CODE = `// Welcome to CodePath AI!
// Start coding and ask Guide-AI for help.

function greet(name) {
  return \`Hello, \${name}! Welcome to CodePath AI.\`;
}

console.log(greet("Developer"));
`;

export default function IDELayout() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/execute-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ code, language }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to execute code');
      } else {
        setOutput(data.output || '');
        if (data.error) {
          setError(data.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <IDEHeader
        language={language}
        onLanguageChange={setLanguage}
        onRun={runCode}
        isRunning={isRunning}
      />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Editor + Output */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={65} minSize={30}>
                <div className="h-full p-2">
                  <div className="h-full rounded-lg overflow-hidden border border-border bg-editor">
                    <CodeEditor
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      language={language}
                    />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Output Panel */}
              <ResizablePanel defaultSize={35} minSize={15}>
                <div className="h-full p-2 pt-0">
                  <OutputPanel output={output} error={error} isRunning={isRunning} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Guide-AI Chat */}
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="h-full p-2 pl-0">
              <GuideAIChat code={code} language={language} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
