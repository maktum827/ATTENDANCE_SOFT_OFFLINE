import { useCallback, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { SnackbarProvider } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import MAIN from '../components/Root';
import { theme as themeConfig } from '../components/styles/theme';
import { ComponentProvider } from '../components/hooks/ComponentContext';
import useInsertAttendance from '../components/utils/insertAttendance';
import PrintProvider from '../components/prints/printProvider';

// Create a custom cache for RTL AND LTR
const ltrCache = createCache({
  key: 'mui',
});

export const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

export default function App() {
  useInsertAttendance();

  // Step 1: Get initial settings from localStorage or default values
  const { language, themeMode } =
    JSON.parse(localStorage.getItem('basics')) || {};
  const [mode, setMode] = useState(themeMode || 'light');

  // Toggle the mode and update state
  const handleToggleMode = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);

    // Update the basics object with new mode and save to localStorage
    const basics = JSON.parse(localStorage.getItem('basics')) || {};
    basics.themeMode = newMode;
    localStorage.setItem('basics', JSON.stringify(basics));
  }, [mode]);

  // Step 3: Apply the theme based on the current mode
  const appliedTheme = themeConfig(mode);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CacheProvider value={language === 'ar' ? cacheRtl : ltrCache}>
        <ThemeProvider theme={appliedTheme}>
          <CssBaseline enableColorScheme />
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <ComponentProvider>
              <PrintProvider>
                <Routes>
                  <Route
                    path="/"
                    element={<MAIN handleToggleMode={handleToggleMode} />}
                  />
                </Routes>
              </PrintProvider>
            </ComponentProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </CacheProvider>
    </Router>
  );
}
