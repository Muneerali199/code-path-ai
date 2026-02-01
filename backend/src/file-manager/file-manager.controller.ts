import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { FileManagerService } from './file-manager.service';

export class ListDirectoryDto {
  dirPath: string;
  recursive?: boolean;
  includeContent?: boolean;
}

export class ReadFileDto {
  filePath: string;
}

export class WriteFileDto {
  filePath: string;
  content: string;
}

export class CreateDirectoryDto {
  dirPath: string;
}

export class CopyMoveFileDto {
  sourcePath: string;
  destPath: string;
}

export class SearchFilesDto {
  directory: string;
  pattern: string;
  caseSensitive?: boolean;
  includeContent?: boolean;
}

export class CreateWorkspaceDto {
  workspaceName: string;
  basePath?: string;
}

@ApiTags('File Manager')
@Controller('files')
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Get('list')
  @ApiOperation({ summary: 'List directory contents' })
  @ApiResponse({ status: 200, description: 'Directory contents listed successfully' })
  async listDirectory(
    @Query('dirPath') dirPath: string,
    @Query('recursive') recursive?: string,
    @Query('includeContent') includeContent?: string
  ) {
    return this.fileManagerService.listDirectory(dirPath, { 
      recursive: recursive === 'true', 
      includeContent: includeContent === 'true' 
    });
  }

  @Get('read')
  @ApiOperation({ summary: 'Read a file' })
  @ApiResponse({ status: 200, description: 'File content retrieved successfully' })
  async readFile(@Query('filePath') filePath: string) {
    return this.fileManagerService.readFile(filePath);
  }

  @Post('write')
  @ApiOperation({ summary: 'Write content to a file' })
  @ApiBody({ type: WriteFileDto })
  @ApiResponse({ status: 200, description: 'File written successfully' })
  async writeFile(@Body('filePath') filePath: string, @Body('content') content: string) {
    await this.fileManagerService.writeFile(filePath, content);
    return { success: true, message: 'File written successfully' };
  }

  @Post('mkdir')
  @ApiOperation({ summary: 'Create a directory' })
  @ApiBody({ type: CreateDirectoryDto })
  @ApiResponse({ status: 200, description: 'Directory created successfully' })
  async createDirectory(@Body('dirPath') dirPath: string) {
    await this.fileManagerService.createDirectory(dirPath);
    return { success: true, message: 'Directory created successfully' };
  }

  @Delete('delete-file')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Query('filePath') filePath: string) {
    await this.fileManagerService.deleteFile(filePath);
    return { success: true, message: 'File deleted successfully' };
  }

  @Delete('delete-dir')
  @ApiOperation({ summary: 'Delete a directory' })
  @ApiResponse({ status: 200, description: 'Directory deleted successfully' })
  async deleteDirectory(@Query('dirPath') dirPath: string) {
    await this.fileManagerService.deleteDirectory(dirPath);
    return { success: true, message: 'Directory deleted successfully' };
  }

  @Post('copy')
  @ApiOperation({ summary: 'Copy a file' })
  @ApiBody({ type: CopyMoveFileDto })
  @ApiResponse({ status: 200, description: 'File copied successfully' })
  async copyFile(@Body('sourcePath') sourcePath: string, @Body('destPath') destPath: string) {
    await this.fileManagerService.copyFile(sourcePath, destPath);
    return { success: true, message: 'File copied successfully' };
  }

  @Post('move')
  @ApiOperation({ summary: 'Move a file' })
  @ApiBody({ type: CopyMoveFileDto })
  @ApiResponse({ status: 200, description: 'File moved successfully' })
  async moveFile(@Body('sourcePath') sourcePath: string, @Body('destPath') destPath: string) {
    await this.fileManagerService.moveFile(sourcePath, destPath);
    return { success: true, message: 'File moved successfully' };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for files by name or content' })
  @ApiResponse({ status: 200, description: 'Files matching the search pattern' })
  async searchFiles(
    @Query('directory') directory: string,
    @Query('pattern') pattern: string,
    @Query('caseSensitive') caseSensitive?: string,
    @Query('includeContent') includeContent?: string
  ) {
    return this.fileManagerService.searchFiles(directory, pattern, { 
      caseSensitive: caseSensitive === 'true', 
      includeContent: includeContent === 'true' 
    });
  }

  @Post('workspace/create')
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiBody({ type: CreateWorkspaceDto })
  @ApiResponse({ status: 200, description: 'Workspace created successfully' })
  async createWorkspace(
    @Body('workspaceName') workspaceName: string,
    @Body('basePath') basePath?: string
  ) {
    return this.fileManagerService.createWorkspace(workspaceName, basePath);
  }

  @Get('workspace/context')
  @ApiOperation({ summary: 'Get workspace context for AI analysis' })
  @ApiResponse({ status: 200, description: 'Workspace context retrieved successfully' })
  async getWorkspaceContext(
    @Query('workspacePath') workspacePath: string,
    @Query('maxDepth') maxDepth?: number
  ) {
    return this.fileManagerService.getWorkspaceContext(workspacePath, maxDepth ? parseInt(maxDepth.toString()) : 3);
  }
}