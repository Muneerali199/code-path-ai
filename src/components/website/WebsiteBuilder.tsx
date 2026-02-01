import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Code2, Package, Eye, Sparkles } from 'lucide-react';

interface WebsiteBuilderProps {
  plan: {
    id: 'A' | 'B';
    title: string;
    description: string;
    features: string[];
    tech: string[];
  };
  prompt: string;
  onComplete: () => void;
}

interface BuildStep {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  description: string;
  code?: string;
  explanation?: string;
}

export default function WebsiteBuilder({ plan, prompt, onComplete }: WebsiteBuilderProps) {
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([
    { id: '1', title: 'Analyzing Requirements', status: 'active', description: 'Understanding your project needs...' },
    { id: '2', title: 'Installing Dependencies', status: 'pending', description: 'Setting up packages...' },
    { id: '3', title: 'Generating Components', status: 'pending', description: 'Creating React components...' },
    { id: '4', title: 'Styling Interface', status: 'pending', description: 'Applying design system...' },
    { id: '5', title: 'Building Preview', status: 'pending', description: 'Compiling your website...' },
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    // Simulate build process
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < buildSteps.length - 1) {
          // Mark current step as completed
          setBuildSteps((steps) =>
            steps.map((step, idx) => {
              if (idx === prev) return { ...step, status: 'completed' };
              if (idx === prev + 1) return { ...step, status: 'active' };
              return step;
            })
          );

          // Simulate code generation and explanations
          if (prev === 2) {
            setGeneratedCode(`import React from 'react';\nimport { Button } from './components/ui/button';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600">\n      <div className="container mx-auto px-4 py-20">\n        <h1 className="text-5xl font-bold text-white mb-6">\n          ${prompt.slice(0, 50)}...\n        </h1>\n        <Button>Get Started</Button>\n      </div>\n    </div>\n  );\n}`);
            setExplanation(`✨ **Component Structure Created**\n\nI've generated a modern React component following ${plan.title}:\n\n- **Responsive Layout**: Mobile-first approach with Tailwind CSS\n- **Gradient Background**: Eye-catching purple to blue gradient\n- **Typography**: Large, bold heading for impact\n- **Interactive Button**: Using shadcn/ui components\n\nThis structure follows best practices for ${plan.tech.join(', ')}.`);
          }

          if (prev === 4) {
            setPreviewUrl('about:blank'); // Simulate preview ready
            setTimeout(() => onComplete(), 2000);
          }

          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex overflow-hidden">
      {/* Left Side - Code Editor */}
      <div className="w-1/2 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="bg-[#111111] border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Code2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Code Editor</h2>
                <p className="text-gray-500 text-sm">{plan.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Generating...</span>
            </div>
          </div>
        </div>

        {/* Build Steps */}
        <div className="bg-[#111111] border-b border-gray-800 px-6 py-3">
          <div className="flex items-center gap-4 overflow-x-auto">
            {buildSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                  step.status === 'completed'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : step.status === 'active'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-800/50 text-gray-500 border border-gray-700'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : step.status === 'active' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <div className="w-3 h-3 rounded-full border-2 border-current" />
                )}
                <span>{step.title}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Code Display */}
        <div className="flex-1 overflow-auto p-6 bg-[#1e1e1e]">
          <AnimatePresence mode="wait">
            {generatedCode ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-sm"
              >
                <pre className="text-gray-300">
                  <code>{generatedCode}</code>
                </pre>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-gray-500"
              >
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Initializing code editor...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* File Tabs */}
        <div className="bg-[#111111] border-t border-gray-800 px-6 py-2">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-[#1e1e1e] border border-gray-700 rounded text-xs text-gray-300">
              App.tsx
            </div>
            <div className="px-3 py-1 bg-transparent text-xs text-gray-500 hover:text-gray-300 cursor-pointer">
              index.html
            </div>
            <div className="px-3 py-1 bg-transparent text-xs text-gray-500 hover:text-gray-300 cursor-pointer">
              styles.css
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Explanation & Preview */}
      <div className="w-1/2 flex flex-col">
        {/* Explanation Panel */}
        <div className="h-1/2 border-b border-gray-800 overflow-auto">
          <div className="bg-[#111111] border-b border-gray-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold">AI Explanation</h2>
                <p className="text-gray-500 text-sm">Understanding your code</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {explanation ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-invert max-w-none"
                >
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {explanation}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-gray-500"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p>Analyzing code structure...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current Step Description */}
            <div className="mt-6 p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/10 rounded">
                  <Package className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm mb-1">
                    {buildSteps[currentStepIndex]?.title}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {buildSteps[currentStepIndex]?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="h-1/2 bg-[#0a0a0a]">
          <div className="bg-[#111111] border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Live Preview</h2>
                  <p className="text-gray-500 text-sm">Real-time rendering</p>
                </div>
              </div>
              {previewUrl && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full"
                >
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">Ready</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="h-[calc(100%-73px)] bg-white flex items-center justify-center">
            {previewUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center"
              >
                <div className="text-center text-white px-8">
                  <h1 className="text-4xl font-bold mb-4">Your Website is Ready!</h1>
                  <p className="text-lg opacity-90">Preview loading...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-gray-400"
              >
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-sm">Building preview...</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
