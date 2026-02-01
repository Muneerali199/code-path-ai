import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play, Sparkles, ChevronDown } from 'lucide-react';
import { Starfield } from '../components/Starfield';

gsap.registerPlugin(ScrollTrigger);

export const Hero = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const content = contentRef.current;
    const image = imageRef.current;

    if (!section || !headline || !content || !image) return;

    const ctx = gsap.context(() => {
      // Entrance timeline
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      // Badge
      tl.fromTo(
        '.hero-badge',
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      );

      // Headline words with 3D effect
      const words = headline.querySelectorAll('.word');
      tl.fromTo(
        words,
        { 
          rotateX: -90,
          y: 50,
          opacity: 0,
          transformOrigin: 'center bottom'
        },
        { 
          rotateX: 0,
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1
        },
        '-=0.3'
      );

      // Description
      tl.fromTo(
        '.hero-description',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        '-=0.4'
      );

      // CTAs
      tl.fromTo(
        '.hero-cta-primary',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
        '-=0.3'
      );

      tl.fromTo(
        '.hero-cta-secondary',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5 },
        '-=0.2'
      );

      // Image with 3D rotation
      tl.fromTo(
        image,
        { 
          rotateY: -30,
          rotateX: 10,
          x: 100,
          opacity: 0,
          transformOrigin: 'center center'
        },
        { 
          rotateY: 0,
          rotateX: 0,
          x: 0,
          opacity: 1,
          duration: 1.2
        },
        '-=0.8'
      );

      // Scroll-triggered parallax
      gsap.to(image, {
        y: -100,
        rotateY: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '50% top',
          scrub: 1,
        },
      });

      gsap.to(headline, {
        opacity: 0.2,
        filter: 'blur(10px)',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '50% top',
          scrub: 1,
        },
      });

      // Floating particles around image
      gsap.to('.float-particle', {
        y: 'random(-30, 30)',
        x: 'random(-20, 20)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.5,
          from: 'random'
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <Starfield />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] pointer-events-none z-10" />
      
      {/* Grid Floor */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none z-0 opacity-20"
        style={{
          background: `
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center bottom',
        }}
      />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-8 items-center">
          {/* Left Content */}
          <div ref={contentRef} className="space-y-4 md:space-y-8" style={{ perspective: '1000px' }}>
            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-neon-green/30 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-sm font-medium text-neon-green">
                AI-POWERED DEVELOPMENT
              </span>
            </div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <span className="word inline-block text-white">Code</span>{' '}
              <span className="word inline-block gradient-text">in</span>{' '}
              <span className="word inline-block gradient-text">the</span>{' '}
              <span className="word inline-block text-white">Void</span>
            </h1>

            {/* Description */}
            <p className="hero-description text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed">
              Where AI writes, explains, and teaches. Experience the future of development 
              with our dual-AI system that transforms every line of code into a learning opportunity.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/auth')}
                className="hero-cta-primary btn-neon flex items-center gap-2 text-base"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scrollToSection('#workspace')}
                className="hero-cta-secondary btn-outline flex items-center gap-2 text-base"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[
                { value: '10M+', label: 'Lines Generated' },
                { value: '500K+', label: 'Developers' },
                { value: '4.9', label: 'Rating' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-display font-bold text-2xl text-neon-green text-glow-green">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - 3D Image */}
          <div
            ref={imageRef}
            className="relative lg:h-[500px] flex items-center justify-center"
            style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
          >
            {/* Main Image */}
            <div 
              className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-soft-lg"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(50px)'
              }}
            >
              <img
                src="/code-editor-dark.jpg"
                alt="CodeFlow IDE"
                className="w-full h-auto"
              />
              
              {/* Glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-neon-green/10 to-transparent pointer-events-none" />
              
              {/* Scanlines */}
              <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
            </div>

            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="float-particle absolute w-3 h-3 rounded-full bg-neon-green/60"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                  boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                }}
              />
            ))}

            {/* Decorative Elements */}
            <div 
              className="absolute -top-8 -right-8 w-24 h-24 rounded-2xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center animate-float"
              style={{ transform: 'translateZ(100px)' }}
            >
              <Sparkles className="w-10 h-10 text-neon-green" />
            </div>

            <div 
              className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-dark-card border border-gray-800 text-sm font-mono text-neon-green"
              style={{ transform: 'translateZ(80px)' }}
            >
              {'>'} npm start
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 animate-bounce">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
};
