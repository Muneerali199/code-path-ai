import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { FileManagerService } from '../file-manager/file-manager.service';
import { EnhancedAiService } from '../ai/enhanced-ai.service';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  files: Array<{
    path: string;
    content: string;
    isTemplate: boolean;
  }>;
  dependencies?: Record<string, string>;
  framework?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  templateId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  path: string;
  status: 'created' | 'initialized' | 'active' | 'archived';
}

export class CreateProjectDto {
  name: string;
  description: string;
  templateId?: string;
  userId: string;
  customizations?: Record<string, any>;
}

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);
  private projects: Project[] = [];
  private templates: ProjectTemplate[] = [];

  constructor(
    private readonly fileManagerService: FileManagerService,
    private readonly enhancedAiService: EnhancedAiService,
  ) {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    // Initialize some default project templates
    const defaultTemplates: ProjectTemplate[] = [
      {
        id: 'web-app-template',
        name: 'Web Application',
        description: 'A basic web application template with frontend and backend',
        category: 'web',
        tags: ['javascript', 'html', 'css', 'react', 'node'],
        files: [
          {
            path: 'README.md',
            content: '# {{PROJECT_NAME}}\n\n{{PROJECT_DESCRIPTION}}\n\n## Setup\n\n```bash\nnpm install\nnpm start\n```',
            isTemplate: true
          },
          {
            path: 'package.json',
            content: `{
  "name": "{{PROJECT_NAME}}",
  "version": "1.0.0",
  "description": "{{PROJECT_DESCRIPTION}}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {},
  "devDependencies": {}
}`,
            isTemplate: true
          },
          {
            path: 'src/index.js',
            content: '// Main application entry point\nconsole.log("Hello, {{PROJECT_NAME}}!");',
            isTemplate: true
          }
        ]
      },
      {
        id: 'api-service-template',
        name: 'API Service',
        description: 'A REST API service template with authentication',
        category: 'api',
        tags: ['node', 'express', 'rest', 'authentication'],
        files: [
          {
            path: 'README.md',
            content: '# {{PROJECT_NAME}} API\n\n{{PROJECT_DESCRIPTION}}\n\n## API Endpoints\n\n- GET /api/health - Health check\n- POST /api/users - Create user\n\n## Setup\n\n```bash\nnpm install\nnpm start\n```',
            isTemplate: true
          },
          {
            path: 'package.json',
            content: `{
  "name": "{{PROJECT_NAME}}",
  "version": "1.0.0",
  "description": "{{PROJECT_DESCRIPTION}}",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {}
}`,
            isTemplate: true
          },
          {
            path: 'server.js',
            content: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
            isTemplate: true
          }
        ]
      }
    ];

    this.templates = defaultTemplates;
    this.logger.log(`Initialized ${this.templates.length} default project templates`);
  }

  async getTemplates(): Promise<ProjectTemplate[]> {
    return this.templates;
  }

  async getTemplateById(templateId: string): Promise<ProjectTemplate> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }
    return template;
  }

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    const { name, description, templateId, userId, customizations } = createProjectDto;

    // Validate user exists (in a real app, you'd check this against a user service)
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Create project object
    const newProject: Project = {
      id: this.generateId(),
      name,
      description,
      templateId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      path: `/projects/${userId}/${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      status: 'created'
    };

    // Add to projects list
    this.projects.push(newProject);

    // Create project directory
    await this.fileManagerService.createDirectory(newProject.path);

    // If a template is specified, create project from template
    if (templateId) {
      await this.createProjectFromTemplate(newProject, templateId, customizations);
    } else {
      // Create basic project structure
      await this.createBasicProjectStructure(newProject);
    }

    // Update project status
    newProject.status = 'initialized';
    newProject.updatedAt = new Date();

    this.logger.log(`Created project: ${newProject.name} (${newProject.id}) for user: ${userId}`);
    return newProject;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return this.projects.filter(project => project.userId === userId);
  }

  async getProjectById(projectId: string): Promise<Project> {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
    return project;
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Update project properties
    Object.assign(this.projects[projectIndex], {
      ...updates,
      updatedAt: new Date()
    });

    const updatedProject = this.projects[projectIndex];
    this.logger.log(`Updated project: ${updatedProject.name} (${projectId})`);
    return updatedProject;
  }

  async deleteProject(projectId: string): Promise<void> {
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const project = this.projects[projectIndex];
    
    // Remove from projects list
    this.projects.splice(projectIndex, 1);
    
    // Optionally delete project files (be careful!)
    // await this.fileManagerService.deleteDirectory(project.path);
    
    this.logger.log(`Deleted project: ${project.name} (${projectId})`);
  }

  async generateProjectDocumentation(projectId: string): Promise<string> {
    const project = await this.getProjectById(projectId);
    
    // Get project files
    const files = await this.fileManagerService.listDirectory(project.path, { 
      recursive: true, 
      includeContent: true 
    });

    // Filter out non-code files
    const codeFiles = files.filter(file => 
      file.type === 'file' && 
      (file.name.endsWith('.js') || 
       file.name.endsWith('.ts') || 
       file.name.endsWith('.jsx') || 
       file.name.endsWith('.tsx') ||
       file.name.endsWith('.py') ||
       file.name.endsWith('.java'))
    );

    // Generate documentation based on project structure and code
    const projectStructure = this.buildProjectStructure(files, project.path);
    const codeSnippets = codeFiles.slice(0, 5).map(file => ({
      path: file.path,
      content: file.content?.substring(0, 500) // First 500 chars
    }));

    const documentationRequest = {
      description: `Generate comprehensive documentation for this project named "${project.name}". 
                   The project description is: "${project.description}".
                   The project structure is: ${JSON.stringify(projectStructure, null, 2)}.
                   Here are some code snippets from the project: ${JSON.stringify(codeSnippets, null, 2)}.`,
      language: 'markdown',
      requirements: [
        'Include project overview',
        'Describe main components',
        'Provide setup instructions',
        'Document API endpoints if present',
        'Include usage examples'
      ]
    };

    const documentation = await this.enhancedAiService.generateCode(documentationRequest);
    return documentation.generatedCode;
  }

  private async createProjectFromTemplate(
    project: Project, 
    templateId: string, 
    customizations?: Record<string, any>
  ): Promise<void> {
    const template = await this.getTemplateById(templateId);

    for (const file of template.files) {
      let content = file.content;

      // Replace template variables
      content = content
        .replace('{{PROJECT_NAME}}', project.name)
        .replace('{{PROJECT_DESCRIPTION}}', project.description);

      // Apply customizations if provided
      if (customizations) {
        for (const [key, value] of Object.entries(customizations)) {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value.toString());
        }
      }

      // Write file to project directory
      const filePath = `${project.path}/${file.path}`;
      await this.fileManagerService.writeFile(filePath, content);
    }

    this.logger.log(`Created project from template: ${template.name} (${templateId})`);
  }

  private async createBasicProjectStructure(project: Project): Promise<void> {
    // Create basic project structure
    await this.fileManagerService.createDirectory(`${project.path}/src`);
    await this.fileManagerService.createDirectory(`${project.path}/tests`);
    await this.fileManagerService.createDirectory(`${project.path}/docs`);

    // Create basic files
    await this.fileManagerService.writeFile(
      `${project.path}/README.md`, 
      `# ${project.name}\n\n${project.description}`
    );

    await this.fileManagerService.writeFile(
      `${project.path}/src/index.js`,
      `// ${project.name} - Main entry point\nconsole.log('Welcome to ${project.name}!');`
    );

    this.logger.log(`Created basic project structure for: ${project.name}`);
  }

  private buildProjectStructure(files: any[], basePath: string): any {
    const structure: any = {};

    for (const file of files) {
      const relativePath = file.path.replace(basePath, '').replace(/^\/+/, '');
      const pathParts = relativePath.split('/').filter(part => part !== '');

      let current = structure;
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];

        if (i === pathParts.length - 1) {
          // Last part is a file
          if (!current[part]) {
            current[part] = {
              type: 'file',
              size: file.size,
            };
          }
        } else {
          // Intermediate part is a directory
          if (!current[part]) {
            current[part] = { type: 'directory', children: {} };
          }
          current = current[part].children;
        }
      }
    }

    return structure;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}