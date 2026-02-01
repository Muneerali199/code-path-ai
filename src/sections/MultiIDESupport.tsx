import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Monitor, 
  Check, 
  ArrowRight,
  Terminal,
  Layers,
  Cpu
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const supportedIDEs = [
  {
    name: 'VS Code',
    icon: 'VS',
    color: '#007ACC',
    status: 'available',
    features: ['Full AI Support', 'Inline Chat', 'Smart Completion'],
  },
  {
    name: 'JetBrains',
    icon: 'JB',
    color: '#00CDD7',
    status: 'available',
    features: ['IntelliJ', 'WebStorm', 'PyCharm', 'GoLand'],
  },
  {
    name: 'Vim/Neovim',
    icon: 'V',
    color: '#019733',
    status: 'available',
    features: ['Plugin Support', 'Lua Config', 'LSP Integration'],
  },
  {
    name: 'Sublime Text',
    icon: 'ST',
    color: '#FF9800',
    status: 'coming',
    features: ['Package Control', 'Snippet Support'],
  },
  {
    name: 'Atom',
    icon: 'At',
    color: '#66595C',
    status: 'coming',
    features: ['Package Support', 'Theme Integration'],
  },
  {
    name: 'Emacs',
    icon: 'Em',
    color: '#7F5AB6',
    status: 'coming',
    features: ['ELisp Package', 'Org Mode'],
  },
];

export const MultiIDESupport = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.multi-ide-title',
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

      // IDE cards
      gsap.fromTo(
        '.ide-card',
        { y: 60, opacity: 0, rotateX: 20 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.1,
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
        '.ide-feature',
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          delay: 0.5,
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
      id="multi-ide"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
            <Monitor className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">MULTI-IDE SUPPORT</span>
          </div>
          <h2 className="multi-ide-title font-display font-bold text-4xl sm:text-5xl text-white mb-4">
            Use Your <span className="gradient-text-purple">Favorite Editor</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            CodeFlow works seamlessly across all major IDEs and editors
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* IDE Cards Grid */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportedIDEs.map((ide) => (
              <div
                key={ide.name}
                className={`ide-card group relative p-6 rounded-2xl border transition-all duration-500 hover:-translate-y-2 ${
                  ide.status === 'available'
                    ? 'bg-dark-card border-gray-800 hover:border-neon-green/30'
                    : 'bg-dark-card/50 border-gray-800/50 opacity-70'
                }`}
                style={{ perspective: '1000px' }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {ide.status === 'available' ? (
                    <span className="flex items-center gap-1 text-xs text-neon-green">
                      <Check className="w-3 h-3" />
                      Available
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Coming Soon</span>
                  )}
                </div>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white font-display font-bold text-xl"
                  style={{ backgroundColor: `${ide.color}20`, color: ide.color }}
                >
                  {ide.icon}
                </div>

                {/* Name */}
                <h3 className="font-display font-semibold text-white mb-2">
                  {ide.name}
                </h3>

                {/* Features */}
                <ul className="space-y-1">
                  {ide.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Hover Glow */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 30px ${ide.color}10`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Features Panel */}
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-xl text-white">
              Universal Features
            </h3>
            
            <div className="space-y-4">
              {[
                { icon: Terminal, title: 'Unified CLI', desc: 'Same commands across all editors' },
                { icon: Layers, title: 'Shared Context', desc: 'Your learning history follows you' },
                { icon: Cpu, title: 'Cloud Sync', desc: 'Settings sync across devices' },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="ide-feature flex items-start gap-4 p-4 rounded-xl bg-dark-card border border-gray-800"
                  >
                    <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-neon-green" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white text-sm">{feature.title}</h4>
                      <p className="text-gray-500 text-xs">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Request CTA */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <h4 className="font-display font-semibold text-white mb-2">
                Missing your editor?
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                We&apos;re constantly adding support for new editors. Let us know what you use!
              </p>
              <button className="flex items-center gap-2 text-purple-400 hover:text-white transition-colors text-sm">
                Request Support
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
