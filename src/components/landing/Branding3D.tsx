import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type Branding3DProps = {
  brand?: string;
  caption?: string;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function Branding3D({ brand = 'CodePath AI', caption = 'Designed for specs • Built for shipping', className }: Branding3DProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const root = rootRef.current;
    if (!section || !root) return;

    let rafId: number | null = null;

    const setVars = (vars: Record<string, string>) => {
      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    };

    const updateFromEvent = (clientX?: number, clientY?: number) => {
      const rect = root.getBoundingClientRect();
      const x = clientX ?? rect.left + rect.width / 2;
      const y = clientY ?? rect.top + rect.height / 2;

      const nx = clamp((x - rect.left) / rect.width, 0, 1);
      const ny = clamp((y - rect.top) / rect.height, 0, 1);

      const tiltY = (nx - 0.5) * 18;
      const tiltX = (0.5 - ny) * 14;

      setVars({
        '--mx': `${(nx * 100).toFixed(2)}%`,
        '--my': `${(ny * 100).toFixed(2)}%`,
        '--tilt-x': `${tiltX.toFixed(2)}deg`,
        '--tilt-y': `${tiltY.toFixed(2)}deg`,
      });
    };

    const updateScroll = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      const total = rect.height + vh;
      const traveled = vh - rect.top;
      const progress = clamp(traveled / total, 0, 1);

      const lift = (1 - progress) * 140;
      const rotateX = (1 - progress) * 14;
      const scale = 0.94 + progress * 0.06;
      const opacity = 0.1 + progress * 0.9;

      const viewportCenter = vh * 0.5;
      const sectionCenter = rect.top + rect.height * 0.5;
      const distance = clamp((sectionCenter - viewportCenter) / (vh * 0.6), -1, 1);
      const scrollRx = distance * -6;
      const depth = 14 - Math.abs(distance) * 8;

      setVars({
        '--reveal-y': `${lift.toFixed(2)}px`,
        '--reveal-rx': `${rotateX.toFixed(2)}deg`,
        '--reveal-scale': `${scale.toFixed(4)}`,
        '--reveal-opacity': `${opacity.toFixed(4)}`,
        '--scroll-x': `${scrollRx.toFixed(2)}deg`,
        '--depth': `${depth.toFixed(2)}px`,
      });
    };

    const onMove = (e: PointerEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateFromEvent(e.clientX, e.clientY);
      });
    };

    const onLeave = () => {
      setVars({
        '--mx': '50%',
        '--my': '50%',
        '--tilt-x': '0deg',
        '--tilt-y': '0deg',
      });
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateScroll();
      });
    };

    updateFromEvent();
    updateScroll();

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className={cn('relative w-screen overflow-hidden', className)}>
      <div className="relative h-[140vh]">
        <div className="sticky top-0 flex min-h-screen items-center justify-center">
          <div
            ref={rootRef}
            className="relative w-full"
            style={{
              ['--mx' as any]: '50%',
              ['--my' as any]: '50%',
              ['--tilt-x' as any]: '0deg',
              ['--tilt-y' as any]: '0deg',
              ['--scroll-x' as any]: '0deg',
              ['--depth' as any]: '10px',
              ['--reveal-y' as any]: '0px',
              ['--reveal-rx' as any]: '0deg',
              ['--reveal-scale' as any]: '1',
              ['--reveal-opacity' as any]: '1',
            }}
          >
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
              <div className="absolute -top-48 left-1/2 h-[560px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.emerald.500/18%),transparent_60%)] blur-2xl" />
              <div className="absolute -bottom-56 right-[-180px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.violet.500/18%),transparent_60%)] blur-2xl" />
              <div className="absolute -bottom-56 left-[-180px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.cyan.500/14%),transparent_60%)] blur-2xl" />
            </div>

            <div
              className="group relative mx-auto w-full px-6 md:px-10 lg:px-16"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1200px',
              }}
            >
              <div
                className="relative select-none"
                style={{
                  transform:
                    'translate3d(0, var(--reveal-y), 0) rotateX(calc(var(--reveal-rx) + var(--tilt-x) + var(--scroll-x))) rotateY(var(--tilt-y)) translateZ(var(--depth)) scale(var(--reveal-scale))',
                  opacity: 'var(--reveal-opacity)',
                  willChange: 'transform, opacity',
                }}
              >
                <div
                  className="absolute inset-0 rounded-[42px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at calc(var(--mx) + 18%) calc(var(--my) + 12%), rgba(34,197,94,0.25), transparent 55%), radial-gradient(circle at calc(var(--mx) - 16%) calc(var(--my) - 10%), rgba(139,92,246,0.22), transparent 55%)',
                    mixBlendMode: 'screen',
                  }}
                />

                <div className="rounded-[42px] px-6 py-16 md:px-12 md:py-24">
                  <div
                    className="text-center text-[56px] font-semibold leading-[0.95] tracking-tight text-foreground sm:text-[84px] md:text-[112px] lg:text-[150px]"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, hsl(var(--foreground)) 0%, hsl(var(--primary)) 35%, hsl(var(--foreground)) 70%)',
                      backgroundSize: '220% 100%',
                      backgroundPosition: 'center',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {brand}
                  </div>
                  <div className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted-foreground md:text-base">
                    {caption}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}