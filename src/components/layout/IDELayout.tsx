import { useEffect, useMemo, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import CodeEditor from '@/components/editor/CodeEditor';
import OutputPanel from '@/components/editor/OutputPanel';
import GuideAIChat from '@/components/chat/GuideAIChat';
import IDEHeader from './IDEHeader';
import FileExplorer, { WorkspaceFile } from '@/components/ide/FileExplorer';
import EditorTabs from '@/components/ide/EditorTabs';
import StatusBar from '@/components/ide/StatusBar';

const DEFAULT_CODE = `// Welcome to CodePath AI!
// Start coding and ask Guide-AI for help.

function greet(name) {
  return \`Hello, \${name}! Welcome to CodePath AI.\`;
}

console.log(greet("Developer"));
`;

const STORAGE_KEYS = {
  code: 'codepath_ai_code',
  language: 'codepath_ai_language',
  workspace: 'codepath_ai_workspace_v1',
} as const;

const guessLanguageFromPath = (path: string) => {
  const lower = path.toLowerCase();
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'javascript';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.java')) return 'java';
  if (lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx')) return 'cpp';
  if (lower.endsWith('.c')) return 'c';
  if (lower.endsWith('.go')) return 'go';
  if (lower.endsWith('.rs')) return 'rust';
  return 'javascript';
};

const getDefaultContentForLanguage = (language: string) => {
  if (language === 'python') return 'print("Hello from Python")\n';
  if (language === 'java') return 'class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java");\n  }\n}\n';
  if (language === 'cpp') return '#include <iostream>\n\nint main() {\n  std::cout << "Hello from C++" << std::endl;\n  return 0;\n}\n';
  if (language === 'c') return '#include <stdio.h>\n\nint main() {\n  printf("Hello from C\\n");\n  return 0;\n}\n';
  if (language === 'go') return 'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello from Go")\n}\n';
  if (language === 'rust') return 'fn main() {\n  println!("Hello from Rust");\n}\n';
  return DEFAULT_CODE;
};

const normalizePath = (path: string) => {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\//, '');
};

export default function IDELayout() {
  const initialWorkspace = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.workspace);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.files) && typeof parsed.activePath === 'string' && Array.isArray(parsed.openPaths)) {
          return parsed as { files: WorkspaceFile[]; activePath: string; openPaths: string[] };
        }
      }
    } catch {
    }

    let legacyCode = DEFAULT_CODE;
    let legacyLanguage = 'javascript';
    try {
      legacyCode = localStorage.getItem(STORAGE_KEYS.code) ?? DEFAULT_CODE;
      legacyLanguage = localStorage.getItem(STORAGE_KEYS.language) ?? 'javascript';
    } catch {
    }

    const mainPath = legacyLanguage === 'typescript' ? 'main.ts' : 'main.js';
    const files: WorkspaceFile[] = [
      {
        id: crypto.randomUUID(),
        path: mainPath,
        language: legacyLanguage,
        content: legacyCode,
      },
    ];

    return { files, activePath: mainPath, openPaths: [mainPath] };
  }, []);

  const [files, setFiles] = useState<WorkspaceFile[]>(initialWorkspace.files);
  const [activePath, setActivePath] = useState<string>(initialWorkspace.activePath);
  const [openPaths, setOpenPaths] = useState<string[]>(initialWorkspace.openPaths);

  const activeFile = useMemo(() => {
    return files.find((f) => f.path === activePath) ?? files[0];
  }, [files, activePath]);

  const [language, setLanguage] = useState(() => activeFile?.language ?? 'javascript');

  useEffect(() => {
    if (activeFile && activeFile.language !== language) {
      setLanguage(activeFile.language);
    }
  }, [activeFile, language]);

  useEffect(() => {
    if (!activeFile) return;
    if (activeFile.language === language) return;
    setFiles((prev) => prev.map((f) => (f.path === activeFile.path ? { ...f, language } : f)));
  }, [language, activeFile]);

  useEffect(() => {
    if (!activeFile) return;
    if (activeFile.path === activePath) return;
    setActivePath(activeFile.path);
  }, [activeFile, activePath]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.workspace,
        JSON.stringify({ files, activePath: activeFile?.path ?? activePath, openPaths })
      );
    } catch {
    }
  }, [files, activeFile, activePath, openPaths]);

  const code = activeFile?.content ?? '';
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runJavaScriptLocally = () => {
    const logs: string[] = [];
    const sandboxConsole = {
      log: (...args: unknown[]) => {
        logs.push(
          args
            .map((a) => {
              if (typeof a === 'string') return a;
              try {
                return JSON.stringify(a, null, 2);
              } catch {
                return String(a);
              }
            })
            .join(' ')
        );
      },
      error: (...args: unknown[]) => {
        logs.push(
          `Error: ${args
            .map((a) => (typeof a === 'string' ? a : String(a)))
            .join(' ')}`
        );
      },
      warn: (...args: unknown[]) => {
        logs.push(
          `Warning: ${args
            .map((a) => (typeof a === 'string' ? a : String(a)))
            .join(' ')}`
        );
      },
    };

    try {
      const fn = new Function('console', code);
      const result = fn(sandboxConsole);

      if (logs.length === 0 && result !== undefined) {
        logs.push(String(result));
      }

      return { output: logs.length > 0 ? logs.join('\n') : 'Program finished with no output.', error: '' };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Execution error';
      return { output: logs.join('\n'), error: message };
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.code, code);
    } catch {
    }
  }, [code]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.language, language);
    } catch {
    }
  }, [language]);

  const openFile = (path: string) => {
    setActivePath(path);
    setOpenPaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
  };

  const renameEntry = (oldPathRaw: string, newPathRaw: string) => {
    const oldPath = normalizePath(oldPathRaw);
    const newPath = normalizePath(newPathRaw);
    if (!oldPath || !newPath) return;

    const isFile = files.some((f) => normalizePath(f.path) === oldPath);

    const nextFiles = files.map((f) => {
      const p = normalizePath(f.path);
      if (isFile) {
        if (p !== oldPath) return f;
        const nextLang = guessLanguageFromPath(newPath);
        return { ...f, path: newPath, language: nextLang };
      }

      if (p === oldPath || p.startsWith(`${oldPath}/`)) {
        const suffix = p.slice(oldPath.length);
        const updatedPath = `${newPath}${suffix}`;
        return { ...f, path: updatedPath };
      }
      return f;
    });

    const remap = (p: string) => {
      const np = normalizePath(p);
      if (isFile) {
        return np === oldPath ? newPath : np;
      }
      if (np === oldPath || np.startsWith(`${oldPath}/`)) {
        const suffix = np.slice(oldPath.length);
        return `${newPath}${suffix}`;
      }
      return np;
    };

    const nextOpenPaths = Array.from(new Set(openPaths.map(remap))).filter((p) => nextFiles.some((f) => normalizePath(f.path) === p));

    const nextActivePath = remap(activePath);
    const activeExists = nextFiles.some((f) => normalizePath(f.path) === normalizePath(nextActivePath));

    setFiles(nextFiles);
    setOpenPaths(nextOpenPaths.length > 0 ? nextOpenPaths : [normalizePath(nextFiles[0]?.path ?? nextActivePath)]);
    if (activeExists) {
      setActivePath(nextActivePath);
    } else if (nextFiles[0]?.path) {
      setActivePath(nextFiles[0].path);
    }
  };

  const createFile = (path: string) => {
    const language = guessLanguageFromPath(path);
    const file: WorkspaceFile = {
      id: crypto.randomUUID(),
      path,
      language,
      content: getDefaultContentForLanguage(language),
    };

    setFiles((prev) => [...prev, file]);
    setActivePath(path);
    setOpenPaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
  };

  const deleteFile = (path: string) => {
    setFiles((prev) => {
      if (prev.length <= 1) return prev;
      const nextFiles = prev.filter((f) => f.path !== path);
      if (activePath === path) {
        const nextActive = nextFiles[0]?.path;
        if (nextActive) setActivePath(nextActive);
      }
      return nextFiles;
    });

    setOpenPaths((prev) => {
      const next = prev.filter((p) => p !== path);
      if (activePath === path) {
        const fallback = next[next.length - 1];
        if (fallback) setActivePath(fallback);
      }
      return next;
    });
  };

  const closeTab = (path: string) => {
    setOpenPaths((prev) => {
      const next = prev.filter((p) => p !== path);
      if (path === activePath) {
        const fallback = next[next.length - 1] ?? files.find((f) => f.path !== path)?.path;
        if (fallback) setActivePath(fallback);
      }
      return next.length > 0 ? next : prev;
    });
  };

  const runCode = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const canRunLocally = language === 'javascript';

    setIsRunning(true);
    setOutput('');
    setError('');

    if (!supabaseUrl || !supabaseKey) {
      if (canRunLocally) {
        const local = runJavaScriptLocally();
        setOutput(local.output);
        if (local.error) setError(local.error);
        setIsRunning(false);
        return;
      }

      setError(
        'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.'
      );
      setIsRunning(false);
      return;
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/execute-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ code, language }),
        }
      );

      const text = await response.text();
      let data: any = {};
      let parsedJson = true;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        parsedJson = false;
        data = { error: text };
      }

      if (response.ok && !parsedJson) {
        if (canRunLocally) {
          const local = runJavaScriptLocally();
          setOutput(local.output);
          setError(
            local.error ||
              `Remote execution returned an invalid response. Showing local output.`
          );
        } else {
          setError('Remote execution returned an invalid response.');
        }
        return;
      }

      if (!response.ok) {
        if (canRunLocally) {
          const local = runJavaScriptLocally();
          setOutput(local.output);
          setError(
            local.error ||
              (data as any).error ||
              `Remote execution failed (HTTP ${response.status}). Showing local output.`
          );
        } else {
          setError((data as any).error || `Failed to execute code (HTTP ${response.status})`);
        }
        return;
      }

      setOutput((data as any).output || '');
      if ((data as any).error) {
        setError((data as any).error);
      }
    } catch (err) {
      if (canRunLocally) {
        const local = runJavaScriptLocally();
        setOutput(local.output);
        setError(
          local.error ||
            (err instanceof Error ? err.message : 'Failed to execute code')
        );
      } else {
        setError(err instanceof Error ? err.message : 'Failed to execute code');
      }
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
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
                <FileExplorer
                  files={files}
                  activePath={activeFile?.path ?? activePath}
                  onOpen={openFile}
                  onCreate={createFile}
                  onRename={renameEntry}
                  onDelete={deleteFile}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={78} minSize={40}>
                <div className="h-full flex flex-col">
                  <div className="flex-1">
                    <ResizablePanelGroup direction="vertical" className="h-full">
                      {/* Code Editor */}
                      <ResizablePanel defaultSize={65} minSize={30}>
                        <div className="h-full p-2">
                          <div className="h-full rounded-lg overflow-hidden border border-border bg-editor flex flex-col">
                            <EditorTabs
                              openPaths={openPaths}
                              activePath={activeFile?.path ?? activePath}
                              onActivate={openFile}
                              onClose={closeTab}
                            />
                            <div className="flex-1">
                              <CodeEditor
                                value={code}
                                onChange={(value) => {
                                  const next = value ?? '';
                                  const path = activeFile?.path ?? activePath;
                                  setFiles((prev) => prev.map((f) => (f.path === path ? { ...f, content: next } : f)));
                                }}
                                language={language}
                                path={activeFile?.path ?? activePath}
                              />
                            </div>
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
                  </div>

                  <StatusBar
                    activePath={activeFile?.path ?? activePath}
                    language={language}
                    isRunning={isRunning}
                  />
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
