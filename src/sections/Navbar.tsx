import { useState, useEffect } from 'react';
import { Code2, Menu, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Workspace', href: '#workspace' },
    { name: 'AI Minds', href: '#dual-ai' },
    { name: 'Integrations', href: '#integrations' },
    { name: 'Docs', href: '#documentation' },
    { name: 'VS Code', href: '#vscode-extension' },
    { name: 'Pricing', href: '#pricing' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-cinematic ${
        isScrolled
          ? 'glass-dark py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-dark flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-neon-green opacity-20 animate-pulse" />
              <Code2 className="w-6 h-6 text-black relative z-10" />
            </div>
            <span className="font-display font-bold text-xl text-white group-hover:text-neon-green transition-colors duration-300">
              CodeFlow
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="relative text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300 group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-green transition-all duration-300 group-hover:w-full shadow-glow" />
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/auth')}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="relative px-6 py-2.5 rounded-full font-display font-semibold text-sm text-black bg-neon-green overflow-hidden group transition-all duration-300 hover:shadow-glow-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Get Started
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg border border-gray-800 hover:border-neon-green/50 transition-colors z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-cinematic ${
            isMobileMenuOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="glass-dark rounded-2xl p-3 sm:p-4 space-y-1 sm:space-y-2 border border-gray-800">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="block px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2 space-y-2">
              <button 
                onClick={() => {
                  navigate('/auth');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  navigate('/auth');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-display font-semibold text-black bg-neon-green flex items-center justify-center gap-2 hover:bg-neon-green/90 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
