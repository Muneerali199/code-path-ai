import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';

interface CodePathRequest {
    code?: string;
    message?: string;
    language?: string;
    action: 'explain' | 'generate' | 'debug' | 'analyze' | 'refactor' | 'create';
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

export class CodePathAIProvider {
    private backendUrl: string;
    private userId: string | undefined;
    private sessionId: string;

    constructor() {
        // Get backend URL from configuration
        this.backendUrl = vscode.workspace.getConfiguration('codepath-ai').get('backendUrl') || 'http://localhost:3000';
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

    private async sendRequest(request: CodePathRequest): Promise<CodePathResponse> {
        try {
            const response: AxiosResponse<CodePathResponse> = await axios.post(
                `${this.backendUrl}/ai/vscode/process`,
                {
                    ...request,
                    userId: this.userId,
                    sessionId: this.sessionId
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${vscode.workspace.getConfiguration('codepath-ai').get('apiKey') || ''}`
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error communicating with CodePath backend:', error);
            
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error occurred'
            };
        }
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
        }, async (progress, token) => {
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
                // Show the explanation in an output channel or new document
                this.showExplanation(response.data.explanation || response.data.response);
            } else {
                vscode.window.showErrorMessage(`Error: ${response.error || 'Unknown error occurred'}`);
            }
        });
    }

    async handleGenerateCode(): Promise<void> {
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
        }, async (progress, token) => {
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
                this.showDebugSolution(response.data.solution || response.data.response);
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
        }, async (progress, token) => {
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
                this.showAnalysisResults(response.data);
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
        }, async (progress, token) => {
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
        const end = Math.min(documentEndLine, endLine + 5); // Get up to 5 following lines
        const range = new vscode.Range(
            new vscode.Position(endLine + 1, 0),
            new vscode.Position(end, editor.document.lineAt(end).range.end.character)
        );
        return editor.document.getText(range);
    }

    private showExplanation(explanation: string): void {
        const panel = vscode.window.createWebviewPanel(
            'codepathExplanation',
            'CodePath Explanation',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = this.getExplanationHtml(explanation);
    }

    private getExplanationHtml(content: string): string {
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

    private formatAsMarkdown(text: string): string {
        // Simple markdown formatting for the webview
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Italic
            .replace(/`(.*?)`/g, '<code>$1</code>')           // Inline code
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>'); // Code blocks

        // Convert newlines to paragraphs
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        formatted = `<p>${formatted}</p>`;
        formatted = formatted.replace(/<p><\/p>/g, '');

        return formatted;
    }

    private async insertGeneratedCode(code: string): Promise<void> {
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

    private showDebugSolution(solution: string): void {
        const panel = vscode.window.createWebviewPanel(
            'codepathDebugSolution',
            'CodePath Debug Solution',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = this.getDebugSolutionHtml(solution);
    }

    private getDebugSolutionHtml(content: string): string {
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

    private showAnalysisResults(results: any): void {
        const panel = vscode.window.createWebviewPanel(
            'codepathAnalysis',
            'CodePath Analysis Results',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = this.getAnalysisHtml(results);
    }

    private getAnalysisHtml(results: any): string {
        let findingsHtml = '';
        
        if (results.findings && Array.isArray(results.findings)) {
            findingsHtml = results.findings.map((finding: any) => `
                <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid ${this.getSeverityColor(finding.severity)};">
                    <h4 style="margin: 0 0 5px 0; color: ${this.getSeverityColor(finding.severity)};">${finding.issue || 'Issue'}</h4>
                    <p><strong>Severity:</strong> ${finding.severity || 'Unknown'}</p>
                    <p><strong>Recommendation:</strong> ${finding.recommendation || 'No recommendation provided'}</p>
                    ${finding.example ? `<details><summary>Example</summary><pre>${finding.example}</pre></details>` : ''}
                </div>
            `).join('');
        } else {
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

    private getSeverityColor(severity: string): string {
        switch (severity?.toLowerCase()) {
            case 'high': return '#d73a49'; // Red
            case 'medium': return '#f66a0a'; // Orange
            case 'low': return '#ffd33d'; // Yellow
            default: return '#005fb8'; // Blue
        }
    }

    private async applyRefactoring(refactoredCode: string, editor: vscode.TextEditor, selection: vscode.Selection): Promise<void> {
        // Replace the selected code with the refactored version
        await editor.edit(editBuilder => {
            editBuilder.replace(selection, refactoredCode);
        });

        vscode.window.showInformationMessage('Code refactored successfully!');
    }
}