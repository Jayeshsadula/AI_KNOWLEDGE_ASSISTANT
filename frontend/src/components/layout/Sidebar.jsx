/**
 * Sidebar — persistent left nav for the authenticated app shell.
 * Collapses to icon-only on mobile via the `mobileOpen` prop.
 */
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Avatar, Box, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Stack, Tooltip, Typography,
} from "@mui/material";
import DashboardOutlinedIcon    from "@mui/icons-material/DashboardOutlined";
import ChatBubbleOutlineIcon    from "@mui/icons-material/ChatBubbleOutline";
import FolderOpenOutlinedIcon   from "@mui/icons-material/FolderOpenOutlined";
import PersonOutlineIcon        from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon     from "@mui/icons-material/SettingsOutlined";
import AdminPanelSettingsIcon   from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon               from "@mui/icons-material/Logout";
import ChevronLeftIcon          from "@mui/icons-material/ChevronLeft";
import { useAuth }              from "@/hooks/useAuth";
import { useToast }             from "@/context/ToastContext";

const DRAWER_W     = 228;
const DRAWER_W_COL = 64;    // collapsed icon-only width on desktop

const NAV = [
  { label: "Dashboard",  icon: <DashboardOutlinedIcon />,  to: "/dashboard" },
  { label: "Chat",       icon: <ChatBubbleOutlineIcon />,  to: "/chat" },
  { label: "Documents",  icon: <FolderOpenOutlinedIcon />, to: "/documents" },
  { label: "Profile",    icon: <PersonOutlineIcon />,      to: "/profile" },
  { label: "Settings",   icon: <SettingsOutlinedIcon />,   to: "/settings" },
];
const ADMIN = [
  { label: "Admin",      icon: <AdminPanelSettingsIcon />, to: "/admin" },
];

function NavItem({ item, collapsed }) {
  return (
    <Tooltip title={collapsed ? item.label : ""} placement="right" arrow>
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          component={NavLink}
          to={item.to}
          end={item.to === "/"}
          sx={{
            borderRadius: 2,
            minHeight: 44,
            px: collapsed ? 1.5 : 1.75,
            justifyContent: collapsed ? "center" : "flex-start",
            color: "text.secondary",
            transition: "all .15s",
            "&.active": {
              color: "primary.main",
              background: "rgba(245,158,11,0.1)",
              "& .MuiListItemIcon-root": { color: "primary.main" },
            },
            "&:hover": {
              background: "rgba(232,232,240,0.05)",
              color: "text.primary",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 0 : 36,
              color: "inherit",
              fontSize: 20,
              mr: collapsed ? 0 : 0,
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          )}
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
}

function SidebarContent({ collapsed, onCollapse, onClose }) {
  const { user, profile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = profile?.role === "admin";

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: collapsed ? DRAWER_W_COL : DRAWER_W,
        transition: "width .2s ease",
        overflow: "hidden",
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={collapsed ? "center" : "space-between"}
        sx={{ px: collapsed ? 1.5 : 2.5, py: 2.5, flexShrink: 0 }}
      >
        {!collapsed && (
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 28, height: 28, borderRadius: 1,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0,
              }}
            >
              ✦
            </Box>
            <Typography
              variant="body1"
              fontWeight={700}
              letterSpacing={-0.3}
              sx={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13 }}
            >
              AI Knowledge
            </Typography>
          </Stack>
        )}
        {collapsed && (
          <Box
            sx={{
              width: 28, height: 28, borderRadius: 1,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
            }}
          >
            ✦
          </Box>
        )}
        {!collapsed && (
          <IconButton size="small" onClick={onCollapse} sx={{ color: "text.disabled" }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 1 }}>
        <List dense disablePadding>
          {NAV.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
        </List>

        {isAdmin && (
          <>
            <Divider sx={{ my: 1.5, borderColor: "divider" }} />
            <List dense disablePadding>
              {ADMIN.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
            </List>
          </>
        )}
      </Box>

      {/* ── User footer ────────────────────────────────────────────────── */}
      <Divider sx={{ borderColor: "divider" }} />
      <Stack
        direction="row"
        alignItems="center"
        spacing={collapsed ? 0 : 1.5}
        sx={{
          px: collapsed ? 1.5 : 2,
          py: 2,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Avatar
          src={user?.photoURL}
          sx={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}
        >
          {(user?.displayName || user?.email || "U")[0].toUpperCase()}
        </Avatar>
        {!collapsed && (
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.displayName || "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {user?.email}
            </Typography>
          </Box>
        )}
        {!collapsed && (
          <Tooltip title="Sign out" arrow>
            <IconButton size="small" onClick={handleLogout} sx={{ color: "text.disabled", flexShrink: 0 }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── Mobile drawer (temporary) ─────────────────────────────────── */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_W, border: "none" },
        }}
      >
        <SidebarContent collapsed={false} onCollapse={() => {}} onClose={onMobileClose} />
      </Drawer>

      {/* ── Desktop drawer (permanent, collapsible) ───────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? DRAWER_W_COL : DRAWER_W,
          flexShrink: 0,
          transition: "width .2s ease",
          "& .MuiDrawer-paper": {
            width: collapsed ? DRAWER_W_COL : DRAWER_W,
            overflowX: "hidden",
            transition: "width .2s ease",
          },
        }}
        open
      >
        <SidebarContent
          collapsed={collapsed}
          onCollapse={() => setCollapsed((c) => !c)}
          onClose={() => {}}
        />
      </Drawer>
    </>
  );
}
