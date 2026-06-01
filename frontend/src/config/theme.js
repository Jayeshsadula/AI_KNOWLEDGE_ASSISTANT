/**
 * MUI theme — shared across the entire authenticated app.
 * Design direction: refined dark terminal with warm amber accents.
 * Monospace headlines, clean sans body, precise spacing.
 */
import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary:    { main: "#f59e0b", light: "#fbbf24", dark: "#d97706", contrastText: "#0a0a0a" },
    secondary:  { main: "#6366f1" },
    error:      { main: "#ef4444" },
    warning:    { main: "#f59e0b" },
    success:    { main: "#10b981" },
    info:       { main: "#3b82f6" },
    background: {
      default: "#080810",
      paper:   "#0f0f1a",
    },
    text: {
      primary:   "#e8e8f0",
      secondary: "rgba(232,232,240,0.5)",
      disabled:  "rgba(232,232,240,0.25)",
    },
    divider: "rgba(232,232,240,0.07)",
  },
  typography: {
    fontFamily:        "'Geist', 'DM Sans', 'Helvetica Neue', sans-serif",
    fontFamilyMono:    "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
    h1: { fontFamily: "'Geist Mono', monospace", fontWeight: 700, letterSpacing: -2 },
    h2: { fontFamily: "'Geist Mono', monospace", fontWeight: 700, letterSpacing: -1 },
    h3: { fontFamily: "'Geist Mono', monospace", fontWeight: 600, letterSpacing: -0.5 },
    h4: { fontWeight: 700, letterSpacing: -0.5 },
    h5: { fontWeight: 600, letterSpacing: -0.3 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6, fontSize: "0.875rem" },
    caption: { fontSize: "0.75rem", letterSpacing: 0.5 },
    overline: { letterSpacing: 2, fontSize: "0.7rem" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(232,232,240,0.12); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(232,232,240,0.22); }
        ::selection { background: rgba(245,158,11,0.25); }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "0 0 20px rgba(245,158,11,0.25)" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: "rgba(232,232,240,0.03)",
          "& fieldset": { borderColor: "rgba(232,232,240,0.1)" },
          "&:hover fieldset": { borderColor: "rgba(245,158,11,0.4)" },
          "&.Mui-focused fieldset": { borderColor: "#f59e0b", borderWidth: 1 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#0f0f1a",
          border: "1px solid rgba(232,232,240,0.07)",
          backgroundImage: "none",
          boxShadow: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "#09091a",
          borderRight: "1px solid rgba(232,232,240,0.07)",
          backgroundImage: "none",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: 12, background: "#1a1a2e" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
});
