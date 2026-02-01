import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Book, Code, Terminal, FileText, Copy, Check, ChevronRight, Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const codeExamples = [
  {
    title: 'Getting Started',
    language: 'bash',
    code: `# Install CodeFlow CLI
npm install -g @codeflow/cli

# Initialize your project
codeflow init my-project

# Start coding with AI
codeflow start`,
  },
  {
    title: 'AI Code Generation',
    language: 'javascript',
    code: `// Ask CodeFlow to generate code
const response = await codeflow.generate({
  prompt: "Create a React hook for form validation",
  language: "typescript",
  includeTests: true
});

// Get explanation alongside
console.log(response.code);
console.log(response.explanation);`,
  },
  {
    title: 'Error Explanation',
    language: 'typescript',
    code: `// When you encounter an error
const result = await codeflow.explain({
  error: "TypeError: Cannot read property 'map' of undefined",
  code: snippet,
  skillLevel: "beginner" // or "intermediate", "advanced"
});

// Get beginner-friendly explanation
console.log(result.explanation);
console.log(result.suggestedFix);`,
  },
];

const docLinks = [
  { icon: Book, title: 'Getting Started', desc: '5 min read', href: '#' },
  { icon: Code, title: 'API Reference', desc: 'Complete API docs', href: '#' },
  { icon: Terminal, title: 'CLI Commands', desc: 'Command reference', href: '#' },
  { icon: FileText, title: 'Tutorials', desc: 'Step-by-step guides', href: '#' },
];

export const Documentation = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeExample, setActiveExample] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.docs-title',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Code block
      gsap.fromTo(
        '.code-block-container',
        { x: -50, opacity: 0, rotateY: 15 },
        {
          x: 0,
          opacity: 1,
          rotateY: 0,
          duration: 1,
          delay: 0.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Doc links
      gsap.fromTo(
        '.doc-link',
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.4,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeExample].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'bash': return 'text-yellow-400';
      case 'javascript': return 'text-neon-green';
      case 'typescript': return 'text-cyan';
      default: return 'text-gray-300';
    }
  };

  return (
    <section
      id="documentation"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan/10 border border-cyan/30 mb-6">
            <Book className="w-4 h-4 text-cyan" />
            <span className="text-sm font-medium text-cyan">DOCUMENTATION</span>
          </div>
          <h2 className="docs-title font-display font-bold text-4xl sm:text-5xl text-white mb-4">
            Learn by <span className="gradient-text">Example</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Comprehensive docs, tutorials, and examples to get you started in minutes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Code Examples */}
          <div className="code-block-container" style={{ perspective: '1000px' }}>
            <div className="rounded-2xl overflow-hidden border border-gray-800 bg-[#0d1117]">
              {/* Tabs */}
              <div className="flex border-b border-gray-800 overflow-x-auto">
                {codeExamples.map((example, index) => (
                  <button
                    key={example.title}
                    onClick={() => setActiveExample(index)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      activeExample === index
                        ? 'text-neon-green border-b-2 border-neon-green bg-neon-green/5'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {example.title}
                  </button>
                ))}
              </div>

              {/* Code Content */}
              <div className="relative p-6">
                {/* Copy Button */}
                <button
                  onClick={copyCode}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-neon-green" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Language Badge */}
                <div className={`inline-flex items-center gap-2 text-xs mb-4 ${getLanguageColor(codeExamples[activeExample].language)}`}>
                  <Terminal className="w-3 h-3" />
                  {codeExamples[activeExample].language}
                </div>

                {/* Code */}
                <pre className="font-mono text-sm text-gray-300 overflow-x-auto">
                  <code>{codeExamples[activeExample].code}</code>
                </pre>
              </div>

              {/* Run Button */}
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
                <button className="flex items-center gap-2 text-neon-green hover:text-white transition-colors">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Try it in browser</span>
                </button>
              </div>
            </div>
          </div>

          {/* Doc Links */}
          <div className="space-y-4">
            {docLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.title}
                  href={link.href}
                  className="doc-link group flex items-center gap-4 p-5 rounded-2xl bg-dark-card border border-gray-800 hover:border-neon-green/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center group-hover:bg-neon-green/20 transition-colors">
                    <Icon className="w-6 h-6 text-neon-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-white group-hover:text-neon-green transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-500">{link.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-green group-hover:translate-x-1 transition-all" />
                </a>
              );
            })}

            {/* Quick Start CTA */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-neon-green/10 to-cyan/10 border border-neon-green/30">
              <h3 className="font-display font-semibold text-white mb-2">
                Ready to dive deeper?
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Explore our complete documentation with interactive examples
              </p>
              <button className="btn-neon text-sm flex items-center gap-2">
                View Full Docs
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
