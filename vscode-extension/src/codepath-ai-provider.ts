import * as vscode from 'vscode';
import axios from 'axios';
import { wrapInLayout, markdownToHtml, panelHeader, getBaseStyles, getCopyScript } from './webview-styles';

interface CodePathRequest {
    code?: string;
    message?: string;
    language?: string;
    action: 'explain' | 'generate' | 'debug' | 'analyze' | 'refactor' | 'create';
    model?: string;
    provider?: string;
    userApiKey?: string;
    context?: {
        fileName?: string;
        filePath?: string;
        projectContext?: string;
        selectionRange?: {
            startLine: number;
            endLine: number;
        };
        editorContext?: {
            precedingLines?: string;
            followingLines?: string;
        };
    };
    userId?: string;
    sessionId?: string;
}

interface CodePathResponse {
    success: boolean;
    data?: any;
    error?: string;
    modelUsed?: string;
}

interface ModelOption {
    id: string;
    label: string;
    provider: string;
    category: 'trending' | 'china' | 'other';
}

interface GenerateProjectForm {
    projectType?: string;
    platform?: string;
    framework?: string;
    language?: string;
    styling?: string;
    state?: string;
    pages?: string;
    features?: string;
    data?: string;
    auth?: string;
    tests?: string;
    deployment?: string;
    additional?: string;
}

export class CodePathAIProvider {
    private backendUrl: string;
    private userId: string | undefined;
    private sessionId: string;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        // Get backend URL from configuration
        this.backendUrl = vscode.workspace.getConfiguration('codepath-ai').get('backendUrl') || 'http://localhost:3001';
        this.sessionId = this.generateSessionId();
        
        // Initialize user ID (could be from settings or generated)
        this.userId = this.getUserId();
    }

    private generateSessionId(): string {
        return 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    private getUserId(): string | undefined {
        // Could be retrieved from VSCode settings or generated
        return vscode.workspace.getConfiguration('codepath-ai').get('userId') || undefined;
    }

    private getSelectedModel(): { model?: string; provider?: string } {
        const config = vscode.workspace.getConfiguration('codepath-ai');
        const model = config.get<string>('model') || undefined;
        const provider = config.get<string>('provider') || undefined;
        return { model, provider };
    }

    private isLocalBackend(): boolean {
        try {
            const url = new URL(this.backendUrl);
            return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1';
        } catch {
            return this.backendUrl.includes('localhost') || this.backendUrl.includes('127.0.0.1');
        }
    }

    private getBackendApiKey(): string {
        const configKey = vscode.workspace.getConfiguration('codepath-ai').get<string>('apiKey') || '';
        if (configKey) {
            return configKey;
        }

        if (this.isLocalBackend()) {
            // Matches backend default dev key in api-key-auth.service.ts
            return 'cp_dev_key_default_for_testing_purpose';
        }

        return '';
    }

    private async getUserApiKey(): Promise<string | undefined> {
        const secret = await this.context.secrets.get('codepath-ai.userApiKey');
        if (secret) {
            return secret;
        }

        const configFallback = vscode.workspace.getConfiguration('codepath-ai').get<string>('userApiKey');
        return configFallback || undefined;
    }

    private getRequestTimeoutMs(fallback: number): number {
        const configured = vscode.workspace.getConfiguration('codepath-ai').get<number>('requestTimeoutMs');
        if (typeof configured === 'number' && configured > 0) {
            return configured;
        }
        return fallback;
    }

    private async sendRequest(request: CodePathRequest): Promise<CodePathResponse> {
        try {
            const { model, provider } = this.getSelectedModel();
            const userApiKey = await this.getUserApiKey();
            const backendApiKey = this.getBackendApiKey();

            if (!backendApiKey) {
                return {
                    success: false,
                    error: 'Missing backend API key. Set "codepath-ai.apiKey" in settings.'
                };
            }

            if (provider === 'nvidia') {
                return await this.sendNimRequest(request, model, userApiKey);
            }

            const response: any = await axios.post(
                `${this.backendUrl}/ai/vscode/process`,
                {
                    ...request,
                    model,
                    provider,
                    userApiKey,
                    userId: this.userId,
                    sessionId: this.sessionId
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${backendApiKey}`
                    },
                    timeout: this.getRequestTimeoutMs(30000)
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error communicating with CodePath backend:', error);

            if (error?.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: 'Request timed out. Try a smaller request or increase "codepath-ai.requestTimeoutMs" in settings.'
                };
            }
            
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error occurred'
            };
        }
    }

    private async sendNimRequest(request: CodePathRequest, model?: string, userApiKey?: string): Promise<CodePathResponse> {
        if (!userApiKey) {
            return { success: false, error: 'Missing user API key. Set it with "CodePath: Set User API Key".' };
        }

        const config = vscode.workspace.getConfiguration('codepath-ai');
        const invokeUrl = config.get<string>('nimInvokeUrl') || 'https://integrate.api.nvidia.com/v1/chat/completions';
        const thinking = config.get<boolean>('nimThinking') ?? true;

        const messages = this.buildNimMessages(request);

        try {
            const response: any = await axios.post(
                invokeUrl,
                {
                    model: model || 'moonshotai/kimi-k2.5',
                    messages,
                    max_tokens: 16384,
                    temperature: 1.0,
                    top_p: 1.0,
                    stream: false,
                    chat_template_kwargs: { thinking }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userApiKey}`
                    },
                    timeout: this.getRequestTimeoutMs(60000)
                }
            );

            const content = response.data?.choices?.[0]?.message?.content;
            if (!content) {
                return { success: false, error: 'Empty response from NIM.' };
            }

            return { success: true, data: { response: content }, modelUsed: model || 'moonshotai/kimi-k2.5' };
        } catch (error: any) {
            if (error?.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: 'Request timed out. Try a smaller request or increase "codepath-ai.requestTimeoutMs" in settings.'
                };
            }
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error occurred'
            };
        }
    }

    private buildNimMessages(request: CodePathRequest): { role: 'user' | 'assistant' | 'system'; content: string }[] {
        const language = request.language || 'code';
        const code = request.code || '';
        const message = request.message || '';

        switch (request.action) {
            case 'explain':
                return [{ role: 'user', content: `Explain the following ${language}:\n\n${code}` }];
            case 'generate':
                return [{ role: 'user', content: `Generate ${language} for the following request:\n\n${message}` }];
            case 'debug':
                return [{ role: 'user', content: `Debug the following ${language}.\nIssue: ${message || 'No issue provided'}\n\n${code}` }];
            case 'analyze':
                return [{ role: 'user', content: `Analyze the following ${language} for ${message || 'issues'}:\n\n${code}` }];
            case 'refactor':
                return [{ role: 'user', content: `Refactor the following ${language}:\n\n${code}` }];
            case 'create':
            default:
                return [{ role: 'user', content: message || code }];
        }
    }

    async handleSelectModel(): Promise<void> {
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

    async handleSetUserApiKey(): Promise<void> {
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

    async handleClearUserApiKey(): Promise<void> {
        await this.context.secrets.delete('codepath-ai.userApiKey');
        vscode.window.showInformationMessage('User API key cleared.');
    }

    private async getModelOptions(): Promise<ModelOption[]> {
        const config = vscode.workspace.getConfiguration('codepath-ai');
        const source = config.get<string>('modelListSource') || 'dynamic';

        if (source === 'dynamic') {
            const remote = await this.fetchModelsFromBackend();
            if (remote && remote.length > 0) {
                return remote;
            }
        }

        return this.getFallbackModels();
    }

    private async fetchModelsFromBackend(): Promise<ModelOption[] | null> {
        try {
            const backendApiKey = this.getBackendApiKey();
            if (!backendApiKey) {
                return null;
            }
            const response: any = await axios.get(
                `${this.backendUrl}/ai/vscode/models`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${backendApiKey}`
                    },
                    timeout: 10000
                }
            );

            if (response.data?.models && Array.isArray(response.data.models)) {
                return response.data.models;
            }

            return null;
        } catch (error) {
            console.warn('Failed to fetch models from backend, using fallback list.', error);
            return null;
        }
    }

    private getFallbackModels(): ModelOption[] {
        return [
            { id: 'moonshotai/kimi-k2.5', label: 'Kimi K2.5 (NVIDIA NIM)', provider: 'nvidia', category: 'trending' },
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

    async handleExplainCode(): Promise<void> {
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
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => {
            token.onCancellationRequested(() => {
                console.log('Code explanation cancelled');
            });

            progress.report({ increment: 0, message: 'Analyzing code...' });

            const request: CodePathRequest = {
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
                this.showExplanation(response.data.explanation || response.data.response, response.modelUsed);
            } else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }

    async handleGenerateCode(): Promise<void> {
        const mode = await vscode.window.showQuickPick(
            [
                { label: 'Quick Generate (insert into editor)', value: 'quick' },
                { label: 'Generate App/Web (wizard)', value: 'wizard' }
            ],
            { placeHolder: 'Choose how you want to generate code' }
        );

        if (!mode) {
            return;
        }

        if (mode.value === 'wizard') {
            await this.handleGenerateProject();
            return;
        }

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
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => {
            token.onCancellationRequested(() => {
                console.log('Code generation cancelled');
            });

            progress.report({ increment: 0, message: 'Preparing request...' });

            const request: CodePathRequest = {
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
            } else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }

    async handleGenerateProject(): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'codepathGenerateProject',
            'Generate App/Web',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        panel.webview.html = this.getGenerateProjectHtml();

        panel.webview.onDidReceiveMessage(async (msg: any) => {
            switch (msg.command) {
                case 'submitGenerateProject': {
                    const form: GenerateProjectForm = msg.payload || {};
                    panel.webview.postMessage({ command: 'setStatus', status: 'Generating project...' });

                    const request: CodePathRequest = {
                        message: this.buildProjectPrompt(form),
                        language: 'markdown',
                        action: 'generate'
                    };

                    const response = await this.sendRequest(request);
                    if (response.success && response.data) {
                        const content = response.data.generatedCode || response.data.response || '';
                        panel.webview.html = this.getGenerateProjectResultHtml(content, response.modelUsed);
                    } else {
                        panel.webview.postMessage({ command: 'setStatus', status: '' });
                        vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
                    }
                    break;
                }
                case 'openInNewFile': {
                    const content = msg.content || '';
                    await this.openGeneratedDocument(content);
                    break;
                }
                case 'insertInEditor': {
                    const content = msg.content || '';
                    await this.insertGeneratedCode(content);
                    break;
                }
                case 'openGenerator': {
                    panel.webview.html = this.getGenerateProjectHtml();
                    break;
                }
            }
        });
    }

    async handleDebugCode(): Promise<void> {
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
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => {
            token.onCancellationRequested(() => {
                console.log('Debugging cancelled');
            });

            progress.report({ increment: 0, message: 'Analyzing error...' });

            const request: CodePathRequest = {
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
                this.showDebugSolution(response.data.solution || response.data.response, response.modelUsed);
            } else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }

    async handleAnalyzeCode(): Promise<void> {
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
        const analysisType = await vscode.window.showQuickPick(
            ['security', 'performance', 'best-practices', 'refactoring'],
            { placeHolder: 'Select type of analysis' }
        );

        if (!analysisType) {
            return; // User cancelled
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `CodePath AI is analyzing code for ${analysisType} issues...`,
            cancellable: true
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => {
            token.onCancellationRequested(() => {
                console.log('Code analysis cancelled');
            });

            progress.report({ increment: 0, message: 'Analyzing code...' });

            const request: CodePathRequest = {
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
                this.showAnalysisResults(response.data, response.modelUsed);
            } else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }

    async handleRefactorCode(): Promise<void> {
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
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => {
            token.onCancellationRequested(() => {
                console.log('Refactoring cancelled');
            });

            progress.report({ increment: 0, message: 'Analyzing code structure...' });

            const request: CodePathRequest = {
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
            } else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }

    private getPrecedingLines(editor: vscode.TextEditor, startLine: number): string {
        const start = Math.max(0, startLine - 5); // Get up to 5 preceding lines
        const range = new vscode.Range(
            new vscode.Position(start, 0),
            new vscode.Position(startLine, 0)
        );
        return editor.document.getText(range);
    }

    private getFollowingLines(editor: vscode.TextEditor, endLine: number): string {
        const documentEndLine = editor.document.lineCount - 1;
        if (endLine >= documentEndLine) {
            return '';
        }
        const end = Math.min(documentEndLine, endLine + 5); // Get up to 5 following lines
        const range = new vscode.Range(
            new vscode.Position(endLine + 1, 0),
            new vscode.Position(end, editor.document.lineAt(end).range.end.character)
        );
        return editor.document.getText(range);
    }

    private showExplanation(explanation: string, modelUsed?: string): void {
        const panel = vscode.window.createWebviewPanel(
            'codepathExplanation',
            'CodePath Explanation',
            vscode.ViewColumn.Beside,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        const formattedExplanation = this.formatExplanationConcisely(explanation);
        panel.webview.html = this.getExplanationHtml(formattedExplanation, modelUsed);
    }

    private formatExplanationConcisely(originalExplanation: string): string {
        // This function transforms the explanation into a concise format
        // with the structure: What it does, Why it works, Remember, Common mistakes

        // Extract key information from the original explanation
        const lines = originalExplanation.split('\n').filter(line => line.trim() !== '');

        // Basic heuristic to identify different parts of the explanation
        let whatItDoes = '';
        let whyItWorks = '';
        let remember = '';
        let commonMistake = '';

        // Look for keywords that might indicate different sections
        let foundWhat = false;
        let foundWhy = false;
        let foundRemember = false;
        let foundMistake = false;

        for (const line of lines) {
            const lowerLine = line.toLowerCase();

            if (!foundWhat && (lowerLine.includes('purpose') || lowerLine.includes('does') || lowerLine.includes('function'))) {
                whatItDoes += line + ' ';
                foundWhat = true;
            } else if (!foundWhy && (lowerLine.includes('why') || lowerLine.includes('works') || lowerLine.includes('because') || lowerLine.includes('since'))) {
                whyItWorks += line + ' ';
                foundWhy = true;
            } else if (!foundRemember && (lowerLine.includes('important') || lowerLine.includes('remember') || lowerLine.includes('key'))) {
                remember += line + ' ';
                foundRemember = true;
            } else if (!foundMistake && (lowerLine.includes('error') || lowerLine.includes('mistake') || lowerLine.includes('common') || lowerLine.includes('problem'))) {
                commonMistake += line + ' ';
                foundMistake = true;
            } else if (!foundWhat) {
                // If we haven't found the "what" section yet, use the first meaningful line
                whatItDoes += line + ' ';
            }
        }

        // If we couldn't extract specific sections, use the first part of the explanation for "what it does"
        if (!whatItDoes) {
            whatItDoes = lines.length > 0 ? lines[0] : originalExplanation.substring(0, 100) + '...';
        }

        // Fill in defaults if sections weren't found
        if (!whyItWorks) {
            whyItWorks = 'This code implements the specified functionality using standard patterns.';
        }

        if (!remember) {
            remember = 'Pay attention to the syntax and parameters used.';
        }

        if (!commonMistake) {
            commonMistake = 'Common mistakes include syntax errors or incorrect parameter usage.';
        }

        // Format the explanation in the new concise style
        return `✅ **What this does**
${whatItDoes.trim()}

🧠 **Why it works**
${whyItWorks.trim()}

📌 **Remember**
${remember.trim()}

⚠️ **Common mistake**
${commonMistake.trim()}`;
    }

    private getExplanationHtml(content: string, modelUsed?: string): string {
        const body = `
            ${panelHeader('💡', 'Code Explanation', 'AI-powered code understanding', modelUsed)}
            <div class="animate-in delay-1">
                ${this.renderConciseExplanation(content)}
            </div>
        `;
        return wrapInLayout('CodePath Explanation', body);
    }

    private renderConciseExplanation(content: string): string {
        // Parse the concise sections
        const sections = content.split(/\n\n/).filter(s => s.trim());
        let html = '';
        const sectionStyles: Record<string, {icon: string; color: string; bg: string}> = {
            'what this does':    { icon: '✅', color: 'var(--green)',  bg: 'var(--green-dim)' },
            'why it works':      { icon: '🧠', color: 'var(--accent)', bg: 'var(--accent-dim)' },
            'remember':          { icon: '📌', color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
            'common mistake':    { icon: '⚠️', color: 'var(--orange)', bg: 'var(--orange-dim)' },
        };

        for (const section of sections) {
            let matched = false;
            for (const [key, style] of Object.entries(sectionStyles)) {
                if (section.toLowerCase().includes(key)) {
                    const lines = section.split('\n');
                    const title = lines[0].replace(/\*\*/g, '').replace(/[✅🧠📌⚠️]/g, '').trim();
                    const body = lines.slice(1).join('\n').trim();
                    html += `
                        <div class="card" style="border-left: 3px solid ${style.color};">
                            <div class="card-header">
                                <div class="icon" style="background: ${style.bg}; color: ${style.color};">${style.icon}</div>
                                <h4>${title}</h4>
                            </div>
                            <div style="color: var(--text-secondary); padding-left: 42px;">${markdownToHtml(body)}</div>
                        </div>
                    `;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                html += `<div class="card">${markdownToHtml(section)}</div>`;
            }
        }
        return html;
    }

    private formatAsMarkdownHtml(text: string): string {
        return markdownToHtml(text);
    }

    private async insertGeneratedCode(code: string): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // Insert at cursor position or end of document
        const position = editor.selection.active;
        await editor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.insert(position, '\n' + code);
        });
    }

    private showDebugSolution(solution: string, modelUsed?: string): void {
        const panel = vscode.window.createWebviewPanel(
            'codepathDebugSolution',
            'CodePath Debug Solution',
            vscode.ViewColumn.Beside,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        panel.webview.html = this.getDebugSolutionHtml(solution, modelUsed);
    }

    private getDebugSolutionHtml(content: string, modelUsed?: string): string {
        const body = `
            ${panelHeader('🐛', 'Debug Solution', 'AI-powered debugging assistant', modelUsed)}
            <div class="animate-in delay-1">
                <div class="card" style="border-left: 3px solid var(--red);">
                    <div class="card-header">
                        <div class="icon" style="background: var(--red-dim); color: var(--red);">🔍</div>
                        <h4>Diagnosis & Fix</h4>
                    </div>
                    <div style="padding-left: 42px; color: var(--text-secondary);">
                        ${markdownToHtml(content)}
                    </div>
                </div>
            </div>
        `;
        return wrapInLayout('CodePath Debug Solution', body);
    }

    private showAnalysisResults(results: any, modelUsed?: string): void {
        const panel = vscode.window.createWebviewPanel(
            'codepathAnalysis',
            'CodePath Analysis Results',
            vscode.ViewColumn.Beside,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        panel.webview.html = this.getAnalysisHtml(results, modelUsed);
    }

    private getAnalysisHtml(results: any, modelUsed?: string): string {
        let findingsHtml = '';

        if (results.findings && Array.isArray(results.findings)) {
            findingsHtml = results.findings.map((finding: any, i: number) => {
                const severity = (finding.severity || 'info').toLowerCase();
                const badgeClass = severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : severity === 'low' ? 'low' : 'info';
                const borderColor = this.getSeverityColor(severity);
                return `
                    <div class="card animate-in delay-${Math.min(i + 1, 4)}" style="border-left: 3px solid ${borderColor};">
                        <div class="card-header">
                            <div class="icon" style="background: ${borderColor}20; color: ${borderColor};">
                                ${severity === 'high' ? '🔴' : severity === 'medium' ? '🟠' : severity === 'low' ? '🟡' : '🔵'}
                            </div>
                            <h4 style="flex:1;">${finding.issue || 'Issue'}</h4>
                            <span class="badge ${badgeClass}">${finding.severity || 'Info'}</span>
                        </div>
                        <div style="padding-left: 42px; color: var(--text-secondary);">
                            <p><strong>Recommendation:</strong> ${finding.recommendation || 'No recommendation provided'}</p>
                            ${finding.example ? `<details><summary>View Example</summary><pre><div class="code-header"><span class="lang-badge">example</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div><code>${finding.example}</code></pre></details>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            findingsHtml = `<div class="card">${markdownToHtml(results.analysis || results.response || 'Analysis results not available')}</div>`;
        }

        // Summary counts
        let summaryHtml = '';
        if (results.findings && Array.isArray(results.findings)) {
            const counts = { high: 0, medium: 0, low: 0, other: 0 };
            results.findings.forEach((f: any) => {
                const s = (f.severity || '').toLowerCase();
                if (s === 'high') { counts.high++; }
                else if (s === 'medium') { counts.medium++; }
                else if (s === 'low') { counts.low++; }
                else { counts.other++; }
            });
            summaryHtml = `
                <div class="grid grid-3 animate-in" style="margin-bottom: 20px;">
                    <div class="card" style="text-align:center; border-top: 3px solid var(--red); padding: 16px;">
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--red);">${counts.high}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">High Severity</div>
                    </div>
                    <div class="card" style="text-align:center; border-top: 3px solid var(--orange); padding: 16px;">
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--orange);">${counts.medium}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">Medium Severity</div>
                    </div>
                    <div class="card" style="text-align:center; border-top: 3px solid var(--yellow); padding: 16px;">
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--yellow);">${counts.low + counts.other}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">Low / Info</div>
                    </div>
                </div>
            `;
        }

        const body = `
            ${panelHeader('🔎', 'Analysis Results', 'Code quality & security analysis', modelUsed)}
            ${summaryHtml}
            <div class="section">
                <div class="section-title">Findings</div>
                ${findingsHtml}
            </div>
        `;
        return wrapInLayout('CodePath Analysis Results', body);
    }

    private getSeverityColor(severity: string): string {
        switch (severity?.toLowerCase()) {
            case 'high': return 'var(--red)';
            case 'medium': return 'var(--orange)';
            case 'low': return 'var(--yellow)';
            default: return 'var(--accent)';
        }
    }

    private async applyRefactoring(refactoredCode: string, editor: vscode.TextEditor, selection: vscode.Selection): Promise<void> {
        // Replace the selected code with the refactored version
        await editor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(selection, refactoredCode);
        });

        vscode.window.showInformationMessage('Code refactored successfully!');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Dashboard Panel
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async handleOpenDashboard(): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'codepathDashboard',
            'CodePath AI Dashboard',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        const { model, provider } = this.getSelectedModel();
        const models = await this.getModelOptions();

        panel.webview.html = this.getDashboardHtml(model, provider, models);

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(async (msg: any) => {
            switch (msg.command) {
                case 'selectModel':
                    await this.handleSelectModel();
                    // Refresh dashboard with new model
                    const updated = this.getSelectedModel();
                    panel.webview.html = this.getDashboardHtml(updated.model, updated.provider, models);
                    break;
                case 'setApiKey':
                    await this.handleSetUserApiKey();
                    break;
                case 'explainCode':
                    await this.handleExplainCode();
                    break;
                case 'generateCode':
                    await this.handleGenerateCode();
                    break;
                case 'generateProject':
                    await this.handleGenerateProject();
                    break;
                case 'debugCode':
                    await this.handleDebugCode();
                    break;
                case 'analyzeCode':
                    await this.handleAnalyzeCode();
                    break;
                case 'refactorCode':
                    await this.handleRefactorCode();
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('workbench.action.openSettings', 'codepath-ai');
                    break;
            }
        });
    }

    private getDashboardHtml(currentModel?: string, currentProvider?: string, models?: ModelOption[]): string {
        const modelDisplayName = currentModel || 'Not selected';
        const providerName = currentProvider || 'N/A';

        const modelCards = (models || this.getFallbackModels()).map(m => {
            const isActive = m.id === currentModel;
            const categoryColors: Record<string, string> = {
                trending: 'var(--accent)',
                china: 'var(--teal)',
                other: 'var(--purple)',
            };
            const color = categoryColors[m.category] || 'var(--text-muted)';
            return `
                <div class="model-card ${isActive ? 'active' : ''}" title="${m.id}">
                    <div class="model-card-status">
                        <span class="status-dot" style="background: ${isActive ? 'var(--green)' : 'var(--text-muted)'};"></span>
                    </div>
                    <div class="model-card-info">
                        <div class="model-name">${m.label}</div>
                        <div class="model-provider">${m.provider}</div>
                    </div>
                    <span class="badge" style="background: ${color}20; color: ${color};">${m.category}</span>
                </div>
            `;
        }).join('');

        const actions = [
            { cmd: 'explainCode',  icon: '💡', title: 'Explain Code',   desc: 'Understand any code selection', color: 'var(--green)' },
            { cmd: 'generateCode', icon: '⚡', title: 'Generate Code',  desc: 'Create code from a description', color: 'var(--accent)' },
            { cmd: 'generateProject', icon: '🧱', title: 'Generate App/Web', desc: 'Full project from a prompt', color: 'var(--teal)' },
            { cmd: 'debugCode',    icon: '🐛', title: 'Debug Code',     desc: 'Find and fix bugs in your code', color: 'var(--red)' },
            { cmd: 'analyzeCode',  icon: '🔎', title: 'Analyze Code',   desc: 'Security, performance & quality', color: 'var(--orange)' },
            { cmd: 'refactorCode', icon: '🔄', title: 'Refactor Code',  desc: 'Improve structure & readability', color: 'var(--purple)' },
        ];

        const actionCards = actions.map((a, i) => `
            <button class="action-card animate-in delay-${Math.min(i + 1, 4)}" onclick="sendCommand('${a.cmd}')">
                <div class="action-icon" style="background: ${a.color}18; color: ${a.color};">${a.icon}</div>
                <div class="action-info">
                    <div class="action-title">${a.title}</div>
                    <div class="action-desc">${a.desc}</div>
                </div>
                <span class="action-arrow">→</span>
            </button>
        `).join('');

        const body = `
            <style>
                /* ── Dashboard-specific styles ──────── */
                .dash-hero {
                    text-align: center;
                    padding: 36px 20px 28px;
                    margin-bottom: 8px;
                }
                .dash-hero .hero-logo {
                    width: 64px; height: 64px;
                    background: linear-gradient(135deg, var(--accent), var(--purple));
                    border-radius: 16px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--bg-primary);
                    box-shadow: 0 4px 20px rgba(137, 180, 250, 0.3);
                    margin-bottom: 16px;
                }
                .dash-hero h1 {
                    font-size: 1.6rem;
                    background: linear-gradient(135deg, var(--accent), var(--purple));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 6px;
                }
                .dash-hero .tagline { color: var(--text-muted); font-size: 0.88rem; }

                /* ── Status bar ─────────────────────── */
                .status-bar {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    flex-wrap: wrap;
                    margin-bottom: 32px;
                }
                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.82rem;
                    color: var(--text-secondary);
                }
                .status-item .dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: var(--green);
                    box-shadow: 0 0 6px var(--green);
                }

                /* ── Action cards ───────────────────── */
                .action-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    width: 100%;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    padding: 16px 18px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all var(--transition);
                    font-family: var(--font-sans);
                    text-align: left;
                    color: var(--text-primary);
                }
                .action-card:hover {
                    border-color: var(--accent);
                    background: var(--bg-surface-hover);
                    box-shadow: var(--shadow-sm);
                    transform: translateX(4px);
                }
                .action-icon {
                    width: 42px; height: 42px;
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }
                .action-info { flex: 1; }
                .action-title { font-weight: 600; font-size: 0.92rem; }
                .action-desc { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
                .action-arrow {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                    opacity: 0;
                    transform: translateX(-4px);
                    transition: all var(--transition);
                }
                .action-card:hover .action-arrow { opacity: 1; transform: translateX(0); }

                /* ── Model cards ────────────────────── */
                .models-scroll {
                    max-height: 260px;
                    overflow-y: auto;
                    padding-right: 4px;
                }
                .model-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    border-radius: var(--radius-sm);
                    transition: background var(--transition);
                    cursor: default;
                }
                .model-card:hover { background: var(--bg-surface-hover); }
                .model-card.active {
                    background: var(--accent-dim);
                    border: 1px solid rgba(137, 180, 250, 0.2);
                    border-radius: var(--radius-sm);
                }
                .model-card-status { flex-shrink: 0; }
                .status-dot { width: 8px; height: 8px; border-radius: 50%; display: block; }
                .model-card-info { flex: 1; min-width: 0; }
                .model-name { font-size: 0.85rem; font-weight: 500; }
                .model-provider { font-size: 0.72rem; color: var(--text-muted); }

                /* ── Footer ─────────────────────────── */
                .dash-footer {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 28px;
                    padding-top: 20px;
                    border-top: 1px solid var(--border-subtle);
                }

                /* ── Keyboard shortcuts ─────────────── */
                .shortcut-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 8px;
                    margin-top: 10px;
                }
                .shortcut-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: var(--bg-surface);
                    border-radius: var(--radius-sm);
                    font-size: 0.8rem;
                }
                .shortcut-item .label { color: var(--text-secondary); }
                .kbd {
                    display: inline-block;
                    padding: 2px 6px;
                    background: var(--bg-code);
                    border: 1px solid var(--border-subtle);
                    border-radius: 4px;
                    font-family: var(--font-mono);
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    box-shadow: 0 1px 0 var(--bg-secondary);
                }
            </style>

            <!-- Hero -->
            <div class="dash-hero animate-in">
                <div class="hero-logo">CP</div>
                <h1>CodePath AI</h1>
                <p class="tagline">Your intelligent coding assistant — powered by multi-model AI</p>
            </div>

            <!-- Status Bar -->
            <div class="status-bar animate-in delay-1">
                <div class="status-item">
                    <span class="dot"></span>
                    <span><strong>Model:</strong> ${modelDisplayName}</span>
                </div>
                <div class="status-item">
                    <span><strong>Provider:</strong> ${providerName}</span>
                </div>
                <div class="status-item" style="cursor: pointer;" onclick="sendCommand('selectModel')">
                    🔄 Change Model
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="section animate-in delay-2">
                <div class="section-title">Quick Actions</div>
                ${actionCards}
            </div>

            <!-- Models Overview -->
            <div class="section animate-in delay-3">
                <div class="section-title">Available Models</div>
                <div class="card">
                    <div class="models-scroll">
                        ${modelCards}
                    </div>
                </div>
            </div>

            <!-- Keyboard Shortcuts -->
            <div class="section animate-in delay-4">
                <div class="section-title">Tips</div>
                <div class="card">
                    <div class="shortcut-grid">
                        <div class="shortcut-item"><span class="label">Select code →</span> <span>Right-click context menu</span></div>
                        <div class="shortcut-item"><span class="label">Command Palette</span> <span class="kbd">Ctrl+Shift+P</span></div>
                        <div class="shortcut-item"><span class="label">Switch Model</span> <span><em>CodePath: Select Model</em></span></div>
                        <div class="shortcut-item"><span class="label">Set API Key</span> <span><em>CodePath: Set User API Key</em></span></div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="dash-footer animate-in delay-4">
                <button class="btn btn-secondary" onclick="sendCommand('setApiKey')">🔑 Set API Key</button>
                <button class="btn btn-secondary" onclick="sendCommand('openSettings')">⚙️ Settings</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function sendCommand(cmd) {
                    vscode.postMessage({ command: cmd });
                }
            </script>
        `;

        return wrapInLayout('CodePath AI Dashboard', body);
    }

    private buildProjectPrompt(form: GenerateProjectForm): string {
        const sections: string[] = [];
        const push = (label: string, value?: string) => {
            if (value && value.trim().length > 0) {
                sections.push(`${label}: ${value.trim()}`);
            }
        };

        push('Project type', form.projectType);
        push('Platform', form.platform);
        push('Framework', form.framework);
        push('Language', form.language);
        push('Styling', form.styling);
        push('State management', form.state);
        push('Pages/Routes', form.pages);
        push('Features', form.features);
        push('API/Data', form.data);
        push('Authentication', form.auth);
        push('Testing', form.tests);
        push('Deployment', form.deployment);
        push('Additional requirements', form.additional);

        const details = sections.length > 0 ? sections.join('\n') : 'Use sensible defaults.';

        return [
            'Generate a complete, runnable project based on the following requirements.',
            '',
            details,
            '',
            'Output format requirements:',
            '1) Provide a project tree (folders and files).',
            '2) Provide complete file contents using Markdown code blocks.',
            '3) Include setup and run instructions.',
            '4) Keep the output deterministic and minimal while still complete.'
        ].join('\n');
    }

    private async openGeneratedDocument(content: string): Promise<void> {
        const doc = await vscode.workspace.openTextDocument({
            content: content || '',
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc, { preview: false });
    }

    private getGenerateProjectHtml(): string {
        const body = `
            <style>
                .gen-hero {
                    text-align: center;
                    padding: 20px 16px 10px;
                }
                .gen-hero h1 {
                    font-size: 1.4rem;
                    margin-bottom: 6px;
                }
                .gen-hero p { color: var(--text-muted); font-size: 0.86rem; }
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 12px;
                }
                .form-field label {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                }
                .form-field input, .form-field textarea, .form-field select {
                    width: 100%;
                    background: var(--bg-code);
                    border: 1px solid var(--border-subtle);
                    color: var(--text-primary);
                    border-radius: 8px;
                    padding: 10px 12px;
                    font-family: var(--font-sans);
                    font-size: 0.9rem;
                }
                .form-field textarea { min-height: 90px; resize: vertical; }
                .actions-row {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 16px;
                }
                .status {
                    margin-top: 10px;
                    font-size: 0.82rem;
                    color: var(--text-muted);
                    min-height: 18px;
                }
            </style>

            <div class="gen-hero">
                <h1>Generate App/Web</h1>
                <p>Describe what you want. We will generate a full project structure and code.</p>
            </div>

            <div class="section">
                <div class="section-title">Project Details</div>
                <div class="card">
                    <div class="form-grid">
                        <div class="form-field">
                            <label>Project Type</label>
                            <select id="projectType">
                                <option>Web App</option>
                                <option>Mobile App</option>
                                <option>Backend API</option>
                                <option>CLI Tool</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>Platform</label>
                            <input id="platform" placeholder="e.g., browser, iOS/Android, server" />
                        </div>
                        <div class="form-field">
                            <label>Framework</label>
                            <input id="framework" placeholder="e.g., React, Next.js, Flutter, Express" />
                        </div>
                        <div class="form-field">
                            <label>Language</label>
                            <input id="language" placeholder="e.g., TypeScript, JavaScript, Dart" />
                        </div>
                        <div class="form-field">
                            <label>Styling/UI</label>
                            <input id="styling" placeholder="e.g., Tailwind, CSS Modules, Material UI" />
                        </div>
                        <div class="form-field">
                            <label>State Management</label>
                            <input id="state" placeholder="e.g., Redux, Zustand, Riverpod" />
                        </div>
                        <div class="form-field">
                            <label>Pages / Routes</label>
                            <input id="pages" placeholder="e.g., Home, Dashboard, Settings" />
                        </div>
                        <div class="form-field">
                            <label>Core Features</label>
                            <input id="features" placeholder="e.g., auth, CRUD, search, charts" />
                        </div>
                        <div class="form-field">
                            <label>API / Data</label>
                            <input id="data" placeholder="e.g., REST API, Firebase, local JSON" />
                        </div>
                        <div class="form-field">
                            <label>Auth</label>
                            <input id="auth" placeholder="e.g., JWT, OAuth, none" />
                        </div>
                        <div class="form-field">
                            <label>Testing</label>
                            <input id="tests" placeholder="e.g., Jest, Playwright, none" />
                        </div>
                        <div class="form-field">
                            <label>Deployment</label>
                            <input id="deployment" placeholder="e.g., Vercel, Netlify, Docker" />
                        </div>
                    </div>
                    <div class="form-field" style="margin-top:12px;">
                        <label>Additional Requirements</label>
                        <textarea id="additional" placeholder="Any constraints, edge cases, or special requests"></textarea>
                    </div>
                    <div class="actions-row">
                        <button class="btn btn-secondary" onclick="fillTemplate()">Fill Example</button>
                        <button class="btn btn-primary" onclick="submit()">Generate Project</button>
                    </div>
                    <div class="status" id="status"></div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function val(id) { return document.getElementById(id).value; }
                function submit() {
                    const payload = {
                        projectType: val('projectType'),
                        platform: val('platform'),
                        framework: val('framework'),
                        language: val('language'),
                        styling: val('styling'),
                        state: val('state'),
                        pages: val('pages'),
                        features: val('features'),
                        data: val('data'),
                        auth: val('auth'),
                        tests: val('tests'),
                        deployment: val('deployment'),
                        additional: val('additional')
                    };
                    vscode.postMessage({ command: 'submitGenerateProject', payload });
                }
                function fillTemplate() {
                    document.getElementById('projectType').value = 'Web App';
                    document.getElementById('platform').value = 'Browser';
                    document.getElementById('framework').value = 'React + Vite';
                    document.getElementById('language').value = 'TypeScript';
                    document.getElementById('styling').value = 'Tailwind CSS';
                    document.getElementById('state').value = 'Zustand';
                    document.getElementById('pages').value = 'Home, Dashboard, Settings';
                    document.getElementById('features').value = 'Auth, CRUD, charts';
                    document.getElementById('data').value = 'Mock API with JSON';
                    document.getElementById('auth').value = 'Email/password';
                    document.getElementById('tests').value = 'Jest';
                    document.getElementById('deployment').value = 'Vercel';
                    document.getElementById('additional').value = 'Include README and basic error handling.';
                }
                window.addEventListener('message', (event) => {
                    const msg = event.data;
                    if (msg.command === 'setStatus') {
                        document.getElementById('status').textContent = msg.status || '';
                    }
                });
            </script>
        `;

        return wrapInLayout('Generate App/Web', body);
    }

    private getGenerateProjectResultHtml(content: string, modelUsed?: string): string {
        const rendered = markdownToHtml(content || 'No content returned.');
        const body = `
            ${panelHeader('ðŸ§±', 'Generated Project', 'Full app/web scaffold', modelUsed)}
            <div class="section">
                <div class="section-title">Output</div>
                <div class="card">${rendered}</div>
            </div>
            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:16px;">
                <button class="btn btn-secondary" onclick="openInNewFile()">Open in New File</button>
                <button class="btn btn-secondary" onclick="insertInEditor()">Insert in Editor</button>
                <button class="btn btn-primary" onclick="openGenerator()">Generate Another</button>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                const content = ${JSON.stringify(content || '')};
                function openInNewFile() { vscode.postMessage({ command: 'openInNewFile', content }); }
                function insertInEditor() { vscode.postMessage({ command: 'insertInEditor', content }); }
                function openGenerator() { vscode.postMessage({ command: 'openGenerator' }); }
            </script>
        `;

        return wrapInLayout('Generated Project', body);
    }
}
