import { cn } from '@/lib/utils';

interface MediaCardProps {
  children: React.ReactNode;
  className?: string;
}

export function MediaCard({ children, className }: MediaCardProps) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-card border border-border/50 shadow-lg', className)}>
      {children}
    </div>
  );
}