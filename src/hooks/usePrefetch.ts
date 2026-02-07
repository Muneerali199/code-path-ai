import { useCallback } from 'react';

/**
 * Maps route paths to their lazy-import functions.
 * When a user hovers a link, we fire the import() so the chunk
 * is already cached by the time they click.
 */
const routeImportMap: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/LandingPage'),
  '/auth': () => import('@/pages/Auth'),
  '/dashboard': () => import('@/pages/Dashboard'),
  '/editor': () => import('@/pages/EditorPage'),
  '/settings': () => import('@/pages/SettingsPage'),
  '/docs': () => import('@/pages/DocsPage'),
  '/profile': () => import('@/pages/ProfilePage'),
};

const prefetched = new Set<string>();

export function prefetchRoute(path: string) {
  // Normalise: strip query/hash, match first segment
  const base = '/' + (path.split('/').filter(Boolean)[0] || '');
  if (prefetched.has(base)) return;
  const importer = routeImportMap[base];
  if (importer) {
    prefetched.add(base);
    importer(); // fire & forget — browser caches the chunk
  }
}

/**
 * Returns onMouseEnter / onFocus handlers that prefetch a route's chunk.
 * Usage: <Link to="/dashboard" {...usePrefetch('/dashboard')}>
 */
export function usePrefetch(path: string) {
  const onMouseEnter = useCallback(() => prefetchRoute(path), [path]);
  return { onMouseEnter, onFocus: onMouseEnter };
}
