// File Generation Service - Bolt.new style streaming file creation

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface FileGenerationProgress {
  currentFile: string;
  progress: number;
  totalFiles: number;
  status: 'generating' | 'installing' | 'previewing' | 'complete';
}

export class FileGenerationService {
  private onProgress?: (progress: FileGenerationProgress) => void;

  constructor(onProgress?: (progress: FileGenerationProgress) => void) {
    this.onProgress = onProgress;
  }

  // Parse AI response to extract file structure
  parseFilesFromPrompt(response: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    // Match code blocks with file paths
    // Format: ```language:path/to/file.ext
    const fileBlockRegex = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;
    let match;

    while ((match = fileBlockRegex.exec(response)) !== null) {
      const [, language, path, content] = match;
      files.push({
        path: path.trim(),
        content: content.trim(),
        language: language.toLowerCase()
      });
    }

    // If no structured blocks found, try to detect common patterns
    if (files.length === 0) {
      files.push(...this.detectCommonFilePatterns(response));
    }

    return files;
  }

  private detectCommonFilePatterns(response: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    // Detect HTML
    if (response.includes('<!DOCTYPE html') || response.includes('<html')) {
      const htmlMatch = response.match(/<!DOCTYPE[\s\S]*<\/html>/i);
      if (htmlMatch) {
        files.push({
          path: 'index.html',
          content: htmlMatch[0],
          language: 'html'
        });
      }
    }

    // Detect CSS
    const cssMatch = response.match(/```css\n([\s\S]*?)```/);
    if (cssMatch) {
      files.push({
        path: 'styles.css',
        content: cssMatch[1].trim(),
        language: 'css'
      });
    }

    // Detect JavaScript
    const jsMatch = response.match(/```(javascript|js)\n([\s\S]*?)```/);
    if (jsMatch) {
      files.push({
        path: 'script.js',
        content: jsMatch[2].trim(),
        language: 'javascript'
      });
    }

    return files;
  }

  // Stream files creation with animation
  async *generateFilesWithStreaming(files: GeneratedFile[]): AsyncGenerator<FileGenerationProgress> {
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate streaming effect (character by character)
      yield {
        currentFile: file.path,
        progress: i,
        totalFiles,
        status: 'generating'
      };

      // Add delay for streaming effect
      await this.delay(200);
    }

    yield {
      currentFile: '',
      progress: totalFiles,
      totalFiles,
      status: 'complete'
    };
  }

  // Auto-install dependencies
  async installDependencies(files: GeneratedFile[]): Promise<void> {
    // Check if package.json exists
    const packageJson = files.find(f => f.path === 'package.json');
    
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson.content);
        const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
        
        if (Object.keys(dependencies).length > 0) {
          if (this.onProgress) {
            this.onProgress({
              currentFile: 'Installing dependencies...',
              progress: 0,
              totalFiles: Object.keys(dependencies).length,
              status: 'installing'
            });
          }
          
          // Simulate installation (in real app, this would call terminal)
          await this.delay(2000);
        }
      } catch (e) {
        console.error('Failed to parse package.json:', e);
      }
    }
  }

  // Generate common project templates
  generateTemplate(type: 'react' | 'vue' | 'vanilla' | 'node'): GeneratedFile[] {
    const templates: Record<string, GeneratedFile[]> = {
      vanilla: [
        {
          path: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to My Website</h1>
        <p>Built with AI assistance</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`
        },
        {
          path: 'styles.css',
          language: 'css',
          content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 3rem;
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    text-align: center;
}

h1 {
    color: #333;
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

p {
    color: #666;
    font-size: 1.2rem;
}`
        },
        {
          path: 'script.js',
          language: 'javascript',
          content: `console.log('Website loaded successfully!');

// Add your JavaScript code here
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
});`
        }
      ],
      react: [
        {
          path: 'package.json',
          language: 'json',
          content: JSON.stringify({
            name: 'react-app',
            version: '1.0.0',
            dependencies: {
              'react': '^18.2.0',
              'react-dom': '^18.2.0'
            }
          }, null, 2)
        },
        {
          path: 'src/App.jsx',
          language: 'javascript',
          content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Welcome to React</h1>
      <p>Built with AI assistance</p>
    </div>
  );
}

export default App;`
        },
        {
          path: 'src/App.css',
          language: 'css',
          content: `.App {
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #61dafb;
}`
        }
      ],
      vue: [],
      node: []
    };

    return templates[type] || templates.vanilla;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default FileGenerationService;
