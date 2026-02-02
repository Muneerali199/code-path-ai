import * as vscode from 'vscode';
import { CodePathAIProvider } from './codepath-ai-provider';

export function activate(context: vscode.ExtensionContext) {
    console.log('CodePath AI extension activated');

    const aiProvider = new CodePathAIProvider();

    // Register commands
    const explainCodeCommand = vscode.commands.registerCommand('codepath-ai.explainCode', async () => {
        await aiProvider.handleExplainCode();
    });

    const generateCodeCommand = vscode.commands.registerCommand('codepath-ai.generateCode', async () => {
        await aiProvider.handleGenerateCode();
    });

    const debugCodeCommand = vscode.commands.registerCommand('codepath-ai.debugCode', async () => {
        await aiProvider.handleDebugCode();
    });

    const analyzeCodeCommand = vscode.commands.registerCommand('codepath-ai.analyzeCode', async () => {
        await aiProvider.handleAnalyzeCode();
    });

    const refactorCodeCommand = vscode.commands.registerCommand('codepath-ai.refactorCode', async () => {
        await aiProvider.handleRefactorCode();
    });

    // Add all disposables to context
    context.subscriptions.push(
        explainCodeCommand,
        generateCodeCommand,
        debugCodeCommand,
        analyzeCodeCommand,
        refactorCodeCommand
    );
}

export function deactivate() {
    console.log('CodePath AI extension deactivated');
}