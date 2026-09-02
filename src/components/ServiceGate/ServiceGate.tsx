import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLocation as useCustomerLocation } from '../../context/LocationContext';
import type { CustomerService } from '../../data/locationServiceConfig';
import {
  getLocationServiceConfig,
  isServiceAvailable,
  isLoginRequired,
} from '../../data/locationServiceConfig';
import { isCustomerSignedIn } from '../../data/customerAuth';
import ServiceUnavailablePage from '../../pages/ServiceUnavailablePage/ServiceUnavailablePage';

const SERVICE_LABELS: Record<CustomerService, string> = {
  quickFix: 'Quick Fix',
  proFix: 'Pro Fix',
};

interface ServiceGateProps {
  service: CustomerService;
  children: ReactNode;
}

/**
 * Route-level guard for customer service pages (Quick Fix / Pro Fix).
 *
 * Enforces, in order:
 *   1. Service availability for the currently selected location.
 *   2. If the service requires login and the customer is not signed in,
 *      redirect to the existing /login page, remembering where to return.
 *
 * Because every Quick Fix / Pro Fix route is wrapped with this guard, direct
 * URL access is protected the same way as navigation from the UI.
 */
export default function ServiceGate({ service, children }: ServiceGateProps) {
  const { pathname, search } = useLocation();
  const { selected } = useCustomerLocation();

  const config = getLocationServiceConfig();
  const available = isServiceAvailable(config, selected.id, service);

  if (!available) {
    return <ServiceUnavailablePage service={SERVICE_LABELS[service]} location={selected.label} />;
  }

  if (isLoginRequired(config, service) && !isCustomerSignedIn()) {
    const returnTo = encodeURIComponent(pathname + search);
    return <Navigate to={`/login?return=${returnTo}`} replace />;
  }

  return <>{children}</>;
}
