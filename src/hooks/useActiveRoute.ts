import { useLocation } from 'react-router-dom';

/**
 * Returns true if the given navPath matches the current route.
 *
 * Matching rules:
 * - '/' → exact match only
 * - '/projects?category=renovation' → projects page with renovation category
 * - '/projects?category=interiors' → projects page with interiors category
 * - all others → exact match or prefix match on segment boundary
 *   (e.g. '/pro-fix' also matches '/pro-fix/:serviceId/...')
 */
export function useActiveRoute(navPath: string): boolean {
  const { pathname, search } = useLocation();

  if (navPath === '/') {
    return pathname === '/';
  }

  if (navPath === '/projects?category=renovation') {
    return pathname === '/projects' && search.includes('category=renovation');
  }

  if (navPath === '/projects?category=interiors') {
    return pathname === '/projects' && search.includes('category=interiors');
  }

  return pathname === navPath || pathname.startsWith(`${navPath}/`);
}
