import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLocation as useCustomerLocation } from '../../context/LocationContext';
import type { CustomerService } from '../../data/locationServiceConfig';
import {
  getLocationServiceConfig,
  isServiceAvailable,
  isLoginRequired,
} from '../../data/locationServiceConfig';
import { useAuth } from '../../context/AuthContext';
import ServiceUnavailablePage from '../../pages/ServiceUnavailablePage/ServiceUnavailablePage';

const SERVICE_LABELS: Record<CustomerService, string> = {
  quickFix: 'Quick Fix',
  proFix: 'Pro Fix',
};

interface ServiceGateProps {
  service: CustomerService;
  children: ReactNode;
}

export default function ServiceGate({ service, children }: ServiceGateProps) {
  const { pathname, search } = useLocation();
  const { selected } = useCustomerLocation();
  const { isAuthenticated } = useAuth();

  const config = getLocationServiceConfig();
  const available = isServiceAvailable(config, selected.id, service);

  if (!available) {
    return <ServiceUnavailablePage service={SERVICE_LABELS[service]} location={selected.label} />;
  }

  if (isLoginRequired(config, service) && !isAuthenticated) {
    const returnTo = encodeURIComponent(pathname + search);
    return <Navigate to={`/login?return=${returnTo}`} replace />;
  }

  return <>{children}</>;
}
