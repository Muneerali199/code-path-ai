import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageSquare, Send, Bot, User, Code } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const codeLines = [
  { text: 'import React, { useState } from "react";', type: 'import', delay: 0 },
  { text: '', type: 'empty', delay: 100 },
  { text: 'function Counter() {', type: 'function', delay: 200 },
  { text: '  const [count, setCount] = useState(0);', type: 'code', delay: 400 },
  { text: '', type: 'empty', delay: 600 },
  { text: '  // Increment the counter', type: 'comment', delay: 800 },
  { text: '  const increment = () => {', type: 'code', delay: 1000 },
  { text: '    setCount(count + 1);', type: 'code', delay: 1200 },
  { text: '  };', type: 'code', delay: 1400 },
  { text: '', type: 'empty', delay: 1500 },
  { text: '  return (', type: 'code', delay: 1600 },
  { text: '    <button onClick={increment}>', type: 'jsx', delay: 1800 },
  { text: '      Count: {count}', type: 'jsx', delay: 2000 },
  { text: '    </button>', type: 'jsx', delay: 2200 },
  { text: '  );', type: 'code', delay: 2400 },
  { text: '}', type: 'function', delay: 2600 },
];

const aiResponses = [
  { text: 'I see you\'re creating a React counter component! Let me explain what\'s happening:', sender: 'ai', delay: 2800 },
  { text: '1. useState(0) creates a state variable starting at 0', sender: 'ai', delay: 3500 },
  { text: '2. setCount updates the state and triggers a re-render', sender: 'ai', delay: 4200 },
  { text: '3. The button calls increment() when clicked', sender: 'ai', delay: 4900 },
];

export const Workspace = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const codePanelRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState(0);
  const [visibleResponses, setVisibleResponses] = useState(0);
  const [cursorLine, setCursorLine] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Pin the section
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
      });

      // Code panel entrance
      gsap.fromTo(
        codePanelRef.current,
        { x: -100, rotateY: 15, opacity: 0 },
        {
          x: 0,
          rotateY: 0,
          opacity: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          },
        }
      );

      // Chat panel entrance
      gsap.fromTo(
        chatPanelRef.current,
        { x: 100, rotateY: -15, opacity: 0 },
        {
          x: 0,
          rotateY: 0,
          opacity: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          },
        }
      );

      // Code typing animation based on scroll
      ScrollTrigger.create({
        trigger: section,
        start: 'top 20%',
        end: '+=100%',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const lineIndex = Math.floor(progress * codeLines.length);
          setVisibleLines(Math.min(lineIndex, codeLines.length));
          setCursorLine(Math.min(lineIndex, codeLines.length - 1));
        },
      });

      // AI responses based on scroll
      ScrollTrigger.create({
        trigger: section,
        start: '+=50%',
        end: '+=150%',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const responseIndex = Math.floor(progress * aiResponses.length);
          setVisibleResponses(Math.min(responseIndex, aiResponses.length));
        },
      });

      // Connection beam animation
      gsap.fromTo(
        '.connection-beam',
        { opacity: 0, scaleX: 0 },
        {
          opacity: 1,
          scaleX: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 30%',
            end: 'top 10%',
            scrub: 1,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const getLineColor = (type: string) => {
    switch (type) {
      case 'import': return 'text-purple-neon';
      case 'function': return 'text-cyan';
      case 'comment': return 'text-gray-500';
      case 'jsx': return 'text-neon-green';
      default: return 'text-gray-300';
    }
  };

  return (
    <section
      id="workspace"
      ref={sectionRef}
      className="relative min-h-screen bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-3 sm:mb-4">
            The <span className="gradient-text">Workspace</span>
          </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Watch AI write code and explain it in real-time
          </p>
        </div>

        {/* Split Panels */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-7 lg:gap-8 relative" style={{ perspective: '1200px' }}>
          {/* Connection Beam */}
          <div 
            className="connection-beam absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1 hidden lg:block origin-center"
            style={{
              background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
            }}
          />

          {/* Code Panel */}
          <div
            ref={codePanelRef}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-gray-800 bg-[#0d1117]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Panel Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-gray-800">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-2 ml-4 px-3 py-1 rounded-md bg-[#0d1117] text-sm text-gray-400">
                <Code className="w-4 h-4" />
                Counter.jsx
              </div>
            </div>

            {/* Code Content */}
            <div className="p-4 font-mono text-sm overflow-hidden">
              {codeLines.map((line, index) => (
                <div
                  key={index}
                  className={`flex transition-all duration-300 ${
                    index < visibleLines ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span className="w-8 text-gray-600 select-none text-right pr-4">
                    {index + 1}
                  </span>
                  <span className={getLineColor(line.type)}>
                    {line.text}
                    {index === cursorLine && index < visibleLines && (
                      <span className="inline-block w-2 h-4 bg-neon-green ml-0.5 animate-pulse" />
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,255,136,0.1)]" />
          </div>

          {/* Chat Panel */}
          <div
            ref={chatPanelRef}
            className="relative rounded-2xl overflow-hidden border border-gray-800 bg-dark-card"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Panel Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-dark-lighter border-b border-gray-800">
              <Bot className="w-5 h-5 text-neon-green" />
              <span className="font-medium text-white">CodeFlow AI</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            </div>

            {/* Chat Content */}
            <div className="p-4 space-y-4 h-[400px] overflow-hidden">
              {/* AI Intro */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-neon-green" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                  <p className="text-sm text-gray-300">
                    Hi! I&apos;m your AI coding assistant. I&apos;ll write code and explain it as we go.
                  </p>
                </div>
              </div>

              {/* AI Responses */}
              {aiResponses.slice(0, visibleResponses).map((response, index) => (
                <div key={index} className="flex gap-3 animate-slide-up">
                  <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-neon-green" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                    <p className="text-sm text-gray-300">{response.text}</p>
                  </div>
                </div>
              ))}

              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-neon-green/20 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  <p className="text-sm text-neon-green">
                    Create a counter component please
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-dark-card border-t border-gray-800">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-gray-700">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                  readOnly
                />
                <button className="w-8 h-8 rounded-full bg-neon-green flex items-center justify-center">
                  <Send className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
