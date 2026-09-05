import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Icon from './components/Icon/Icon';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import SignupPage from './pages/SignupPage/SignupPage';
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
import DiscoverServiceDetailPage from './pages/DiscoverServiceDetailPage/DiscoverServiceDetailPage';
import OffersSection from './pages/AdminPage/OffersSection';
import SiteControlSection from './pages/AdminPage/SiteControlSection';
import EstimatorModule from './pages/AdminPage/EstimatorModule';
import EstimatorProjectSection from './pages/AdminPage/EstimatorProjectSection';
import EstimatorCivilWorksSection from './pages/AdminPage/EstimatorCivilWorksSection';
import EstimatorQuantitySection from './pages/AdminPage/EstimatorQuantitySection';
import EstimatorMaterialSection from './pages/AdminPage/EstimatorMaterialSection';
import EstimatorTemplatesSection from './pages/AdminPage/EstimatorTemplatesSection';
import SmallWorksEstimatorSection from './pages/AdminPage/SmallWorksEstimatorSection';
import FeatureGate from './components/FeatureGate/FeatureGate';
import RouteUnavailablePage from './pages/RouteUnavailablePage/RouteUnavailablePage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import ServiceGate from './components/ServiceGate/ServiceGate';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AnonRoute from './components/ProtectedRoute/AnonRoute';
import AdminRoute from './components/ProtectedRoute/AdminRoute';
import PaymentPage from './pages/PaymentPage/PaymentPage';
import { useSiteControl } from './hooks/useSiteControl';
import AccountDashboardHome from './pages/AccountPage/sections/AccountDashboardHome';
import ProfileSection from './pages/AccountPage/sections/ProfileSection';
import AddressesSection from './pages/AccountPage/sections/AddressesSection';
import AccountOffersSection from './pages/AccountPage/sections/AccountOffersSection';
import AccountNotificationsSection from './pages/AccountPage/sections/AccountNotificationsSection';
import PaymentPrefsSection from './pages/AccountPage/sections/PaymentPrefsSection';
import SecuritySection from './pages/AccountPage/sections/SecuritySection';
import SupportSection from './pages/AccountPage/sections/SupportSection';
import ControlCenterCustomersSection from './pages/AdminPage/ControlCenterCustomersSection';
import ControlCenterBookingsSection from './pages/AdminPage/ControlCenterBookingsSection';
import ControlCenterNotificationsSection from './pages/AdminPage/ControlCenterNotificationsSection';
import ControlCenterQuoteRequestsSection from './pages/AdminPage/ControlCenterQuoteRequestsSection';
import PushAutoSubscribe from './components/PushAutoSubscribe/PushAutoSubscribe';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isAdmin =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/control-center' ||
    pathname.startsWith('/control-center/');
  const { isMaintenance } = useSiteControl();

  if (isAuthenticated && user?.role === 'admin' && !isAdmin && pathname !== '/admin/login') {
    return <Navigate to="/admin" replace />;
  }
  return (
    <div className={`app${isAdmin ? ' app--admin' : ''}`}>
      <PushAutoSubscribe />
      <ScrollToTop />
      {!isAdmin && (
        <>
          <Header />
          <MobileHeader />
        </>
      )}
      <main>
        {isMaintenance ? (
          <RouteUnavailablePage isMaintenance />
        ) : (
          <Routes>
            <Route path="/projects" element={<FeatureGate feature="projects"><ProjectsPage /></FeatureGate>} />
            <Route path="/projects/compare-packages" element={<FeatureGate feature="packages"><ComparePackagesPage /></FeatureGate>} />
            <Route path="/projects/:id" element={<FeatureGate feature="projects"><ProjectDetailPage /></FeatureGate>} />
            <Route path="/about" element={<FeatureGate feature="about"><AboutPage /></FeatureGate>} />
            <Route path="/pricing-policies" element={<PricingPoliciesPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/disclaimers" element={<DisclaimersPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/quote" element={<FeatureGate feature="quote"><QuoteFormPage /></FeatureGate>} />
            <Route
              path="/pro-fix"
              element={
                <FeatureGate feature="proFix">
                  <ServiceGate service="proFix">
                    <ProFixPage />
                  </ServiceGate>
                </FeatureGate>
              }
            />
            <Route
              path="/pro-fix/:serviceId"
              element={
                <FeatureGate feature="proFix">
                  <ServiceGate service="proFix">
                    <ProFixServiceDetailPage />
                  </ServiceGate>
                </FeatureGate>
              }
            />
            <Route
              path="/pro-fix/:serviceId/estimate"
              element={
                <FeatureGate feature="proFix">
                  <ServiceGate service="proFix">
                    <ProFixEstimatePage />
                  </ServiceGate>
                </FeatureGate>
              }
            />
            <Route
              path="/pro-fix/:serviceId/estimate/book"
              element={
                <FeatureGate feature="proFix">
                  <ServiceGate service="proFix">
                    <ProFixBookVisitPage />
                  </ServiceGate>
                </FeatureGate>
              }
            />
            <Route
              path="/pro-fix/:serviceId/estimate/confirmed"
              element={
                <FeatureGate feature="proFix">
                  <ServiceGate service="proFix">
                    <ProFixConfirmationPage />
                  </ServiceGate>
                </FeatureGate>
              }
            />
            <Route
              path="/quick-fix"
              element={
                <FeatureGate feature="quickFix">
                  <ServiceGate service="quickFix">
                    <QuickFixPage />
                  </ServiceGate>
                </FeatureGate>
              }
            />
            <Route
              path="/quick-fix/:serviceId"
              element={
                <FeatureGate feature="quickFix">
                  <ServiceGate service="quickFix">
                    <QuickFixServiceDetailPage />
                  </ServiceGate>
                </FeatureGate>
              }
            />
            <Route
              path="/quick-fix/:serviceId/book"
              element={
                <FeatureGate feature="quickFix">
                  <ServiceGate service="quickFix">
                    <QuickFixBookPage />
                  </ServiceGate>
                </FeatureGate>
              }
            />
            <Route
              path="/quick-fix/:serviceId/confirmed"
              element={
                <FeatureGate feature="quickFix">
                  <ServiceGate service="quickFix">
                    <QuickFixConfirmationPage />
                  </ServiceGate>
                </FeatureGate>
              }
            />
            <Route path="/login" element={<AnonRoute><LoginPage /></AnonRoute>} />
            <Route path="/signup" element={<AnonRoute><SignupPage /></AnonRoute>} />
            <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/account" element={<FeatureGate feature="account"><ProtectedRoute><AccountPage /></ProtectedRoute></FeatureGate>}>
              <Route index element={<AccountDashboardHome />} />
              <Route path="profile" element={<ProfileSection />} />
              <Route path="addresses" element={<AddressesSection />} />
              <Route path="offers" element={<AccountOffersSection />} />
              <Route path="notifications" element={<AccountNotificationsSection />} />
              <Route path="payment-preferences" element={<PaymentPrefsSection />} />
              <Route path="security" element={<SecuritySection />} />
              <Route path="support" element={<SupportSection />} />
            </Route>
            <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/offers" element={<FeatureGate feature="offers"><OffersPage /></FeatureGate>} />
            <Route path="/service-detail" element={<DiscoverServiceDetailPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>}>
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
            <Route path="/control-center" element={<AdminRoute><AdminPage /></AdminRoute>}>
              <Route index element={<Navigate to="/admin" replace />} />
              <Route path="bookings" element={<ControlCenterBookingsSection />} />
              <Route path="customers" element={<ControlCenterCustomersSection />} />
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
                element={<ControlCenterNotificationsSection />}
              />
              <Route
                path="requests/quote"
                element={<ControlCenterQuoteRequestsSection />}
              />
              <Route path="settings" element={<ControlCenterSettingsSection />} />
              <Route path="profile" element={<ControlCenterProfileSection />} />
              <Route path="*" element={<AdminComingSoon title="Page not found" />} />
            </Route>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
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
      <AuthProvider>
        <LocationProvider>
          <AppLayout />
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
