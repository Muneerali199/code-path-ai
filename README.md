# CodePath AI Coach

<div align="center">
  <img src="public/logo.svg" alt="CodePath AI Coach Logo" width="64" height="64">
  <h3>AI-Powered Development Environment</h3>
  <p>Build, explain, and execute code with multi-language support and VSCode-style Explorer</p>
</div>

## ✨ Features

### 🧠 AI Assistant
- **Multiple AI Providers**: Choose between OpenAI, Claude, Gemini, or local models
- **Dual Modes**: Switch between **Explain** (code walkthroughs) and **Create** (generate files/apps)
- **Real-time Streaming**: Chat with your AI assistant while coding
- **Context-Aware**: AI sees your workspace files and active editor

### 💻 VSCode-Style Explorer
- **Folder Tree View**: Expand/collapse folders with chevron navigation
- **Search Filter**: Quickly find files with auto-expand results
- **Context Actions**: Right-click for new file/folder, rename, delete
- **Toolbar Actions**: New file, new folder, collapse all
- **Multi-file Workspace**: Open multiple files in tabs with persistence

### 🚀 Multi-Language Execution
- **Judge0 Integration**: Run Python, Java, C++, C, Go, Rust, and more
- **Local JavaScript Fallback**: Instant JS execution without external services
- **Real-time Output**: Stream execution results in terminal panel

### 🎨 Modern Dark Theme
- **Deep Black Palette**: Consistent dark theme across all panels
- **High Contrast**: Optimized for long coding sessions
- **Responsive Design**: Works on desktop and tablet screens

### 💾 Workspace Persistence
- **Auto-save**: Files, tabs, and active editor state saved to localStorage
- **Session Restore**: Pick up where you left off after reload
- **Language Detection**: Automatic syntax highlighting based on file extension

## 🏗️ Architecture

This project uses a **monorepo structure** with separate frontend and backend:

```
codepath-ai-coach/
├── src/                    # Frontend (React + Vite)
│   ├── components/
│   │   ├── ide/           # IDE components (Explorer, Tabs, Status)
│   │   ├── chat/          # AI chat interface
│   │   ├── editor/        # Monaco editor wrapper
│   │   └── layout/        # Main IDE layout
│   └── ...
├── backend/                # Backend (NestJS)
│   ├── src/
│   │   ├── ai/            # AI service and controllers
│   │   ├── app.module.ts   # Main application module
│   │   └── main.ts        # Application bootstrap
│   └── .env.example       # Environment variables template
└── package.json           # Root package with monorepo scripts
```

## 🛠️ Tech Stack

### Frontend
- **React 18 + TypeScript** - Modern UI framework
- **Vite** - Fast development build tool
- **Monaco Editor** - VS Code editor component
- **shadcn/ui + Radix UI** - Beautiful UI components
- **Tailwind CSS** - Utility-first styling
- **React Query** - Data fetching and state management

### Backend
- **NestJS** - Enterprise Node.js framework
- **TypeScript** - Type-safe development
- **OpenAI/Claude/Gemini SDKs** - AI provider integrations
- **Swagger** - Auto-generated API documentation
- **CORS** - Cross-origin request support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Muneerali199/code-path-ai.git
cd code-path-ai

# Install all dependencies (frontend + backend)
npm install

# Setup backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
```

### Environment Variables

Create `backend/.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# AI Provider API Keys (choose one or more)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Judge0 (for multi-language code execution)
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Running the Application

```bash
# Start both frontend and backend with single command
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:5173
npm run dev:backend   # Backend on http://localhost:3001
```

**Access Points:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

## 📖 Usage

### 1. File Explorer
- **Create Files**: Click to `+` icon or right-click → New File
- **Create Folders**: Click folder icon or right-click → New Folder
- **Rename**: Right-click → Rename or select file and click pencil icon
- **Delete**: Right-click → Delete or select file and click trash icon
- **Search**: Use search box to filter files and auto-expand folders

### 2. Code Editor
- **Multi-file Tabs**: Open multiple files, tabs persist across sessions
- **Syntax Highlighting**: Automatic based on file extension
- **Run Code**: Click Run button to execute (JavaScript locally, others via Judge0)
- **Language Detection**: Editor automatically detects file language

### 3. AI Assistant
- **Switch Provider**: Use dropdown to select AI model (OpenAI/Claude/Gemini/Local)
- **Toggle Mode**: Choose between **Explain** (walkthroughs) and **Create** (generation)
- **Chat**: Type questions about your code or request new features
- **Context-Aware**: AI sees your workspace files and active editor

### 4. Code Execution
- **JavaScript**: Runs locally without configuration
- **Other Languages**: Uses Judge0 API (requires API key)
- **Output**: Results appear in terminal panel below the editor

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start both frontend and backend
npm run dev:frontend # Start frontend only
npm run dev:backend  # Start backend only
npm run build         # Build both frontend and backend
npm run build:frontend # Build frontend only
npm run build:backend  # Build backend only
npm run lint          # Run ESLint
npm run preview       # Preview production build
```

### Project Structure Details

```
src/
├── components/
│   ├── ide/           # IDE-specific components
│   │   ├── EditorTabs.tsx      # File tab management
│   │   ├── FileExplorer.tsx     # VSCode-style file tree
│   │   └── StatusBar.tsx       # IDE status bar
│   ├── ui/            # shadcn/ui components
│   ├── chat/          # AI chat interface
│   ├── editor/        # Monaco editor wrapper
│   └── layout/        # Main IDE layout

backend/
├── src/
│   ├── ai/            # AI service layer
│   │   ├── ai.controller.ts   # REST API endpoints
│   │   ├── ai.service.ts      # AI provider integrations
│   │   └── ai.module.ts       # NestJS module definition
│   ├── app.module.ts   # Main application module
│   └── main.ts        # Application bootstrap
└── .env.example       # Environment variables template
```

## 🚧 Next Steps

### Immediate (In Progress)
- [ ] **Frontend-Backend Integration**: Connect Guide-AI chat to new NestJS backend
- [ ] **AI Provider Selector**: Add dropdown UI for OpenAI/Claude/Gemini/Local
- [ ] **Mode Switcher**: Add Explain/Create toggle in chat header
- [ ] **WebSocket Streaming**: Real-time AI response streaming

### Short Term
- [ ] **Local LLM Support**: Integrate Ollama/LM Studio for local models
- [ ] **Code Execution API**: Move Judge0 logic to backend for better security
- [ ] **User Authentication**: Secure API endpoints with user accounts
- [ ] **Workspace Sync**: Cloud-based workspace persistence

### Long Term
- [ ] **Collaborative Editing**: Real-time collaborative code editing
- [ ] **AI Code Review**: Automated code quality suggestions
- [ ] **Plugin System**: Extensible architecture for custom tools
- [ ] **Deployment**: One-click deployment to cloud platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the existing code style
4. Add tests if applicable
5. Commit your changes: `git commit -m "Add feature description"`
6. Push to the branch: `git push origin feature-name`
7. Open a Pull Request with a clear description

### Development Guidelines
- Follow TypeScript best practices
- Use existing UI components from shadcn/ui
- Maintain consistent dark theme styling
- Add proper error handling and loading states
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Judge0](https://judge0.com/) - Online code execution system
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [OpenAI](https://openai.com/) - GPT API provider
- [Anthropic](https://anthropic.com/) - Claude API provider
- [Google AI](https://ai.google.dev/) - Gemini API provider

---

<div align="center">
  <p>Built with ❤️ by the CodePath AI team</p>
  <p><strong>Currently in active development 🚧</strong></p>
</div>
