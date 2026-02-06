#!/usr/bin/env node
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
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const DEFAULT_MODEL = 'moonshotai/kimi-k2.5';
const DEFAULT_INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const CONFIG_DIR = path.join(os.homedir(), '.codepath-ai');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
const HISTORY_PATH = path.join(CONFIG_DIR, 'history.txt');
const IS_TTY = process.stdout.isTTY;
const DEBUG_LOG = path.join(CONFIG_DIR, 'debug.log');
const DEBUG_ENABLED = process.env.CODEPATH_AI_DEBUG === '1';
const COLORS = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    bright: '\x1b[1m',
    underline: '\x1b[4m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m'
};
function printUsage() {
    // Keep usage simple and cross-platform
    // Examples:
    //   codepath-ai explain --file src/app.ts
    //   codepath-ai generate --text "Create a function that validates email addresses" --lang typescript
    //   codepath-ai analyze --file src/app.ts --text "security" --stream
    //   codepath-ai --help
    console.log(`
CodePath AI CLI

Usage:
  codepath-ai <command> [options]
  codepath-ai            Start interactive chat

Commands:
  explain      Explain code from --file or --text
  generate     Generate code from --text
  debug        Debug code using --file/--text and optional --issue
  analyze      Analyze code using --file/--text and optional --focus
  refactor     Refactor code from --file or --text
  chat         Send a raw chat message using --text
  login        Store NIM API key for future sessions

Options:
  --file <path>        Read code/content from a file
  --text <string>      Inline code or prompt text
  --lang <id>          Language ID (e.g., javascript, python)
  --issue <string>     Issue description for debug
  --focus <string>     Analysis focus (e.g., security, performance)
  --model <id>         Model ID (default: ${DEFAULT_MODEL})
  --thinking           Enable model "thinking" (NIM template)
  --maxTokens <n>      Max tokens (default: 16384)
  --temperature <n>    Temperature (default: 1)
  --topP <n>           Top-p (default: 1)
  --stream             Stream responses
  --repl               Start interactive chat
  --key <string>       Provide API key (login command)
  --help               Show help

Environment variables:
  NIM_API_KEY           NVIDIA NIM API key (required)
  NIM_INVOKE_URL        Override NIM endpoint (optional)
`);
}
function getArgValue(args, name) {
    const idx = args.indexOf(name);
    if (idx >= 0 && idx + 1 < args.length) {
        return args[idx + 1];
    }
    return undefined;
}
function hasFlag(args, name) {
    return args.includes(name);
}
function readFileSafe(filePath) {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
    }
    return fs.readFileSync(fullPath, 'utf8');
}
function loadConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) {
            return {};
        }
        const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function saveConfig(config) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}
function resolveApiKey() {
    const envKey = process.env.NIM_API_KEY;
    if (envKey)
        return envKey;
    const config = loadConfig();
    return config.nimApiKey;
}
function colorize(text, color) {
    if (!IS_TTY)
        return text;
    return `${COLORS[color]}${text}${COLORS.reset}`;
}
function divider() {
    return colorize('─'.repeat(48), 'gray');
}
function nowTime() {
    const d = new Date();
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
}
function loadHistory() {
    try {
        if (!fs.existsSync(HISTORY_PATH))
            return [];
        const raw = fs.readFileSync(HISTORY_PATH, 'utf8');
        return raw.split(/\r?\n/).filter(Boolean);
    }
    catch {
        return [];
    }
}
function appendHistory(line) {
    try {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
        fs.appendFileSync(HISTORY_PATH, line + os.EOL, 'utf8');
    }
    catch {
        // ignore history errors
    }
}
function logDebug(line) {
    if (!DEBUG_ENABLED)
        return;
    try {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
        fs.appendFileSync(DEBUG_LOG, line + os.EOL, 'utf8');
    }
    catch {
        // ignore
    }
}
function extractContent(parsed) {
    const choice = parsed?.choices?.[0];
    if (!choice)
        return undefined;
    const msgContent = choice?.message?.content;
    if (typeof msgContent === 'string')
        return msgContent;
    if (Array.isArray(msgContent)) {
        const texts = msgContent
            .map((c) => c?.text || c?.content || '')
            .filter(Boolean);
        if (texts.length > 0)
            return texts.join('');
    }
    const delta = choice?.delta;
    if (delta) {
        if (typeof delta?.content === 'string')
            return delta.content;
        if (typeof delta?.text === 'string')
            return delta.text;
        if (typeof delta?.reasoning === 'string')
            return delta.reasoning;
        if (Array.isArray(delta?.content)) {
            const texts = delta.content.map((c) => c?.text || c?.content || '').filter(Boolean);
            if (texts.length > 0)
                return texts.join('');
        }
    }
    const alt = choice?.content;
    if (typeof alt === 'string')
        return alt;
    return undefined;
}
function buildMessages(command, text, lang, issue, focus) {
    switch (command) {
        case 'explain':
            return [{
                    role: 'user',
                    content: `Explain the following ${lang || 'code'}:\n\n${text}`
                }];
        case 'generate':
            return [{
                    role: 'user',
                    content: `Generate ${lang || 'code'} for the following request:\n\n${text}`
                }];
        case 'debug':
            return [{
                    role: 'user',
                    content: `Debug the following ${lang || 'code'}.\nIssue: ${issue || 'No issue provided'}\n\n${text}`
                }];
        case 'analyze':
            return [{
                    role: 'user',
                    content: `Analyze the following ${lang || 'code'} for ${focus || 'issues'}:\n\n${text}`
                }];
        case 'refactor':
            return [{
                    role: 'user',
                    content: `Refactor the following ${lang || 'code'}:\n\n${text}`
                }];
        case 'chat':
        default:
            return [{
                    role: 'user',
                    content: text
                }];
    }
}
async function sendChat(payload, stream) {
    const apiKey = resolveApiKey();
    if (!apiKey) {
        throw new Error('Missing NIM API key. Set NIM_API_KEY or run "codepath-ai login".');
    }
    const invokeUrl = process.env.NIM_INVOKE_URL || DEFAULT_INVOKE_URL;
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': stream ? 'text/event-stream' : 'application/json',
        'Content-Type': 'application/json'
    };
    if (stream) {
        const response = await axios_1.default.post(invokeUrl, payload, {
            headers,
            responseType: 'stream',
            timeout: 600000
        });
        let fullText = '';
        let buffer = '';
        let sawData = false;
        response.data.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed)
                    continue;
                sawData = true;
                if (trimmed.startsWith('data:')) {
                    const data = trimmed.replace(/^data:\s*/, '');
                    if (data === '[DONE]') {
                        continue;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const content = extractContent(parsed);
                        if (content) {
                            fullText += content;
                            process.stdout.write(content);
                        }
                    }
                    catch {
                        // If parsing fails, just print the line
                        process.stdout.write(data);
                    }
                    continue;
                }
                // Some servers stream raw JSON without "data:" prefix
                if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        const content = extractContent(parsed);
                        if (content) {
                            fullText += content;
                            process.stdout.write(content);
                        }
                    }
                    catch {
                        // ignore
                    }
                }
            }
        });
        await new Promise((resolve, reject) => {
            response.data.on('end', () => resolve());
            response.data.on('error', (err) => reject(err));
        });
        return fullText;
    }
    const response = await axios_1.default.post(invokeUrl, payload, {
        headers,
        timeout: 600000
    });
    if (DEBUG_ENABLED) {
        logDebug('--- response ---');
        logDebug(JSON.stringify(response.data));
    }
    const content = extractContent(response.data);
    if (content) {
        return content;
    }
    return JSON.stringify(response.data, null, 2);
}
async function runRepl() {
    let model = DEFAULT_MODEL;
    let thinking = true;
    let temperature = 1;
    let topP = 1;
    let maxTokens = 16384;
    let multiline = false;
    let useStream = false;
    const messages = [];
    const history = loadHistory();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
        historySize: 500
    });
    const prompt = () => {
        const base = multiline ? '... ' : 'codepath-ai> ';
        rl.setPrompt(colorize(base, 'cyan'));
        rl.prompt();
    };
    if (history.length > 0) {
        rl.history = history.slice(-500).reverse();
    }
    console.log(colorize('CodePath AI CLI (NIM)', 'bright'));
    console.log(colorize('Interactive chat — better than Codex, built for focus.', 'gray'));
    console.log(`${colorize('Tip', 'yellow')}: /help for commands, /login to store key, /exit to quit.`);
    console.log(`${colorize('Config', 'dim')}: ${CONFIG_PATH}`);
    if (DEBUG_ENABLED) {
        console.log(`${colorize('Debug', 'dim')}: ${DEBUG_LOG}`);
    }
    console.log(divider());
    prompt();
    let buffer = '';
    rl.on('line', async (line) => {
        const trimmed = line.trimEnd();
        const isContinuation = trimmed.endsWith('\\');
        const cleaned = isContinuation ? trimmed.slice(0, -1) : trimmed;
        if (multiline) {
            buffer += '\n' + cleaned;
        }
        else {
            buffer = cleaned;
        }
        multiline = isContinuation;
        if (multiline) {
            prompt();
            return;
        }
        const input = buffer.trim();
        buffer = '';
        if (!input) {
            prompt();
            return;
        }
        if (input.startsWith('/')) {
            const parts = input.split(' ');
            const cmd = parts[0].toLowerCase();
            switch (cmd) {
                case '/exit':
                    rl.close();
                    return;
                case '/clear':
                    messages.length = 0;
                    console.log('Conversation cleared.');
                    prompt();
                    return;
                case '/status':
                    console.log(`${colorize('Model', 'magenta')}: ${model}`);
                    console.log(`${colorize('Thinking', 'magenta')}: ${thinking ? 'on' : 'off'}`);
                    console.log(`${colorize('Stream', 'magenta')}: ${useStream ? 'on' : 'off'}`);
                    console.log(`${colorize('Temp', 'magenta')}: ${temperature}`);
                    console.log(`${colorize('TopP', 'magenta')}: ${topP}`);
                    console.log(`${colorize('MaxTokens', 'magenta')}: ${maxTokens}`);
                    prompt();
                    return;
                case '/login':
                    rl.question('Paste NIM API key: ', (key) => {
                        const trimmed = key.trim();
                        if (trimmed) {
                            saveConfig({ nimApiKey: trimmed });
                            console.log('API key saved.');
                        }
                        else {
                            console.log('No key provided.');
                        }
                        prompt();
                    });
                    return;
                case '/logout':
                    saveConfig({ nimApiKey: undefined });
                    console.log('API key removed.');
                    prompt();
                    return;
                case '/model':
                    if (parts[1]) {
                        model = parts[1];
                        console.log(`Model set to ${model}`);
                    }
                    else {
                        console.log(`Current model: ${model}`);
                    }
                    prompt();
                    return;
                case '/thinking':
                    if (parts[1] === 'on')
                        thinking = true;
                    if (parts[1] === 'off')
                        thinking = false;
                    console.log(`Thinking: ${thinking ? 'on' : 'off'}`);
                    prompt();
                    return;
                case '/stream':
                    if (parts[1] === 'on')
                        useStream = true;
                    if (parts[1] === 'off')
                        useStream = false;
                    console.log(`Stream: ${useStream ? 'on' : 'off'}`);
                    prompt();
                    return;
                case '/help':
                    console.log('Commands:');
                    console.log('/help                Show this help');
                    console.log('/exit                Quit');
                    console.log('/clear               Clear conversation');
                    console.log('/status              Show current settings');
                    console.log('/login               Save NIM API key');
                    console.log('/logout              Remove saved key');
                    console.log('/model <id>          Set model');
                    console.log('/thinking on|off     Toggle thinking');
                    console.log('/stream on|off       Toggle streaming');
                    console.log('Use \\ at end of line for multi-line input');
                    prompt();
                    return;
                default:
                    console.log(`Unknown command: ${cmd}`);
                    prompt();
                    return;
            }
        }
        messages.push({ role: 'user', content: input });
        appendHistory(input);
        const payload = {
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
            top_p: topP,
            stream: useStream,
            chat_template_kwargs: { thinking }
        };
        console.log(`${colorize('you', 'cyan')} ${colorize(nowTime(), 'dim')}`);
        console.log(colorize(input, 'bright'));
        console.log(divider());
        console.log(`${colorize('assistant', 'green')} ${colorize(nowTime(), 'dim')}`);
        process.stdout.write(colorize('> ', 'green'));
        rl.pause();
        let assistantText = await sendChat(payload, useStream);
        rl.resume();
        process.stdout.write('\n');
        if (assistantText) {
            console.log(colorize(assistantText, 'bright'));
        }
        else {
            // Fallback to non-stream if stream returned nothing
            assistantText = await sendChat({ ...payload, stream: false }, false);
            if (assistantText) {
                console.log(colorize(assistantText, 'bright'));
            }
        }
        if (assistantText) {
            messages.push({ role: 'assistant', content: assistantText });
        }
        else {
            console.log(colorize('No response received. Try /stream off, /status, or check your API key.', 'yellow'));
        }
        console.log(divider());
        prompt();
    });
}
async function run() {
    const args = process.argv.slice(2);
    if (args.length === 0 || hasFlag(args, '--repl')) {
        await runRepl();
        return;
    }
    if (hasFlag(args, '--help')) {
        printUsage();
        return;
    }
    const command = args[0];
    const textArg = getArgValue(args, '--text');
    const fileArg = getArgValue(args, '--file');
    const lang = getArgValue(args, '--lang');
    const issue = getArgValue(args, '--issue');
    const focus = getArgValue(args, '--focus');
    const loginKey = getArgValue(args, '--key');
    if (command === 'login') {
        if (!loginKey) {
            throw new Error('Missing --key. Example: codepath-ai login --key YOUR_KEY');
        }
        saveConfig({ nimApiKey: loginKey });
        process.stdout.write('API key saved.\n');
        return;
    }
    if (command === 'chat' && !textArg && !fileArg) {
        await runRepl();
        return;
    }
    const text = fileArg ? readFileSafe(fileArg) : (textArg || '');
    if (!text) {
        throw new Error('No input provided. Use --text or --file.');
    }
    const model = getArgValue(args, '--model') || DEFAULT_MODEL;
    const maxTokens = Number(getArgValue(args, '--maxTokens') || '16384');
    const temperature = Number(getArgValue(args, '--temperature') || '1');
    const topP = Number(getArgValue(args, '--topP') || '1');
    const stream = hasFlag(args, '--stream');
    const thinking = hasFlag(args, '--thinking');
    const payload = {
        model,
        messages: buildMessages(command, text, lang, issue, focus),
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        stream
    };
    if (thinking) {
        payload.chat_template_kwargs = { thinking: true };
    }
    const result = await sendChat(payload, stream);
    if (!stream) {
        process.stdout.write(result);
    }
}
run().catch((err) => {
    console.error(`Error: ${err.message || err}`);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map