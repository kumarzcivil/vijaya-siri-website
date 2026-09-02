import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Icon from './components/Icon/Icon';
import { LocationProvider } from './context/LocationContext';
import Header from './components/Header/Header';
import MobileHeader from './components/MobileHeader/MobileHeader';
import MobileNavigation from './components/MobileNavigation/MobileNavigation';
import Footer from './components/Footer/Footer';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage/ProjectDetailPage';
import ComparePackagesPage from './pages/ComparePackagesPage/ComparePackagesPage';
import AboutPage from './pages/AboutPage/AboutPage';
import PricingPoliciesPage from './pages/PricingPoliciesPage/PricingPoliciesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage/PrivacyPolicyPage';
import DisclaimersPage from './pages/DisclaimersPage/DisclaimersPage';
import TermsPage from './pages/TermsPage/TermsPage';
import QuoteFormPage from './pages/QuoteFormPage/QuoteFormPage';
import HomePage from './pages/HomePage/HomePage';
import ProFixPage from './pages/ProFixPage/ProFixPage';
import ProFixServiceDetailPage from './pages/ProFixServiceDetailPage/ProFixServiceDetailPage';
import ProFixEstimatePage from './pages/ProFixEstimatePage/ProFixEstimatePage';
import ProFixBookVisitPage from './pages/ProFixBookVisitPage/ProFixBookVisitPage';
import ProFixConfirmationPage from './pages/ProFixConfirmationPage/ProFixConfirmationPage';
import QuickFixPage from './pages/QuickFixPage/QuickFixPage';
import QuickFixServiceDetailPage from './pages/QuickFixServiceDetailPage/QuickFixServiceDetailPage';
import QuickFixBookPage from './pages/QuickFixBookPage/QuickFixBookPage';
import QuickFixConfirmationPage from './pages/QuickFixConfirmationPage/QuickFixConfirmationPage';
import AccountPage from './pages/AccountPage/AccountPage';
import LoginPage from './pages/LoginPage/LoginPage';
import BookingsPage from './pages/BookingsPage/BookingsPage';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import OffersPage from './pages/OffersPage/OffersPage';
import AdminPage from './pages/AdminPage/AdminPage';
import AdminLoginPage from './pages/AdminPage/AdminLoginPage';
import AdminDashboard from './pages/AdminPage/AdminDashboard';
import AdminComingSoon from './pages/AdminPage/AdminComingSoon';
import ControlCenterEmptyState from './pages/AdminPage/ControlCenterEmptyState';
import ControlCenterSettingsSection from './pages/AdminPage/ControlCenterSettingsSection';
import ControlCenterProfileSection from './pages/AdminPage/ControlCenterProfileSection';
import AdminProjectsSection from './pages/AdminPage/AdminProjectsSection';
import AdminPackagesSection from './pages/AdminPage/AdminPackagesSection';
import LocationContactSection from './pages/AdminPage/LocationContactSection';
import ProFixServicesSection from './pages/AdminPage/ProFixServicesSection';
import ProFixCategoriesSection from './pages/AdminPage/ProFixCategoriesSection';
import ProFixBannersSection from './pages/AdminPage/ProFixBannersSection';
import QuickFixCategoriesSection from './pages/AdminPage/QuickFixCategoriesSection';
import QuickFixServicesSection from './pages/AdminPage/QuickFixServicesSection';
import QuickFixBannersSection from './pages/AdminPage/QuickFixBannersSection';
import MarketingStatisticsSection from './pages/AdminPage/MarketingStatisticsSection';
import DiscoverServicesSection from './pages/AdminPage/DiscoverServicesSection';
import OffersSection from './pages/AdminPage/OffersSection';
import SiteControlSection from './pages/AdminPage/SiteControlSection';
import EstimatorModule from './pages/AdminPage/EstimatorModule';
import EstimatorProjectSection from './pages/AdminPage/EstimatorProjectSection';
import EstimatorCivilWorksSection from './pages/AdminPage/EstimatorCivilWorksSection';
import EstimatorQuantitySection from './pages/AdminPage/EstimatorQuantitySection';
import EstimatorMaterialSection from './pages/AdminPage/EstimatorMaterialSection';
import EstimatorTemplatesSection from './pages/AdminPage/EstimatorTemplatesSection';
import SmallWorksEstimatorSection from './pages/AdminPage/SmallWorksEstimatorSection';
import RouteUnavailablePage from './pages/RouteUnavailablePage/RouteUnavailablePage';
import ServiceGate from './components/ServiceGate/ServiceGate';
import { useSiteControl } from './hooks/useSiteControl';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isAdmin =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/control-center' ||
    pathname.startsWith('/control-center/');
  const { available, gated } = useSiteControl();
  return (
    <div className={`app${isAdmin ? ' app--admin' : ''}`}>
      <ScrollToTop />
      {!isAdmin && (
        <>
          <Header />
          <MobileHeader />
        </>
      )}
      <main>
        {gated && !available ? (
          <RouteUnavailablePage />
        ) : (
          <Routes>
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/compare-packages" element={<ComparePackagesPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing-policies" element={<PricingPoliciesPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/disclaimers" element={<DisclaimersPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/quote" element={<QuoteFormPage />} />
            <Route
              path="/pro-fix"
              element={
                <ServiceGate service="proFix">
                  <ProFixPage />
                </ServiceGate>
              }
            />
            <Route
              path="/pro-fix/:serviceId"
              element={
                <ServiceGate service="proFix">
                  <ProFixServiceDetailPage />
                </ServiceGate>
              }
            />
            <Route
              path="/pro-fix/:serviceId/estimate"
              element={
                <ServiceGate service="proFix">
                  <ProFixEstimatePage />
                </ServiceGate>
              }
            />
            <Route
              path="/pro-fix/:serviceId/estimate/book"
              element={
                <ServiceGate service="proFix">
                  <ProFixBookVisitPage />
                </ServiceGate>
              }
            />
            <Route
              path="/pro-fix/:serviceId/estimate/confirmed"
              element={
                <ServiceGate service="proFix">
                  <ProFixConfirmationPage />
                </ServiceGate>
              }
            />
            <Route
              path="/quick-fix"
              element={
                <ServiceGate service="quickFix">
                  <QuickFixPage />
                </ServiceGate>
              }
            />
            <Route
              path="/quick-fix/:serviceId"
              element={
                <ServiceGate service="quickFix">
                  <QuickFixServiceDetailPage />
                </ServiceGate>
              }
            />
            <Route
              path="/quick-fix/:serviceId/book"
              element={
                <ServiceGate service="quickFix">
                  <QuickFixBookPage />
                </ServiceGate>
              }
            />
            <Route
              path="/quick-fix/:serviceId/confirmed"
              element={
                <ServiceGate service="quickFix">
                  <QuickFixConfirmationPage />
                </ServiceGate>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminPage />}>
              <Route index element={<AdminDashboard />} />
              <Route path="site-control" element={<SiteControlSection />} />
              <Route path="projects" element={<AdminProjectsSection />} />
              <Route path="packages" element={<AdminPackagesSection />} />
              <Route path="locations" element={<LocationContactSection />} />
              <Route path="estimator" element={<EstimatorModule />} />
              <Route path="estimator/project" element={<EstimatorProjectSection />} />
              <Route path="estimator/civil-works" element={<EstimatorCivilWorksSection />} />
              <Route path="estimator/quantity" element={<EstimatorQuantitySection />} />
              <Route path="estimator/material" element={<EstimatorMaterialSection />} />
              <Route path="estimator/templates" element={<EstimatorTemplatesSection />} />
              <Route path="estimator/templates/new" element={<SmallWorksEstimatorSection />} />
              <Route
                path="estimator/templates/:templateId"
                element={<SmallWorksEstimatorSection />}
              />
              <Route path="pro-fix/services" element={<ProFixServicesSection />} />
              <Route path="pro-fix/categories" element={<ProFixCategoriesSection />} />
              <Route path="pro-fix/banners" element={<ProFixBannersSection />} />
              <Route path="quick-fix/services" element={<QuickFixServicesSection />} />
              <Route path="quick-fix/categories" element={<QuickFixCategoriesSection />} />
              <Route path="quick-fix/banners" element={<QuickFixBannersSection />} />
              <Route path="marketing/statistics" element={<MarketingStatisticsSection />} />
              <Route path="marketing/discover-services" element={<DiscoverServicesSection />} />
              <Route path="marketing/offers" element={<OffersSection />} />
              <Route path="*" element={<AdminComingSoon title="Page not found" />} />
            </Route>
            <Route path="/control-center" element={<AdminPage />}>
              <Route index element={<Navigate to="/admin" replace />} />
              <Route
                path="bookings"
                element={
                  <ControlCenterEmptyState
                    icon={<Icon name="clipboard" size={30} />}
                    heading="Bookings"
                    description="View and manage customer service bookings."
                    emptyTitle="No bookings yet"
                    emptyText="Customer bookings will appear here once booking data is connected."
                  />
                }
              />
              <Route
                path="customers"
                element={
                  <ControlCenterEmptyState
                    icon={<Icon name="users" size={30} />}
                    heading="Customers"
                    description="View and manage customer information."
                    emptyTitle="No customer records yet"
                    emptyText="Customer information will appear here once the customer system is connected."
                  />
                }
              />
              <Route
                path="leads"
                element={
                  <ControlCenterEmptyState
                    icon={<Icon name="mail" size={30} />}
                    heading="Leads & Enquiries"
                    description="Manage customer enquiries and potential service leads."
                    emptyTitle="No leads yet"
                    emptyText="Customer enquiries will appear here once lead capture is connected."
                  />
                }
              />
              <Route
                path="notifications"
                element={
                  <ControlCenterEmptyState
                    icon={<Icon name="bell" size={30} />}
                    heading="Notifications"
                    description="Manage operational notifications and customer updates."
                    emptyTitle="No notifications yet"
                    emptyText="Notifications will appear here once the notification system is connected."
                  />
                }
              />
              <Route
                path="requests/quote"
                element={
                  <ControlCenterEmptyState
                    icon={<Icon name="receipt" size={30} />}
                    heading="Quote Requests"
                    description="View and manage customer quote requests."
                    emptyTitle="No quote requests yet"
                    emptyText="Quote requests will appear here once quote submission is connected."
                  />
                }
              />
              <Route
                path="requests/pro-fix"
                element={
                  <ControlCenterEmptyState
                    icon={<Icon name="wrench" size={30} />}
                    heading="Pro Fix Requests"
                    description="View and manage Pro Fix service requests."
                    emptyTitle="No Pro Fix requests yet"
                    emptyText="Service requests will appear here once Pro Fix bookings are connected."
                  />
                }
              />
              <Route
                path="requests/quick-fix"
                element={
                  <ControlCenterEmptyState
                    icon={<Icon name="clock" size={30} />}
                    heading="Quick Fix Requests"
                    description="View and manage Quick Fix service requests."
                    emptyTitle="No Quick Fix requests yet"
                    emptyText="Service requests will appear here once Quick Fix bookings are connected."
                  />
                }
              />
              <Route path="settings" element={<ControlCenterSettingsSection />} />
              <Route path="profile" element={<ControlCenterProfileSection />} />
              <Route path="*" element={<AdminComingSoon title="Page not found" />} />
            </Route>
            <Route path="/" element={<HomePage />} />
          </Routes>
        )}
      </main>
      {!isAdmin && (
        <>
          <Footer />
          <MobileNavigation />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <AppLayout />
      </LocationProvider>
    </BrowserRouter>
  );
}

export default App;
