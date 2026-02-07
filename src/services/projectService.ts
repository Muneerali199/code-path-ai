import { supabase } from '@/integrations/supabase/client';

export interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: ProjectFile[];
  isExpanded?: boolean;
  isHidden?: boolean;
}

export interface Project {
  id: string;
  firebase_uid: string;
  name: string;
  description: string | null;
  template: string;
  prompt: string | null;
  files: ProjectFile[];
  created_at: string;
  updated_at: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  template: string;
  updated_at: string;
  created_at: string;
}

// Default template files that mirror what the editor shows when opened directly
const DEFAULT_PROJECT_FILES: ProjectFile[] = [
  {
    id: 'folder-src',
    name: 'src',
    type: 'folder',
    isExpanded: true,
    children: [
      {
        id: 'main-tsx',
        name: 'main.tsx',
        type: 'file',
        language: 'typescript',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      },
      {
        id: 'app-tsx',
        name: 'App.tsx',
        type: 'file',
        language: 'typescript',
        content: `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header>
        <h1>Welcome to CodePath AI</h1>
        <p>Start building your project with AI assistance.</p>
      </header>
      <main>
        <div className="card">
          <button onClick={() => setCount(c => c + 1)}>
            Count: {count}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;`,
      },
      {
        id: 'index-css',
        name: 'index.css',
        type: 'file',
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0a0a12;
  color: #e4e4e7;
  min-height: 100vh;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

header h1 {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #a78bfa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

header p {
  color: #71717a;
  font-size: 1.1rem;
}

.card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  text-align: center;
}

button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
}`,
      },
      {
        id: 'folder-components',
        name: 'components',
        type: 'folder',
        isExpanded: false,
        children: [
          {
            id: 'header-tsx',
            name: 'Header.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = 'CodePath AI' }) => {
  return (
    <header className="header">
      <h1>{title}</h1>
    </header>
  );
};`,
          },
        ],
      },
      {
        id: 'folder-utils',
        name: 'utils',
        type: 'folder',
        isExpanded: false,
        children: [
          {
            id: 'helpers-ts',
            name: 'helpers.ts',
            type: 'file',
            language: 'typescript',
            content: `// Utility helper functions

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}`,
          },
        ],
      },
    ],
  },
  {
    id: 'index-html',
    name: 'index.html',
    type: 'file',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodePath AI Project</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
  },
  {
    id: 'package-json',
    name: 'package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "codepath-project",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}`,
  },
  {
    id: 'readme-md',
    name: 'README.md',
    type: 'file',
    language: 'markdown',
    content: `# CodePath AI Project

Built with CodePath AI IDE.

## Getting Started

Edit the files in the \`src/\` folder to customize your project.

## Features

- React 18 with TypeScript
- Vite for fast development
- AI-powered code assistance
`,
  },
];

/**
 * Create a new project and persist to Supabase
 */
export async function createProject(
  firebaseUid: string,
  options: {
    name?: string;
    description?: string;
    template?: string;
    prompt?: string;
    files?: ProjectFile[];
  } = {}
): Promise<Project> {
  const projectFiles = options.files || [...DEFAULT_PROJECT_FILES];
  const projectName = options.name || deriveProjectName(options.prompt || options.description || 'Untitled Project');

  const { data, error } = await supabase
    .from('projects')
    .insert({
      firebase_uid: firebaseUid,
      name: projectName,
      description: options.description || options.prompt || null,
      template: options.template || 'custom',
      prompt: options.prompt || null,
      files: projectFiles as any,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return {
    ...data,
    files: (data.files as any) || [],
  } as Project;
}

/**
 * Get a project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    console.error('Error fetching project:', error);
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return {
    ...data,
    files: (data.files as any) || [],
  } as Project;
}

/**
 * List all projects for a user, ordered by most recently updated
 */
export async function listProjects(firebaseUid: string): Promise<ProjectSummary[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, template, updated_at, created_at')
    .eq('firebase_uid', firebaseUid)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error listing projects:', error);
    throw new Error(`Failed to list projects: ${error.message}`);
  }

  return (data || []) as ProjectSummary[];
}

/**
 * Update project files (auto-save)
 */
export async function updateProjectFiles(projectId: string, files: ProjectFile[]): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ files: files as any, updated_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) {
    console.error('Error updating project files:', error);
    throw new Error(`Failed to update project files: ${error.message}`);
  }
}

/**
 * Update project metadata
 */
export async function updateProject(
  projectId: string,
  updates: { name?: string; description?: string }
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId);

  if (error) {
    console.error('Error updating project:', error);
    throw new Error(`Failed to update project: ${error.message}`);
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error);
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}

/**
 * Derive a short project name from a prompt string
 */
function deriveProjectName(prompt: string): string {
  // Take first 40 chars, trim to last word boundary
  const trimmed = prompt.slice(0, 50).trim();
  const lastSpace = trimmed.lastIndexOf(' ');
  const name = lastSpace > 20 ? trimmed.slice(0, lastSpace) : trimmed;
  return name + (prompt.length > 50 ? '...' : '');
}

/**
 * Get default project files template
 */
export function getDefaultProjectFiles(): ProjectFile[] {
  return JSON.parse(JSON.stringify(DEFAULT_PROJECT_FILES));
}
