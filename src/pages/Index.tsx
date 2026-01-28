import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Container } from '@/components/landing/Container';
import { Section } from '@/components/landing/Section';
import { MediaCard } from '@/components/landing/MediaCard';
import { Github, Brain, Wand2, Check, Code2, FolderPlus, Zap, Shield, Users, BookOpen, Download, Mail, ArrowRight, Laptop } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, handle gracefully
      });
    }
  }, []);

  const handleStartBuilding = () => {
    navigate('/auth');
  };

  const scrollToDemo = () => {
    const demoElement = document.getElementById('demo');
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Section id="hero" className="relative overflow-hidden pt-24 md:pt-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <Container className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 bg-primary/15 text-primary">
              <Zap className="mr-2 h-3.5 w-3.5" />
              AI-Powered Development
            </Badge>
            <h1 className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-5xl font-semibold tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl">
              CodePath AI
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Tame complexity with spec-driven development, advanced steering, and custom agents
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-8 py-3 text-base font-medium text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                onClick={handleStartBuilding}
              >
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-2 px-8 py-3 text-base font-medium"
                onClick={scrollToDemo}
              >
                <Laptop className="mr-2 h-4 w-4" />
                Watch demo
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-primary" />
                Coder-AI executes
              </span>
              <span className="inline-flex items-center gap-2">
                <Wand2 className="h-3.5 w-3.5 text-primary" />
                Guide-AI explains
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Built on Firebase
              </span>
            </div>
          </div>

          <div className="mt-10 md:mt-14">
            <div
              id="demo"
              className="relative mx-auto aspect-video w-full max-w-6xl overflow-hidden rounded-3xl shadow-[0_20px_70px_-40px_hsl(var(--primary)/0.55)] lg:max-w-7xl"
            >
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/secondary-specs-requirements.png"
                src="/primary-specs.mp4"
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section id="how-it-works" className="pt-16 md:pt-24">
        <Container>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Natural prompt to structured requirements</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                Make your intent and constraints explicit, then move from requirements to architecture to discrete tasks.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5" />
                Specs
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="inline-flex items-center gap-2">
                <FolderPlus className="h-3.5 w-3.5" />
                Tasks
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[{
              title: 'Natural prompt to structured requirements',
              img: '/tertiary-context.png',
              points: [
                'Turn natural language into clear requirements and acceptance criteria',
                'Use EARS notation to make intent explicit',
                'Capture constraints before implementation starts',
              ],
            }, {
              title: 'Architectural designs backed by best practices',
              img: '/tertiary-steering.png',
              points: [
                'Iterate on requirements, then analyze your codebase',
                'Create architecture, system design, and tech stack',
                'Keep decisions consistent as the project grows',
              ],
            }, {
              title: 'Discrete tasks that map to requirements',
              img: '/tertiary-vibes.png',
              points: [
                'Generate an implementation plan with discrete tasks',
                'Sequence work based on dependencies',
                'Add optional comprehensive tests',
              ],
            }].map((card) => (
              <Card key={card.title} className="overflow-hidden border-border bg-card/50 flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                    <Badge variant="outline" className="border-border/60 text-muted-foreground">
                      Step
                    </Badge>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {card.points.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 pb-6 mt-auto">
                  <div className="w-full h-[220px] md:h-[260px] lg:h-[280px]">
                    <img src={card.img} alt={card.title} className="block w-full h-full object-contain" loading="lazy" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="features" className="pt-16 md:pt-24">
        <Container className="max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Features that feel premium</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
                Go from prompt to requirements to tasks with a clean interface and agent-powered workflows.
              </p>
            </div>
            <div className="flex items-center justify-start md:justify-end">
              <Button variant="outline" className="rounded-xl" onClick={() => window.open('https://github.com', '_blank')}>
                <Github className="mr-2 h-4 w-4" />
                View source
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-16 md:gap-24">
            <div className="grid gap-6 md:grid-cols-5 md:items-center">
              <div className="md:col-span-2">
                <Badge className="bg-primary/15 text-primary" variant="secondary">
                  Hooks
                </Badge>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">Automate tasks with agent hooks</h3>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  Delegate tasks to AI agents that trigger on events such as file save. Agents autonomously execute in the
                  background based on your pre-defined prompts.
                </p>
              </div>
              <MediaCard className="transition-transform hover:-translate-y-1 md:col-span-3">
                <img src="/primary-hooks.png" alt="Primary hooks" className="block w-full h-auto object-contain rounded-lg" loading="lazy" />
              </MediaCard>
            </div>

            <div className="grid gap-6 md:grid-cols-5 md:items-center">
              <MediaCard className="transition-transform hover:-translate-y-1 md:col-span-3">
                <img
                  src="/secondary-specs-design.png"
                  alt="Specs design"
                  className="block w-full h-auto object-contain rounded-lg"
                  loading="lazy"
                />
              </MediaCard>
              <div className="md:col-span-2">
                <Badge className="bg-primary/15 text-primary" variant="secondary">
                  Specs
                </Badge>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">Write specs that ship</h3>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  Align requirements, design, and tasks in one place so features don't drift.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-5 md:items-center">
              <div className="md:col-span-2">
                <Badge className="bg-primary/15 text-primary" variant="secondary">
                  Specs
                </Badge>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">Discrete tasks that map to requirements</h3>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  Create an implementation plan with discrete tasks, sequenced based on dependencies, with optional
                  comprehensive tests.
                </p>
              </div>
              <MediaCard className="transition-transform hover:-translate-y-1 md:col-span-3">
                <img
                  src="/secondary-specs-tasks.png"
                  alt="Specs tasks"
                  className="block w-full h-auto object-contain rounded-lg"
                  loading="lazy"
                />
              </MediaCard>
            </div>

            <div className="grid gap-6 md:grid-cols-5 md:items-center">
              <MediaCard className="transition-transform hover:-translate-y-1 md:col-span-3">
                <img src="/tertiary-diagnostics.png" alt="Diagnostics" className="block w-full h-auto object-contain rounded-lg" loading="lazy" />
              </MediaCard>
              <div className="md:col-span-2">
                <Badge className="bg-primary/15 text-primary" variant="secondary">
                  Tooling
                </Badge>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">Connect to real workflows</h3>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  Stay in control while the assistant uses context, diagnostics, and tools to unblock you and keep momentum.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="hooks-demo" className="pt-16 md:pt-24 bg-gradient-to-b from-background to-background/95">
        <Container className="max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="bg-primary/15 text-primary mb-4" variant="secondary">
              Agent Hooks
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl mb-4">Automate tasks with agent hooks</h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
              Delegate tasks to AI agents that trigger on events such as file save. Agents autonomously execute in the background based on your pre-defined prompts.
            </p>
          </div>
          
          <div className="mt-10">
            <div className="relative mx-auto aspect-video w-full max-w-6xl overflow-hidden rounded-3xl shadow-[0_20px_70px_-40px_hsl(var(--primary)/0.55)] lg:max-w-7xl">
              <img 
                src="/primary-hooks.png" 
                alt="Agent hooks demonstration" 
                className="absolute inset-0 h-full w-full object-contain bg-gradient-to-br from-primary/5 to-transparent" 
                loading="lazy" 
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section id="faq" className="pt-16 md:pt-24">
        <Container className="max-w-4xl">
          <div className="text-center">
            <Badge className="bg-primary/15 text-primary" variant="secondary">
              FAQ
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Frequently asked questions</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
              Everything you need to know about CodePath AI
            </p>
          </div>

          <Accordion type="single" collapsible className="mt-10 w-full">
            <AccordionItem value="item-1" className="border-border/60">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                What is CodePath AI?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                CodePath AI is an AI-powered development platform that helps you go from natural language prompts to working code through spec-driven development. It combines AI agents with structured requirements to deliver consistent, high-quality results.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-border/60">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                How does spec-driven development work?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Instead of jumping straight into code, CodePath AI first converts your natural language into structured requirements using EARS notation. It then creates an architecture plan, breaks work into discrete tasks, and implements each task with specialized AI agents.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-border/60">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                What programming languages are supported?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                CodePath AI supports all major programming languages including Python, JavaScript, TypeScript, Java, C#, Go, Rust, PHP, Ruby, and many more. It also handles frameworks like React, Vue, Express, Django, and databases like PostgreSQL and MongoDB.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-border/60">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                Is my code secure?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Yes, CodePath AI uses enterprise-grade security with encrypted connections, secure credential storage, and follows best practices for code security. All processing happens locally when possible, and sensitive data is never stored without encryption.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-border/60">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                Can I use CodePath AI with my existing projects?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Absolutely! CodePath AI can analyze your existing codebase, understand your architecture, and help you add new features or refactor existing code. It integrates with popular development tools and workflows.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Container>
      </Section>

      <Section id="footer" className="pt-16 md:pt-24">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Ready to build something amazing?</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
                Join thousands of developers who are already building faster with CodePath AI
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-base font-medium text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                onClick={handleStartBuilding}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-6 py-3 text-base font-medium"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </div>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-primary/60" />
                <span className="font-semibold">CodePath AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered development platform that turns your ideas into working code through spec-driven development.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 border-t border-border/60 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
              <p>© 2024 CodePath AI. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
