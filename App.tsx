import React, { Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/store';
import { Navbar, Footer, MiniPlayer } from './components/layout';
import { Spinner, CustomCursor, ThemeTransitionOverlay } from './components/ui';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// --- Lazy Load Pages ---
// 使用 React.lazy 动态导入组件，实现代码分割，减小首屏体积
const Home = React.lazy(() => import('./pages/home').then(module => ({ default: module.Home })));
const ArticleDetail = React.lazy(() => import('./pages/article-detail').then(module => ({ default: module.ArticleDetail })));
const Profile = React.lazy(() => import('./pages/profile').then(module => ({ default: module.Profile })));
const Community = React.lazy(() => import('./pages/community').then(module => ({ default: module.Community })));
const MusicPage = React.lazy(() => import('./pages/music').then(module => ({ default: module.MusicPage })));
const Tools = React.lazy(() => import('./pages/tools').then(module => ({ default: module.Tools })));
const About = React.lazy(() => import('./pages/about').then(module => ({ default: module.About })));
const Contact = React.lazy(() => import('./pages/contact').then(module => ({ default: module.Contact })));
const AIAssistant = React.lazy(() => import('./pages/ai').then(module => ({ default: module.AIAssistant })));

// 批量导入 views 中的组件 (也需要 Lazy Load)
const StartPage = React.lazy(() => import('./pages/views').then(module => ({ default: module.StartPage })));
const MessageBoard = React.lazy(() => import('./pages/views').then(module => ({ default: module.MessageBoard })));
const Album = React.lazy(() => import('./pages/views').then(module => ({ default: module.Album })));
const Timeline = React.lazy(() => import('./pages/views').then(module => ({ default: module.Timeline })));
const FriendLinks = React.lazy(() => import('./pages/views').then(module => ({ default: module.FriendLinks })));

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Wrapper to animate page transitions
const PageTransitionWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <div 
      key={location.pathname} // Key change triggers the animation
      className="animate-page-enter w-full"
    >
      {children}
    </div>
  );
};

// Layout wrapper to conditionally hide Navbar/Footer for fullscreen pages like StartPage
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const isFullScreenPage = location.pathname === '/start' || location.pathname === '/message-board';

    return (
        <>
            {!isFullScreenPage && <Navbar />}
            
            <main className={`flex-grow min-h-screen ${!isFullScreenPage ? 'pt-20' : ''}`}>
               {/* Apply page transition animation here */}
               <PageTransitionWrapper>
                  {children}
               </PageTransitionWrapper>
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
      <ThemeTransitionOverlay />
      <Router>
        <div className="min-h-screen flex flex-col bg-apple-bg text-apple-text dark:bg-apple-dark-bg dark:text-apple-dark-text font-sans selection:bg-apple-blue selection:text-white transition-colors duration-500 ease-ios">
          <ScrollToTop />
          <CustomCursor />
          
          <LayoutWrapper>
            <Suspense fallback={
              <div className="flex items-center justify-center h-[60vh] w-full">
                <Spinner />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/start" element={<StartPage />} />
                <Route path="/message-board" element={<MessageBoard />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/friend-links" element={<FriendLinks />} />
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