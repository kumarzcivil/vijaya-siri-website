import type { ReactNode } from 'react';
import type { SiteFeature } from '../../data/siteControl';
import { useIsFeatureEnabled } from '../../hooks/useSiteControl';
import RouteUnavailablePage from '../../pages/RouteUnavailablePage/RouteUnavailablePage';

interface FeatureGateProps {
  feature: SiteFeature;
  children: ReactNode;
}

export default function FeatureGate({ feature, children }: FeatureGateProps) {
  const enabled = useIsFeatureEnabled(feature);

  if (!enabled) {
    return <RouteUnavailablePage feature={feature} />;
  }

  return <>{children}</>;
}
