"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodePathAIProvider = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
class CodePathAIProvider {
    constructor(context) {
        this.context = context;
        // Get backend URL from configuration
        this.backendUrl = vscode.workspace.getConfiguration('codepath-ai').get('backendUrl') || 'http://localhost:3001';
        this.sessionId = this.generateSessionId();
        // Initialize user ID (could be from settings or generated)
        this.userId = this.getUserId();
    }
    generateSessionId() {
        return 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    getUserId() {
        // Could be retrieved from VSCode settings or generated
        return vscode.workspace.getConfiguration('codepath-ai').get('userId') || undefined;
    }
    getSelectedModel() {
        const config = vscode.workspace.getConfiguration('codepath-ai');
        const model = config.get('model') || undefined;
        const provider = config.get('provider') || undefined;
        return { model, provider };
    }
    async getUserApiKey() {
        const secret = await this.context.secrets.get('codepath-ai.userApiKey');
        if (secret) {
            return secret;
        }
        const configFallback = vscode.workspace.getConfiguration('codepath-ai').get('userApiKey');
        return configFallback || undefined;
    }
    async sendRequest(request) {
        try {
            const { model, provider } = this.getSelectedModel();
            const userApiKey = await this.getUserApiKey();
            const response = await axios_1.default.post(`${this.backendUrl}/ai/vscode/process`, {
                ...request,
                model,
                provider,
                userApiKey,
                userId: this.userId,
                sessionId: this.sessionId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${vscode.workspace.getConfiguration('codepath-ai').get('apiKey') || ''}`
                },
                timeout: 30000 // 30 second timeout
            });
            return response.data;
        }
        catch (error) {
            console.error('Error communicating with CodePath backend:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error occurred'
            };
        }
    }
    async handleSelectModel() {
        const models = await this.getModelOptions();
        const items = models.map(model => ({
            label: model.label,
            description: `${model.provider} - ${model.id}`,
            detail: model.category === 'trending' ? 'Trending' : model.category === 'china' ? 'China' : 'Other',
            model
        }));
        const selection = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select an AI model'
        });
        if (!selection) {
            return;
        }
        const config = vscode.workspace.getConfiguration('codepath-ai');
        await config.update('model', selection.model.id, vscode.ConfigurationTarget.Global);
        await config.update('provider', selection.model.provider, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`CodePath AI model set to ${selection.model.label}`);
    }
    async handleSetUserApiKey() {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your model provider API key',
            password: true,
            placeHolder: 'e.g., sk-...'
        });
        if (!apiKey) {
            return;
        }
        await this.context.secrets.store('codepath-ai.userApiKey', apiKey);
        vscode.window.showInformationMessage('User API key saved securely.');
    }
    async handleClearUserApiKey() {
        await this.context.secrets.delete('codepath-ai.userApiKey');
        vscode.window.showInformationMessage('User API key cleared.');
    }
    async getModelOptions() {
        const config = vscode.workspace.getConfiguration('codepath-ai');
        const source = config.get('modelListSource') || 'dynamic';
        if (source === 'dynamic') {
            const remote = await this.fetchModelsFromBackend();
            if (remote && remote.length > 0) {
                return remote;
            }
        }
        return this.getFallbackModels();
    }
    async fetchModelsFromBackend() {
        try {
            const response = await axios_1.default.get(`${this.backendUrl}/ai/vscode/models`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${vscode.workspace.getConfiguration('codepath-ai').get('apiKey') || ''}`
                },
                timeout: 10000
            });
            if (response.data?.models && Array.isArray(response.data.models)) {
                return response.data.models;
            }
            return null;
        }
        catch (error) {
            console.warn('Failed to fetch models from backend, using fallback list.', error);
            return null;
        }
    }
    getFallbackModels() {
        return [
            { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai', category: 'trending' },
            { id: 'gpt-4.1', label: 'GPT-4.1', provider: 'openai', category: 'trending' },
            { id: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'anthropic', category: 'trending' },
            { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'google', category: 'trending' },
            { id: 'mistral-large', label: 'Mistral Large', provider: 'mistral', category: 'trending' },
            { id: 'qwen2.5-72b-instruct', label: 'Qwen 2.5 72B Instruct', provider: 'qwen', category: 'china' },
            { id: 'deepseek-r1', label: 'DeepSeek R1', provider: 'deepseek', category: 'china' },
            { id: 'yi-34b-chat', label: 'Yi 34B Chat', provider: 'yi', category: 'china' },
            { id: 'glm-4', label: 'GLM-4', provider: 'zhipu', category: 'china' },
            { id: 'moonshot-v1', label: 'Moonshot v1', provider: 'moonshot', category: 'china' }
        ];
    }
    async handleExplainCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage('Please select code to explain');
            return;
        }
        const selectedCode = editor.document.getText(selection);
        const language = editor.document.languageId;
        const fileName = editor.document.fileName;
        // Show progress indicator
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'CodePath AI is explaining your code...',
            cancellable: true
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log('Code explanation cancelled');
            });
            progress.report({ increment: 0, message: 'Analyzing code...' });
            const request = {
                code: selectedCode,
                language,
                action: 'explain',
                context: {
                    fileName: fileName,
                    filePath: editor.document.uri.path,
                    selectionRange: {
                        startLine: selection.start.line,
                        endLine: selection.end.line
                    },
                    editorContext: {
                        precedingLines: this.getPrecedingLines(editor, selection.start.line),
                        followingLines: this.getFollowingLines(editor, selection.end.line)
                    }
                }
            };
            progress.report({ increment: 50, message: 'Sending to AI...' });
            const response = await this.sendRequest(request);
            progress.report({ increment: 100, message: 'Formatting response...' });
            if (response.success && response.data) {
                // Show the explanation in an output channel or new document
                this.showExplanation(response.data.explanation || response.data.response);
            }
            else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }
    async handleGenerateCode() {
        // Prompt user for code description
        const description = await vscode.window.showInputBox({
            prompt: 'Describe the code you want to generate',
            placeHolder: 'e.g., "Create a function that validates email addresses"'
        });
        if (!description) {
            return; // User cancelled
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const language = editor.document.languageId;
        const fileName = editor.document.fileName;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'CodePath AI is generating code...',
            cancellable: true
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log('Code generation cancelled');
            });
            progress.report({ increment: 0, message: 'Preparing request...' });
            const request = {
                message: description,
                language,
                action: 'generate',
                context: {
                    fileName: fileName,
                    filePath: editor.document.uri.path
                }
            };
            progress.report({ increment: 50, message: 'Generating code...' });
            const response = await this.sendRequest(request);
            progress.report({ increment: 100, message: 'Inserting code...' });
            if (response.success && response.data) {
                this.insertGeneratedCode(response.data.generatedCode || response.data.response);
            }
            else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }
    async handleDebugCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const selection = editor.selection;
        const selectedCode = selection.isEmpty ? '' : editor.document.getText(selection);
        const language = editor.document.languageId;
        const fileName = editor.document.fileName;
        // Ask user for error description
        const errorMessage = await vscode.window.showInputBox({
            prompt: 'Describe the error or issue you\'re experiencing',
            placeHolder: 'e.g., "Function throws TypeError when passing null value"'
        });
        if (!errorMessage) {
            return; // User cancelled
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'CodePath AI is debugging your code...',
            cancellable: true
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log('Debugging cancelled');
            });
            progress.report({ increment: 0, message: 'Analyzing error...' });
            const request = {
                code: selectedCode,
                message: errorMessage,
                language,
                action: 'debug',
                context: {
                    fileName: fileName,
                    filePath: editor.document.uri.path,
                    selectionRange: selection.isEmpty ? undefined : {
                        startLine: selection.start.line,
                        endLine: selection.end.line
                    }
                }
            };
            progress.report({ increment: 50, message: 'Sending to AI...' });
            const response = await this.sendRequest(request);
            progress.report({ increment: 100, message: 'Formatting solution...' });
            if (response.success && response.data) {
                this.showDebugSolution(response.data.solution || response.data.response);
            }
            else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }
    async handleAnalyzeCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage('Please select code to analyze');
            return;
        }
        const selectedCode = editor.document.getText(selection);
        const language = editor.document.languageId;
        const fileName = editor.document.fileName;
        // Ask user what type of analysis they want
        const analysisType = await vscode.window.showQuickPick(['security', 'performance', 'best-practices', 'refactoring'], { placeHolder: 'Select type of analysis' });
        if (!analysisType) {
            return; // User cancelled
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `CodePath AI is analyzing code for ${analysisType} issues...`,
            cancellable: true
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log('Code analysis cancelled');
            });
            progress.report({ increment: 0, message: 'Analyzing code...' });
            const request = {
                code: selectedCode,
                language,
                action: 'analyze',
                context: {
                    fileName: fileName,
                    filePath: editor.document.uri.path,
                    selectionRange: {
                        startLine: selection.start.line,
                        endLine: selection.end.line
                    },
                    editorContext: {
                        precedingLines: this.getPrecedingLines(editor, selection.start.line),
                        followingLines: this.getFollowingLines(editor, selection.end.line)
                    }
                }
            };
            // Add analysis type to message
            request.message = `Analyze this code for ${analysisType} issues`;
            progress.report({ increment: 50, message: 'Sending to AI...' });
            const response = await this.sendRequest(request);
            progress.report({ increment: 100, message: 'Formatting analysis...' });
            if (response.success && response.data) {
                this.showAnalysisResults(response.data);
            }
            else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }
    async handleRefactorCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage('Please select code to refactor');
            return;
        }
        const selectedCode = editor.document.getText(selection);
        const language = editor.document.languageId;
        const fileName = editor.document.fileName;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'CodePath AI is refactoring your code...',
            cancellable: true
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log('Refactoring cancelled');
            });
            progress.report({ increment: 0, message: 'Analyzing code structure...' });
            const request = {
                code: selectedCode,
                language,
                action: 'refactor',
                context: {
                    fileName: fileName,
                    filePath: editor.document.uri.path,
                    selectionRange: {
                        startLine: selection.start.line,
                        endLine: selection.end.line
                    },
                    editorContext: {
                        precedingLines: this.getPrecedingLines(editor, selection.start.line),
                        followingLines: this.getFollowingLines(editor, selection.end.line)
                    }
                }
            };
            progress.report({ increment: 50, message: 'Sending to AI...' });
            const response = await this.sendRequest(request);
            progress.report({ increment: 100, message: 'Applying refactoring...' });
            if (response.success && response.data) {
                this.applyRefactoring(response.data.refactoredCode || response.data.response, editor, selection);
            }
            else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }
    getPrecedingLines(editor, startLine) {
        const start = Math.max(0, startLine - 5); // Get up to 5 preceding lines
        const range = new vscode.Range(new vscode.Position(start, 0), new vscode.Position(startLine, 0));
        return editor.document.getText(range);
    }
    getFollowingLines(editor, endLine) {
        const documentEndLine = editor.document.lineCount - 1;
        if (endLine >= documentEndLine) {
            return '';
        }
        const end = Math.min(documentEndLine, endLine + 5); // Get up to 5 following lines
        const range = new vscode.Range(new vscode.Position(endLine + 1, 0), new vscode.Position(end, editor.document.lineAt(end).range.end.character));
        return editor.document.getText(range);
    }
    showExplanation(explanation) {
        const panel = vscode.window.createWebviewPanel('codepathExplanation', 'CodePath Explanation', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.getExplanationHtml(explanation);
    }
    getExplanationHtml(content) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CodePath Explanation</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
                    code { font-family: 'Courier New', monospace; }
                    h3 { color: #007acc; }
                </style>
            </head>
            <body>
                <h3>CodePath AI Explanation</h3>
                <div>${this.formatAsMarkdown(content)}</div>
            </body>
            </html>
        `;
    }
    formatAsMarkdown(text) {
        // Simple markdown formatting for the webview
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>'); // Code blocks
        // Convert newlines to paragraphs
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        formatted = `<p>${formatted}</p>`;
        formatted = formatted.replace(/<p><\/p>/g, '');
        return formatted;
    }
    async insertGeneratedCode(code) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        // Insert at cursor position or end of document
        const position = editor.selection.active;
        await editor.edit(editBuilder => {
            editBuilder.insert(position, '\n' + code);
        });
    }
    showDebugSolution(solution) {
        const panel = vscode.window.createWebviewPanel('codepathDebugSolution', 'CodePath Debug Solution', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.getDebugSolutionHtml(solution);
    }
    getDebugSolutionHtml(content) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CodePath Debug Solution</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
                    code { font-family: 'Courier New', monospace; }
                    h3 { color: #d73a49; }
                    .solution { margin-top: 20px; }
                </style>
            </head>
            <body>
                <h3>CodePath AI Debug Solution</h3>
                <div class="solution">${this.formatAsMarkdown(content)}</div>
            </body>
            </html>
        `;
    }
    showAnalysisResults(results) {
        const panel = vscode.window.createWebviewPanel('codepathAnalysis', 'CodePath Analysis Results', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = this.getAnalysisHtml(results);
    }
    getAnalysisHtml(results) {
        let findingsHtml = '';
        if (results.findings && Array.isArray(results.findings)) {
            findingsHtml = results.findings.map((finding) => `
                <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid ${this.getSeverityColor(finding.severity)};">
                    <h4 style="margin: 0 0 5px 0; color: ${this.getSeverityColor(finding.severity)};">${finding.issue || 'Issue'}</h4>
                    <p><strong>Severity:</strong> ${finding.severity || 'Unknown'}</p>
                    <p><strong>Recommendation:</strong> ${finding.recommendation || 'No recommendation provided'}</p>
                    ${finding.example ? `<details><summary>Example</summary><pre>${finding.example}</pre></details>` : ''}
                </div>
            `).join('');
        }
        else {
            findingsHtml = `<p>${results.analysis || results.response || 'Analysis results not available'}</p>`;
        }
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CodePath Analysis Results</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
                    code { font-family: 'Courier New', monospace; }
                    h3 { color: #005fb8; }
                    details { margin: 10px 0; }
                    summary { cursor: pointer; font-weight: bold; }
                </style>
            </head>
            <body>
                <h3>CodePath AI Analysis Results</h3>
                <div>${findingsHtml}</div>
            </body>
            </html>
        `;
    }
    getSeverityColor(severity) {
        switch (severity?.toLowerCase()) {
            case 'high': return '#d73a49'; // Red
            case 'medium': return '#f66a0a'; // Orange
            case 'low': return '#ffd33d'; // Yellow
            default: return '#005fb8'; // Blue
        }
    }
    async applyRefactoring(refactoredCode, editor, selection) {
        // Replace the selected code with the refactored version
        await editor.edit(editBuilder => {
            editBuilder.replace(selection, refactoredCode);
        });
        vscode.window.showInformationMessage('Code refactored successfully!');
    }
}
exports.CodePathAIProvider = CodePathAIProvider;
//# sourceMappingURL=codepath-ai-provider.js.map