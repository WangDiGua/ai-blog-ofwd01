import React, { Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/store';
import { Navbar, Footer, MiniPlayer } from './components/layout';
import { Spinner } from './components/ui';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Page Imports
import { Home } from './pages/home';
import { ArticleDetail } from './pages/article-detail';
import { Profile } from './pages/profile';
import { Community } from './pages/community';
import { MusicPage } from './pages/music';
import { Tools } from './pages/tools';
import { About } from './pages/about';
import { Contact } from './pages/contact';
import { AIAssistant } from './pages/ai';
import { StartPage, MessageBoard, Album } from './pages/views';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout wrapper to conditionally hide Navbar/Footer for fullscreen pages like StartPage
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const isFullScreenPage = location.pathname === '/start' || location.pathname === '/message-board';

    return (
        <>
            {!isFullScreenPage && <Navbar />}
            
            <main className={`flex-grow ${!isFullScreenPage ? 'pt-20' : ''}`}>
                {children}
            </main>

            <MiniPlayer />
            {!isFullScreenPage && <Footer />}
        </>
    );
};

const App = () => {
  // 禁止整个 App 的右键菜单 (基础代码层面保护)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-apple-bg text-apple-text dark:bg-apple-dark-bg dark:text-apple-dark-text font-sans selection:bg-apple-blue selection:text-white transition-colors duration-300">
          <ScrollToTop />
          
          <LayoutWrapper>
            <Suspense fallback={
              <div className="flex items-center justify-center h-[60vh]">
                <Spinner />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/start" element={<StartPage />} />
                <Route path="/message-board" element={<MessageBoard />} />
                <Route path="/album" element={<Album />} />
                <Route path="/article/:id" element={<ArticleDetail />} />
                <Route path="/community" element={<Community />} />
                <Route path="/music" element={<MusicPage />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/about" element={<About />} />
                
                {/* 受保护路由 */}
                <Route path="/contact" element={
                    <ProtectedRoute>
                        <Contact />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/ai" element={
                    <ProtectedRoute>
                        <AIAssistant />
                    </ProtectedRoute>
                } />
                
                {/* 允许未登录访问他人主页，但在组件内部做权限控制 */}
                <Route path="/user/:id" element={<Profile />} />
                
                {/* Fallback */}
                <Route path="*" element={<div className="text-center py-20 text-gray-400">404 - Page Not Found</div>} />
              </Routes>
            </Suspense>
          </LayoutWrapper>

        </div>
      </Router>
    </AppProvider>
  );
};

export default App;