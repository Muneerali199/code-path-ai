import { Controller, Post, Body, Get, Query, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EnhancedAiService } from './enhanced-ai.service';

// DTOs for enhanced AI services
export class CodeAnalysisDto {
  code: string;
  language: string;
  analysisType: 'security' | 'performance' | 'best-practices' | 'refactoring';
  context?: {
    filename?: string;
    dependencies?: string[];
    framework?: string;
  };
}

export class CodeGenerationDto {
  description: string;
  language: string;
  framework?: string;
  requirements?: string[];
  context?: {
    existingCode?: string;
    files?: Array<{ path: string; content: string }>;
  };
}

export class DebuggingDto {
  error: string;
  code?: string;
  stackTrace?: string;
  context?: {
    environment?: string;
    runtime?: string;
  };
}

export class ExplainCodeDto {
  code: string;
  language: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export class TransformCodeDto {
  code: string;
  fromLanguage: string;
  toLanguage: string;
  context?: any;
}

export class PullRequestReviewDto {
  diff: string;
  context?: any;
}

export class GenerateTestsDto {
  code: string;
  language: string;
  framework?: string;
  context?: any;
}

@ApiTags('Enhanced AI')
@Controller('ai/enhanced')
export class EnhancedAiController {
  constructor(private readonly enhancedAiService: EnhancedAiService) {}

  @Post('analyze-code')
  @ApiOperation({ summary: 'Analyze code for security, performance, or best practices' })
  @ApiBody({ type: CodeAnalysisDto })
  @ApiResponse({ status: 200, description: 'Code analysis results' })
  async analyzeCode(@Body() request: CodeAnalysisDto) {
    return this.enhancedAiService.analyzeCode(request);
  }

  @Post('generate-code')
  @ApiOperation({ summary: 'Generate code based on description and requirements' })
  @ApiBody({ type: CodeGenerationDto })
  @ApiResponse({ status: 200, description: 'Generated code' })
  async generateCode(@Body() request: CodeGenerationDto) {
    return this.enhancedAiService.generateCode(request);
  }

  @Post('debug-code')
  @ApiOperation({ summary: 'Debug code based on error messages' })
  @ApiBody({ type: DebuggingDto })
  @ApiResponse({ status: 200, description: 'Debugging solution' })
  async debugCode(@Body() request: DebuggingDto) {
    return this.enhancedAiService.debugCode(request);
  }

  @Post('explain-code')
  @ApiOperation({ summary: 'Explain complex code concepts' })
  @ApiBody({ type: ExplainCodeDto })
  @ApiResponse({ status: 200, description: 'Code explanation' })
  async explainCode(@Body() request: ExplainCodeDto) {
    return this.enhancedAiService.explainCode(
      request.code, 
      request.language, 
      request.level
    );
  }

  @Post('transform-code')
  @ApiOperation({ summary: 'Transform code from one language to another' })
  @ApiBody({ type: TransformCodeDto })
  @ApiResponse({ status: 200, description: 'Transformed code' })
  async transformCode(@Body() request: TransformCodeDto) {
    return this.enhancedAiService.transformCode(
      request.code,
      request.fromLanguage,
      request.toLanguage,
      request.context
    );
  }

  @Post('review-pr')
  @ApiOperation({ summary: 'Review pull request changes' })
  @ApiBody({ type: PullRequestReviewDto })
  @ApiResponse({ status: 200, description: 'Pull request review' })
  async reviewPullRequest(@Body() request: PullRequestReviewDto) {
    return this.enhancedAiService.reviewPullRequest(
      request.diff,
      request.context
    );
  }

  @Post('generate-tests')
  @ApiOperation({ summary: 'Generate unit tests for code' })
  @ApiBody({ type: GenerateTestsDto })
  @ApiResponse({ status: 200, description: 'Generated tests' })
  async generateTests(@Body() request: GenerateTestsDto) {
    return this.enhancedAiService.generateTests(
      request.code,
      request.language,
      request.framework,
      request.context
    );
  }
}