import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code2, Twitter, Github, MessageCircle, Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  product: {
    title: 'Product',
    links: ['Features', 'Pricing', 'Integrations', 'Changelog'],
  },
  resources: {
    title: 'Resources',
    links: ['Documentation', 'Tutorials', 'Blog', 'Community'],
  },
  company: {
    title: 'Company',
    links: ['About', 'Careers', 'Contact', 'Press'],
  },
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter', color: '#1DA1F2' },
  { icon: Github, href: '#', label: 'GitHub', color: '#ffffff' },
  { icon: MessageCircle, href: '#', label: 'Discord', color: '#5865F2' },
];

export const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const ctx = gsap.context(() => {
      // Border draw
      gsap.fromTo(
        '.footer-border',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Logo
      gsap.fromTo(
        '.footer-logo',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Columns
      gsap.fromTo(
        '.footer-column',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.3,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Social icons
      gsap.fromTo(
        '.social-icon',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.5,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: footer,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, footer);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative bg-[#0a0a0a] pt-12 md:pt-16 pb-6 md:pb-8"
    >
      {/* Top Border */}
      <div className="footer-border absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent origin-center" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-7 md:gap-8 lg:gap-12 mb-10 md:mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <div className="footer-logo flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-dark flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-neon-green opacity-20 animate-pulse" />
                <Code2 className="w-6 h-6 text-black relative z-10" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                CodeFlow
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              The AI-powered IDE that writes, explains, and teaches. 
              Transform your coding journey today.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="social-icon w-10 h-10 rounded-xl bg-dark-card border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition-all duration-300 hover:rotate-[360deg]"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className="footer-column">
              <h4 className="font-display font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-500 text-sm hover:text-neon-green transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 flex items-center gap-1">
            © 2024 CodeFlow. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for developers
          </p>
          
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-neon-green transition-colors">Privacy</a>
            <a href="#" className="hover:text-neon-green transition-colors">Terms</a>
            <a href="#" className="hover:text-neon-green transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
