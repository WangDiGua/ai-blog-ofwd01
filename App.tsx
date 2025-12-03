import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/store';
import { Navbar, Footer, MiniPlayer } from './components/layout';
import { Home, Community, MusicPage, Tools, About } from './pages/views';
import { Spinner } from './components/ui';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-apple-bg text-apple-text font-sans selection:bg-apple-blue selection:text-white">
          <ScrollToTop />
          <Navbar />
          
          <main className="flex-grow pt-4">
            <Suspense fallback={
              <div className="flex items-center justify-center h-[60vh]">
                <Spinner />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/community" element={<Community />} />
                <Route path="/music" element={<MusicPage />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/about" element={<About />} />
                {/* Fallback */}
                <Route path="*" element={<div className="text-center py-20 text-gray-400">404 - Page Not Found</div>} />
              </Routes>
            </Suspense>
          </main>

          <MiniPlayer />
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
