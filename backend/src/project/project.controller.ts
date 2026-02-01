import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProjectService, CreateProjectDto } from './project.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get available project templates' })
  @ApiResponse({ status: 200, description: 'List of project templates' })
  getTemplates() {
    return this.projectService.getTemplates();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get project template by ID' })
  @ApiResponse({ status: 200, description: 'Project template details' })
  getTemplate(@Param('id') templateId: string) {
    return this.projectService.getTemplateById(templateId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  async createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get projects for a user' })
  @ApiResponse({ status: 200, description: 'List of user projects' })
  getProjects(@Query('userId') userId: string) {
    return this.projectService.getProjectsByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project details' })
  getProject(@Param('id') projectId: string) {
    return this.projectService.getProjectById(projectId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  async updateProject(@Param('id') projectId: string, @Body() updates: Partial<CreateProjectDto>) {
    return this.projectService.updateProject(projectId, updates);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  async deleteProject(@Param('id') projectId: string) {
    await this.projectService.deleteProject(projectId);
    return { success: true, message: 'Project deleted successfully' };
  }

  @Post(':id/generate-docs')
  @ApiOperation({ summary: 'Generate documentation for a project' })
  @ApiResponse({ status: 200, description: 'Generated documentation' })
  async generateDocumentation(@Param('id') projectId: string) {
    return this.projectService.generateProjectDocumentation(projectId);
  }
}