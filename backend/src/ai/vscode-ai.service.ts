import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AiService } from './ai.service';
import { EnhancedAiService } from './enhanced-ai.service';
import { VscodeRequestDto } from './vscode-ai.controller';

export interface ModelRoute {
  action: string;
  complexity: 'simple' | 'complex';
  priority: number;
  provider: string;
  model?: string;
}

export interface ModelCatalogEntry {
  id: string;
  label: string;
  provider: string;
  category: 'trending' | 'china' | 'other';
}

@Injectable()
export class VscodeAiService {
  private readonly logger = new Logger(VscodeAiService.name);

  constructor(
    private aiService: AiService,
    private enhancedAiService: EnhancedAiService,
  ) {}

  /**
   * Process a VSCode extension request and route to appropriate AI model
   */
  async processRequest(request: VscodeRequestDto): Promise<any> {
    const { action, code, message, language } = request;

    this.logger.log(`Processing VSCode request: ${action} for ${language || 'unknown language'}`);

    // Validate that the request has proper authentication context
    // (This would be checked by the guard in the controller, but we can add additional validation here)

    // Determine the appropriate model based on action and complexity
    const modelRoute = this.determineModelRoute(request);

    try {
      let result: any;

      switch (action) {
        case 'explain':
          result = await this.handleExplainRequest(request, modelRoute);
          break;

        case 'generate':
          result = await this.handleGenerateRequest(request, modelRoute);
          break;

        case 'debug':
          result = await this.handleDebugRequest(request, modelRoute);
          break;

        case 'analyze':
          result = await this.handleAnalyzeRequest(request, modelRoute);
          break;

        case 'refactor':
          result = await this.handleRefactorRequest(request, modelRoute);
          break;

        case 'create':
          result = await this.handleCreateRequest(request, modelRoute);
          break;

        default:
          throw new BadRequestException(`Unsupported action: ${action}`);
      }

      return {
        ...result,
        modelUsed: modelRoute.provider,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error processing VSCode request: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to process request: ${error.message}`);
    }
  }

  /**
   * Determines which model to use based on the request characteristics
   */
  private determineModelRoute(request: VscodeRequestDto): ModelRoute {
    const { action, code, message, provider: requestedProvider, model: requestedModel } = request;

    // Determine complexity based on request characteristics
    let complexity: 'simple' | 'complex' = 'simple';

    // Simple tasks - use cheaper models
    const simpleActions = ['explain', 'generate']; // For small code snippets
    const isSimpleAction = simpleActions.includes(action);

    // Complex tasks - use stronger models
    const complexIndicators = [
      code && code.length > 500, // Large code blocks
      message && message.toLowerCase().includes('architecture'),
      message && message.toLowerCase().includes('design'),
      message && message.toLowerCase().includes('pattern'),
      message && message.toLowerCase().includes('optimize'),
      message && (message.toLowerCase().includes('security') || message.toLowerCase().includes('vulnerability')),
      message && (message.toLowerCase().includes('performance') || message.toLowerCase().includes('slow'))
    ];

    const hasComplexIndicator = complexIndicators.some(indicator => indicator);

    // If it's not a simple action OR has complex indicators, use complex model
    if (!isSimpleAction || hasComplexIndicator) {
      complexity = 'complex';
    }

    // Model selection logic
    let provider: string;

    if (complexity === 'simple') {
      // Use cheaper models for simple tasks
      provider = 'mistral'; // Mistral is typically cost-effective
    } else {
      // Use stronger models for complex tasks
      provider = 'claude'; // Claude is good for complex reasoning
    }

    // Special cases for specific actions
    switch (action) {
      case 'analyze':
        // Security/performance analysis needs strong reasoning
        provider = 'claude';
        complexity = 'complex';
        break;

      case 'debug':
        // Debugging often requires complex reasoning
        provider = 'claude';
        complexity = 'complex';
        break;

      case 'refactor':
        // Refactoring requires understanding context and implications
        provider = 'claude';
        complexity = 'complex';
        break;
    }

    if (requestedProvider) {
      provider = requestedProvider;
    }

    this.logger.log(`Routing request to ${provider} model (complexity: ${complexity})`);

    return {
      action,
      complexity,
      priority: complexity === 'complex' ? 2 : 1,
      provider,
      model: requestedModel
    };
  }

  private async handleExplainRequest(request: VscodeRequestDto, modelRoute: ModelRoute): Promise<any> {
    if (!request.code) {
      throw new BadRequestException('Code is required for explanation');
    }

    // Use enhanced service for detailed explanations
    if (modelRoute.complexity === 'complex') {
      return await this.enhancedAiService.explainCode(
        request.code,
        request.language || 'javascript',
        'intermediate' // Default to intermediate level
      );
    } else {
      // Use basic AI service for simpler explanations
      const response = await this.aiService.chat({
        message: `Explain the following ${request.language || 'code'}:\n\n${request.code}`,
        provider: modelRoute.provider as any,
        model: modelRoute.model,
        apiKey: request.userApiKey,
        mode: 'explain'
      });

      return {
        explanation: response.response,
        language: request.language,
        level: 'beginner'
      };
    }
  }

  private async handleGenerateRequest(request: VscodeRequestDto, modelRoute: ModelRoute): Promise<any> {
    if (!request.message) {
      throw new BadRequestException('Message/description is required for code generation');
    }

    // Use enhanced service for better code generation
    if (modelRoute.complexity === 'complex') {
      return await this.enhancedAiService.generateCode({
        description: request.message,
        language: request.language || 'javascript',
        framework: request.context?.projectContext,
        context: {
          existingCode: request.code,
          files: [] // Could include related files if available
        }
      });
    } else {
      // Use basic AI service for simpler generation
      const response = await this.aiService.chat({
        message: `Generate ${request.language || 'JavaScript'} code based on this description: ${request.message}`,
        provider: modelRoute.provider as any,
        model: modelRoute.model,
        apiKey: request.userApiKey,
        mode: 'create',
        context: {
          files: request.context ? [{ path: request.context.fileName || 'unknown', content: request.code || '' }] : []
        }
      });

      return {
        generatedCode: response.response,
        language: request.language
      };
    }
  }

  private async handleDebugRequest(request: VscodeRequestDto, modelRoute: ModelRoute): Promise<any> {
    if (!request.message) {
      throw new BadRequestException('Error message is required for debugging');
    }

    // Use enhanced service for better debugging
    if (modelRoute.complexity === 'complex') {
      return await this.enhancedAiService.debugCode({
        error: request.message,
        code: request.code,
        stackTrace: request.context?.editorContext?.followingLines, // Using following lines as proxy for stack trace
        context: {
          environment: 'development',
          runtime: request.language
        }
      });
    } else {
      // Use basic AI service for simpler debugging
      const fullMessage = `Debug this error: ${request.message}\n\nCode: ${request.code || 'No code provided'}`;
      const response = await this.aiService.chat({
        message: fullMessage,
        provider: modelRoute.provider as any,
        model: modelRoute.model,
        apiKey: request.userApiKey,
        mode: 'explain'
      });

      return {
        solution: response.response,
        error: request.message
      };
    }
  }

  private async handleAnalyzeRequest(request: VscodeRequestDto, modelRoute: ModelRoute): Promise<any> {
    if (!request.code) {
      throw new BadRequestException('Code is required for analysis');
    }

    // Determine analysis type from message
    let analysisType: 'security' | 'performance' | 'best-practices' | 'refactoring' = 'best-practices';

    const messageLower = request.message?.toLowerCase() || '';
    if (messageLower.includes('security') || messageLower.includes('vulnerability')) {
      analysisType = 'security';
    } else if (messageLower.includes('performance') || messageLower.includes('slow') || messageLower.includes('memory')) {
      analysisType = 'performance';
    } else if (messageLower.includes('refactor') || messageLower.includes('improve')) {
      analysisType = 'refactoring';
    }

    // Use enhanced service for analysis
    return await this.enhancedAiService.analyzeCode({
      code: request.code,
      language: request.language || 'javascript',
      analysisType,
      context: {
        filename: request.context?.fileName,
        dependencies: [], // Could extract from project context
        framework: request.context?.projectContext
      }
    });
  }

  private async handleRefactorRequest(request: VscodeRequestDto, modelRoute: ModelRoute): Promise<any> {
    if (!request.code) {
      throw new BadRequestException('Code is required for refactoring');
    }

    // For refactoring, we'll use the enhanced service with Claude for best results
    const response = await this.aiService.chat({
      message: `Refactor the following ${request.language || 'code'} to improve readability, performance, and maintainability:\n\n${request.code}`,
      provider: modelRoute.provider as any,
      model: modelRoute.model,
      apiKey: request.userApiKey,
      mode: 'create'
    });

    return {
      refactoredCode: response.response,
      originalCode: request.code,
      language: request.language
    };
  }

  private async handleCreateRequest(request: VscodeRequestDto, modelRoute: ModelRoute): Promise<any> {
    if (!request.message) {
      throw new BadRequestException('Message/description is required for creation');
    }

    // Use enhanced service for creation tasks
    if (modelRoute.complexity === 'complex') {
      return await this.enhancedAiService.generateCode({
        description: request.message,
        language: request.language || 'javascript',
        framework: request.context?.projectContext,
        context: {
          existingCode: request.code,
          files: [] // Could include related files if available
        }
      });
    } else {
      // Use basic AI service for simpler creation
      const response = await this.aiService.chat({
        message: `Create ${request.language || 'JavaScript'} code based on this: ${request.message}`,
        provider: modelRoute.provider as any,
        model: modelRoute.model,
        apiKey: request.userApiKey,
        mode: 'create'
      });

      return {
        createdCode: response.response,
        language: request.language
      };
    }
  }

  getModelCatalog(): ModelCatalogEntry[] {
    return [
      { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai', category: 'trending' },
      { id: 'gpt-4.1', label: 'GPT-4.1', provider: 'openai', category: 'trending' },
      { id: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'anthropic', category: 'trending' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'google', category: 'trending' },
      { id: 'mistral-large', label: 'Mistral Large', provider: 'mistral', category: 'trending' },
      { id: 'qwen2.5-72b-instruct', label: 'Qwen 2.5 72B Instruct', provider: 'qwen', category: 'china' },
      { id: 'deepseek-r1', label: 'DeepSeek R1', provider: 'deepseek', category: 'china' },
      { id: 'yi-34b-chat', label: 'Yi 34B Chat', provider: 'yi', category: 'china' },
      { id: 'glm-4', label: 'GLM-4', provider: 'zhipu', category: 'china' },
      { id: 'moonshot-v1', label: 'Moonshot v1', provider: 'moonshot', category: 'china' }
    ];
  }
}
