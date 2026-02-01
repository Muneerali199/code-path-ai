import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 10000000, suffix: '+', label: 'Lines of Code Generated', prefix: '' },
  { value: 500000, suffix: '+', label: 'Active Developers', prefix: '' },
  { value: 99.9, suffix: '%', label: 'Uptime', prefix: '' },
  { value: 4.9, suffix: '/5', label: 'User Rating', prefix: '' },
];

function AnimatedNumber({ value, suffix, prefix, isVisible }: { 
  value: number; 
  suffix: string; 
  prefix: string;
  isVisible: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const startTime = Date.now();
    const isDecimal = value % 1 !== 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = value * easeOutQuart;
      
      setDisplayValue(isDecimal ? parseFloat(currentValue.toFixed(1)) : Math.floor(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isVisible]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <span ref={numberRef} className="tabular-nums">
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
}

export const Stats = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Trigger number animation when section is visible
      ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        onEnter: () => setIsVisible(true),
      });

      // Stats cards entrance
      gsap.fromTo(
        '.stat-card',
        { y: 60, opacity: 0, rotateX: 30 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Numbers That <span className="gradient-text">Speak</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            Trusted by developers worldwide
          </p>
        </div>

        {/* Stats Grid */}
        <div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
          style={{ perspective: '1000px' }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card relative p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-dark-card border border-gray-800 text-center overflow-hidden group hover:border-neon-green/30 transition-all duration-500"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Number */}
              <div className="relative font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-neon-green text-glow-green mb-2">
                <AnimatedNumber 
                  value={stat.value} 
                  suffix={stat.suffix} 
                  prefix={stat.prefix}
                  isVisible={isVisible}
                />
              </div>
              
              {/* Label */}
              <div className="relative text-gray-400 text-sm">
                {stat.label}
              </div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-green/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
