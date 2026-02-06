# CodePath AI VSCode Extension

The CodePath AI VSCode Extension brings the power of AI-assisted coding directly into Visual Studio Code. Built with a dual-model architecture, it connects to the CodePath backend service to provide intelligent code explanations, generation, debugging, analysis, and refactoring capabilities.

## Features

- **Code Explanation**: Select code and get detailed explanations of what it does
- **Code Generation**: Describe what you want to build and generate code automatically
- **Debugging Assistance**: Get help identifying and fixing code issues
- **Code Analysis**: Analyze code for security vulnerabilities, performance issues, and best practices
- **Code Refactoring**: Improve existing code structure and readability
- **Context-Aware Processing**: Leverages surrounding code context for better results

## Architecture

The extension follows a dual-model architecture:

- **Lightweight Frontend**: The VSCode extension only sends structured data (selected code, file context, language, user action, metadata) to the backend
- **Centralized Backend**: The backend handles all heavy processing including:
  - Authentication and authorization
  - Model selection and routing
  - Prompt construction and optimization
  - Cost control and usage tracking
  - Response formatting and caching

## Installation

### Prerequisites

- Visual Studio Code v1.74 or higher
- Access to a running CodePath backend service

### Setup

1. Clone the CodePath repository:
   ```bash
   git clone https://github.com/your-org/code-path-ai.git
   cd code-path-ai/vscode-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

4. Package the extension (optional):
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```

## Configuration

The extension can be configured through VSCode settings:

- `codepath-ai.backendUrl`: URL of the CodePath backend service (default: `http://localhost:3001`)
- `codepath-ai.nimInvokeUrl`: NVIDIA NIM chat completions endpoint
- `codepath-ai.nimThinking`: Enable NIM thinking template
- `codepath-ai.apiKey`: API key for authenticating with the backend
- `codepath-ai.userApiKey`: Optional provider API key (fallback if Secret Storage isn't available)
- `codepath-ai.model`: Selected AI model ID
- `codepath-ai.provider`: Selected AI model provider
- `codepath-ai.modelListSource`: Model list source (`dynamic` or `static`)
- `codepath-ai.userId`: User ID for tracking usage (optional)

To configure these settings:

1. Open VSCode Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "CodePath AI"
3. Enter your backend URL and API key

Alternatively, you can add these to your `settings.json`:

```json
{
  "codepath-ai.backendUrl": "https://your-codepath-backend.com",
  "codepath-ai.apiKey": "your-api-key-here",
  "codepath-ai.nimInvokeUrl": "https://integrate.api.nvidia.com/v1/chat/completions",
  "codepath-ai.nimThinking": true,
  "codepath-ai.model": "moonshotai/kimi-k2.5",
  "codepath-ai.provider": "nvidia",
  "codepath-ai.userId": "optional-user-id"
}
```

## Usage

### Code Explanation

1. Select the code you want to understand
2. Right-click and choose "CodePath: Explain Selected Code" from the context menu
3. Or use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run "CodePath: Explain Selected Code"

### Code Generation

1. Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run "CodePath: Generate Code"
3. Describe what code you want to generate in the input box

### Debugging Assistance

1. Select the problematic code (or leave unselected if you have an error message)
2. Right-click and choose "CodePath: Debug Code" from the context menu
3. Or use the command palette and run "CodePath: Debug Code"
4. If no code is selected, you'll be prompted to describe the error

### Code Analysis

1. Select the code you want to analyze
2. Right-click and choose "CodePath: Analyze Code" from the context menu
3. Choose the type of analysis (security, performance, best practices, refactoring)
4. Or use the command palette and run "CodePath: Analyze Code"

### Code Refactoring

1. Select the code you want to refactor
2. Right-click and choose "CodePath: Refactor Code" from the context menu
3. Or use the command palette and run "CodePath: Refactor Code"

### Model Selection

1. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run "CodePath: Select Model"
3. Choose a model from the list (the backend catalog is used when available)

### Settings Model Dropdown

You can also pick a model/provider directly in Settings via dropdowns:

- `codepath-ai.model`: choose a model ID (e.g., `gpt-4o`, `claude-3.5-sonnet`, `mistral-large`, `gemini-1.5-pro`)
- `codepath-ai.provider`: choose a provider (e.g., `openai`, `anthropic`, `mistral`, `google`)

### User API Key

1. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run "CodePath: Set User API Key"
3. Paste your provider key (stored in VSCode Secret Storage)

### Using NVIDIA NIM Directly (Recommended)

1. Set `codepath-ai.provider` to `nvidia`
2. Set `codepath-ai.model` to `moonshotai/kimi-k2.5`
3. Run "CodePath: Set User API Key" and paste your NIM key
4. Run any CodePath command (explain, generate, debug, analyze, refactor)

## CLI

The CLI uses NVIDIA NIM directly and works on Windows, macOS, and Linux.

### Setup

Set your NIM key in the environment:

```bash
# macOS/Linux
export NIM_API_KEY="your-nim-key"

# Windows PowerShell
$env:NIM_API_KEY="your-nim-key"
```

Or store it once for future sessions:

```bash
codepath-ai login --key "your-nim-key"
```

### Examples

```bash
codepath-ai explain --file src/app.ts
codepath-ai generate --text "Create a function that validates email addresses" --lang typescript
codepath-ai analyze --file src/app.ts --focus security --stream
codepath-ai debug --file src/app.ts --issue "TypeError when value is null"
codepath-ai chat --text "Summarize this module's purpose"
```

### Interactive Chat (Codex-Style)

```bash
codepath-ai
```

Inside the chat:

```
/help
/login
/logout
/model moonshotai/kimi-k2.5
/thinking on
/exit
```

## API Keys

To use the extension, you need an API key from your CodePath backend. If you're running the backend locally, a default development key is created automatically. For production use, you should generate an API key through the backend's authentication system.

## Development

To develop and test the extension:

1. Open the `vscode-extension` folder in VSCode
2. Press `F5` to launch a new Extension Development Host window
3. The extension will be loaded and ready for testing

### Building for Production

```bash
npm run compile
```

### Running Tests

```bash
npm test
```

## Security

- API keys are stored securely and never exposed to client-side code
- All AI provider keys are kept server-side
- Requests are authenticated using API key-based authentication
- Sensitive code context is transmitted securely over HTTPS

## Troubleshooting

- If you receive authentication errors, verify your API key is correct
- If requests are timing out, check that your backend URL is accessible
- For issues with specific AI features, check the backend logs for detailed error messages

## Support

For support, please check the main CodePath repository or contact the development team.

---

**Version**: 0.0.1  
**Last Updated**: February 3, 2026
