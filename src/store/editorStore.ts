import { create } from 'zustand';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

export interface Tab {
  id: string;
  name: string;
  language: string;
  content: string;
  isModified: boolean;
  isActive: boolean;
  path?: string;
}

interface EditorState {
  // Files
  files: FileNode[];
  selectedFile: string | null;
  
  // Tabs
  tabs: Tab[];
  activeTab: string | null;
  
  // UI State
  sidebarVisible: boolean;
  sidebarWidth: number;
  aiPanelVisible: boolean;
  aiPanelWidth: number;
  terminalVisible: boolean;
  terminalHeight: number;
  previewVisible: boolean;
  previewWidth: number;
  
  // Actions
  setFiles: (files: FileNode[]) => void;
  selectFile: (fileId: string) => void;
  openTab: (file: FileNode) => void;
  addTab: (tab: Tab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  toggleAIPanel: () => void;
  setAIPanelWidth: (width: number) => void;
  toggleTerminal: () => void;
  setTerminalHeight: (height: number) => void;
  togglePreview: () => void;
  setPreviewWidth: (width: number) => void;
  // File operations
  addFile: (parentId: string | null, name: string, type: 'file' | 'folder') => void;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
}

const sampleFiles: FileNode[] = [
  {
    id: '2',
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
    id: '3',
    name: 'App.tsx',
    type: 'file',
    language: 'typescript',
    content: `import React, { useState } from 'react';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';
import { AddTaskForm } from './components/AddTaskForm';
import { useLocalStorage } from './utils/useLocalStorage';
import type { Task } from './models/types';

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const addTask = (title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const activeTasks = tasks.filter(t => !t.completed).length;

  return (
    <div className="app">
      <Header />
      <main className="container">
        <AddTaskForm onAdd={addTask} />
        
        <div className="filters">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active ({activeTasks})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed ({tasks.length - activeTasks})
          </button>
        </div>

        <TaskList 
          tasks={filteredTasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />

        {tasks.some(t => t.completed) && (
          <button 
            className="clear-completed"
            onClick={clearCompleted}
          >
            Clear Completed
          </button>
        )}
      </main>
    </div>
  );
}

export default App;`,
      },
      {
        id: '4',
        name: 'index.css',
        type: 'file',
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 2rem;
}

.app {
  max-width: 600px;
  margin: 0 auto;
}

.container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.filters button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.filters button:hover {
  border-color: #667eea;
}

.filters button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.clear-completed {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-completed:hover {
  background: #d32f2f;
}`,
      },
      {
        id: '10',
        name: 'components',
        type: 'folder',
        isOpen: true,
        children: [
          {
            id: '11',
            name: 'Header.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <h1>✨ Task Manager</h1>
      <p>Stay organized and productive</p>
    </header>
  );
};

// Add this to your index.css:
/*
.header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}
*/`,
          },
          {
            id: '12',
            name: 'TaskList.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';
import { TaskItem } from './TaskItem';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete }) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>📝 No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => onToggle(task.id)}
          onDelete={() => onDelete(task.id)}
        />
      ))}
    </div>
  );
};

// Add this to your index.css:
/*
.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.empty-state p {
  font-size: 1.1rem;
}
*/`,
          },
          {
            id: '13',
            name: 'TaskItem.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <div className={\`task-item \${task.completed ? 'completed' : ''}\`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="task-checkbox"
      />
      <span className="task-title">{task.title}</span>
      <button
        onClick={onDelete}
        className="delete-btn"
        aria-label="Delete task"
      >
        🗑️
      </button>
    </div>
  );
};

// Add this to your index.css:
/*
.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.task-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.task-item.completed {
  opacity: 0.6;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.task-title {
  flex: 1;
  font-size: 1rem;
}

.task-item.completed .task-title {
  text-decoration: line-through;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}
*/`,
          },
          {
            id: '14',
            name: 'AddTaskForm.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React, { useState } from 'react';

interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="task-input"
      />
      <button type="submit" className="add-btn">
        ➕ Add Task
      </button>
    </form>
  );
};

// Add this to your index.css:
/*
.add-task-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.task-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.task-input:focus {
  outline: none;
  border-color: #667eea;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #5568d3;
}
*/`,
          },
        ],
      },
      {
        id: '20',
        name: 'utils',
        type: 'folder',
        isOpen: false,
        children: [
          {
            id: '21',
            name: 'useLocalStorage.ts',
            type: 'file',
            language: 'typescript',
            content: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}`,
          },
        ],
      },
      {
        id: '30',
        name: 'models',
        type: 'folder',
        isOpen: false,
        children: [
          {
            id: '31',
            name: 'types.ts',
            type: 'file',
            language: 'typescript',
            content: `export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}`,
          },
        ],
      },
      {
        id: '5',
        name: 'package.json',
        type: 'file',
        language: 'json',
    content: `{
  "name": "task-manager-app",
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
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}`,
  },
  {
    id: '6',
    name: 'tsconfig.json',
    type: 'file',
    language: 'json',
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}`,
  },
  {
    id: '7',
    name: 'vite.config.ts',
    type: 'file',
    language: 'typescript',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});`,
  },
  {
    id: '8',
    name: 'index.html',
    type: 'file',
    language: 'html',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  },
  {
    id: '9',
    name: 'README.md',
    type: 'file',
    language: 'markdown',
    content: `# Task Manager App

A modern, beautiful task management application built with React and TypeScript.

## Features

- ✅ Add, complete, and delete tasks
- 🔍 Filter tasks by status (All, Active, Completed)
- 💾 Persistent storage with localStorage
- 🎨 Beautiful gradient UI
- 📱 Fully responsive design
- ⚡ Built with Vite for fast development

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Tech Stack

- React 18
- TypeScript
- Vite
- CSS3 (with gradients and animations)

## Project Structure

\`\`\`
src/
├── components/         # React components
│   ├── Header.tsx
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   └── AddTaskForm.tsx
├── utils/             # Utility functions and hooks
│   └── useLocalStorage.ts
├── models/            # TypeScript type definitions
│   └── types.ts
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
\`\`\``,
  },
];

export const useEditorStore = create<EditorState>((set, get) => ({
  files: sampleFiles,
  selectedFile: null,
  tabs: [],
  activeTab: null,
  sidebarVisible: true,
  sidebarWidth: 260,
  aiPanelVisible: true,
  aiPanelWidth: 380,
  terminalVisible: true,
  terminalHeight: 200,
  previewVisible: false,
  previewWidth: 400,

  setFiles: (files) => set({ files }),
  
  selectFile: (fileId) => set({ selectedFile: fileId }),
  
  openTab: (file) => {
    const { tabs } = get();
    const existingTab = tabs.find((t) => t.id === file.id);
    
    if (existingTab) {
      set({
        activeTab: file.id,
        tabs: tabs.map((t) => ({ ...t, isActive: t.id === file.id })),
      });
    } else {
      const newTab: Tab = {
        id: file.id,
        name: file.name,
        language: file.language || 'text',
        content: file.content || '',
        isModified: false,
        isActive: true,
      };
      set({
        tabs: [...tabs.map((t) => ({ ...t, isActive: false })), newTab],
        activeTab: file.id,
      });
    }
  },
  
  addTab: (tab) => {
    const { tabs } = get();
    set({
      tabs: [...tabs.map((t) => ({ ...t, isActive: false })), { ...tab, isActive: true }],
      activeTab: tab.id,
    });
  },
  
  closeTab: (tabId) => {
    const { tabs, activeTab } = get();
    const newTabs = tabs.filter((t) => t.id !== tabId);
    
    if (activeTab === tabId && newTabs.length > 0) {
      const lastTab = newTabs[newTabs.length - 1];
      lastTab.isActive = true;
      set({ tabs: newTabs, activeTab: lastTab.id });
    } else {
      set({ tabs: newTabs, activeTab: newTabs.length > 0 ? activeTab : null });
    }
  },
  
  setActiveTab: (tabId) => {
    set({
      activeTab: tabId,
      tabs: get().tabs.map((t) => ({ ...t, isActive: t.id === tabId })),
    });
  },
  
  updateTabContent: (tabId, content) => {
    set({
      tabs: get().tabs.map((t) =>
        t.id === tabId ? { ...t, content, isModified: true } : t
      ),
    });
  },
  
  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  
  toggleAIPanel: () => set((state) => ({ aiPanelVisible: !state.aiPanelVisible })),
  setAIPanelWidth: (width) => set({ aiPanelWidth: width }),
  
  toggleTerminal: () => set((state) => ({ terminalVisible: !state.terminalVisible })),
  setTerminalHeight: (height) => set({ terminalHeight: height }),

  togglePreview: () => set((state) => ({ previewVisible: !state.previewVisible })),
  setPreviewWidth: (width) => set({ previewWidth: width }),

  // File operations
  addFile: (parentId, name, type) => {
    const { files } = get();
    const newId = Date.now().toString();
    const newFile: FileNode = {
      id: newId,
      name,
      type,
      language: type === 'file' ? name.split('.').pop() || 'text' : undefined,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined,
      isOpen: type === 'folder' ? true : undefined,
    };

    if (!parentId) {
      set({ files: [...files, newFile] });
      return;
    }

    const addToParent = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === parentId && node.type === 'folder') {
          return { ...node, children: [...(node.children || []), newFile], isOpen: true };
        }
        if (node.children) {
          return { ...node, children: addToParent(node.children) };
        }
        return node;
      });
    };

    set({ files: addToParent(files) });
  },

  deleteFile: (fileId) => {
    const { files, tabs, activeTab } = get();
    
    const removeFile = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter((node) => node.id !== fileId).map((node) => {
        if (node.children) {
          return { ...node, children: removeFile(node.children) };
        }
        return node;
      });
    };

    const newFiles = removeFile(files);
    const newTabs = tabs.filter((t) => t.id !== fileId);
    const newActiveTab = activeTab === fileId 
      ? (newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null)
      : activeTab;

    set({ 
      files: newFiles, 
      tabs: newTabs, 
      activeTab: newActiveTab,
      selectedFile: get().selectedFile === fileId ? null : get().selectedFile
    });
  },

  renameFile: (fileId, newName) => {
    const { files } = get();
    
    const updateName = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === fileId) {
          return { 
            ...node, 
            name: newName,
            language: node.type === 'file' ? newName.split('.').pop() || 'text' : node.language
          };
        }
        if (node.children) {
          return { ...node, children: updateName(node.children) };
        }
        return node;
      });
    };

    set({ files: updateName(files) });
  },
}));
