import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useAIStore } from '@/store/aiStore';

export function useWebsiteCreation() {
  const { setFiles, setActiveTab } = useEditorStore();
  const { sendMessage } = useAIStore();

  useEffect(() => {
    // Check if there's a website prompt from Dashboard
    const websitePrompt = localStorage.getItem('websitePrompt');
    
    // Check if there's a website creation context from the plan selector
    const contextStr = localStorage.getItem('websiteCreationContext');
    
    if (!websitePrompt && !contextStr) return;

    try {
      let plan, prompt;
      
      if (contextStr) {
        // Use context if available (from plan selector)
        const context = JSON.parse(contextStr);
        plan = context.plan;
        prompt = context.prompt;

        // Check if context is recent (within last 5 minutes)
        const isRecent = Date.now() - context.timestamp < 5 * 60 * 1000;
        if (!isRecent) {
          localStorage.removeItem('websiteCreationContext');
          return;
        }

        // Clear the context so it doesn't trigger again
        localStorage.removeItem('websiteCreationContext');
      } else if (websitePrompt) {
        // Use simple prompt from Dashboard recommendation
        prompt = websitePrompt;
        plan = null; // Will use default plan
        
        // Clear the prompt so it doesn't trigger again
        localStorage.removeItem('websitePrompt');
      }

      // Initialize the website creation process
      initializeWebsiteCreation(plan, prompt);
    } catch (error) {
      console.error('Error loading website creation context:', error);
      localStorage.removeItem('websiteCreationContext');
      localStorage.removeItem('websitePrompt');
    }
  }, []);

  const initializeWebsiteCreation = async (plan: any | null, prompt: string) => {
    // Create initial project structure
    const initialFiles = [
      {
        id: 'index.html',
        name: 'index.html',
        type: 'file' as const,
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Loading...</title>\n</head>\n<body>\n    <div id="root"></div>\n</body>\n</html>',
      },
      {
        id: 'App.tsx',
        name: 'App.tsx',
        type: 'file' as const,
        content: '// AI is generating your website...\n',
      },
      {
        id: 'styles.css',
        name: 'styles.css',
        type: 'file' as const,
        content: '/* Styles will be generated... */\n',
      },
    ];

    setFiles(initialFiles);
    setActiveTab('App.tsx');

    // If we have a plan, use it; otherwise create a simple message
    if (plan) {
      const techStack = plan.tech.join(', ');
      const features = plan.features.join('\n- ');

      const createMessage = `🚀 **Website Creation Started**

**Project:** ${prompt}

**Selected Plan:** ${plan.title}
${plan.description}

**Tech Stack:** ${techStack}

**Features to Implement:**
- ${features}

Please create a complete, production-ready website following this plan. Generate:

1. **HTML Structure** (index.html) - Semantic, accessible markup
2. **React Components** (App.tsx) - Modern, functional components
3. **Styling** (styles.css) - Beautiful, responsive CSS with the design system
4. **Interactive Features** - All the features from the plan

Make it professional, pixel-perfect, and fully functional. Explain each step as you build!`;

      // Send to Forge (generator AI)
      sendMessage('forge', createMessage);

      // Also send explanation request to Sage
      setTimeout(() => {
        const explainMessage = `I'm building a website with this specification:

**Prompt:** ${prompt}
**Plan:** ${plan.title} - ${plan.description}
**Tech:** ${techStack}

Please explain the architecture, design decisions, and best practices I should follow for this project. Guide me through the development process.`;

        sendMessage('sage', explainMessage);
      }, 1000);
    } else {
      // Simple direct prompt from Dashboard recommendation
      const createMessage = `🚀 **Website Creation Started**

Create a website based on this request: **${prompt}**

Please create a complete, production-ready website that fulfills this request. Generate:

1. **HTML Structure** (index.html) - Semantic, accessible markup
2. **React Components** (App.tsx) - Modern, functional components  
3. **Styling** (styles.css) - Beautiful, responsive CSS
4. **Interactive Features** - All interactive elements needed

Make it professional, pixel-perfect, and fully functional. Explain each step as you build!`;

      // Send to Forge
      sendMessage('forge', createMessage);

      // Send explanation to Sage
      setTimeout(() => {
        const explainMessage = `I want to create a website with this idea: ${prompt}

Please explain how I should approach building this website. What technologies and design patterns would work best? Guide me through the development process step by step.`;

        sendMessage('sage', explainMessage);
      }, 1000);
    }
  };

  return null;
}
