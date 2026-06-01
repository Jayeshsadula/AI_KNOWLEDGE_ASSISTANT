/**
 * ProfilePage — user account information and display name editing.
 */
import { useState } from "react";
import {
  Avatar, Box, Button, Card, CardContent, Chip,
  Divider, Stack, TextField, Typography,
} from "@mui/material";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon      from "@mui/icons-material/SaveOutlined";
import GoogleIcon            from "@mui/icons-material/Google";
import EmailOutlinedIcon     from "@mui/icons-material/EmailOutlined";
import VerifiedOutlinedIcon  from "@mui/icons-material/VerifiedOutlined";

import { useAuth }  from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { SectionHeader } from "@/components/ui";
import api from "@/services/api";
import { fmtDate } from "@/utils/format";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [editing,     setEditing]     = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saving,      setSaving]      = useState(false);

  async function saveProfile() {
    if (!displayName.trim()) { toast.error("Name cannot be empty."); return; }
    setSaving(true);
    try {
      await api.put("/api/settings", { display_name: displayName.trim() });
      toast.success("Profile updated.");
      setEditing(false);
    } catch {
      toast.error("Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  const provider = profile?.provider ?? (user?.providerData?.[0]?.providerId === "google.com" ? "google" : "password");

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 720, mx: "auto" }}>
      <SectionHeader title="Profile" sub="Manage your account information" />

      {/* ── Avatar + name card ──────────────────────────────────────────── */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: "28px !important" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ sm: "center" }}>
            <Avatar
              src={user?.photoURL}
              sx={{
                width: 80, height: 80,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                fontSize: 32, fontWeight: 700, flexShrink: 0,
              }}
            >
              {(user?.displayName || user?.email || "U")[0].toUpperCase()}
            </Avatar>

            <Box flex={1}>
              {editing ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    label="Display name"
                    sx={{ flex: 1 }}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && saveProfile()}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={saveProfile}
                    disabled={saving}
                    sx={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}
                  >
                    Save
                  </Button>
                  <Button size="small" onClick={() => setEditing(false)} sx={{ color: "text.secondary" }}>
                    Cancel
                  </Button>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Typography variant="h5" fontWeight={700} letterSpacing={-0.3}>
                    {user?.displayName || "No name set"}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => setEditing(true)}
                    sx={{ color: "text.secondary", fontSize: 12 }}
                  >
                    Edit
                  </Button>
                </Stack>
              )}

              <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap">
                {user?.emailVerified && (
                  <Chip
                    icon={<VerifiedOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                    label="Verified"
                    size="small"
                    sx={{ height: 22, fontSize: 11, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
                  />
                )}
                <Chip
                  icon={provider === "google" ? <GoogleIcon sx={{ fontSize: "13px !important" }} /> : <EmailOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                  label={provider === "google" ? "Google" : "Email"}
                  size="small"
                  sx={{ height: 22, fontSize: 11, background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}
                />
                <Chip
                  label={profile?.role ?? "user"}
                  size="small"
                  sx={{ height: 22, fontSize: 11, background: "rgba(245,158,11,0.1)", color: "primary.main", border: "1px solid rgba(245,158,11,0.2)", textTransform: "capitalize" }}
                />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Account details ─────────────────────────────────────────────── */}
      <Card>
        <CardContent sx={{ p: "24px !important" }}>
          <Typography variant="overline" color="text.secondary" letterSpacing={2} display="block" mb={2}>
            Account details
          </Typography>

          {[
            { label: "Email",      value: user?.email ?? "—" },
            { label: "User ID",    value: user?.uid ?? "—",    mono: true },
            { label: "Member since", value: fmtDate(profile?.created_at) || "—" },
            { label: "Last login", value: fmtDate(profile?.last_login) || "—" },
          ].map((row, i, arr) => (
            <Box key={row.label}>
              <Stack direction={{ xs: "column", sm: "row" }} py={1.75}
                justifyContent="space-between" alignItems={{ sm: "center" }} spacing={0.5}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {row.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: row.mono ? "monospace" : "inherit", fontSize: row.mono ? 12 : 14, color: "text.primary" }}
                >
                  {row.value}
                </Typography>
              </Stack>
              {i < arr.length - 1 && <Divider sx={{ borderColor: "divider" }} />}
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
