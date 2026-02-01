import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';

import { IsString, IsOptional, IsObject, IsArray, IsBoolean } from 'class-validator';

export class ChatRequest {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;

  @IsOptional()
  @IsString()
  provider?: 'openai' | 'claude' | 'gemini' | 'local' | 'deepseek' | 'mistral';

  @IsOptional()
  @IsString()
  mode?: 'explain' | 'create';

  @IsOptional()
  @IsBoolean()
  enableResearch?: boolean;

  @IsOptional()
  @IsObject()
  context?: {
    files?: Array<{ path: string; content: string }>;
    activeFile?: string;
  };
}

export class ChatResponse {
  @IsString()
  response: string;

  @IsString()
  provider: string;

  @IsString()
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
