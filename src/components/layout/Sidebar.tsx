import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileType,
  File as FileIconGeneric,
  ChevronRight,
  ChevronDown,
  Search,
  GitBranch,
  RefreshCw,
  MoreVertical,
  Edit3,
  Trash2,
  FolderPlus,
  FilePlus,
} from 'lucide-react';
import { useEditorStore, type FileNode } from '@/store/editorStore';

const FileIcon: React.FC<{ file: FileNode }> = ({ file }) => {
  if (file.type === 'folder') {
    return file.isOpen ? (
      <FolderOpen className="w-4 h-4 text-forge" />
    ) : (
      <Folder className="w-4 h-4 text-sage" />
    );
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'jsx':
    case 'js':
      return <FileCode className="w-4 h-4 text-yellow-400" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-orange-400" />;
    case 'css':
    case 'scss':
      return <FileType className="w-4 h-4 text-blue-400" />;
    case 'html':
      return <FileType className="w-4 h-4 text-red-400" />;
    default:
      return <FileIconGeneric className="w-4 h-4 text-gray-400" />;
  }
};

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
  nodeType: 'file' | 'folder' | null;
}

const FileTreeItem: React.FC<{
  node: FileNode;
  depth: number;
  onToggle: (id: string) => void;
  onSelect: (file: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}> = ({ node, depth, onToggle, onSelect, onContextMenu }) => {
  const { selectedFile } = useEditorStore();
  const isSelected = selectedFile === node.id;

  const handleClick = () => {
    if (node.type === 'folder') {
      onToggle(node.id);
    } else {
      onSelect(node);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, node);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer text-sm transition-colors ${
          isSelected
            ? 'bg-forge/10 text-white border-l-2 border-forge'
            : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.type === 'folder' && (
          <span className="text-gray-500">
            {node.isOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        {node.type === 'file' && <span className="w-3" />}
        <FileIcon file={node} />
        <span className="truncate">{node.name}</span>
      </div>

      {node.type === 'folder' && node.isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onToggle={onToggle}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { files, setFiles, selectFile, openTab, addFile, deleteFile, renameFile } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'explorer' | 'search' | 'git'>('explorer');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
    nodeType: null,
  });
  const [isCreating, setIsCreating] = useState<{ parentId: string | null; type: 'file' | 'folder' } | null>(null);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  const toggleFolder = (id: string) => {
    const updateFiles = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: updateFiles(node.children) };
        }
        return node;
      });
    };
    setFiles(updateFiles(files));
  };

  const handleFileSelect = (file: FileNode) => {
    selectFile(file.id);
    openTab(file);
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      nodeId: node.id,
      nodeType: node.type,
    });
  };

  const handleCreateFile = (type: 'file' | 'folder') => {
    setIsCreating({ parentId: contextMenu.nodeId, type });
    setContextMenu((prev) => ({ ...prev, visible: false }));
    setNewName('');
  };

  const handleCreateRoot = (type: 'file' | 'folder') => {
    setIsCreating({ parentId: null, type });
    setNewName('');
  };

  const handleSubmitCreate = () => {
    if (newName.trim() && isCreating) {
      addFile(isCreating.parentId, newName.trim(), isCreating.type);
      setIsCreating(null);
      setNewName('');
    }
  };

  const handleDelete = () => {
    if (contextMenu.nodeId) {
      deleteFile(contextMenu.nodeId);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleRename = () => {
    if (contextMenu.nodeId) {
      setRenamingId(contextMenu.nodeId);
      const findNode = (nodes: FileNode[]): FileNode | null => {
        for (const node of nodes) {
          if (node.id === contextMenu.nodeId) return node;
          if (node.children) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      const node = findNode(files);
      setNewName(node?.name || '');
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleSubmitRename = () => {
    if (newName.trim() && renamingId) {
      renameFile(renamingId, newName.trim());
      setRenamingId(null);
      setNewName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isCreating) handleSubmitCreate();
      if (renamingId) handleSubmitRename();
    } else if (e.key === 'Escape') {
      setIsCreating(null);
      setRenamingId(null);
      setNewName('');
    }
  };

  const renderCreateInput = (_parentId: string | null, depth: number) => (
    <div
      className="flex items-center gap-1.5 px-2 py-1"
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      {isCreating?.type === 'folder' ? (
        <FolderPlus className="w-4 h-4 text-forge" />
      ) : (
        <FilePlus className="w-4 h-4 text-sage" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={isCreating ? handleSubmitCreate : undefined}
        placeholder={isCreating?.type === 'folder' ? 'folder name' : 'file name'}
        className="flex-1 bg-neural-input border border-forge/50 rounded px-2 py-0.5 text-sm text-white placeholder:text-gray-600 focus:outline-none"
      />
    </div>
  );

  const renderRenameInput = (node: FileNode, depth: number) => (
    <div
      className="flex items-center gap-1.5 px-2 py-1"
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <FileIcon file={node} />
      <input
        ref={inputRef}
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmitRename}
        className="flex-1 bg-neural-input border border-forge/50 rounded px-2 py-0.5 text-sm text-white focus:outline-none"
      />
    </div>
  );

  const renderFileTree = (nodes: FileNode[], depth: number = 0, parentId: string | null = null): React.ReactNode => {
    return (
      <>
        {isCreating && isCreating.parentId === parentId && renderCreateInput(parentId, depth)}
        {nodes.map((node) => (
          <div key={node.id}>
            {renamingId === node.id ? (
              renderRenameInput(node, depth)
            ) : (
              <FileTreeItem
                node={node}
                depth={depth}
                onToggle={toggleFolder}
                onSelect={handleFileSelect}
                onContextMenu={handleContextMenu}
              />
            )}
            {node.type === 'folder' && node.isOpen && node.children && (
              <div>
                {renderFileTree(node.children, depth + 1, node.id)}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="h-full flex flex-col bg-neural-panel">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-neural-border">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeTab === 'explorer'
              ? 'text-white border-b-2 border-forge'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Explorer
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-white border-b-2 border-forge'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Search
        </button>
        <button
          onClick={() => setActiveTab('git')}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeTab === 'git'
              ? 'text-white border-b-2 border-forge'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Git
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'explorer' && (
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-neural-border">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Project</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCreateRoot('file')}
                  className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  title="New File"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleCreateRoot('folder')}
                  className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  title="New Folder"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* File Tree */}
            <div className="py-2">
              {renderFileTree(files)}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search in files..."
                className="w-full pl-9 pr-3 py-2 bg-neural-input border border-neural-border rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-forge/50"
              />
            </div>
            <div className="mt-4 text-center text-gray-500 text-sm">
              Type to search across all files
            </div>
          </div>
        )}

        {activeTab === 'git' && (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-4 h-4 text-forge" />
              <span className="text-sm text-white">main</span>
            </div>
            <div className="text-center text-gray-500 text-sm py-8">
              No changes to commit
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[160px] bg-neural-panel border border-neural-border rounded-lg shadow-xl py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.nodeType === 'folder' && (
            <>
              <button
                onClick={() => handleCreateFile('file')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <FilePlus className="w-4 h-4" />
                New File
              </button>
              <button
                onClick={() => handleCreateFile('folder')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
              <div className="my-1 border-t border-neural-border" />
            </>
          )}
          <button
            onClick={handleRename}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
