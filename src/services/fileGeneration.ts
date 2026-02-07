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
    const seen = new Set<string>();
    
    // Strategy 1: ```language:path/to/file.ext (explicit path after colon)
    const fileBlockRegex = /```(\w+):([^\n]+)\n([\s\S]*?)```/g;
    let match;
    while ((match = fileBlockRegex.exec(response)) !== null) {
      const [, language, path, content] = match;
      const trimmedPath = path.trim();
      if (!seen.has(trimmedPath)) {
        seen.add(trimmedPath);
        files.push({
          path: trimmedPath,
          content: content.trim(),
          language: language.toLowerCase()
        });
      }
    }

    if (files.length > 0) return files;

    // Strategy 2: File path in a comment/heading right before the code block
    // Matches patterns like:
    //   **`src/App.tsx`**
    //   ### src/App.tsx
    //   // src/App.tsx
    //   <!-- src/App.tsx -->
    //   `src/App.tsx`:
    //   File: src/App.tsx
    const pathBeforeBlockRegex = /(?:(?:\*{1,2}`|###?\s*|\/\/\s*|<!--\s*|`|File:\s*)([a-zA-Z0-9_\-./]+\.[a-zA-Z]{1,10})(?:`\*{1,2}|`|:?\s*-->|:?))\s*\n+```(\w*)\n([\s\S]*?)```/g;
    while ((match = pathBeforeBlockRegex.exec(response)) !== null) {
      const [, path, language, content] = match;
      const trimmedPath = path.trim();
      if (!seen.has(trimmedPath) && content.trim()) {
        seen.add(trimmedPath);
        files.push({
          path: trimmedPath,
          content: content.trim(),
          language: language?.toLowerCase() || this.inferLanguage(trimmedPath)
        });
      }
    }

    if (files.length > 0) return files;

    // Strategy 3: Fallback — detect code blocks and infer filenames
    files.push(...this.detectCommonFilePatterns(response));

    return files;
  }

  // Infer language from file extension
  private inferLanguage(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      tsx: 'typescript', ts: 'typescript', jsx: 'javascript', js: 'javascript',
      css: 'css', scss: 'scss', html: 'html', json: 'json', md: 'markdown',
      py: 'python', rs: 'rust', go: 'go', java: 'java', rb: 'ruby',
      php: 'php', sql: 'sql', yaml: 'yaml', yml: 'yaml', xml: 'xml',
      sh: 'shell', bash: 'shell',
    };
    return map[ext] || 'text';
  }

  private detectCommonFilePatterns(response: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const seen = new Set<string>();
    
    // Try to detect filename comments before code blocks: <!-- filename: index.html --> or // filename: app.js
    const commentFileRegex = /(?:<!--|\/\/|#)\s*(?:filename|file):\s*([^\n>]+?)(?:-->|\n)/gi;
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    
    // Collect all code blocks
    const codeBlocks: { language: string; content: string; index: number }[] = [];
    let blockMatch;
    while ((blockMatch = codeBlockRegex.exec(response)) !== null) {
      codeBlocks.push({
        language: blockMatch[1]?.toLowerCase() || 'text',
        content: blockMatch[2]?.trim() || '',
        index: blockMatch.index,
      });
    }

    // Try to associate filename comments with blocks
    let commentMatch;
    const fileComments: { name: string; index: number }[] = [];
    while ((commentMatch = commentFileRegex.exec(response)) !== null) {
      fileComments.push({ name: commentMatch[1].trim(), index: commentMatch.index });
    }
    
    for (const block of codeBlocks) {
      // Find nearest preceding filename comment
      let fileName = '';
      for (const fc of fileComments) {
        if (fc.index < block.index) fileName = fc.name;
      }
      
      if (!fileName) {
        // Infer filename from language
        const langToFile: Record<string, string> = {
          html: 'index.html', htm: 'index.html',
          css: 'styles.css', scss: 'styles.scss',
          javascript: 'script.js', js: 'script.js',
          typescript: 'app.ts', ts: 'app.ts',
          jsx: 'App.jsx', tsx: 'App.tsx',
          json: 'package.json',
          python: 'main.py', py: 'main.py',
        };
        fileName = langToFile[block.language] || `file.${block.language || 'txt'}`;
      }
      
      // Avoid duplicate filenames
      if (seen.has(fileName)) {
        const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '';
        const base = fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;
        fileName = `${base}-${seen.size}${ext}`;
      }
      seen.add(fileName);
      
      if (block.content) {
        files.push({
          path: fileName,
          content: block.content,
          language: block.language || 'text',
        });
      }
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
