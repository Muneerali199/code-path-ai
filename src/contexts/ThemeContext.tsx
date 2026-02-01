import React, { createContext, useContext, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface ThemeContextType {
  theme: 'neural-dark' | 'neural-light' | 'high-contrast';
  accentColor: 'sage' | 'forge' | 'sync' | 'custom';
  customAccent?: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSettingsStore((state) => state.theme);

  console.log('ThemeProvider render - current theme:', theme);

  // Apply theme classes to the document element
  useEffect(() => {
    console.log('ThemeContext useEffect triggered with theme:', theme);
    const root = document.documentElement;

    // Set CSS variables based on the selected theme
    switch (theme.mode) {
      case 'neural-dark':
        // Neural dark theme (already defined in index.css as default)
        root.style.setProperty('--background', '160 20% 4%');
        root.style.setProperty('--background-panel', '160 15% 7%');
        root.style.setProperty('--background-input', '160 12% 10%');
        root.style.setProperty('--foreground', '0 0% 100%');
        root.style.setProperty('--foreground-secondary', '215 20% 65%');
        root.style.setProperty('--foreground-muted', '215 16% 47%');
        root.style.setProperty('--border-subtle', '215 28% 17%');
        root.style.setProperty('--border', '215 28% 17%');
        break;
      case 'neural-light':
        // Light theme
        root.style.setProperty('--background', '210 20% 98%');
        root.style.setProperty('--background-panel', '210 15% 95%');
        root.style.setProperty('--background-input', '210 12% 90%');
        root.style.setProperty('--foreground', '220 10% 10%');
        root.style.setProperty('--foreground-secondary', '215 10% 30%');
        root.style.setProperty('--foreground-muted', '215 10% 45%');
        root.style.setProperty('--border-subtle', '215 20% 85%');
        root.style.setProperty('--border', '215 20% 85%');
        root.style.setProperty('--muted-foreground', '215 10% 45%');
        root.style.setProperty('--primary-foreground', '0 0% 100%');
        break;
      case 'high-contrast':
        // High contrast theme
        root.style.setProperty('--background', '0 0% 0%');
        root.style.setProperty('--background-panel', '0 0% 5%');
        root.style.setProperty('--background-input', '0 0% 10%');
        root.style.setProperty('--foreground', '0 0% 100%');
        root.style.setProperty('--foreground-secondary', '0 0% 90%');
        root.style.setProperty('--foreground-muted', '0 0% 70%');
        root.style.setProperty('--border-subtle', '0 0% 30%');
        root.style.setProperty('--border', '0 0% 50%');
        break;
    }

    // Set accent color CSS variables based on selected accent
    // Keep all accent colors available, but change which one is "primary"
    const accentColors = {
      sage: '195 100% 50%',  // Cyan
      forge: '155 100% 50%', // Green
      sync: '270 70% 60%',   // Purple
    };

    // Always set all accent colors
    root.style.setProperty('--accent-sage', accentColors.sage);
    root.style.setProperty('--accent-forge', accentColors.forge);
    root.style.setProperty('--accent-sync', accentColors.sync);

    // Update primary color based on selected accent
    let primaryColor: string;
    switch (theme.accentColor) {
      case 'sage':
        primaryColor = accentColors.sage; // Cyan becomes primary
        break;
      case 'forge':
        primaryColor = accentColors.forge; // Green becomes primary
        break;
      case 'sync':
        primaryColor = accentColors.sync; // Purple becomes primary
        break;
      case 'custom':
        primaryColor = theme.customAccent || accentColors.forge;
        break;
      default:
        primaryColor = accentColors.forge;
    }

    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--border-active', primaryColor);
    root.style.setProperty('--ring', primaryColor);
    root.style.setProperty('--accent', primaryColor);

    console.log('Accent colors applied:', {
      sage: accentColors.sage,
      forge: accentColors.forge,
      sync: accentColors.sync,
      selectedAccent: theme.accentColor,
      primaryColor: primaryColor
    });

    // Log for debugging
    console.log('Theme applied:', {
      mode: theme.mode,
      accentColor: theme.accentColor,
      primaryColor,
      customAccent: theme.customAccent
    });
  }, [theme.mode, theme.accentColor, theme.customAccent]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};