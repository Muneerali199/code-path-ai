import React, { useState, useEffect, useRef, useCallback } from 'react'
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
    return isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-violet-400/70" /> : <Folder className="w-3.5 h-3.5 text-violet-400/50" />
  }

  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode className="w-3.5 h-3.5 text-amber-400/60" />
    case 'json':
      return <FileJson className="w-3.5 h-3.5 text-orange-400/50" />
    case 'md':
    case 'txt':
      return <FileText className="w-3.5 h-3.5 text-white/25" />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FileImage className="w-3.5 h-3.5 text-emerald-400/50" />
    case 'zip':
    case 'rar':
    case 'tar':
      return <FileArchive className="w-3.5 h-3.5 text-red-400/50" />
    default:
      return <File className="w-3.5 h-3.5 text-white/20" />
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
      console.log("Selected file:", node.name, node.id) // Debug log
      onFileSelect(node)
    }
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'flex items-center px-2 py-0.5 text-[12px] cursor-pointer transition-colors duration-100 group',
              'hover:bg-white/[0.04]',
              isActive && 'bg-violet-500/10 border-r-2 border-violet-500/60',
              isSearching && 'bg-amber-500/5'
            )}
            style={{ paddingLeft: `${level * 14 + 8}px` }}
            onClick={handleClick}
          >
            <div className="flex items-center flex-1 min-w-0">
              {isFolder && (
                <div className="mr-1">
                  {node.isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-white/20" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-white/20" />
                  )}
                </div>
              )}
              
              <div className="mr-1.5 flex-shrink-0">
                {getFileIcon(node.name, node.type, node.isExpanded)}
              </div>
              
              <span className={cn(
                'flex-1 truncate text-white/50',
                isActive && 'text-white/80',
                node.isHidden && 'text-white/20 italic'
              )}>
                {node.name}
              </span>
            </div>

            {/* Action buttons - visible on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center space-x-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-white/20 hover:text-white/50 hover:bg-white/[0.06]"
                onClick={(e) => {
                  e.stopPropagation()
                  onContextMenu(node, 'new')
                }}
              >
                <Plus className="w-2.5 h-2.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-white/20 hover:text-white/50 hover:bg-white/[0.06]"
                onClick={(e) => {
                  e.stopPropagation()
                  onContextMenu(node, 'more')
                }}
              >
                <MoreHorizontal className="w-2.5 h-2.5" />
              </Button>
            </div>
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent className="bg-[#12121e] border-white/[0.08] text-white/70 shadow-2xl shadow-black/50">
          <ContextMenuItem 
            className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]"
            onClick={() => onContextMenu(node, 'new-file')}
          >
            <File className="w-3.5 h-3.5 mr-2 text-white/25" />
            New File
          </ContextMenuItem>
          <ContextMenuItem 
            className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]"
            onClick={() => onContextMenu(node, 'new-folder')}
          >
            <Folder className="w-3.5 h-3.5 mr-2 text-white/25" />
            New Folder
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-white/[0.06]" />
          <ContextMenuItem 
            className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]"
            onClick={() => onContextMenu(node, 'rename')}
          >
            Rename
          </ContextMenuItem>
          <ContextMenuItem 
            className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]"
            onClick={() => onContextMenu(node, 'duplicate')}
          >
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem 
            className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]"
            onClick={() => onContextMenu(node, 'delete')}
          >
            Delete
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-white/[0.06]" />
          <ContextMenuItem 
            className="hover:bg-white/[0.06] focus:bg-white/[0.06] text-[12px]"
            onClick={() => onContextMenu(node, 'hide')}
          >
            {node.isHidden ? <Eye className="w-3.5 h-3.5 mr-2" /> : <EyeOff className="w-3.5 h-3.5 mr-2" />}
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

const EnhancedFileExplorer = React.memo(function EnhancedFileExplorer({
  files,
  onFileSelect,
  onFileChange,
  activeFile,
  className
}: EnhancedFileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showHiddenFiles, setShowHiddenFiles] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Use files prop directly instead of duplicating into local state
  // Apply expand/collapse state from local expandedFolders set
  const applyExpandState = useCallback((nodes: FileNode[]): FileNode[] => {
    return nodes.map(node => {
      if (node.type === 'folder') {
        return {
          ...node,
          isExpanded: expandedFolders.has(node.id),
          children: node.children ? applyExpandState(node.children) : undefined,
        }
      }
      return node
    })
  }, [expandedFolders])

  const fileTree = applyExpandState(files)

  // Auto-expand folders containing the active file (only when activeFile changes)
  const prevActiveFileRef = useRef(activeFile)
  useEffect(() => {
    if (activeFile && activeFile !== prevActiveFileRef.current) {
      prevActiveFileRef.current = activeFile
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

      const parentIds = findAndExpandParents(files, activeFile)
      if (parentIds.length > 0) {
        setExpandedFolders(prev => {
          const next = new Set(prev)
          let changed = false
          for (const id of parentIds) {
            if (!next.has(id)) {
              next.add(id)
              changed = true
            }
          }
          return changed ? next : prev
        })
      }
    }
  }, [activeFile, files])

  const handleToggleExpand = (nodeId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
    // Don't call onFileChange — expand/collapse is UI-only state
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

    const updatedTree = updateTree(files)
    onFileChange(updatedTree)
    // Auto-expand the parent folder
    setExpandedFolders(prev => {
      const next = new Set(prev)
      next.add(parentNode.id)
      return next
    })
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

    const updatedTree = updateTree(files)
    onFileChange(updatedTree)
    setExpandedFolders(prev => {
      const next = new Set(prev)
      next.add(parentNode.id)
      return next
    })
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

      const updatedTree = updateTree(files)
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

    const updatedTree = updateTree(files)
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

      const updatedTree = updateTree(files)
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

    const updatedTree = updateTree(files)
    onFileChange(updatedTree)
  }

  const filterFiles = (files: FileNode[]): FileNode[] => {
    return files.filter(file => {
      if (!showHiddenFiles && file.isHidden) return false
      
      if (searchTerm) {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
        if (matchesSearch) return true
        
        if (file.children) {
          const filteredChildren = filterFiles(file.children)
          if (filteredChildren.length > 0) {
            file = { ...file, children: filteredChildren }
            return true
          }
        }
        
        return false
      }
      
      if (file.children) {
        file = { ...file, children: filterFiles(file.children) }
      }
      
      return true
    })
  }

  const filteredFiles = filterFiles(fileTree)

  return (
    <div className={cn("flex flex-col h-full bg-[#0a0a12] border-r border-white/[0.06]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-medium text-white/25 uppercase tracking-wider">Explorer</h3>
        <div className="flex items-center space-x-0.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-white/20 hover:text-white/50 hover:bg-white/[0.06]">
                <Settings className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-[#12121e] border-white/[0.08] text-white/70 p-2 shadow-2xl shadow-black/50" side="bottom" align="end">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/50">Show Hidden Files</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-white/30 hover:text-white/60"
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
      <div className="px-2.5 py-1.5 border-b border-white/[0.06]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/15" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 bg-white/[0.03] border-white/[0.06] text-white/60 placeholder-white/15 text-[11px] h-7 focus:bg-white/[0.05] focus:border-violet-500/30"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 text-white/20 hover:text-white/50"
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
          <div className="p-4 text-center text-white/15 text-[11px]">
            {searchTerm ? 'No files found' : 'No files in project'}
          </div>
        ) : (
          <div className="py-0.5">
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
      <div className="px-3 py-1.5 border-t border-white/[0.06] text-[10px] text-white/15">
        <div className="flex justify-between">
          <span>{files.length} items</span>
          <span>{searchTerm ? `${filteredFiles.length} matches` : ''}</span>
        </div>
      </div>
    </div>
  )
})

export default EnhancedFileExplorer