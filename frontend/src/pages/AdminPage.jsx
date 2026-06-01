/**
 * AdminPage — user monitoring and document management.
 * Protected by require_admin dependency on the backend.
 */
import { useEffect, useState } from "react";
import {
  Avatar, Box, Card, CardContent, Chip, CircularProgress,
  Divider, Grid, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, Typography,
} from "@mui/material";
import PeopleOutlineIcon        from "@mui/icons-material/PeopleOutline";
import FolderOpenOutlinedIcon   from "@mui/icons-material/FolderOpenOutlined";
import ChatBubbleOutlineIcon    from "@mui/icons-material/ChatBubbleOutline";
import { SectionHeader, StatCard } from "@/components/ui";
import { fmtDate, fmtRelative } from "@/utils/format";
import api from "@/services/api";

// Dummy data for UI development
const DUMMY_USERS = [
  { uid: "u1", email: "alice@example.com", display_name: "Alice",  role: "admin", created_at: new Date(Date.now() - 8.64e7).toISOString() },
  { uid: "u2", email: "bob@example.com",   display_name: "Bob",    role: "user",  created_at: new Date(Date.now() - 1.728e8).toISOString() },
  { uid: "u3", email: "carol@example.com", display_name: "Carol",  role: "user",  created_at: new Date(Date.now() - 2.592e8).toISOString() },
];

function RoleChip({ role }) {
  const isAdmin = role === "admin";
  return (
    <Chip
      label={role}
      size="small"
      sx={{
        height: 20, fontSize: 10, textTransform: "capitalize",
        background: isAdmin ? "rgba(245,158,11,0.12)" : "rgba(99,102,241,0.1)",
        color: isAdmin ? "primary.main" : "#6366f1",
        border: `1px solid ${isAdmin ? "rgba(245,158,11,0.2)" : "rgba(99,102,241,0.2)"}`,
      }}
    />
  );
}

export default function AdminPage() {
  const [users,   setUsers]   = useState([]);
  const [stats,   setStats]   = useState({ users: 0, docs: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // These endpoints to be implemented in the backend admin module
        const [uRes] = await Promise.allSettled([api.get("/api/admin/users")]);
        setUsers(uRes.status === "fulfilled" ? uRes.value.data : DUMMY_USERS);
      } catch {
        setUsers(DUMMY_USERS);
      } finally {
        setLoading(false);
        setStats({ users: DUMMY_USERS.length, docs: 7, sessions: 24 });
      }
    }
    load();
  }, []);

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <SectionHeader
        title="Admin"
        sub="Platform-wide monitoring and management"
      />

      {/* Stats */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Total users"     value={stats.users}    icon={<PeopleOutlineIcon />}         color="#6366f1" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Indexed docs"    value={stats.docs}     icon={<FolderOpenOutlinedIcon />}    color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Chat sessions"   value={stats.sessions} icon={<ChatBubbleOutlineIcon />}     color="#10b981" />
        </Grid>
      </Grid>

      {/* Users table */}
      <Card>
        <CardContent sx={{ p: "0 !important" }}>
          <Box sx={{ p: "20px 24px" }}>
            <Typography variant="h6" fontWeight={600}>Users</Typography>
          </Box>
          <Divider sx={{ borderColor: "divider" }} />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={28} sx={{ color: "primary.main" }} />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {["User", "Email", "Role", "Joined", "Last active"].map((h) => (
                    <TableCell key={h}
                      sx={{ color: "text.secondary", fontSize: 12, textTransform: "uppercase",
                        letterSpacing: 1, borderColor: "divider", py: 1.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.uid}
                    sx={{ "&:hover": { background: "rgba(232,232,240,0.02)" }, "& td": { borderColor: "divider" } }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 30, height: 30, fontSize: 13,
                          background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                          {(u.display_name || u.email)[0].toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>{u.display_name || "—"}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                    </TableCell>
                    <TableCell><RoleChip role={u.role} /></TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{fmtDate(u.created_at)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{fmtRelative(u.last_login)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
