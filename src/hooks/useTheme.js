import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('cuboid-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('cuboid-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const isDark = theme === 'dark';

  return { theme, isDark, toggleTheme };
}
