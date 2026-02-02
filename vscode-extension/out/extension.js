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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const codepath_ai_provider_1 = require("./codepath-ai-provider");
function activate(context) {
    console.log('CodePath AI extension activated');
    const aiProvider = new codepath_ai_provider_1.CodePathAIProvider();
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
    context.subscriptions.push(explainCodeCommand, generateCodeCommand, debugCodeCommand, analyzeCodeCommand, refactorCodeCommand);
}
exports.activate = activate;
function deactivate() {
    console.log('CodePath AI extension deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map