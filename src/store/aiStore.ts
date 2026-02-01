import { create } from 'zustand';

export interface AIMessage {
  id: string;
  role: 'sage' | 'forge' | 'user' | 'system';
  content: string;
  timestamp: Date;
  codeBlocks?: string[];
  isStreaming?: boolean;
}

export interface CodeSuggestion {
  id: string;
  code: string;
  description: string;
  confidence: number;
  language: string;
}

export interface AIContext {
  currentFile: string | null;
  currentFunction: string | null;
  selectedCode: string | null;
  projectContext: string[];
}

interface AIState {
  // Messages
  sageMessages: AIMessage[];
  forgeMessages: AIMessage[];
  
  // AI Status
  sageStatus: 'idle' | 'thinking' | 'responding';
  forgeStatus: 'idle' | 'thinking' | 'generating';
  collaborationMode: boolean;
  
  // Context
  context: AIContext;
  
  // Suggestions
  suggestions: CodeSuggestion[];
  activeSuggestion: string | null;
  
  // Settings
  sagePersonality: 'patient' | 'direct' | 'academic' | 'friendly';
  forgeCreativity: 'conservative' | 'balanced' | 'adventurous';
  autoSuggest: boolean;
  explainOnHover: boolean;
  
  // Actions
  sendMessage: (role: 'sage' | 'forge', content: string) => void;
  updateMessageContent: (role: 'sage' | 'forge', messageId: string, content: string, isStreaming?: boolean) => void;
  setSageStatus: (status: 'idle' | 'thinking' | 'responding') => void;
  setForgeStatus: (status: 'idle' | 'thinking' | 'generating') => void;
  setCollaborationMode: (active: boolean) => void;
  setContext: (context: Partial<AIContext>) => void;
  addSuggestion: (suggestion: CodeSuggestion) => void;
  clearSuggestions: () => void;
  setActiveSuggestion: (id: string | null) => void;
  setSagePersonality: (personality: 'patient' | 'direct' | 'academic' | 'friendly') => void;
  setForgeCreativity: (creativity: 'conservative' | 'balanced' | 'adventurous') => void;
  setAutoSuggest: (enabled: boolean) => void;
  setExplainOnHover: (enabled: boolean) => void;
  clearMessages: (role: 'sage' | 'forge') => void;
}

const initialSageMessages: AIMessage[] = [
  {
    id: '1',
    role: 'sage',
    content: 'Hello! I\'m Sage, your AI teacher. I\'m here to explain concepts, answer questions, and help you learn while you code. What would you like to understand better?',
    timestamp: new Date(),
  },
];

const initialForgeMessages: AIMessage[] = [
  {
    id: '1',
    role: 'forge',
    content: 'Hi! I\'m Forge, your AI coding assistant. I can generate code, refactor, write tests, and help you build faster. Just tell me what you need!',
    timestamp: new Date(),
  },
];

export const useAIStore = create<AIState>((set, get) => ({
  sageMessages: initialSageMessages,
  forgeMessages: initialForgeMessages,
  sageStatus: 'idle',
  forgeStatus: 'idle',
  collaborationMode: false,
  context: {
    currentFile: null,
    currentFunction: null,
    selectedCode: null,
    projectContext: [],
  },
  suggestions: [],
  activeSuggestion: null,
  sagePersonality: 'friendly',
  forgeCreativity: 'balanced',
  autoSuggest: true,
  explainOnHover: true,

  sendMessage: async (role, content) => {
    const message: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Gather MCP context from workspace
    const mcpContext = {
      currentFile: get().context.currentFile,
      projectContext: get().context.projectContext,
      availableComponents: ['Header', 'TaskList', 'TaskItem', 'AddTaskForm'],
      availableHooks: ['useLocalStorage'],
      projectStructure: {
        components: 'React components with TypeScript',
        hooks: 'Custom React hooks',
        types: 'TypeScript interfaces and types',
        styles: 'CSS with modern features'
      }
    };

    const BACKEND_URL = 'http://localhost:3001/ai/chat';

    if (role === 'sage') {
      set({ sageMessages: [...get().sageMessages, message], sageStatus: 'thinking' });
      try {
        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: 'sage',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        };
        
        // Add empty message that will be streamed to
        set({ sageMessages: [...get().sageMessages, aiMessage], sageStatus: 'responding' });

        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            provider: 'mistral',
            mode: 'explain',
            messages: [
              ...get().sageMessages.map(m => ({ 
                role: m.role === 'sage' ? 'assistant' : m.role === 'user' ? 'user' : 'system', 
                content: m.content 
              })),
              { role: 'user', content }
            ]
          })
        });

        const data = await response.json();
        const aiContent = data.response || 'I couldn\'t generate a response.';

        // Stream the text character by character
        let displayText = '';
        for (let i = 0; i < aiContent.length; i++) {
          displayText += aiContent[i];
          
          // Update message content
          set({
            sageMessages: get().sageMessages.map(msg =>
              msg.id === aiMessage.id
                ? { ...msg, content: displayText, isStreaming: i < aiContent.length - 1 }
                : msg
            ),
          });
          
          // Add delay for typing effect (faster for code, slower for text)
          const char = aiContent[i];
          const delay = /[a-zA-Z0-9]/.test(char) ? 10 : /[.!?,]/.test(char) ? 30 : 5;
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        set({ sageStatus: 'idle' });
      } catch (error) {
        console.error('Sage Error:', error);
        set({ sageStatus: 'idle' });
      }
    } else {
      set({ forgeMessages: [...get().forgeMessages, message], forgeStatus: 'thinking' });
      try {
        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: 'forge',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
          codeBlocks: [],
        };
        
        // Add empty message that will be streamed to
        set({ forgeMessages: [...get().forgeMessages, aiMessage], forgeStatus: 'generating' });

        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            provider: 'mistral',
            mode: 'create',
            messages: [
              ...get().forgeMessages.map(m => ({ 
                role: m.role === 'forge' ? 'assistant' : m.role === 'user' ? 'user' : 'system', 
                content: m.content 
              })),
              { role: 'user', content }
            ]
          })
        });

        const data = await response.json();
        const aiContent = data.response || 'I couldn\'t generate code.';

        // Stream the text character by character
        let displayText = '';
        for (let i = 0; i < aiContent.length; i++) {
          displayText += aiContent[i];
          
          // Update message content
          set({
            forgeMessages: get().forgeMessages.map(msg =>
              msg.id === aiMessage.id
                ? { ...msg, content: displayText, isStreaming: i < aiContent.length - 1 }
                : msg
            ),
          });
          
          // Add delay for typing effect (faster for code, slower for text)
          const char = aiContent[i];
          const delay = /[a-zA-Z0-9]/.test(char) ? 10 : /[.!?,]/.test(char) ? 30 : 5;
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        set({ forgeStatus: 'idle' });
      } catch (error) {
        console.error('Forge Error:', error);
        set({ forgeStatus: 'idle' });
      }
    }
  },

  setSageStatus: (status) => set({ sageStatus: status }),
  setForgeStatus: (status) => set({ forgeStatus: status }),
  
  updateMessageContent: (role, messageId, content, isStreaming = true) => {
    if (role === 'sage') {
      set({
        sageMessages: get().sageMessages.map(msg =>
          msg.id === messageId
            ? { ...msg, content, isStreaming }
            : msg
        ),
      });
    } else {
      set({
        forgeMessages: get().forgeMessages.map(msg =>
          msg.id === messageId
            ? { ...msg, content, isStreaming }
            : msg
        ),
      });
    }
  },
  
  setSageStatus: (status) => set({ sageStatus: status }),
  setCollaborationMode: (active) => set({ collaborationMode: active }),
  
  setContext: (context) => set({
    context: { ...get().context, ...context },
  }),
  
  addSuggestion: (suggestion) => set({
    suggestions: [...get().suggestions, suggestion],
  }),
  
  clearSuggestions: () => set({ suggestions: [], activeSuggestion: null }),
  setActiveSuggestion: (id) => set({ activeSuggestion: id }),
  
  setSagePersonality: (personality) => set({ sagePersonality: personality }),
  setForgeCreativity: (creativity) => set({ forgeCreativity: creativity }),
  setAutoSuggest: (enabled) => set({ autoSuggest: enabled }),
  setExplainOnHover: (enabled) => set({ explainOnHover: enabled }),
  
  clearMessages: (role) => {
    if (role === 'sage') {
      set({ sageMessages: [] });
    } else {
      set({ forgeMessages: [] });
    }
  },
}));

// Helper functions to generate responses
function generateSageResponse(message: string, personality: string, context?: any): string {
  const responses: Record<string, string[]> = {
    patient: [
      'Let me break this down step by step...',
      'Take your time with this concept. Here\'s what you need to know...',
      'No rush! Let me explain this thoroughly...',
    ],
    direct: [
      'Here\'s the core concept:',
      'The key thing to understand is:',
      'Let me get straight to the point:',
    ],
    academic: [
      'From a theoretical perspective...',
      'The fundamental principle here is...',
      'In computer science literature...',
    ],
    friendly: [
      'Great question! Let me help you understand this...',
      'I love that you\'re curious about this! Here\'s the scoop:',
      'Awesome question! Let me break it down for you...',
    ],
  };
  
  const personalityResponses = responses[personality] || responses.friendly;
  let response = personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
  
  // Add context-aware information
  if (context) {
    if (context.currentFile) {
      response += ` Based on your current file (${context.currentFile}), `;
    }
    if (context.availableComponents?.length > 0) {
      response += `\n\n📦 Available components in your project: ${context.availableComponents.join(', ')}`;
    }
  }
  
  response += ' This is a placeholder response that would be replaced with actual AI-generated content based on your question about: "' + message + '"';
  return response;
}

function generateForgeResponse(message: string, creativity: string, context?: any): string {
  const responses: Record<string, string[]> = {
    conservative: [
      'Here\'s a reliable, well-tested solution:',
      'I\'ll generate a safe, standard implementation:',
      'This is the most stable approach:',
    ],
    balanced: [
      'Here\'s a solid solution with good practices:',
      'I\'ve generated code that balances simplicity and power:',
      'This approach should work well for your use case:',
    ],
    adventurous: [
      'Let\'s try something innovative!',
      'Here\'s a creative solution that pushes boundaries:',
      'I\'ve generated an experimental but powerful approach:',
    ],
  };
  
  const creativityResponses = responses[creativity] || responses.balanced;
  let response = creativityResponses[Math.floor(Math.random() * creativityResponses.length)];
  
  // Add MCP context awareness
  if (context) {
    if (context.projectStructure) {
      response += `\n\n🏗️ Your project structure: ${Object.entries(context.projectStructure).map(([key, val]) => `${key} (${val})`).join(', ')}`;
    }
    if (context.availableHooks?.length > 0) {
      response += `\n\n🪝 Available hooks you can use: ${context.availableHooks.join(', ')}`;
    }
    if (context.availableComponents?.length > 0) {
      response += `\n\n🧩 I can reference these components: ${context.availableComponents.join(', ')}`;
    }
  }
  
  response += '\n\nI\'ve analyzed your request: "' + message + '" and generated the code below. Feel free to modify it to fit your exact needs!';
  return response;
}
