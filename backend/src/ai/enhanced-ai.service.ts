import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  analysisType: 'security' | 'performance' | 'best-practices' | 'refactoring';
  context?: {
    filename?: string;
    dependencies?: string[];
    framework?: string;
  };
}

export interface CodeGenerationRequest {
  description: string;
  language: string;
  framework?: string;
  requirements?: string[];
  context?: {
    existingCode?: string;
    files?: Array<{ path: string; content: string }>;
  };
}

export interface DebuggingRequest {
  error: string;
  code?: string;
  stackTrace?: string;
  context?: {
    environment?: string;
    runtime?: string;
  };
}

@Injectable()
export class EnhancedAiService {
  private readonly logger = new Logger(EnhancedAiService.name);
  private openai: OpenAI;
  private claude: Anthropic;
  private gemini: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
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

  /**
   * Analyzes code for security vulnerabilities, performance issues, or best practices
   */
  async analyzeCode(request: CodeAnalysisRequest): Promise<any> {
    const { code, language, analysisType, context } = request;
    
    if (!code || !language) {
      throw new BadRequestException('Code and language are required for analysis');
    }

    this.logger.log(`Analyzing code for ${analysisType} issues in ${language}`);

    try {
      let prompt = this.buildCodeAnalysisPrompt(code, language, analysisType, context);
      
      const response = await this.generateText(prompt, 'openai'); // Using OpenAI for code analysis
      
      return {
        analysisType,
        language,
        findings: this.parseAnalysisResponse(response),
        rawResponse: response,
      };
    } catch (error) {
      this.logger.error(`Error analyzing code: ${error.message}`);
      throw new InternalServerErrorException(`Failed to analyze code: ${error.message}`);
    }
  }

  /**
   * Generates code based on a description and requirements
   */
  async generateCode(request: CodeGenerationRequest): Promise<any> {
    const { description, language, framework, requirements, context } = request;
    
    if (!description || !language) {
      throw new BadRequestException('Description and language are required for code generation');
    }

    this.logger.log(`Generating code in ${language}${framework ? ` using ${framework}` : ''}`);

    try {
      let prompt = this.buildCodeGenerationPrompt(description, language, framework, requirements, context);
      
      const response = await this.generateText(prompt, 'openai'); // Using OpenAI for code generation
      
      return {
        language,
        framework,
        generatedCode: response,
        requirements,
      };
    } catch (error) {
      this.logger.error(`Error generating code: ${error.message}`);
      throw new InternalServerErrorException(`Failed to generate code: ${error.message}`);
    }
  }

  /**
   * Debugs code based on error messages and stack traces
   */
  async debugCode(request: DebuggingRequest): Promise<any> {
    const { error, code, stackTrace, context } = request;
    
    if (!error) {
      throw new BadRequestException('Error message is required for debugging');
    }

    this.logger.log(`Debugging error: ${error.substring(0, 100)}...`);

    try {
      let prompt = this.buildDebuggingPrompt(error, code, stackTrace, context);
      
      const response = await this.generateText(prompt, 'openai'); // Using OpenAI for debugging
      
      return {
        error,
        solution: response,
        stackTrace,
        suggestions: this.extractSuggestions(response),
      };
    } catch (error) {
      this.logger.error(`Error debugging code: ${error.message}`);
      throw new InternalServerErrorException(`Failed to debug code: ${error.message}`);
    }
  }

  /**
   * Explains complex code concepts or algorithms
   */
  async explainCode(code: string, language: string, level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<any> {
    if (!code || !language) {
      throw new BadRequestException('Code and language are required for explanation');
    }

    this.logger.log(`Explaining code in ${language} for ${level} level`);

    try {
      const prompt = this.buildExplanationPrompt(code, language, level);
      const response = await this.generateText(prompt, 'openai');
      
      return {
        explanation: response,
        language,
        level,
        concepts: this.extractConcepts(response),
      };
    } catch (error) {
      this.logger.error(`Error explaining code: ${error.message}`);
      throw new InternalServerErrorException(`Failed to explain code: ${error.message}`);
    }
  }

  /**
   * Transforms code from one language to another
   */
  async transformCode(code: string, fromLanguage: string, toLanguage: string, context?: any): Promise<any> {
    if (!code || !fromLanguage || !toLanguage) {
      throw new BadRequestException('Code, source language, and target language are required for transformation');
    }

    this.logger.log(`Transforming code from ${fromLanguage} to ${toLanguage}`);

    try {
      const prompt = this.buildTransformationPrompt(code, fromLanguage, toLanguage, context);
      const response = await this.generateText(prompt, 'openai');
      
      return {
        originalCode: code,
        transformedCode: response,
        fromLanguage,
        toLanguage,
      };
    } catch (error) {
      this.logger.error(`Error transforming code: ${error.message}`);
      throw new InternalServerErrorException(`Failed to transform code: ${error.message}`);
    }
  }

  /**
   * Reviews pull request changes and suggests improvements
   */
  async reviewPullRequest(diff: string, context?: any): Promise<any> {
    if (!diff) {
      throw new BadRequestException('Diff is required for pull request review');
    }

    this.logger.log('Reviewing pull request changes');

    try {
      const prompt = this.buildPullRequestReviewPrompt(diff, context);
      const response = await this.generateText(prompt, 'openai');
      
      return {
        review: response,
        issues: this.extractIssues(response),
        suggestions: this.extractSuggestions(response),
      };
    } catch (error) {
      this.logger.error(`Error reviewing pull request: ${error.message}`);
      throw new InternalServerErrorException(`Failed to review pull request: ${error.message}`);
    }
  }

  /**
   * Generates unit tests for given code
   */
  async generateTests(code: string, language: string, framework?: string, context?: any): Promise<any> {
    if (!code || !language) {
      throw new BadRequestException('Code and language are required for test generation');
    }

    this.logger.log(`Generating tests for ${language}${framework ? ` using ${framework}` : ''}`);

    try {
      const prompt = this.buildTestGenerationPrompt(code, language, framework, context);
      const response = await this.generateText(prompt, 'openai');
      
      return {
        generatedTests: response,
        language,
        framework,
      };
    } catch (error) {
      this.logger.error(`Error generating tests: ${error.message}`);
      throw new InternalServerErrorException(`Failed to generate tests: ${error.message}`);
    }
  }

  private buildCodeAnalysisPrompt(
    code: string, 
    language: string, 
    analysisType: string, 
    context?: any
  ): string {
    const analysisPrompts = {
      security: `Analyze the following ${language} code for security vulnerabilities. Identify potential security issues such as injection attacks, authentication problems, data exposure, etc. Provide specific recommendations to address each vulnerability.`,
      performance: `Analyze the following ${language} code for performance issues. Identify potential bottlenecks, inefficient algorithms, memory leaks, and other performance concerns. Provide specific recommendations to optimize the code.`,
      'best-practices': `Analyze the following ${language} code for adherence to best practices. Identify areas that could be improved in terms of code organization, readability, maintainability, and design patterns. Provide specific recommendations to improve the code quality.`,
      refactoring: `Analyze the following ${language} code for refactoring opportunities. Identify areas that could benefit from code simplification, modularization, or restructuring. Provide specific recommendations for refactoring the code.`
    };

    const basePrompt = analysisPrompts[analysisType as keyof typeof analysisPrompts] || analysisPrompts['best-practices'];

    return `${basePrompt}

Context:
${context?.filename ? `File: ${context.filename}\n` : ''}
${context?.dependencies ? `Dependencies: ${context.dependencies.join(', ')}\n` : ''}
${context?.framework ? `Framework: ${context.framework}\n` : ''}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Provide a detailed analysis with specific, actionable recommendations. Format your response as:
- Issue: [Brief description of the issue]
- Severity: [High/Medium/Low]
- Recommendation: [Specific recommendation to fix the issue]
- Example: [Code example showing the fix if applicable]`;
  }

  private buildCodeGenerationPrompt(
    description: string, 
    language: string, 
    framework?: string, 
    requirements?: string[], 
    context?: any
  ): string {
    return `Generate ${language} code based on the following description:
"${description}"

Requirements:
${requirements?.length ? requirements.map((req, i) => `${i + 1}. ${req}`).join('\n') : 'None specified'}

Context:
${context?.existingCode ? `Existing code to extend or modify:\n\`\`\`${language}\n${context.existingCode}\n\`\`\`\n` : ''}
${context?.files ? `Related files in the project:\n${context.files.map(f => `- ${f.path}: ${f.content.substring(0, 100)}...`).join('\n')}\n` : ''}

${framework ? `Use the ${framework} framework.` : ''}

Generate complete, working code that follows best practices for ${language}. Include necessary imports, error handling, and documentation. Make sure the code is production-ready.`;
  }

  private buildDebuggingPrompt(
    error: string, 
    code?: string, 
    stackTrace?: string, 
    context?: any
  ): string {
    return `Debug the following error:
"${error}"

Stack trace:
${stackTrace || 'Not provided'}

Code causing the error:
${code ? `\`\`\`${context?.language || 'javascript'}\n${code}\n\`\`\`` : 'Not provided'}

Environment: ${context?.environment || 'Unknown'}
Runtime: ${context?.runtime || 'Unknown'}

Provide a detailed explanation of what's causing the error and specific steps to fix it. Include code examples if necessary.`;
  }

  private buildExplanationPrompt(
    code: string, 
    language: string, 
    level: string
  ): string {
    const levelInstructions = {
      beginner: 'Explain in simple terms for someone new to programming. Use analogies and avoid technical jargon.',
      intermediate: 'Explain with moderate technical detail for a developer with some experience.',
      advanced: 'Provide deep technical insights and discuss advanced concepts, optimizations, and edge cases.'
    };

    return `Explain the following ${language} code. ${levelInstructions[level as keyof typeof levelInstructions]}

Code to explain:
\`\`\`${language}
${code}
\`\`\`

Cover:
- What the code does
- How it works
- Key concepts used
- Potential improvements or considerations`;
  }

  private buildTransformationPrompt(
    code: string, 
    fromLanguage: string, 
    toLanguage: string, 
    context?: any
  ): string {
    return `Transform the following ${fromLanguage} code to equivalent ${toLanguage} code. Maintain the same functionality and logic while adapting to ${toLanguage}'s idioms and best practices.

Original code:
\`\`\`${fromLanguage}
${code}
\`\`\`

${context?.framework ? `Target framework: ${context.framework}` : ''}

Provide the transformed code with appropriate comments explaining any significant changes made for the target language.`;
  }

  private buildPullRequestReviewPrompt(
    diff: string, 
    context?: any
  ): string {
    return `Review the following pull request changes and provide feedback. Look for potential issues with code quality, performance, security, and best practices.

Diff to review:
\`\`\`
${diff}
\`\`\`

${context?.title ? `PR Title: ${context.title}\n` : ''}
${context?.description ? `PR Description: ${context.description}\n` : ''}

Provide constructive feedback with specific suggestions for improvement. Highlight any potential issues and suggest better approaches if applicable.`;
  }

  private buildTestGenerationPrompt(
    code: string, 
    language: string, 
    framework?: string, 
    context?: any
  ): string {
    return `Generate comprehensive unit tests for the following ${language} code using ${framework || 'the default testing framework'}.

Code to test:
\`\`\`${language}
${code}
\`\`\`

${context?.functionName ? `Focus on testing the ${context.functionName} function.` : ''}
${context?.requirements ? `Testing requirements: ${context.requirements.join(', ')}\n` : ''}

Generate tests that cover:
- Happy path scenarios
- Edge cases
- Error conditions
- Boundary conditions

Include appropriate assertions and mock objects if needed. Make sure the tests are clear and maintainable.`;
  }

  private async generateText(prompt: string, provider: 'openai' | 'claude' | 'gemini' = 'openai'): Promise<string> {
    try {
      switch (provider) {
        case 'openai':
          if (!this.openai) {
            // In development, provide a mock response if API key is not configured
            if (process.env.NODE_ENV !== 'production') {
              return `This is a simulated response from OpenAI.\n\nPrompt: ${prompt}\n\nFor a real response, please configure your OpenAI API key.`;
            }
            throw new Error('OpenAI API key not configured');
          }
          
          const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
              { role: 'system', content: 'You are an expert programming assistant that provides accurate, detailed, and helpful responses to developers.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          });

          return completion.choices[0]?.message?.content || 'No response from OpenAI';

        case 'claude':
          if (!this.claude) {
            // In development, provide a mock response if API key is not configured
            if (process.env.NODE_ENV !== 'production') {
              return `This is a simulated response from Claude AI.\n\nPrompt: ${prompt}\n\nFor a real response, please configure your Anthropic API key.`;
            }
            throw new Error('Claude API key not configured');
          }
          
          const message = await this.claude.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            temperature: 0.3,
            system: 'You are an expert programming assistant that provides accurate, detailed, and helpful responses to developers.',
            messages: [
              { role: 'user', content: prompt },
            ],
          });

          return message.content[0]?.type === 'text' 
            ? message.content[0].text 
            : 'No response from Claude';

        case 'gemini':
          if (!this.gemini) {
            // In development, provide a mock response if API key is not configured
            if (process.env.NODE_ENV !== 'production') {
              return `This is a simulated response from Google Gemini AI.\n\nPrompt: ${prompt}\n\nFor a real response, please configure your Google AI key.`;
            }
            throw new Error('Gemini API key not configured');
          }

          const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
          const result = await model.generateContent(prompt);

          return result.response.text() || 'No response from Gemini';

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      this.logger.error(`Error generating text with ${provider}: ${error.message}`);
      throw error;
    }
  }

  private parseAnalysisResponse(response: string): any[] {
    // Simple parsing of the response to extract structured findings
    const lines = response.split('\n');
    const findings: any[] = [];
    let currentFinding: any = null;

    for (const line of lines) {
      if (line.startsWith('- Issue:')) {
        if (currentFinding) findings.push(currentFinding);
        currentFinding = { issue: line.replace('- Issue:', '').trim() };
      } else if (line.startsWith('- Severity:') && currentFinding) {
        currentFinding.severity = line.replace('- Severity:', '').trim();
      } else if (line.startsWith('- Recommendation:') && currentFinding) {
        currentFinding.recommendation = line.replace('- Recommendation:', '').trim();
      } else if (line.startsWith('- Example:') && currentFinding) {
        currentFinding.example = line.replace('- Example:', '').trim();
      }
    }

    if (currentFinding) findings.push(currentFinding);
    return findings;
  }

  private extractSuggestions(response: string): string[] {
    // Extract suggestions from the response
    const suggestionRegex = /(suggest|recommend|should|could|consider).*?(?=\n|$)/gi;
    const matches = response.match(suggestionRegex) || [];
    return matches.map(match => match.trim());
  }

  private extractIssues(response: string): string[] {
    // Extract issues from the response
    const issueRegex = /(issue|problem|concern|vulnerability|bug).*?(?=\n|$)/gi;
    const matches = response.match(issueRegex) || [];
    return matches.map(match => match.trim());
  }

  private extractConcepts(response: string): string[] {
    // Extract key concepts from the response
    const conceptRegex = /([A-Z][a-z]+(?:[A-Z][a-z]*)*)/g;
    const matches = response.match(conceptRegex) || [];
    return [...new Set(matches)].filter(concept => 
      concept.length > 3 && 
      !['Code', 'The', 'And', 'For', 'With', 'That', 'Have', 'This', 'Will', 'Can'].includes(concept)
    );
  }
}