import { Controller, Post, Body, Get, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { VscodeAiService } from './vscode-ai.service';
import type { Request } from 'express';
import { ApiKeyGuard } from '../auth/api-key.guard';

// Define DTOs for VSCode extension requests
export class VscodeRequestDto {
  code?: string;
  message?: string;
  language?: string;
  action: 'explain' | 'generate' | 'debug' | 'analyze' | 'refactor' | 'create';
  context?: {
    fileName?: string;
    filePath?: string;
    projectContext?: string;
    selectionRange?: {
      startLine: number;
      endLine: number;
    };
    editorContext?: {
      precedingLines?: string;
      followingLines?: string;
    };
  };
  userId?: string;
  sessionId?: string;
}

export class VscodeResponseDto {
  success: boolean;
  data?: any;
  error?: string;
  modelUsed?: string;
  executionTime?: number;
}

@ApiTags('VSCode AI')
@Controller('ai/vscode')
export class VscodeAiController {
  constructor(private readonly vscodeAiService: VscodeAiService) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Process VSCode extension AI request' })
  @ApiBody({ type: VscodeRequestDto })
  @ApiResponse({ status: 200, type: VscodeResponseDto })
  async processRequest(
    @Body() request: VscodeRequestDto,
    @Req() req: Request
  ): Promise<VscodeResponseDto> {
    const startTime = Date.now();

    try {
      // Determine the appropriate model based on the request
      const result = await this.vscodeAiService.processRequest(request);

      return {
        success: true,
        data: result,
        modelUsed: result.modelUsed,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Internal server error',
        executionTime: Date.now() - startTime,
      };
    }
  }

  @Get('capabilities')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Get VSCode extension capabilities' })
  @ApiResponse({ status: 200, description: 'Capabilities information' })
  getCapabilities(): any {
    return {
      actions: ['explain', 'generate', 'debug', 'analyze', 'refactor', 'create'],
      supportedLanguages: [
        'javascript', 'typescript', 'python', 'java', 'go', 'rust',
        'csharp', 'cpp', 'html', 'css', 'json', 'yaml', 'markdown'
      ],
      features: [
        'Code explanation',
        'Code generation',
        'Bug detection and debugging',
        'Code analysis (security, performance)',
        'Code refactoring',
        'Test generation'
      ]
    };
  }
}