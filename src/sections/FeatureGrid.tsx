import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Wand2, 
  MessageCircle, 
  AlertCircle, 
  LayoutTemplate,
  Users,
  Brain,
  ArrowRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Wand2,
    title: 'Smart Code Generation',
    description: 'Write natural language, get production-ready code. Our AI understands context, best practices, and your coding style.',
    color: '#00ff88',
    gradient: 'from-neon-green to-neon-dark',
  },
  {
    icon: MessageCircle,
    title: 'Instant Explanations',
    description: 'Stuck on a concept? Highlight any code and get a clear, beginner-friendly explanation in seconds.',
    color: '#00d4ff',
    gradient: 'from-cyan to-blue-500',
  },
  {
    icon: AlertCircle,
    title: 'Error Resolution',
    description: 'Errors become learning opportunities. Our AI not only fixes issues but teaches you why they happened.',
    color: '#ff6b00',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: LayoutTemplate,
    title: 'Project Templates',
    description: 'Start faster with intelligent templates that adapt to your skill level and project requirements.',
    color: '#a855f7',
    gradient: 'from-purple-neon to-pink-neon',
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Work together with your team in real-time. See cursors, share code, and learn from each other.',
    color: '#00ff88',
    gradient: 'from-neon-green to-cyan',
  },
  {
    icon: Brain,
    title: 'AI Pair Programming',
    description: 'Have a coding partner that never sleeps. Bounce ideas, get suggestions, and code better together.',
    color: '#00d4ff',
    gradient: 'from-cyan to-purple-neon',
  },
];

export const FeatureGrid = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;

    if (!section || !grid) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.feature-title',
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

      // Cards fly in from different directions
      const cards = grid.querySelectorAll('.feature-card');
      cards.forEach((card, index) => {
        const directions = [
          { x: -100, y: -50 },
          { x: 0, y: -100 },
          { x: 100, y: -50 },
          { x: -100, y: 50 },
          { x: 0, y: 100 },
          { x: 100, y: 50 },
        ];
        const dir = directions[index % directions.length];

        gsap.fromTo(
          card,
          { 
            x: dir.x, 
            y: dir.y, 
            opacity: 0,
            rotateX: 30,
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            delay: 0.2 + index * 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 60%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Parallax depth on scroll
      gsap.to('.feature-card:nth-child(odd)', {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to('.feature-card:nth-child(even)', {
        y: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="feature-title font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            Everything You <span className="gradient-text">Need</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            A complete development environment powered by dual AI intelligence
          </p>
        </div>

        {/* Feature Grid */}
        <div
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
          style={{ perspective: '1000px' }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            
            return (
              <div
                key={feature.title}
                className="feature-card group relative p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-dark-card border border-gray-800 overflow-hidden transition-all duration-500 hover:border-gray-700 hover:-translate-y-2"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Glow Background */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ backgroundColor: feature.color }}
                />

                {/* Icon */}
                <div 
                  className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-display font-semibold text-xl text-white mb-3 group-hover:text-neon-green transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Learn More Link */}
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3"
                  style={{ color: feature.color }}
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                {/* Border Glow on Hover */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 30px ${feature.color}10`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
