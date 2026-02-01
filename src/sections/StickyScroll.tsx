"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const content = [
  {
    title: "Dynamic Path Generation",
    description:
      "Stop following generic tutorials. CodePath AI analyzes your current skill level and desired goals to architect a personalized learning journey. Whether you're mastering Rust or building a microservices mesh, your path evolves as you learn.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white p-6">
        <div className="relative w-full h-full border border-white/20 rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm p-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="space-y-3">
                <div className="h-2 w-3/4 bg-white/20 rounded" />
                <div className="h-2 w-1/2 bg-white/20 rounded" />
                <div className="h-2 w-5/6 bg-cyan-400/40 rounded animate-pulse" />
                <div className="h-2 w-2/3 bg-white/20 rounded" />
                <div className="h-2 w-4/5 bg-emerald-400/40 rounded animate-pulse" />
            </div>
        </div>
      </div>
    ),
  },
  {
    title: "Dual-Agent Intelligence",
    description:
      "Experience true pair programming. Our architecture leverages a Researcher agent to gather context and a Coder agent to implement logic. They communicate in real-time to solve complex architectural challenges before a single line of code is written.",
    content: (
      <div className="h-full w-full flex items-center justify-center text-white bg-slate-900">
        <div className="grid grid-cols-2 gap-4 w-full p-4">
            <div className="aspect-square rounded-lg border border-cyan-500/50 bg-cyan-500/10 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 text-xl font-bold">R</span>
                </div>
                <span className="text-xs text-cyan-300">Researcher</span>
            </div>
            <div className="aspect-square rounded-lg border border-purple-500/50 bg-purple-500/10 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 text-xl font-bold">C</span>
                </div>
                <span className="text-xs text-purple-300">Coder</span>
            </div>
            <div className="col-span-2 h-12 rounded border border-white/10 bg-white/5 flex items-center px-4 overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-ping" />
                <span className="text-[10px] font-mono text-white/50 truncate">Syncing context... Found 14 relevant file references</span>
            </div>
        </div>
      </div>
    ),
  },
  {
    title: "MCP-Powered Integration",
    description:
      "Connect your AI to your entire stack. Using the Model Context Protocol, CodePath AI can index your GitHub repos, query your documentation, and even interact with your local development environment directly. No more manual copy-pasting.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white p-6">
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-500/20" />
                    <span className="text-sm font-medium">GitHub Repository</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px]">Connected</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-orange-500/20" />
                    <span className="text-sm font-medium">Local File System</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px]">Connected</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20" />
                    <span className="text-sm font-medium">PostgreSQL DB</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px]">Configuring</div>
            </div>
        </div>
      </div>
    ),
  },
  {
    title: "Interactive Sandbox",
    description:
      "Build, run, and iterate in seconds. Every snippet generated or explained by CodePath AI can be executed in a secure, isolated cloud sandbox. See your changes live without ever leaving the platform or breaking your local setup.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--indigo-500),var(--purple-500))] flex items-center justify-center text-white">
        <div className="w-full max-w-xs aspect-video bg-black/50 rounded-lg border border-white/20 p-3 font-mono text-[10px] overflow-hidden">
            <div className="text-green-400">$ npm run dev</div>
            <div className="text-gray-400">Ready in 245ms</div>
            <div className="text-blue-400 mt-2">Local: http://localhost:5173</div>
            <div className="mt-2 text-white/80">
                &gt; compiling main.ts... <br/>
                &gt; bundling assets... <br/>
                <span className="text-green-500">&gt; success! Application running.</span>
            </div>
        </div>
      </div>
    ),
  },
];

const StickyScroll = ({ className }: { className?: string }) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useScroll({
    target: ref,
    offset: ["start start", "end start"],
  }).scrollYProgress.on("change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "var(--black)",
    "var(--slate-900)",
    "var(--neutral-900)",
  ];
  const linearGradients = [
    "linear-gradient(to bottom right, var(--cyan-500), var(--emerald-500))",
    "linear-gradient(to bottom right, var(--pink-500), var(--indigo-500))",
    "linear-gradient(to bottom right, var(--orange-500), var(--yellow-500))",
  ];

  const [backgroundGradient, setBackgroundGradient] = React.useState(
    linearGradients[0]
  );

  React.useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="h-[30rem] overflow-y-auto flex justify-center relative space-x-10 rounded-md p-10 custom-scrollbar scroll-smooth"
      ref={ref}
    >
      <div className="relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-2xl font-bold text-slate-100"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-kg text-slate-300 max-w-sm mt-10"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        style={{ background: backgroundGradient }}
        className={cn(
          "hidden lg:block h-60 w-80 rounded-md bg-white sticky top-20 overflow-hidden shadow-2xl shadow-cyan-500/20 border border-white/10",
          className
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};

export default StickyScroll;
