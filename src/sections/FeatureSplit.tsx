import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useTiltEffect } from '../hooks/useMousePosition';

gsap.registerPlugin(ScrollTrigger);

export const FeatureSplit = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  
  const { ref: tiltRef, tilt, handlers } = useTiltEffect(5);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const image = imageRef.current;
    const icon = iconRef.current;

    if (!section || !content || !image || !icon) return;

    const ctx = gsap.context(() => {
      // Entrance animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      // Icon scale and rotate
      tl.fromTo(
        icon,
        { scale: 0, rotateZ: -180 },
        { scale: 1, rotateZ: 0, duration: 0.7, ease: 'back.out(1.7)' }
      );

      // Headline lines
      tl.fromTo(
        '.split-headline',
        { x: -80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'expo.out' },
        '-=0.4'
      );

      // Description
      tl.fromTo(
        '.split-description',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' },
        '-=0.3'
      );

      // CTA button
      tl.fromTo(
        '.split-cta',
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' },
        '-=0.2'
      );

      // Image 3D swing in
      tl.fromTo(
        image,
        { rotateY: -45, x: 100, opacity: 0 },
        { rotateY: 0, x: 0, opacity: 1, duration: 0.9, ease: 'expo.out' },
        '-=0.6'
      );

      // Scroll-based 3D tilt on image
      gsap.to(image, {
        rotateY: 15,
        rotateX: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Icon gentle rotation
      gsap.to(icon, {
        rotateZ: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Content parallax
      gsap.to(content, {
        y: -30,
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

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden bg-white"
    >
      {/* Diagonal SVG Divider */}
      <svg
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M50,0 Q55,50 50,100"
          stroke="url(#divider-gradient)"
          strokeWidth="0.2"
          fill="none"
          className="opacity-30"
        >
          <animate
            attributeName="d"
            values="M50,0 Q55,50 50,100; M50,0 Q60,50 50,100; M50,0 Q45,50 50,100; M50,0 Q55,50 50,100"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
        <defs>
          <linearGradient id="divider-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00d084" stopOpacity="0" />
            <stop offset="50%" stopColor="#00d084" stopOpacity="1" />
            <stop offset="100%" stopColor="#00d084" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div ref={contentRef} className="space-y-6 lg:pr-8">
            {/* Icon */}
            <div
              ref={iconRef}
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-green to-green-dark flex items-center justify-center"
            >
              <BookOpen className="w-8 h-8 text-white" />
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-2xl bg-green animate-ripple" />
            </div>

            {/* Headline */}
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-dark leading-tight">
              <span className="split-headline block">Learn as You</span>
              <span className="split-headline block gradient-text">Build</span>
            </h2>

            {/* Description */}
            <p className="split-description text-lg text-gray-600 leading-relaxed max-w-lg">
              Every line of code comes with an explanation. Our AI breaks down complex 
              concepts into simple, digestible insights. No more googling—just pure 
              understanding as you create.
            </p>

            {/* Features List */}
            <ul className="split-description space-y-3">
              {[
                'Real-time code explanations',
                'Context-aware learning',
                'Progressive skill building',
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-green" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button 
              onClick={() => scrollToSection('#features')}
              className="split-cta btn-secondary flex items-center gap-2"
            >
              Explore Features
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Image */}
          <div
            ref={imageRef}
            className="relative"
            style={{ perspective: '800px' }}
          >
            <div
              ref={tiltRef}
              className="relative rounded-2xl overflow-hidden shadow-soft-lg"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
              }}
              {...handlers}
            >
              <img
                src="/feature-learn.jpg"
                alt="Learn as you build"
                className="w-full h-auto"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-green/10 to-transparent pointer-events-none" />
            </div>

            {/* Floating accent */}
            <div 
              className="absolute -bottom-6 -right-6 w-24 h-24 rounded-2xl bg-green-light flex items-center justify-center animate-float"
              style={{ animationDelay: '0.3s' }}
            >
              <span className="text-3xl font-display font-bold text-green">AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
