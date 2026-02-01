import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Zap, BookOpen, Cpu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const teacherFeatures = [
  'Breaks down complex concepts',
  'Answers any coding question',
  'Adapts to your skill level',
  'Provides learning resources',
];

const builderFeatures = [
  'Writes production-ready code',
  'Follows best practices',
  'Optimizes performance',
  'Generates tests automatically',
];

export const DualAI = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const teacherCardRef = useRef<HTMLDivElement>(null);
  const builderCardRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const teacherCard = teacherCardRef.current;
    const builderCard = builderCardRef.current;
    const beam = beamRef.current;

    if (!section || !teacherCard || !builderCard || !beam) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.dual-title',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Cards emerge from depth
      gsap.fromTo(
        teacherCard,
        { 
          z: -200,
          rotateY: 45,
          opacity: 0,
        },
        {
          z: 0,
          rotateY: -15,
          opacity: 1,
          duration: 1,
          delay: 0.3,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        builderCard,
        { 
          z: -200,
          rotateY: -45,
          opacity: 0,
        },
        {
          z: 0,
          rotateY: 15,
          opacity: 1,
          duration: 1,
          delay: 0.3,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Beam animation
      gsap.fromTo(
        beam,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.8,
          delay: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Avatars pop in
      gsap.fromTo(
        '.ai-avatar',
        { scale: 0, rotateY: 180 },
        {
          scale: 1,
          rotateY: 0,
          duration: 0.6,
          delay: 1,
          ease: 'back.out(1.7)',
          stagger: 0.2,
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Feature lists
      gsap.fromTo(
        '.feature-item',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          delay: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Scroll-based card rotation
      gsap.to(teacherCard, {
        rotateY: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to(builderCard, {
        rotateY: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Cards converge
      gsap.to(teacherCard, {
        x: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'center center',
          scrub: 1,
        },
      });

      gsap.to(builderCard, {
        x: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'center center',
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="dual-ai"
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background Neural Network Image */}
      <div className="absolute inset-0 opacity-30">
        <img
          src="/neural-network.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="dual-title font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            Two AI <span className="gradient-text">Minds</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            The perfect partnership for learning and building
          </p>
        </div>

        {/* Dual Cards */}
        <div 
          className="relative grid md:grid-cols-2 gap-6 md:gap-7 lg:gap-16 max-w-5xl mx-auto"
          style={{ perspective: '1200px' }}
        >
          {/* Connection Beam */}
          <div
            ref={beamRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 hidden md:block origin-center"
            style={{
              background: 'linear-gradient(90deg, #00d4ff, #00ff88, #00d4ff)',
              backgroundSize: '200% 100%',
              animation: 'beam-flow 2s linear infinite',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
            }}
          />

          {/* Teacher AI Card */}
          <div
            ref={teacherCardRef}
            className="relative group"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-cyan/10 to-transparent border border-cyan/30 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-cyan/50 hover:shadow-glow-cyan">
              {/* Glow Background */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan/20 blur-3xl" />
              
              {/* Avatar */}
              <div className="ai-avatar relative w-32 h-32 mx-auto mb-6">
                <img
                  src="/ai-teacher-holo.png"
                  alt="ExplainAI"
                  className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,212,255,0.5)]"
                />
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-cyan/20 flex items-center justify-center mb-6 mx-auto">
                <BookOpen className="w-7 h-7 text-cyan" />
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="font-display font-bold text-2xl text-white mb-1">
                  ExplainAI
                </h3>
                <p className="text-cyan font-medium">
                  Your Personal Coding Mentor
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {teacherFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="feature-item flex items-center gap-3 text-gray-300"
                  >
                    <span className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-cyan" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Builder AI Card */}
          <div
            ref={builderCardRef}
            className="relative group"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-neon-green/10 to-transparent border border-neon-green/30 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-neon-green/50 hover:shadow-glow">
              {/* Glow Background */}
              <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-neon-green/20 blur-3xl" />
              
              {/* Avatar */}
              <div className="ai-avatar relative w-32 h-32 mx-auto mb-6">
                <img
                  src="/ai-builder-holo.png"
                  alt="CodeAI"
                  className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,255,136,0.5)]"
                />
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-neon-green/20 flex items-center justify-center mb-6 mx-auto">
                <Cpu className="w-7 h-7 text-neon-green" />
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="font-display font-bold text-2xl text-white mb-1">
                  CodeAI
                </h3>
                <p className="text-neon-green font-medium">
                  Your Expert Developer Partner
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {builderFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="feature-item flex items-center gap-3 text-gray-300"
                  >
                    <span className="w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-neon-green" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Central Badge */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan to-neon-green flex items-center justify-center shadow-glow animate-pulse-glow">
                <Zap className="w-8 h-8 text-black" />
              </div>
              {/* Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-neon-green/30 animate-ping" />
            </div>
          </div>
        </div>

        {/* Mobile Badge */}
        <div className="mt-12 flex justify-center md:hidden">
          <div className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan to-neon-green text-black font-display font-bold shadow-glow">
            Better Together
          </div>
        </div>
      </div>
    </section>
  );
};
