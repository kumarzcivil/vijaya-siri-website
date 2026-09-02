import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import OffersPage from './pages/OffersPage/OffersPage';
import AdminPage from './pages/AdminPage/AdminPage';
import AdminDashboard from './pages/AdminPage/AdminDashboard';
import AdminComingSoon from './pages/AdminPage/AdminComingSoon';
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
import RouteUnavailablePage from './pages/RouteUnavailablePage/RouteUnavailablePage';
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
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
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
            <Route path="/pro-fix" element={<ProFixPage />} />
            <Route path="/pro-fix/:serviceId" element={<ProFixServiceDetailPage />} />
            <Route path="/pro-fix/:serviceId/estimate" element={<ProFixEstimatePage />} />
            <Route path="/pro-fix/:serviceId/estimate/book" element={<ProFixBookVisitPage />} />
            <Route path="/pro-fix/:serviceId/estimate/confirmed" element={<ProFixConfirmationPage />} />
            <Route path="/quick-fix" element={<QuickFixPage />} />
            <Route path="/quick-fix/:serviceId" element={<QuickFixServiceDetailPage />} />
            <Route path="/quick-fix/:serviceId/book" element={<QuickFixBookPage />} />
            <Route path="/quick-fix/:serviceId/confirmed" element={<QuickFixConfirmationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/admin" element={<AdminPage />}>
              <Route index element={<AdminDashboard />} />
              <Route path="site-control" element={<SiteControlSection />} />
              <Route path="projects" element={<AdminProjectsSection />} />
              <Route path="packages" element={<AdminPackagesSection />} />
              <Route path="locations" element={<LocationContactSection />} />
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
