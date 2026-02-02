import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResearchService } from './research.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private deepseek: OpenAI;
  private mistral: OpenAI;
  private claude: Anthropic;
  private gemini: GoogleGenerativeAI;

  constructor(private configService: ConfigService, private researchService: ResearchService) {
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
      });
    }

    const deepseekKey = this.configService.get<string>('DEEPSEEK_API_KEY') || process.env.DEEPSEEK_API_KEY;
    if (deepseekKey) {
      this.deepseek = new OpenAI({
        apiKey: deepseekKey,
        baseURL: 'https://api.deepseek.com',
      });
    }

    const mistralKey = this.configService.get<string>('MISTRAL_API_KEY') || process.env.MISTRAL_API_KEY;
    if (mistralKey) {
      this.mistral = new OpenAI({
        apiKey: mistralKey,
        baseURL: 'https://api.mistral.ai/v1',
      });
    }

    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (anthropicKey) {
      this.claude = new Anthropic({
        apiKey: anthropicKey,
      });
    }

    const googleKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (googleKey) {
      this.gemini = new GoogleGenerativeAI(googleKey);
    }
  }

  async chat(request: {
    message: string;
    messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    provider?: 'openai' | 'claude' | 'gemini' | 'local' | 'deepseek' | 'mistral';
    mode?: 'explain' | 'create';
    enableResearch?: boolean;
    context?: {
      files?: Array<{ path: string; content: string }>;
      activeFile?: string;
      researchData?: string;
    };
  }) {
    const provider = request.provider || 'mistral';
    const mode = request.mode || 'explain';

    this.logger.log(`Processing chat request with provider: ${provider}, mode: ${mode}, research: ${request.enableResearch}`);

    try {
      let response: string;
      let researchContext = '';

      if (request.enableResearch || this.isResearchQuery(request.message)) {
        this.logger.log('Performing research for query...');
        try {
          const searchResults = await this.researchService.search(request.message);
          researchContext = await this.researchService.enrichWithAI(request.message, searchResults.results);
          this.logger.log(`Research completed with ${searchResults.results.length} results`);
        } catch (error) {
          this.logger.warn(`Research failed: ${error.message}`);
        }
      }

      const enrichedRequest = {
        ...request,
        context: {
          ...request.context,
          researchData: researchContext,
        },
      };

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
        case 'deepseek':
          response = await this.chatWithDeepSeek(request, mode);
          break;
        case 'mistral':
          response = await this.chatWithMistral(enrichedRequest, mode);
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
        researchPerformed: !!researchContext,
      };
    } catch (error) {
      this.logger.error(`Error processing chat request: ${error.message}`);
      throw error;
    }
  }

  private isResearchQuery(message: string): boolean {
    const researchKeywords = [
      'research', 'find information', 'search for', 'tell me about', 
      'what is', 'who is', 'how does', 'explain about',
      'latest news', 'current', 'updates on', 'information about'
    ];
    
    const lowerMessage = message.toLowerCase();
    return researchKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async chatWithOpenAI(request: any, mode: string): Promise<string> {
    if (!this.openai) {
      // In development, provide a mock response if API key is not configured
      if (process.env.NODE_ENV !== 'production') {
        return `This is a simulated response from OpenAI.\n\nSelected code: ${request.code || request.message || 'No code provided'}\n\nFor a real response, please configure your OpenAI API key.`;
      }
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment.');
    }
    
    const systemPrompt = this.getSystemPrompt(mode);
    
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
    if (!this.claude) {
      // In development, provide a mock response if API key is not configured
      if (process.env.NODE_ENV !== 'production') {
        return `This is a simulated response from Claude AI.\n\nSelected code: ${request.code || request.message || 'No code provided'}\n\nFor a real response, please configure your Anthropic API key.`;
      }
      throw new Error('Anthropic API key not configured. Please set ANTHROPIC_API_KEY in your environment.');
    }
    
    const systemPrompt = this.getSystemPrompt(mode);
    
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
    if (!this.gemini) {
      // In development, provide a mock response if API key is not configured
      if (process.env.NODE_ENV !== 'production') {
        return `This is a simulated response from Google Gemini AI.\n\nSelected code: ${request.code || request.message || 'No code provided'}\n\nFor a real response, please configure your Google AI API key.`;
      }
      throw new Error('Google AI API key not configured. Please set GOOGLE_AI_API_KEY in your environment.');
    }
    
    const systemPrompt = this.getSystemPrompt(mode);
    
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const chat = model.startChat({
      history: [],
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(request.message);
    return result.response.text() || 'No response from Gemini';
  }

  private async chatWithDeepSeek(request: any, mode: string): Promise<string> {
    if (!this.deepseek) {
      // In development, provide a mock response if API key is not configured
      if (process.env.NODE_ENV !== 'production') {
        return `This is a simulated response from DeepSeek AI.\n\nSelected code: ${request.code || request.message || 'No code provided'}\n\nFor a real response, please configure your DeepSeek API key.`;
      }
      throw new Error('DeepSeek API key not configured.');
    }
    
    const systemPrompt = this.getSystemPrompt(mode);
    const messages = request.messages || [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: request.message },
    ];
    
    if (request.messages && !messages.find(m => m.role === 'system')) {
      messages.unshift({ role: 'system', content: systemPrompt });
    }

    const completion = await this.deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      stream: false,
    });

    return completion.choices[0]?.message?.content || 'No response from DeepSeek';
  }

  private async chatWithMistral(request: any, mode: string): Promise<string> {
    if (!this.mistral) {
      // In development, provide a mock response if API key is not configured
      if (process.env.NODE_ENV !== 'production') {
        return `This is a simulated response from Mistral AI.\n\nSelected code: ${request.code || request.message || 'No code provided'}\n\nFor a real response, please configure your Mistral API key.`;
      }
      throw new Error('Mistral API key not configured. Please set MISTRAL_API_KEY in your environment.');
    }
    
    const systemPrompt = this.getSystemPrompt(mode);
    
    let messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
    
    messages.push({ role: 'system', content: systemPrompt });
    
    if (request.messages && Array.isArray(request.messages)) {
      for (const msg of request.messages) {
        let role: 'user' | 'assistant' | 'system' = 'user';
        if (msg.role === 'assistant' || msg.role === 'sage' || msg.role === 'forge') {
          role = 'assistant';
        } else if (msg.role === 'system') {
          role = 'system';
        }
        
        if (msg.content) {
          messages.push({ role, content: msg.content });
        }
      }
    }
    
    let userMessage = request.message;
    if (request.context?.researchData) {
      userMessage = `Web Research:\n${request.context.researchData}\n\nQuestion: ${request.message}`;
    }
    messages.push({ role: 'user', content: userMessage });
    
    const systemMessages = messages.filter(m => m.role === 'system');
    if (systemMessages.length > 1) {
      messages = messages.filter((m, idx) => {
        if (m.role === 'system' && idx > 0) return false;
        return true;
      });
    }

    try {
      this.logger.debug(`[Mistral] Sending ${messages.length} messages, mode: ${mode}`);
      
      const completion = await this.mistral.chat.completions.create({
        model: 'mistral-large-latest',
        messages: messages as any,
        max_tokens: 4096,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        this.logger.error('[Mistral] Empty response from API');
        return 'No response from Mistral';
      }
      
      return response;
    } catch (error: any) {
      this.logger.error(`[Mistral] Error: ${error.message}`);
      this.logger.error(`[Mistral] Status: ${error.status}`);
      throw error;
    }
  }

  private async chatWithLocal(request: any, mode: string): Promise<string> {
    return 'Local AI model integration not implemented yet.';
  }

  private getSystemPrompt(mode: string): string {
    if (mode === 'explain') {
      return `You are CodePath AI, a programming expert. Provide clear, well-structured explanations using markdown. Use headers, code blocks, and examples to illustrate concepts. Explain both the what and why behind solutions.`;
    } else if (mode === 'create') {
      return `You are CodePath Forge, an expert code generation assistant. Generate clean, production-ready code with clear comments. Explain your implementation decisions and provide usage examples.`;
    }
    
    return `You are CodePath AI, a helpful programming assistant. Provide thoughtful responses with code examples.`;
  }

  getAvailableProviders(): string[] {
    return ['openai', 'claude', 'gemini', 'deepseek', 'mistral', 'local'];
  }

  getModelsForProvider(provider: string): string[] {
    const models = {
      openai: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
      claude: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
      gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
      deepseek: ['deepseek-chat', 'deepseek-coder'],
      mistral: ['mistral-tiny', 'mistral-small', 'mistral-medium', 'mistral-large-latest'],
      local: ['custom-model'],
    };

    return models[provider] || [];
  }
}
