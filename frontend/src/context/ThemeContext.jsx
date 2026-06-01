import { createContext, useContext, useState, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { appTheme } from "@/config/theme";

const ThemeCtx = createContext({ mode: "dark", toggleMode: () => {} });

export function AppThemeProvider({ children }) {
  // Light mode is not yet designed — stub kept for future extension
  const [mode] = useState("dark");
  const toggleMode = () => {};          // wire up when light theme is ready

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeCtx.Provider value={value}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
