import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

const lightTheme = {
  bg: '#F3F4F6',
  card: '#FFFFFF',
  primary: '#FF6B35',
  primaryGlow: 'rgba(255, 107, 53, 0.1)',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
  success: '#10B981',
  mapStyle: 'light',
};

const darkTheme = {
  bg: '#0A0A0F',
  card: '#1C1C24',
  primary: '#FF6B35',
  primaryGlow: 'rgba(255, 107, 53, 0.3)',
  text: '#FFFFFF',
  textMuted: '#A0A0B0',
  border: 'rgba(255,255,255,0.08)',
  danger: '#EF4444',
  success: '#10B981',
  mapStyle: 'dark',
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
