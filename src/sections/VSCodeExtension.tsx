import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Download, 
  Star, 
  Zap, 
  MessageSquare, 
  Code, 
  Sparkles,
  Check,
  ExternalLink
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: Zap, title: 'One-Click Install', desc: 'Install from VS Code marketplace in seconds' },
  { icon: MessageSquare, title: 'Inline Chat', desc: 'Talk to AI without leaving your editor' },
  { icon: Code, title: 'Smart Suggestions', desc: 'AI-powered autocomplete as you type' },
  { icon: Sparkles, title: 'Code Explanation', desc: 'Highlight any code to get instant explanations' },
];

const stats = [
  { value: '500K+', label: 'Downloads' },
  { value: '4.9', label: 'Rating' },
  { value: '50+', label: 'Countries' },
];

export const VSCodeExtension = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.vscode-title',
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

      // Extension card
      gsap.fromTo(
        '.extension-card',
        { x: -80, opacity: 0, rotateY: 20 },
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

      // Features
      gsap.fromTo(
        '.vscode-feature',
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

      // Stats
      gsap.fromTo(
        '.vscode-stat',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.6,
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

  return (
    <section
      id="vscode-extension"
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/2 right-0 w-1/2 h-full -translate-y-1/2 opacity-20"
          style={{
            background: 'radial-gradient(circle at 100% 50%, rgba(0, 123, 255, 0.2) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
            <Download className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">VS CODE EXTENSION</span>
          </div>
          <h2 className="vscode-title font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            CodeFlow in Your <span className="text-blue-400">VS Code</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Bring the power of dual AI directly into your favorite editor
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Extension Card */}
          <div className="extension-card" style={{ perspective: '1000px' }}>
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-800 bg-dark-card p-6 sm:p-7 md:p-8">
              {/* Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl" />
              
              {/* Header */}
              <div className="relative flex items-start gap-6 mb-8">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Code className="w-10 h-10 text-white" />
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-display font-bold text-2xl text-white mb-1">
                    CodeFlow AI
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    by CodeFlow Team
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-medium">4.9</span>
                      <span className="text-gray-500 text-sm">(2.5k reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Download className="w-4 h-4" />
                      500K+ installs
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="relative text-gray-300 mb-6">
                Your AI pair programmer that writes, explains, and teaches code. 
                Get instant help with ExplainAI and production-ready code with CodeAI.
              </p>

              {/* Install Button */}
              <a
                href="https://marketplace.visualstudio.com/items?itemName=codepath.codepath-ai#review-details"
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-display font-semibold flex items-center justify-center gap-2 transition-all duration-300 group"
              >
                <Download className="w-5 h-5" />
                Install in VS Code
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* Stats Row */}
              <div className="relative mt-6 pt-6 border-t border-gray-800 grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="vscode-stat text-center">
                    <div className="font-display font-bold text-xl text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-xl text-white mb-6">
              Why developers love it
            </h3>
            
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="vscode-feature flex items-start gap-4 p-5 rounded-2xl bg-dark-card border border-gray-800 hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-white mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              );
            })}

            {/* Additional Info */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Check className="w-5 h-5 text-neon-green" />
                <span className="text-white font-medium">Free to use</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Check className="w-5 h-5 text-neon-green" />
                <span className="text-white font-medium">No API key required</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-neon-green" />
                <span className="text-white font-medium">Works offline</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
