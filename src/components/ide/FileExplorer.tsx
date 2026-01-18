import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FilePlus,
  FileText,
  Folder,
  FolderPlus,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

export interface WorkspaceFile {
  id: string;
  path: string;
  language: string;
  content: string;
}

interface FileExplorerProps {
  files: WorkspaceFile[];
  activePath: string;
  onOpen: (path: string) => void;
  onCreate: (path: string) => void;
  onRename: (oldPath: string, newPath: string) => void;
  onDelete: (path: string) => void;
}

type ExplorerNode =
  | { type: 'folder'; path: string; name: string; children: ExplorerNode[] }
  | { type: 'file'; path: string; name: string; id: string };

const normalizePath = (path: string) => {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\//, '');
};

const splitPath = (path: string) => normalizePath(path).split('/').filter(Boolean);

const buildTree = (files: WorkspaceFile[]): ExplorerNode[] => {
  const root: { type: 'folder'; path: string; name: string; children: ExplorerNode[] } = {
    type: 'folder',
    path: '',
    name: '',
    children: [],
  };

  const ensureFolder = (parent: { children: ExplorerNode[] }, path: string, name: string) => {
    const existing = parent.children.find((n) => n.type === 'folder' && n.path === path) as
      | { type: 'folder'; path: string; name: string; children: ExplorerNode[] }
      | undefined;
    if (existing) return existing;
    const created: { type: 'folder'; path: string; name: string; children: ExplorerNode[] } = {
      type: 'folder',
      path,
      name,
      children: [],
    };
    parent.children.push(created);
    return created;
  };

  for (const f of files) {
    const parts = splitPath(f.path);
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const curPath = parts.slice(0, i + 1).join('/');
      if (isLast) {
        current.children.push({ type: 'file', path: curPath, name: part, id: f.id });
      } else {
        current = ensureFolder(current, curPath, part);
      }
    }
  }

  const sortNode = (node: ExplorerNode): ExplorerNode => {
    if (node.type === 'file') return node;
    const folders = node.children.filter((c) => c.type === 'folder') as ExplorerNode[];
    const files = node.children.filter((c) => c.type === 'file') as ExplorerNode[];
    folders.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    return {
      ...node,
      children: [...folders.map(sortNode), ...files],
    };
  };

  return root.children.map(sortNode);
};

const filterTree = (nodes: ExplorerNode[], query: string): ExplorerNode[] => {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const match = (s: string) => s.toLowerCase().includes(q);

  const walk = (node: ExplorerNode): ExplorerNode | null => {
    if (node.type === 'file') {
      return match(node.path) ? node : null;
    }
    const kids = node.children.map(walk).filter(Boolean) as ExplorerNode[];
    if (kids.length > 0 || match(node.path) || match(node.name)) {
      return { ...node, children: kids };
    }
    return null;
  };

  return nodes.map(walk).filter(Boolean) as ExplorerNode[];
};

export default function FileExplorer({ files, activePath, onOpen, onCreate, onRename, onDelete }: FileExplorerProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const active = normalizePath(activePath);

  const tree = useMemo(() => buildTree(files), [files]);
  const visibleTree = useMemo(() => filterTree(tree, query), [tree, query]);

  const expandAllForQuery = (nodes: ExplorerNode[], q: string) => {
    if (!q.trim()) return;
    const next: Record<string, boolean> = {};
    const visit = (n: ExplorerNode) => {
      if (n.type === 'folder') {
        next[n.path] = true;
        n.children.forEach(visit);
      }
    };
    nodes.forEach(visit);
    setExpanded((prev) => ({ ...prev, ...next }));
  };

  const collapseAll = () => {
    setExpanded({});
  };

  const toggleFolder = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const createAtRoot = () => {
    const name = window.prompt('New file path (e.g. src/main.py)');
    if (!name) return;
    const p = normalizePath(name);
    if (!p) return;
    if (files.some((f) => normalizePath(f.path) === p)) return;
    onCreate(p);
  };

  const createFolderAtRoot = () => {
    const name = window.prompt('New folder path (e.g. src/components)');
    if (!name) return;
    const p = normalizePath(name);
    if (!p) return;
    setExpanded((prev) => ({ ...prev, [p]: true }));
  };

  const renamePath = (oldPath: string) => {
    const next = window.prompt('Rename to', oldPath);
    if (!next) return;
    const newPath = normalizePath(next);
    if (!newPath) return;
    if (normalizePath(oldPath) === newPath) return;
    if (files.some((f) => normalizePath(f.path) === newPath)) return;
    onRename(oldPath, newPath);
  };

  const renderNode = (node: ExplorerNode, depth: number) => {
    const pad = 8 + depth * 14;

    if (node.type === 'folder') {
      const isOpen = expanded[node.path] ?? depth === 0;
      return (
        <div key={node.path}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className={
                  'flex items-center gap-2 px-2 py-1 rounded cursor-pointer select-none text-muted-foreground hover:bg-secondary/50'
                }
                style={{ paddingLeft: pad }}
                onClick={() => toggleFolder(node.path)}
                role="button"
                tabIndex={0}
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Folder className="h-4 w-4" />
                <span className="text-sm truncate">{node.name}</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onSelect={() => {
                  const name = window.prompt('New file name');
                  if (!name) return;
                  const p = normalizePath(`${node.path}/${name}`);
                  if (!p) return;
                  if (files.some((f) => normalizePath(f.path) === p)) return;
                  onCreate(p);
                  setExpanded((prev) => ({ ...prev, [node.path]: true }));
                }}
              >
                New File
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => {
                  const name = window.prompt('New folder name');
                  if (!name) return;
                  const p = normalizePath(`${node.path}/${name}`);
                  if (!p) return;
                  setExpanded((prev) => ({ ...prev, [node.path]: true, [p]: true }));
                }}
              >
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={() => renamePath(node.path)}>Rename</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {isOpen && node.children.map((c) => renderNode(c, depth + 1))}
        </div>
      );
    }

    const isActive = normalizePath(node.path) === active;
    return (
      <ContextMenu key={node.path}>
        <ContextMenuTrigger asChild>
          <div
            className={
              'flex items-center gap-2 px-2 py-1 rounded cursor-pointer select-none ' +
              (isActive
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50')
            }
            style={{ paddingLeft: pad + 18 }}
            onClick={() => onOpen(node.path)}
            role="button"
            tabIndex={0}
          >
            <FileText className="h-4 w-4" />
            <span className="text-sm truncate flex-1">{node.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => onOpen(node.path)}>Open</ContextMenuItem>
          <ContextMenuItem onSelect={() => renamePath(node.path)}>Rename</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => onDelete(node.path)}>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <div className="h-full flex flex-col bg-panel-header border-r border-border">
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">EXPLORER</span>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={createAtRoot}>
              <FilePlus className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={createFolderAtRoot}>
              <FolderPlus className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={collapseAll}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                const nextVisible = filterTree(tree, v);
                expandAllForQuery(nextVisible, v);
              }}
              placeholder="Search"
              className="bg-secondary pl-8"
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9"
            onClick={() => {
              if (!active) return;
              renamePath(active);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9"
            onClick={() => {
              if (!active) return;
              onDelete(active);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">{visibleTree.map((n) => renderNode(n, 0))}</div>
      </ScrollArea>
    </div>
  );
}
