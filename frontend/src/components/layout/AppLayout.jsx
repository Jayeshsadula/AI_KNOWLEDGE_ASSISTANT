import { useState } from "react";
import { Box, AppBar, Toolbar, Typography, Stack, Chip, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#080810" }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{
          background: "rgba(8,8,16,0.8)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(232,232,240,0.07)",
        }}>
          <Toolbar sx={{ minHeight: "56px !important", px: { xs: 2, md: 3 } }}>
            <IconButton edge="start" onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { md: "none" }, color: "text.secondary" }}>
              <MenuIcon />
            </IconButton>
            <Box flex={1} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip label="Llama 3" size="small" sx={{
                fontSize: 11, height: 22,
                background: "rgba(245,158,11,0.12)", color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.2)", fontFamily: "monospace",
              }} />
              <Chip label="? Local" size="small" sx={{
                fontSize: 11, height: 22,
                background: "rgba(16,185,129,0.1)", color: "#10b981",
                border: "1px solid rgba(16,185,129,0.2)",
              }} />
            </Stack>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
