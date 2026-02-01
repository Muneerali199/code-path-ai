import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface FileItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: Date;
  content?: string;
}

export interface WorkspaceConfig {
  name: string;
  rootPath: string;
  files: string[];
  git?: boolean;
  dependencies?: Record<string, string>;
}

@Injectable()
export class FileManagerService {
  private readonly logger = new Logger(FileManagerService.name);

  async listDirectory(dirPath: string, options: { recursive?: boolean; includeContent?: boolean } = {}): Promise<FileItem[]> {
    const { recursive = false, includeContent = false } = options;
    
    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new BadRequestException('Path is not a directory');
      }

      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const result: FileItem[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const stat = await fs.stat(fullPath);

        const fileItem: FileItem = {
          path: fullPath,
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stat.size,
          modifiedAt: stat.mtime,
        };

        if (entry.isFile() && includeContent) {
          fileItem.content = await fs.readFile(fullPath, 'utf-8');
        }

        result.push(fileItem);

        if (recursive && entry.isDirectory()) {
          const subDirFiles = await this.listDirectory(fullPath, options);
          result.push(...subDirFiles);
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Error listing directory ${dirPath}: ${error.message}`);
      throw error;
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      this.logger.error(`Error reading file ${filePath}: ${error.message}`);
      throw new NotFoundException(`File not found: ${filePath}`);
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      const dirPath = path.dirname(filePath);
      await fs.mkdir(dirPath, { recursive: true });
      
      await fs.writeFile(filePath, content, 'utf-8');
      this.logger.log(`File written: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error writing file ${filePath}: ${error.message}`);
      throw error;
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      this.logger.log(`Directory created: ${dirPath}`);
    } catch (error) {
      this.logger.error(`Error creating directory ${dirPath}: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.log(`File deleted: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${filePath}: ${error.message}`);
      throw error;
    }
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      this.logger.log(`Directory deleted: ${dirPath}`);
    } catch (error) {
      this.logger.error(`Error deleting directory ${dirPath}: ${error.message}`);
      throw error;
    }
  }

  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destPath);
      await fs.mkdir(destDir, { recursive: true });
      
      await fs.copyFile(sourcePath, destPath);
      this.logger.log(`File copied from ${sourcePath} to ${destPath}`);
    } catch (error) {
      this.logger.error(`Error copying file from ${sourcePath} to ${destPath}: ${error.message}`);
      throw error;
    }
  }

  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destPath);
      await fs.mkdir(destDir, { recursive: true });
      
      await fs.rename(sourcePath, destPath);
      this.logger.log(`File moved from ${sourcePath} to ${destPath}`);
    } catch (error) {
      this.logger.error(`Error moving file from ${sourcePath} to ${destPath}: ${error.message}`);
      throw error;
    }
  }

  async searchFiles(directory: string, pattern: string, options: { caseSensitive?: boolean; includeContent?: boolean } = {}): Promise<FileItem[]> {
    const { caseSensitive = true, includeContent = false } = options;
    const results: FileItem[] = [];
    
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively search in subdirectories
          const subResults = await this.searchFiles(fullPath, pattern, options);
          results.push(...subResults);
        } else if (entry.isFile()) {
          // Check if filename matches pattern
          const fileNameMatch = caseSensitive 
            ? entry.name.includes(pattern)
            : entry.name.toLowerCase().includes(pattern.toLowerCase());
            
          if (fileNameMatch) {
            const stat = await fs.stat(fullPath);
            const fileItem: FileItem = {
              path: fullPath,
              name: entry.name,
              type: 'file',
              size: stat.size,
              modifiedAt: stat.mtime,
            };
            
            if (includeContent) {
              fileItem.content = await fs.readFile(fullPath, 'utf-8');
            }
            
            results.push(fileItem);
          } else if (includeContent) {
            // Search within file content
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              const contentMatch = caseSensitive
                ? content.includes(pattern)
                : content.toLowerCase().includes(pattern.toLowerCase());
                
              if (contentMatch) {
                const stat = await fs.stat(fullPath);
                results.push({
                  path: fullPath,
                  name: entry.name,
                  type: 'file',
                  size: stat.size,
                  modifiedAt: stat.mtime,
                  content,
                });
              }
            } catch (error) {
              // Skip files that can't be read (binary files, etc.)
              continue;
            }
          }
        }
      }
      
      return results;
    } catch (error) {
      this.logger.error(`Error searching files in ${directory}: ${error.message}`);
      throw error;
    }
  }

  async createWorkspace(workspaceName: string, basePath?: string): Promise<WorkspaceConfig> {
    try {
      const workspacePath = basePath 
        ? path.join(basePath, workspaceName)
        : path.join(os.homedir(), 'codepath-workspaces', workspaceName);
      
      await this.createDirectory(workspacePath);
      
      // Create basic workspace structure
      await this.createDirectory(path.join(workspacePath, 'src'));
      await this.createDirectory(path.join(workspacePath, 'tests'));
      await this.createDirectory(path.join(workspacePath, 'docs'));
      
      // Create basic files
      await this.writeFile(path.join(workspacePath, 'README.md'), `# ${workspaceName}\n\nProject description goes here.`);
      await this.writeFile(path.join(workspacePath, '.gitignore'), 'node_modules/\ndist/\n.env');
      
      const config: WorkspaceConfig = {
        name: workspaceName,
        rootPath: workspacePath,
        files: [
          path.join(workspacePath, 'README.md'),
          path.join(workspacePath, '.gitignore'),
          path.join(workspacePath, 'src'),
          path.join(workspacePath, 'tests'),
          path.join(workspacePath, 'docs'),
        ],
        git: false,
      };
      
      this.logger.log(`Workspace created: ${workspacePath}`);
      return config;
    } catch (error) {
      this.logger.error(`Error creating workspace ${workspaceName}: ${error.message}`);
      throw error;
    }
  }

  async getWorkspaceContext(workspacePath: string, maxDepth: number = 3): Promise<any> {
    try {
      const files = await this.listDirectory(workspacePath, { 
        recursive: true, 
        includeContent: false 
      });
      
      // Filter out large files and common ignore patterns
      const filteredFiles = files.filter(file => {
        // Skip common ignore patterns
        const relativePath = path.relative(workspacePath, file.path);
        const ignorePatterns = [
          'node_modules',
          '.git',
          'dist',
          'build',
          '.next',
          '__pycache__',
          '.vscode',
          '.idea',
          'target',
          '*.log',
          '*.tmp',
          '*.lock'
        ];
        
        return !ignorePatterns.some(pattern => 
          relativePath.includes(pattern) || 
          (pattern.startsWith('*.') && file.name.endsWith(pattern.substring(1)))
        ) && file.size < 1024 * 100; // Skip files larger than 100KB
      });
      
      // Limit depth
      const limitedFiles = filteredFiles.filter(file => {
        const relativePath = path.relative(workspacePath, file.path);
        const depth = relativePath.split(path.sep).length;
        return depth <= maxDepth;
      });
      
      return {
        workspacePath,
        totalFiles: files.length,
        scannedFiles: limitedFiles.length,
        files: limitedFiles.map(file => ({
          path: path.relative(workspacePath, file.path),
          size: file.size,
          modifiedAt: file.modifiedAt,
        })),
        structure: this.buildDirectoryStructure(limitedFiles, workspacePath),
      };
    } catch (error) {
      this.logger.error(`Error getting workspace context for ${workspacePath}: ${error.message}`);
      throw error;
    }
  }

  private buildDirectoryStructure(files: FileItem[], basePath: string): any {
    const structure = {};
    
    for (const file of files) {
      const relativePath = path.relative(basePath, file.path);
      const pathParts = relativePath.split(path.sep).filter(part => part !== '');
      
      let current = structure;
      
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        
        if (i === pathParts.length - 1) {
          // Last part is a file
          if (!current[part]) {
            current[part] = {
              type: 'file',
              size: file.size,
              modifiedAt: file.modifiedAt,
            };
          }
        } else {
          // Intermediate part is a directory
          if (!current[part]) {
            current[part] = { type: 'directory', children: {} };
          }
          current = current[part].children;
        }
      }
    }
    
    return structure;
  }
}