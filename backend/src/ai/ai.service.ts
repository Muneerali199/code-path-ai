import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private claude: Anthropic;
  private gemini: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    this.claude = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });

    this.gemini = new GoogleGenerativeAI(
      this.configService.get<string>('GOOGLE_AI_API_KEY')
    );
  }

  async chat(request: {
    message: string;
    provider?: 'openai' | 'claude' | 'gemini' | 'local';
    mode?: 'explain' | 'create';
    context?: {
      files?: Array<{ path: string; content: string }>;
      activeFile?: string;
    };
  }) {
    const provider = request.provider || 'openai';
    const mode = request.mode || 'explain';

    this.logger.log(`Processing chat request with provider: ${provider}, mode: ${mode}`);

    try {
      let response: string;

      switch (provider) {
        case 'openai':
          response = await this.chatWithOpenAI(request, mode);
          break;
        case 'claude':
          response = await this.chatWithClaude(request, mode);
          break;
        case 'gemini':
          response = await this.chatWithGemini(request, mode);
          break;
        case 'local':
          response = await this.chatWithLocal(request, mode);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      return {
        response,
        provider,
        mode,
      };
    } catch (error) {
      this.logger.error(`Error processing chat request: ${error.message}`);
      throw error;
    }
  }

  private async chatWithOpenAI(request: any, mode: string): Promise<string> {
    const systemPrompt = this.getSystemPrompt(mode, request.context);
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.message },
      ],
      stream: false,
    });

    return completion.choices[0]?.message?.content || 'No response from OpenAI';
  }

  private async chatWithClaude(request: any, mode: string): Promise<string> {
    const systemPrompt = this.getSystemPrompt(mode, request.context);
    
    const message = await this.claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: request.message },
      ],
    });

    return message.content[0]?.type === 'text' 
      ? message.content[0].text 
      : 'No response from Claude';
  }

  private async chatWithGemini(request: any, mode: string): Promise<string> {
    const systemPrompt = this.getSystemPrompt(mode, request.context);
    
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const chat = model.startChat({
      history: [],
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(request.message);
    return result.response.text() || 'No response from Gemini';
  }

  private async chatWithLocal(request: any, mode: string): Promise<string> {
    // Placeholder for local LLM integration
    // You can integrate Ollama, LM Studio, or other local models here
    return 'Local AI model integration not implemented yet. Please configure an AI provider.';
  }

  private getSystemPrompt(mode: string, context?: any): string {
    const basePrompt = `You are CodePath AI Coach, an expert programming assistant. 
You help users understand code, debug issues, and build applications.

Current context:
${context?.files ? `Files in workspace:\n${context.files.map(f => `- ${f.path}`).join('\n')}` : ''}
${context?.activeFile ? `Active file: ${context.activeFile}` : ''}`;

    if (mode === 'explain') {
      return `${basePrompt}

Your role is to EXPLAIN code concepts, patterns, and architecture.
Focus on:
- Clear explanations of what the code does
- Why certain patterns are used
- Best practices and potential improvements
- Breaking down complex concepts into simple terms

Be educational and thorough in your explanations.`;
    }

    if (mode === 'create') {
      return `${basePrompt}

Your role is to CREATE new code, features, or applications.
Focus on:
- Writing clean, production-ready code
- Following best practices and conventions
- Providing complete, working solutions
- Including necessary imports and setup

Be practical and provide actionable code solutions.`;
    }

    return basePrompt;
  }

  getAvailableProviders(): string[] {
    return ['openai', 'claude', 'gemini', 'local'];
  }

  getModelsForProvider(provider: string): string[] {
    const models = {
      openai: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
      claude: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
      gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
      local: ['custom-model'],
    };

    return models[provider] || [];
  }
}
