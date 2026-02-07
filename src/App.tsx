import React, { useState, lazy, Suspense } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import PageLoader from './components/ui/PageLoader';

// Lazy-load heavy sub-pages so they don't bloat the editor bundle
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const MCPPage = lazy(() => import('./pages/MCPPage').then(m => ({ default: m.MCPPage })));
const ModelsPage = lazy(() => import('./pages/ModelsPage').then(m => ({ default: m.ModelsPage })));

// Simple router for the editor application
type Page = 'editor' | 'settings' | 'mcp' | 'models';

// Create a simple navigation context
export const NavigationContext = React.createContext<{
  currentPage: Page;
  navigate: (page: Page) => void;
}>({
  currentPage: 'editor',
  navigate: () => {},
});

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('editor');

  const navigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'editor':
        return <MainLayout />;
      case 'settings':
        return <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>;
      case 'mcp':
        return <Suspense fallback={<PageLoader />}><MCPPage /></Suspense>;
      case 'models':
        return <Suspense fallback={<PageLoader />}><ModelsPage /></Suspense>;
      default:
        return <MainLayout />;
    }
  };

  return (
    <ThemeProvider>
      <NavigationContext.Provider value={{ currentPage, navigate }}>
        <div className="h-screen w-screen bg-neural-bg text-white overflow-hidden">
          {renderPage()}
        </div>
      </NavigationContext.Provider>
    </ThemeProvider>
  );
}

export default App;
