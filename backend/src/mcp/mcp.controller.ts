import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { McpService } from './mcp.service';

export class McpCallDto {
  method: string;
  params?: any;
}

@ApiTags('MCP (Model Context Protocol)')
@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get MCP protocol information' })
  @ApiResponse({ status: 200, description: 'MCP protocol information' })
  getProtocolInfo() {
    return this.mcpService.getProtocolInfo();
  }

  @Get('resources')
  @ApiOperation({ summary: 'Get available resources' })
  @ApiResponse({ status: 200, description: 'List of available resources' })
  getResources() {
    return this.mcpService.getResources();
  }

  @Get('resources/:uri')
  @ApiOperation({ summary: 'Get resource by URI' })
  @ApiResponse({ status: 200, description: 'Resource details' })
  getResource(@Query('uri') uri: string) {
    return this.mcpService.getResource(uri);
  }

  @Get('tools')
  @ApiOperation({ summary: 'Get available tools' })
  @ApiResponse({ status: 200, description: 'List of available tools' })
  getTools() {
    return this.mcpService.getTools();
  }

  @Post('call')
  @ApiOperation({ summary: 'Execute an MCP call' })
  @ApiBody({ type: McpCallDto })
  @ApiResponse({ status: 200, description: 'MCP call result' })
  async call(@Body() request: McpCallDto) {
    return this.mcpService.call(request);
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize MCP connection' })
  @ApiResponse({ status: 200, description: 'MCP initialized successfully' })
  async initialize() {
    await this.mcpService.initialize();
    return { success: true, message: 'MCP initialized successfully' };
  }
}