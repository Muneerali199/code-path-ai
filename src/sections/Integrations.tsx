import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Github, 
  Cloud, 
  Database, 
  CreditCard, 
  Server,
  Figma,
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const mcpServers = [
  { 
    name: 'GitHub MCP', 
    icon: Github, 
    description: 'Code Repository Management',
    color: '#ffffff',
    features: ['Pull Requests', 'Issues', 'Actions']
  },
  { 
    name: 'Vercel MCP', 
    icon: Cloud, 
    description: 'Instant Deployment',
    color: '#000000',
    features: ['Auto Deploy', 'Preview URLs', 'Analytics']
  },
  { 
    name: 'MongoDB MCP', 
    icon: Database, 
    description: 'Database Operations',
    color: '#47A248',
    features: ['Collections', 'Queries', 'Indexes']
  },
  { 
    name: 'Stripe MCP', 
    icon: CreditCard, 
    description: 'Payment Processing',
    color: '#635BFF',
    features: ['Payments', 'Subscriptions', 'Invoices']
  },
  { 
    name: 'AWS MCP', 
    icon: Server, 
    description: 'Cloud Infrastructure',
    color: '#FF9900',
    features: ['EC2', 'S3', 'Lambda']
  },
  { 
    name: 'Figma MCP', 
    icon: Figma, 
    description: 'Design Integration',
    color: '#F24E1E',
    features: ['Components', 'Styles', 'Assets']
  },
];

export const Integrations = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.mcp-badge',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
          },
        }
      );

      gsap.fromTo(
        '.mcp-title',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
          },
        }
      );

      gsap.fromTo(
        '.mcp-subtitle',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
          },
        }
      );

      // Cards animation
      gsap.fromTo(
        '.mcp-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.mcp-grid',
            start: 'top 80%',
          },
        }
      );

      // Floating animation for cards
      gsap.to('.mcp-card', {
        y: -10,
        duration: 2,
        ease: 'sine.inOut',
        stagger: {
          each: 0.2,
          repeat: -1,
          yoyo: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="integrations"
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-black overflow-hidden"
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 255, 136, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(0, 255, 136, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20 md:mb-24">
          <div className="mcp-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6">
            <Zap className="w-4 h-4 text-neon-green animate-pulse" />
            <span className="text-sm font-semibold text-neon-green tracking-wider">MCP SERVERS</span>
            <Sparkles className="w-4 h-4 text-neon-green" />
          </div>
          
          <h2 className="mcp-title font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6">
            <span className="text-white">Powered by </span>
            <span className="gradient-text">MCP Protocol</span>
          </h2>
          
          <p className="mcp-subtitle text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Connect your development workflow with powerful Model Context Protocol servers. 
            One interface, infinite possibilities.
          </p>
        </div>

        {/* MCP Server Cards Grid */}
        <div className="mcp-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {mcpServers.map((server) => {
            const Icon = server.icon;
            return (
              <div 
                key={server.name}
                className="mcp-card group relative"
              >
                {/* Glow effect on hover */}
                <div 
                  className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"
                  style={{ background: `linear-gradient(135deg, ${server.color}40, transparent)` }}
                />
                
                {/* Card content */}
                <div className="relative glass-dark rounded-3xl p-8 border border-gray-800 group-hover:border-gray-700 transition-all duration-300 h-full">
                  {/* Icon */}
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${server.color}20, ${server.color}10)`,
                      border: `2px solid ${server.color}40`
                    }}
                  >
                    <Icon 
                      className="w-8 h-8" 
                      style={{ color: server.color }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-white font-bold text-xl mb-2">
                    {server.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    {server.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {server.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle2 
                          className="w-4 h-4 flex-shrink-0" 
                          style={{ color: server.color }}
                        />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status indicator */}
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: server.color }}
                        />
                        <span 
                          className="text-xs font-medium"
                          style={{ color: server.color }}
                        >
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl glass-dark border border-gray-800">
            <div className="flex items-center gap-2 text-neon-green">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">50+ MCP Servers Available</span>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Extend your development capabilities with our growing ecosystem of MCP servers
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(80px); }
        }
      `}</style>
    </section>
  );
};

