import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { EnhancedAiService } from '../ai/enhanced-ai.service';
import { FileManagerService } from '../file-manager/file-manager.service';

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
  size?: number;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface McpCallRequest {
  method: string;
  params?: any;
}

export interface McpCallResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);
  private activeServerId = 'local';
  private activeServerUrl: string | null = null;
  private readonly localHostHints = ['localhost:3001', '127.0.0.1:3001'];
  
  constructor(
    private readonly enhancedAiService: EnhancedAiService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  setActiveServer(serverId: string, url: string | null) {
    this.activeServerId = serverId || 'local';
    this.activeServerUrl = url?.trim() || null;
    this.logger.log(`Active MCP server set to ${this.activeServerId} (${this.activeServerUrl ?? 'local'})`);
  }

  getActiveServer() {
    return {
      serverId: this.activeServerId,
      url: this.activeServerUrl,
      mode: this.shouldProxyRemote() ? 'remote' : 'local',
    };
  }

  private shouldProxyRemote(): boolean {
    if (!this.activeServerUrl) return false;
    const url = this.activeServerUrl.toLowerCase();
    return !this.localHostHints.some((hint) => url.includes(hint));
  }

  private stripMcpPrefix(method: string): string | null {
    return method.startsWith('mcp/') ? method.slice(4) : null;
  }

  private async callRemote(
    method: string,
    params?: any,
  ): Promise<McpCallResponse> {
    if (!this.activeServerUrl) {
      return { error: { code: 400, message: 'No MCP server URL configured' } };
    }

    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params: params ?? {},
    };

    try {
      const response = await axios.post(this.activeServerUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      const data = response.data;

      if (data?.error || data?.result) {
        return data as McpCallResponse;
      }

      return { result: data };
    } catch (error: any) {
      const message = error?.response?.data?.error?.message ?? error?.message ?? 'Remote MCP call failed';
      this.logger.error(`Remote MCP call error: ${message}`);
      return { error: { code: 502, message } };
    }
  }

  private async callRemoteWithFallback(
    primaryMethod: string,
    fallbackMethod: string | null,
    params?: any,
  ): Promise<McpCallResponse> {
    const primary = await this.callRemote(primaryMethod, params);
    if (!primary.error || !fallbackMethod) {
      return primary;
    }
    return this.callRemote(fallbackMethod, params);
  }

  /**
   * Get available resources from the workspace
   */
  async getResources(): Promise<McpResource[]> {
    try {
      if (this.shouldProxyRemote()) {
        const remote = await this.callRemoteWithFallback('mcp/resources/list', 'resources/list');
        if (remote.error) {
          throw new Error(remote.error.message);
        }
        const resources = (remote.result as any)?.resources ?? (remote.result as any)?.result?.resources ?? remote.result;
        if (Array.isArray(resources)) {
          return resources;
        }
        throw new Error('Remote MCP returned invalid resources payload');
      }

      // For now, return a static set of resources
      // In a real implementation, this would dynamically discover resources
      const resources: McpResource[] = [
        {
          uri: 'file:///workspace',
          name: 'workspace-root',
          description: 'Root of the current workspace',
          mimeType: 'application/directory',
        },
        {
          uri: 'tool://code-analyzer',
          name: 'code-analyzer',
          description: 'Analyze code for security, performance, and best practices',
        },
        {
          uri: 'tool://code-generator',
          name: 'code-generator',
          description: 'Generate code based on descriptions and requirements',
        },
        {
          uri: 'tool://debugger',
          name: 'debugger',
          description: 'Debug code based on error messages and stack traces',
        },
        {
          uri: 'tool://explainer',
          name: 'explainer',
          description: 'Explain complex code concepts and algorithms',
        },
      ];

      return resources;
    } catch (error) {
      this.logger.error(`Error getting resources: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get resource details by URI
   */
  async getResource(uri: string): Promise<McpResource> {
    try {
      if (this.shouldProxyRemote()) {
        const remote = await this.callRemoteWithFallback('mcp/resources/read', 'resources/read', { uri });
        if (remote.error) {
          throw new Error(remote.error.message);
        }
        const resource = (remote.result as any)?.resource ?? (remote.result as any)?.result ?? remote.result;
        if (resource && typeof resource === 'object') {
          return resource as McpResource;
        }
        throw new Error('Remote MCP returned invalid resource payload');
      }

      const resources = await this.getResources();
      const resource = resources.find(r => r.uri === uri);
      
      if (!resource) {
        throw new Error(`Resource not found: ${uri}`);
      }

      return resource;
    } catch (error) {
      this.logger.error(`Error getting resource ${uri}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available tools
   */
  async getTools(): Promise<McpTool[]> {
    try {
      if (this.shouldProxyRemote()) {
        const remote = await this.callRemoteWithFallback('mcp/tools/list', 'tools/list');
        if (remote.error) {
          throw new Error(remote.error.message);
        }
        const tools = (remote.result as any)?.tools ?? (remote.result as any)?.result?.tools ?? remote.result;
        if (Array.isArray(tools)) {
          return tools;
        }
        throw new Error('Remote MCP returned invalid tools payload');
      }

      const tools: McpTool[] = [
        {
          name: 'read_file',
          description: 'Read the contents of a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file to read'
              }
            },
            required: ['path']
          }
        },
        {
          name: 'write_file',
          description: 'Write content to a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file to write'
              },
              content: {
                type: 'string',
                description: 'Content to write to the file'
              }
            },
            required: ['path', 'content']
          }
        },
        {
          name: 'list_directory',
          description: 'List the contents of a directory',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the directory to list'
              },
              recursive: {
                type: 'boolean',
                description: 'Whether to list recursively'
              }
            },
            required: ['path']
          }
        },
        {
          name: 'analyze_code',
          description: 'Analyze code for security, performance, or best practices',
          inputSchema: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Code to analyze'
              },
              language: {
                type: 'string',
                description: 'Programming language of the code'
              },
              analysisType: {
                type: 'string',
                enum: ['security', 'performance', 'best-practices', 'refactoring'],
                description: 'Type of analysis to perform'
              }
            },
            required: ['code', 'language', 'analysisType']
          }
        },
        {
          name: 'generate_code',
          description: 'Generate code based on a description',
          inputSchema: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Description of the code to generate'
              },
              language: {
                type: 'string',
                description: 'Programming language for the generated code'
              },
              framework: {
                type: 'string',
                description: 'Framework to use (optional)'
              },
              requirements: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Additional requirements for the generated code'
              }
            },
            required: ['description', 'language']
          }
        },
        {
          name: 'debug_code',
          description: 'Debug code based on error messages',
          inputSchema: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Error message to debug'
              },
              code: {
                type: 'string',
                description: 'Code causing the error (optional)'
              },
              stackTrace: {
                type: 'string',
                description: 'Stack trace (optional)'
              }
            },
            required: ['error']
          }
        },
        {
          name: 'explain_code',
          description: 'Explain complex code concepts',
          inputSchema: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Code to explain'
              },
              language: {
                type: 'string',
                description: 'Programming language of the code'
              },
              level: {
                type: 'string',
                enum: ['beginner', 'intermediate', 'advanced'],
                description: 'Level of explanation'
              }
            },
            required: ['code', 'language']
          }
        }
      ];

      return tools;
    } catch (error) {
      this.logger.error(`Error getting tools: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute an MCP call
   */
  async call(request: McpCallRequest): Promise<McpCallResponse> {
    try {
      const { method, params } = request;

      if (this.shouldProxyRemote()) {
        const fallback = this.stripMcpPrefix(method);
        return await this.callRemoteWithFallback(method, fallback, params);
      }

      switch (method) {
        case 'mcp/resources/list':
          const resources = await this.getResources();
          return { result: { resources } };

        case 'mcp/resources/read':
          if (!params?.uri) {
            return { error: { code: 400, message: 'URI parameter is required' } };
          }
          const resource = await this.getResource(params.uri);
          return { result: resource };

        case 'mcp/tools/list':
          const tools = await this.getTools();
          return { result: { tools } };

        case 'mcp/tools/call':
          if (!params?.name || !params?.arguments) {
            return { error: { code: 400, message: 'Tool name and arguments are required' } };
          }
          const toolResult = await this.executeTool(params.name, params.arguments);
          return { result: toolResult };

        // File operations
        case 'tools/read_file':
          return { result: await this.fileManagerService.readFile(params.path) };

        case 'tools/write_file':
          await this.fileManagerService.writeFile(params.path, params.content);
          return { result: { success: true, path: params.path } };

        case 'tools/list_directory':
          return { 
            result: await this.fileManagerService.listDirectory(
              params.path, 
              { recursive: params.recursive }
            ) 
          };

        // AI operations
        case 'tools/analyze_code':
          return { result: await this.enhancedAiService.analyzeCode(params) };

        case 'tools/generate_code':
          return { result: await this.enhancedAiService.generateCode(params) };

        case 'tools/debug_code':
          return { result: await this.enhancedAiService.debugCode(params) };

        case 'tools/explain_code':
          return { 
            result: await this.enhancedAiService.explainCode(
              params.code, 
              params.language, 
              params.level
            ) 
          };

        default:
          return { error: { code: 404, message: `Method not supported: ${method}` } };
      }
    } catch (error) {
      this.logger.error(`Error executing MCP call ${request.method}: ${error.message}`);
      return { 
        error: { 
          code: 500, 
          message: `Internal server error: ${error.message}` 
        } 
      };
    }
  }

  /**
   * Execute a specific tool with given arguments
   */
  private async executeTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'read_file':
        return await this.fileManagerService.readFile(args.path);

      case 'write_file':
        await this.fileManagerService.writeFile(args.path, args.content);
        return { success: true, path: args.path };

      case 'list_directory':
        return await this.fileManagerService.listDirectory(
          args.path, 
          { recursive: args.recursive }
        );

      case 'analyze_code':
        return await this.enhancedAiService.analyzeCode(args);

      case 'generate_code':
        return await this.enhancedAiService.generateCode(args);

      case 'debug_code':
        return await this.enhancedAiService.debugCode(args);

      case 'explain_code':
        return await this.enhancedAiService.explainCode(
          args.code, 
          args.language, 
          args.level
        );

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Initialize MCP connection
   */
  async initialize(): Promise<void> {
    this.logger.log('MCP service initialized');
    // Perform any initialization logic here
  }

  /**
   * Get MCP protocol version and capabilities
   */
  getProtocolInfo(): any {
    return {
      version: '1.0.0',
      capabilities: {
        resources: true,
        tools: true,
        streaming: false,
        pagination: true
      }
    };
  }
}
