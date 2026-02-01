import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { SettingsPage } from './pages/SettingsPage';
import { MCPPage } from './pages/MCPPage';
import { ModelsPage } from './pages/ModelsPage';
import { ThemeProvider } from './contexts/ThemeContext';

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
        return <SettingsPage />;
      case 'mcp':
        return <MCPPage />;
      case 'models':
        return <ModelsPage />;
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
