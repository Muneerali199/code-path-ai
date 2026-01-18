import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';

export interface ChatRequest {
  message: string;
  provider?: 'openai' | 'claude' | 'gemini' | 'local';
  mode?: 'explain' | 'create';
  context?: {
    files?: Array<{ path: string; content: string }>;
    activeFile?: string;
  };
}

export interface ChatResponse {
  response: string;
  provider: string;
  mode: string;
}

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send message to AI assistant' })
  @ApiBody({ type: ChatRequest })
  @ApiResponse({ status: 200, type: ChatResponse })
  async chat(@Body() chatRequest: ChatRequest): Promise<ChatResponse> {
    return this.aiService.chat(chatRequest);
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get available AI providers' })
  @ApiResponse({ status: 200, type: [String] })
  getProviders(): string[] {
    return this.aiService.getAvailableProviders();
  }

  @Get('models')
  @ApiOperation({ summary: 'Get available models for provider' })
  @ApiResponse({ status: 200, type: [String] })
  getModels(@Query('provider') provider: string): string[] {
    return this.aiService.getModelsForProvider(provider);
  }
}
