import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RecommendationProvider } from './context/RecommendationContext';
import NavBar                      from './components/NavBar';
import LandingPage                 from './components/LandingPage';
import PreferenceSetup             from './components/PreferenceSetup';
import RecommendationDisplay       from './components/RecommendationDisplay';
import ProductBrowse               from './components/ProductBrowse';
import ProductDetail               from './components/ProductDetail';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    // RecommendationProvider must wrap everything so context is available
    // to NavBar, all Route components, and any component they render.
    <RecommendationProvider>
      <div className='min-h-screen bg-slate-50'>
        <ScrollToTop />
        {/* NavBar renders on every page — it sits outside the Routes */}
        <NavBar />

        {/* Main content area — rendered below the NavBar */}
        <main className='max-w-6xl mx-auto px-4 py-6'>
          <Routes>
            {/* Landing / home page */}
            <Route path='/'                element={<LandingPage />} />

            {/* User preference onboarding */}
            <Route path='/setup'           element={<PreferenceSetup />} />

            {/* Main recommendation output page */}
            <Route path='/recommendations' element={<RecommendationDisplay />} />

            {/* Full product catalogue browser */}
            <Route path='/browse'          element={<ProductBrowse />} />

            {/* Individual product detail page — :id is a URL parameter */}
            <Route path='/product/:id'     element={<ProductDetail />} />

            {/* Redirect any unknown URL back to the landing page */}
            <Route path='*'               element={<Navigate to='/' replace />} />
          </Routes>
        </main>
      </div>
    </RecommendationProvider>
  );
}