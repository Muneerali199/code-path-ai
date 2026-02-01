import { ReactLenis } from 'lenis/react';
import { Code2, Sparkles, Zap, Rocket, Brain, Terminal } from 'lucide-react';

const StickyScroll = () => {
  return (
    <ReactLenis root>
      <div className="w-full">
        {/* Section 1 - Introduction */}
        <section className="grid min-h-screen place-content-center sticky top-0 bg-slate-950">
          <div 
            className="absolute inset-0 bg-slate-950"
            style={{
              backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px),
                               linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
              backgroundSize: '4rem 4rem'
            }}
          />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Code2 className="w-12 h-12 sm:w-16 sm:h-16 text-neon-green" />
              <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-neon-green animate-pulse" />
            </div>
            <h2 className="gradient-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-center tracking-tight mb-6">
              Build Anything. Deploy Everywhere.
            </h2>
            <p className="text-gray-400 text-xl sm:text-2xl md:text-3xl text-center max-w-3xl mx-auto">
              Your AI-powered development platform for the modern web
            </p>
            <div className="mt-10">
              <p className="text-neon-green text-lg sm:text-xl animate-bounce">
                Scroll to Explore 👇
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 - Features */}
        <section className="grid min-h-screen place-content-center sticky top-0 bg-neutral-300">
          <div 
            className="absolute inset-0 bg-neutral-300"
            style={{
              backgroundImage: `linear-gradient(to right, #a3a3a3 1px, transparent 1px),
                               linear-gradient(to bottom, #a3a3a3 1px, transparent 1px)`,
              backgroundSize: '4rem 4rem'
            }}
          />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-black" />
            </div>
            <h2 className="text-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-center tracking-tight mb-8">
              Dual AI Architecture
            </h2>
            <p className="text-gray-800 text-lg sm:text-xl md:text-2xl text-center max-w-3xl mx-auto leading-relaxed">
              <span className="font-bold">Forge AI</span> builds your vision.
              <span className="mx-2">+</span>
              <span className="font-bold">Sage AI</span> perfects every detail.
              <br />
              <span className="text-gray-600 text-base sm:text-lg mt-4 block">
                Two AI agents working in perfect harmony for flawless code.
              </span>
            </p>
          </div>
        </section>

        {/* Section 3 - Real-time Collaboration */}
        <section className="grid min-h-screen place-content-center sticky top-0 bg-slate-950">
          <div 
            className="absolute inset-0 bg-slate-950"
            style={{
              backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px),
                               linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
              backgroundSize: '4rem 4rem'
            }}
          />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-neon-green animate-pulse" />
            </div>
            <h2 className="gradient-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-center tracking-tight mb-8">
              Real-Time Everything
            </h2>
            <p className="text-gray-400 text-lg sm:text-xl md:text-2xl text-center max-w-3xl mx-auto leading-relaxed">
              Live preview. Instant collaboration. Zero lag.
              <br />
              <span className="text-neon-green font-semibold mt-4 block">
                See changes as you type. Code together in real-time.
              </span>
            </p>
          </div>
        </section>

        {/* Section 4 - Split: IDE Features */}
        <section className="grid min-h-screen place-content-center sticky top-0 bg-neutral-300">
          <div 
            className="absolute inset-0 bg-neutral-300"
            style={{
              backgroundImage: `linear-gradient(to right, #a3a3a3 1px, transparent 1px),
                               linear-gradient(to bottom, #a3a3a3 1px, transparent 1px)`,
              backgroundSize: '4rem 4rem'
            }}
          />
          <div className="relative z-10 w-full h-screen flex flex-col lg:flex-row">
            {/* Left side - Sticky text */}
            <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
              <div className="max-w-xl">
                <Terminal className="w-12 h-12 text-black mb-6" />
                <h2 className="text-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
                  Multi-IDE Support
                </h2>
                <p className="text-gray-800 text-lg sm:text-xl mb-6 leading-relaxed">
                  Use your favorite editor. VSCode, Cursor, Windsurf, or our built-in browser IDE.
                </p>
                <ul className="space-y-3">
                  {['Syntax Highlighting', 'Auto-completion', 'Live Preview', 'Git Integration'].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-black" />
                      <span className="text-base sm:text-lg font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Right side - Feature cards */}
            <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                {[
                  { icon: Code2, label: 'Smart Code' },
                  { icon: Zap, label: 'Fast Build' },
                  { icon: Terminal, label: 'CLI Tools' },
                  { icon: Rocket, label: 'Deploy' }
                ].map(({ icon: Icon, label }, i) => (
                  <div 
                    key={i}
                    className="aspect-square bg-white rounded-2xl transform hover:scale-105 transition-transform duration-300 p-6 flex flex-col items-center justify-center gap-4 shadow-xl"
                    style={{
                      transform: `rotate(${i % 2 === 0 ? '3deg' : '-3deg'})`
                    }}
                  >
                    <Icon className="w-12 h-12 text-black" />
                    <span className="text-black font-bold text-lg">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 - Split: MCP Servers */}
        <section className="grid min-h-screen place-content-center sticky top-0 bg-slate-950">
          <div 
            className="absolute inset-0 bg-slate-950"
            style={{
              backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px),
                               linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
              backgroundSize: '4rem 4rem'
            }}
          />
          <div className="relative z-10 w-full h-screen flex flex-col lg:flex-row-reverse">
            {/* Right side - Sticky text */}
            <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
              <div className="max-w-xl">
                <Sparkles className="w-12 h-12 text-neon-green mb-6" />
                <h2 className="gradient-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
                  50+ MCP Servers
                </h2>
                <p className="text-gray-400 text-lg sm:text-xl mb-6 leading-relaxed">
                  Connect to GitHub, AWS, MongoDB, Stripe, Figma, and more. One click integration with Model Context Protocol.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['GitHub', 'AWS', 'MongoDB', 'Stripe', 'Vercel', 'Figma'].map((server) => (
                    <span 
                      key={server}
                      className="px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm font-medium"
                    >
                      {server}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Left side - Images */}
            <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                {[
                  { num: '50+', label: 'Servers' },
                  { num: '99%', label: 'Uptime' },
                  { num: '<10ms', label: 'Latency' },
                  { num: '24/7', label: 'Support' }
                ].map(({ num, label }, i) => (
                  <div 
                    key={i}
                    className="aspect-square dark-card rounded-2xl transform hover:scale-105 transition-transform duration-300 p-6 flex flex-col items-center justify-center gap-3"
                    style={{
                      transform: `rotate(${i % 2 === 0 ? '-3deg' : '3deg'})`
                    }}
                  >
                    <span className="text-neon-green text-3xl sm:text-4xl font-black">{num}</span>
                    <span className="text-gray-400 text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer section */}
        <section className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-black"
            style={{
              backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px),
                               linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
              backgroundSize: '4rem 4rem'
            }}
          />
          <div className="relative z-10 text-center px-4">
            <div className="flex items-center justify-center gap-6 mb-12">
              <Rocket className="w-16 h-16 sm:w-20 sm:h-20 text-neon-green" />
            </div>
            <h2 className="text-[6rem] sm:text-[10rem] md:text-[14rem] lg:text-[18rem] font-black gradient-text tracking-tighter leading-none mb-8">
              CodePath
            </h2>
            <p className="text-gray-500 text-xl sm:text-2xl md:text-3xl mt-8 font-medium max-w-2xl mx-auto leading-relaxed">
              The future of development is here.
              <br />
              <span className="text-neon-green">Start building today.</span>
            </p>
            <div className="mt-12">
              <button className="px-8 py-4 bg-neon-green text-black font-bold rounded-xl text-lg hover:bg-neon-green/90 transition-colors duration-300 hover:scale-105 transform">
                Get Started Free
              </button>
            </div>
          </div>
        </section>
      </div>
    </ReactLenis>
  );
};

export default StickyScroll;
