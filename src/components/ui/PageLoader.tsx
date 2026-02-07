import { memo } from 'react';

/**
 * Lightweight page-level loading spinner used as Suspense fallback.
 * Matches the app's dark theme with a violet accent spinner.
 */
const PageLoader = memo(function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090f]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning ring */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-500" />
        </div>
        {/* Subtle pulsing text */}
        <span className="animate-pulse text-sm text-white/40 tracking-wide">
          Loading…
        </span>
      </div>
    </div>
  );
});

export default PageLoader;
