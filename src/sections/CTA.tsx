import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const CTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const portal = portalRef.current;

    if (!section || !portal) return;

    const ctx = gsap.context(() => {
      // Portal expansion
      gsap.fromTo(
        portal,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Headline
      gsap.fromTo(
        '.cta-headline',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.3,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Subtext
      gsap.fromTo(
        '.cta-subtext',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.5,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // CTA Button
      gsap.fromTo(
        '.cta-button',
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          delay: 0.7,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Portal rotation on scroll
      gsap.to(portal, {
        rotation: 360,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      });

      // Particle explosion
      gsap.to('.cta-particle', {
        scale: 'random(0.5, 1.5)',
        opacity: 'random(0.3, 0.8)',
        duration: 'random(2, 4)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.2,
          from: 'random',
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="relative py-24 md:py-32 lg:py-48 overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: `
              radial-gradient(ellipse at 30% 50%, rgba(0, 255, 136, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 50%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)
            `,
          }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="cta-particle absolute w-1 h-1 rounded-full bg-neon-green"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
          }}
        />
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Portal */}
        <div className="relative w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 mx-auto mb-8 md:mb-12">
          <div
            ref={portalRef}
            className="absolute inset-0 rounded-full border-4 border-neon-green/30"
            style={{
              background: 'conic-gradient(from 0deg, #00ff88, #00d4ff, #a855f7, #00ff88)',
              animation: 'spin 10s linear infinite',
            }}
          >
            <div className="absolute inset-2 rounded-full bg-[#0a0a0a]" />
          </div>
          
          {/* Inner Glow */}
          <div className="absolute inset-4 rounded-full bg-neon-green/20 blur-xl animate-pulse" />
          
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-neon-green" />
          </div>

          {/* Orbiting Rings */}
          <div className="absolute -inset-4 rounded-full border border-neon-green/20 animate-spin" style={{ animationDuration: '15s' }} />
          <div className="absolute -inset-8 rounded-full border border-cyan/10 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
        </div>

        {/* Headline */}
        <h2 className="cta-headline font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white mb-4 sm:mb-6">
          Ready to <span className="gradient-text">Transform</span><br />
          Your Coding?
        </h2>

        {/* Subtext */}
        <p className="cta-subtext text-base sm:text-lg md:text-xl text-gray-400 mb-8 md:mb-10 max-w-2xl mx-auto">
          Join thousands of developers who are already coding smarter, 
          learning faster, and building better with CodeFlow.
        </p>

        {/* CTA Button */}
        <button className="cta-button group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full bg-neon-green text-black font-display font-bold text-lg md:text-xl transition-all duration-500 hover:scale-105 overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          <span className="relative z-10 flex items-center gap-2 sm:gap-3">
            <Zap className="w-5 sm:w-6 h-5 sm:h-6" />
            Start Free Today
            <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
          
          {/* Outer Glow */}
          <div className="absolute -inset-1 rounded-full bg-neon-green/50 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-green" />
            14-day free trial
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-green" />
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-green" />
            Cancel anytime
          </span>
        </div>
      </div>
    </section>
  );
};
