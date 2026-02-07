import * as vscode from 'vscode';
import { CodePathAIProvider } from './codepath-ai-provider';

export function activate(context: vscode.ExtensionContext) {
    console.log('CodePath AI extension activated');

    const aiProvider = new CodePathAIProvider(context);

    // Register commands
    const explainCodeCommand = vscode.commands.registerCommand('codepath-ai.explainCode', async () => {
        await aiProvider.handleExplainCode();
    });

    const generateCodeCommand = vscode.commands.registerCommand('codepath-ai.generateCode', async () => {
        await aiProvider.handleGenerateCode();
    });

    const generateProjectCommand = vscode.commands.registerCommand('codepath-ai.generateProject', async () => {
        await aiProvider.handleGenerateProject();
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

    const selectModelCommand = vscode.commands.registerCommand('codepath-ai.selectModel', async () => {
        await aiProvider.handleSelectModel();
    });

    const setUserApiKeyCommand = vscode.commands.registerCommand('codepath-ai.setUserApiKey', async () => {
        await aiProvider.handleSetUserApiKey();
    });

    const clearUserApiKeyCommand = vscode.commands.registerCommand('codepath-ai.clearUserApiKey', async () => {
        await aiProvider.handleClearUserApiKey();
    });

    const openDashboardCommand = vscode.commands.registerCommand('codepath-ai.openDashboard', async () => {
        await aiProvider.handleOpenDashboard();
    });

    // Add all disposables to context
    context.subscriptions.push(
        explainCodeCommand,
        generateCodeCommand,
        generateProjectCommand,
        debugCodeCommand,
        analyzeCodeCommand,
        refactorCodeCommand,
        selectModelCommand,
        setUserApiKeyCommand,
        clearUserApiKeyCommand,
        openDashboardCommand
    );
}

export function deactivate() {
    console.log('CodePath AI extension deactivated');
}
