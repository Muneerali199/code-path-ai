import { useState, useEffect } from 'react';
import { Code2, Menu, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { prefetchRoute } from '@/hooks/usePrefetch';

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '#hero', isRoute: false },
    { name: 'Workspace', href: '#workspace', isRoute: false },
    { name: 'AI Minds', href: '#dual-ai', isRoute: false },
    { name: 'Integrations', href: '#integrations', isRoute: false },
    { name: 'Docs', href: '/docs', isRoute: true },
    { name: 'VS Code', href: '#vscode-extension', isRoute: false },
    { name: 'Pricing', href: '#pricing', isRoute: false },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    if (link.isRoute) {
      navigate(link.href);
    } else {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full transition-all duration-300 ${
        isScrolled
          ? 'glass-dark py-2 sm:py-3 shadow-lg'
          : 'bg-black/70 backdrop-blur-md py-3 sm:py-4'
      } z-50`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 sm:gap-3 group relative z-[60] shrink-0 transition-opacity duration-300 ${
              isMobileMenuOpen ? 'lg:opacity-100 opacity-0' : 'opacity-100'
            }`}
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-neon-green to-neon-dark flex items-center justify-center overflow-hidden shadow-lg shadow-neon-green/20">
              <div className="absolute inset-0 bg-neon-green opacity-20 animate-pulse" />
              <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-black relative z-10" />
            </div>
            <span className="font-display font-bold text-base sm:text-xl text-white group-hover:text-neon-green transition-colors duration-300">
              CodePath
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link)}
                onMouseEnter={() => link.isRoute && prefetchRoute(link.href)}
                className="relative text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300 group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-green transition-all duration-300 group-hover:w-full shadow-glow" />
              </button>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            <button 
              onClick={() => navigate('/auth')}
              onMouseEnter={() => prefetchRoute('/auth')}
              className="px-3 xl:px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/auth')}
              onMouseEnter={() => prefetchRoute('/auth')}
              className="relative px-4 xl:px-6 py-2 xl:py-2.5 rounded-full font-display font-semibold text-sm text-black bg-neon-green overflow-hidden group transition-all duration-300 hover:shadow-glow-lg"
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
            className="lg:hidden p-2.5 rounded-lg border border-neon-green/40 hover:border-neon-green bg-black/90 backdrop-blur-sm shadow-lg active:scale-95 transition-all relative z-[60] shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-neon-green" />
            ) : (
              <Menu className="w-5 h-5 text-neon-green" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay - Outside of container */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}

      {/* Mobile Menu Sidebar - Outside of container */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-[340px] z-[56] lg:hidden transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ height: '100vh', height: '100dvh' }}
      >
        <div className="h-full flex flex-col bg-[#0a0a0a] border-l border-neon-green/30 shadow-2xl shadow-neon-green/10 overflow-hidden">
          {/* Sidebar Header - Fixed */}
          <div className="shrink-0 bg-gradient-to-r from-black/95 to-[#0a0a0a] border-b border-gray-800 px-5 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-dark flex items-center justify-center shadow-lg shadow-neon-green/40">
                  <Code2 className="w-6 h-6 text-black" />
                </div>
                <div>
                  <span className="font-display font-bold text-lg text-white block leading-tight">CodePath</span>
                  <span className="text-[10px] text-gray-500 leading-tight">Menu</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 active:bg-white/5 transition-all"
              >
                <X className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="px-5 py-5">
              {/* Welcome Banner */}
              <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-neon-green/15 via-neon-green/5 to-transparent border border-neon-green/30 shadow-lg shadow-neon-green/5">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-neon-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white mb-0.5">Start Building Today</p>
                    <p className="text-xs text-gray-400">Join 12,000+ developers</p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 mb-5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Pages</p>
                {navLinks.map((link, index) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-[15px] font-medium text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-green/50 group-hover:bg-neon-green group-hover:shadow-[0_0_8px_rgba(0,255,136,0.5)] transition-all" />
                      <span>{link.name}</span>
                    </div>
                    {link.isRoute && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green font-bold uppercase">New</span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Divider */}
              <div className="relative h-px my-5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/20 to-transparent" />
              </div>

              {/* Auth Buttons */}
              <div className="space-y-3 mb-5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Account</p>
                <button 
                  onClick={() => {
                    navigate('/auth');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-[15px] font-semibold text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 active:bg-white/5 transition-all duration-200 hover:shadow-md"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => {
                    navigate('/auth');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3.5 rounded-xl text-[15px] font-bold text-black bg-gradient-to-r from-neon-green to-emerald-400 flex items-center justify-center gap-2 hover:from-neon-green/90 hover:to-emerald-400/90 active:scale-[0.98] shadow-lg shadow-neon-green/30 hover:shadow-neon-green/50 transition-all duration-200"
                >
                  <Zap className="w-5 h-5" />
                  Get Started Free
                </button>
              </div>

              {/* Social Proof Footer */}
              <div className="pt-5 border-t border-gray-800/80">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-[#0a0a0a] flex items-center justify-center"
                      >
                        <span className="text-xs text-gray-500">👤</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">+12k developers</span>
                </div>
                <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                  Powered by AI • Built for speed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
