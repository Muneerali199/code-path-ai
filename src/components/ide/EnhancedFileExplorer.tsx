import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, MoreHorizontal, Search, FileText, FileCode, FileJson, FileImage, FileArchive, Settings, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileNode[]
  isHidden?: boolean
  isExpanded?: boolean
}

interface EnhancedFileExplorerProps {
  files: FileNode[]
  onFileSelect: (file: FileNode) => void
  onFileChange: (files: FileNode[]) => void
  activeFile?: string
  className?: string
}

const getFileIcon = (fileName: string, type: 'file' | 'folder', isExpanded?: boolean) => {
  if (type === 'folder') {
    return isExpanded ? <FolderOpen className="w-4 h-4 text-blue-400" /> : <Folder className="w-4 h-4 text-blue-400" />
  }

  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-yellow-400" />
    case 'json':
      return <FileJson className="w-4 h-4 text-orange-400" />
    case 'md':
    case 'txt':
      return <FileText className="w-4 h-4 text-gray-400" />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FileImage className="w-4 h-4 text-green-400" />
    case 'zip':
    case 'rar':
    case 'tar':
      return <FileArchive className="w-4 h-4 text-red-400" />
    default:
      return <File className="w-4 h-4 text-gray-400" />
  }
}

const FileTreeItem = ({
  node,
  level = 0,
  onFileSelect,
  onToggleExpand,
  onContextMenu,
  activeFile,
  isSearching = false
}: {
  node: FileNode
  level?: number
  onFileSelect: (file: FileNode) => void
  onToggleExpand: (nodeId: string) => void
  onContextMenu: (node: FileNode, action: string) => void
  activeFile?: string
  isSearching?: boolean
}) => {
  const isActive = activeFile === node.id
  const isFolder = node.type === 'folder'
  const hasChildren = node.children && node.children.length > 0

  const handleClick = () => {
    if (isFolder) {
      onToggleExpand(node.id)
    } else {
      onFileSelect(node)
    }
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'flex items-center px-2 py-1 text-sm cursor-pointer transition-colors duration-150 group',
              'hover:bg-slate-700/50',
              isActive && 'bg-blue-900/30 border-r-2 border-blue-400',
              isSearching && 'bg-yellow-900/20'
            )}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={handleClick}
          >
            <div className="flex items-center flex-1 min-w-0">
              {isFolder && (
                <div className="mr-1">
                  {node.isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              )}
              
              <div className="mr-2 flex-shrink-0">
                {getFileIcon(node.name, node.type, node.isExpanded)}
              </div>
              
              <span className={cn(
                'flex-1 truncate',
                node.isHidden && 'text-slate-500 italic'
              )}>
                {node.name}
              </span>
            </div>

            {/* Action buttons - visible on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onContextMenu(node, 'new')
                }}
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onContextMenu(node, 'more')
                }}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent className="bg-slate-800 border-slate-700 text-white">
          <ContextMenuItem 
            className="hover:bg-slate-700 focus:bg-slate-700"
            onClick={() => onContextMenu(node, 'new-file')}
          >
            <File className="w-4 h-4 mr-2" />
            New File
          </ContextMenuItem>
          <ContextMenuItem 
            className="hover:bg-slate-700 focus:bg-slate-700"
            onClick={() => onContextMenu(node, 'new-folder')}
          >
            <Folder className="w-4 h-4 mr-2" />
            New Folder
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-slate-700" />
          <ContextMenuItem 
            className="hover:bg-slate-700 focus:bg-slate-700"
            onClick={() => onContextMenu(node, 'rename')}
          >
            Rename
          </ContextMenuItem>
          <ContextMenuItem 
            className="hover:bg-slate-700 focus:bg-slate-700"
            onClick={() => onContextMenu(node, 'duplicate')}
          >
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem 
            className="hover:bg-slate-700 focus:bg-slate-700"
            onClick={() => onContextMenu(node, 'delete')}
          >
            Delete
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-slate-700" />
          <ContextMenuItem 
            className="hover:bg-slate-700 focus:bg-slate-700"
            onClick={() => onContextMenu(node, 'hide')}
          >
            {node.isHidden ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {node.isHidden ? 'Show' : 'Hide'}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Render children if folder is expanded */}
      {isFolder && node.isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              onToggleExpand={onToggleExpand}
              onContextMenu={onContextMenu}
              activeFile={activeFile}
              isSearching={isSearching}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function EnhancedFileExplorer({
  files,
  onFileSelect,
  onFileChange,
  activeFile,
  className
}: EnhancedFileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showHiddenFiles, setShowHiddenFiles] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [fileTree, setFileTree] = useState<FileNode[]>(files)

  useEffect(() => {
    setFileTree(files)
  }, [files])

  useEffect(() => {
    // Auto-expand folders containing the active file
    if (activeFile) {
      const findAndExpandParents = (nodes: FileNode[], targetId: string, path: string[] = []): string[] => {
        for (const node of nodes) {
          const currentPath = [...path, node.id]
          if (node.id === targetId) {
            return path // Return parent IDs
          }
          if (node.children) {
            const result = findAndExpandParents(node.children, targetId, currentPath)
            if (result.length > 0) {
              return result
            }
          }
        }
        return []
      }

      const parentIds = findAndExpandParents(fileTree, activeFile)
      setExpandedFolders(new Set([...expandedFolders, ...parentIds]))
    }
  }, [activeFile, fileTree])

  const handleToggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedFolders(newExpanded)

    // Update the tree state
    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId && node.type === 'folder') {
          return { ...node, isExpanded: !node.isExpanded }
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) }
        }
        return node
      })
    }

    const updatedTree = updateTree(fileTree)
    setFileTree(updatedTree)
    onFileChange(updatedTree)
  }

  const handleContextMenu = (node: FileNode, action: string) => {
    switch (action) {
      case 'new-file':
        handleNewFile(node)
        break
      case 'new-folder':
        handleNewFolder(node)
        break
      case 'rename':
        handleRename(node)
        break
      case 'duplicate':
        handleDuplicate(node)
        break
      case 'delete':
        handleDelete(node)
        break
      case 'hide':
        handleToggleHidden(node)
        break
      case 'new':
        handleNewFile(node)
        break
      case 'more':
        // Context menu is already shown
        break
    }
  }

  const handleNewFile = (parentNode: FileNode) => {
    const newFile: FileNode = {
      id: `file-${Date.now()}`,
      name: 'new-file.txt',
      type: 'file',
      content: '',
      language: 'text'
    }

    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === parentNode.id && node.type === 'folder') {
          const children = node.children || []
          return { 
            ...node, 
            children: [...children, newFile],
            isExpanded: true
          }
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) }
        }
        return node
      })
    }

    const updatedTree = updateTree(fileTree)
    setFileTree(updatedTree)
    onFileChange(updatedTree)
  }

  const handleNewFolder = (parentNode: FileNode) => {
    const newFolder: FileNode = {
      id: `folder-${Date.now()}`,
      name: 'new-folder',
      type: 'folder',
      children: [],
      isExpanded: false
    }

    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === parentNode.id && node.type === 'folder') {
          const children = node.children || []
          return { 
            ...node, 
            children: [...children, newFolder],
            isExpanded: true
          }
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) }
        }
        return node
      })
    }

    const updatedTree = updateTree(fileTree)
    setFileTree(updatedTree)
    onFileChange(updatedTree)
  }

  const handleRename = (node: FileNode) => {
    const newName = prompt('Enter new name:', node.name)
    if (newName && newName !== node.name) {
      const updateTree = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(n => {
          if (n.id === node.id) {
            return { ...n, name: newName }
          }
          if (n.children) {
            return { ...n, children: updateTree(n.children) }
          }
          return n
        })
      }

      const updatedTree = updateTree(fileTree)
      setFileTree(updatedTree)
      onFileChange(updatedTree)
    }
  }

  const handleDuplicate = (node: FileNode) => {
    const duplicateNode = (n: FileNode): FileNode => ({
      ...n,
      id: `${n.id}-copy-${Date.now()}`,
      name: `${n.name} (copy)`
    })

    const updateTree = (nodes: FileNode[]): FileNode[] => {
      const result: FileNode[] = []
      for (const n of nodes) {
        result.push(n)
        if (n.id === node.id) {
          result.push(duplicateNode(n))
        }
        if (n.children) {
          result.push({ ...n, children: updateTree(n.children) })
        }
      }
      return result
    }

    const updatedTree = updateTree(fileTree)
    setFileTree(updatedTree)
    onFileChange(updatedTree)
  }

  const handleDelete = (node: FileNode) => {
    if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
      const updateTree = (nodes: FileNode[]): FileNode[] => {
        return nodes.filter(n => n.id !== node.id).map(n => {
          if (n.children) {
            return { ...n, children: updateTree(n.children) }
          }
          return n
        })
      }

      const updatedTree = updateTree(fileTree)
      setFileTree(updatedTree)
      onFileChange(updatedTree)
    }
  }

  const handleToggleHidden = (node: FileNode) => {
    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(n => {
        if (n.id === node.id) {
          return { ...n, isHidden: !n.isHidden }
        }
        if (n.children) {
          return { ...n, children: updateTree(n.children) }
        }
        return n
      })
    }

    const updatedTree = updateTree(fileTree)
    setFileTree(updatedTree)
    onFileChange(updatedTree)
  }

  const filterFiles = (files: FileNode[]): FileNode[] => {
    return files.filter(file => {
      if (!showHiddenFiles && file.isHidden) return false
      
      if (searchTerm) {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
        if (matchesSearch) return true
        
        if (file.children) {
          file.children = filterFiles(file.children)
          return file.children.length > 0
        }
        
        return false
      }
      
      if (file.children) {
        file.children = filterFiles(file.children)
      }
      
      return true
    })
  }

  const filteredFiles = filterFiles([...fileTree])

  return (
    <div className={cn("flex flex-col h-full bg-slate-800 border-r border-slate-700", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300">EXPLORER</h3>
        <div className="flex items-center space-x-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700">
                <Settings className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-slate-800 border-slate-700 text-white p-2" side="bottom" align="end">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Hidden Files</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => setShowHiddenFiles(!showHiddenFiles)}
                  >
                    {showHiddenFiles ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-xs h-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 text-slate-400 hover:text-white"
              onClick={() => setSearchTerm('')}
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto ide-scrollbar">
        {filteredFiles.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">
            {searchTerm ? 'No files found' : 'No files in project'}
          </div>
        ) : (
          <div>
            {filteredFiles.map((file) => (
              <FileTreeItem
                key={file.id}
                node={file}
                level={0}
                onFileSelect={onFileSelect}
                onToggleExpand={handleToggleExpand}
                onContextMenu={handleContextMenu}
                activeFile={activeFile}
                isSearching={!!searchTerm && file.name.toLowerCase().includes(searchTerm.toLowerCase())}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700 text-xs text-slate-400">
        <div className="flex justify-between">
          <span>{fileTree.length} items</span>
          <span>{searchTerm ? `${filteredFiles.length} matches` : ''}</span>
        </div>
      </div>
    </div>
  )
}