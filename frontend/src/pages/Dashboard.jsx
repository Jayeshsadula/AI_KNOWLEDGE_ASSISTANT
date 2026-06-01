/**
 * Dashboard — overview of activity, documents, and recent chats.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar, Box, Button, Card, CardActionArea, CardContent,
  Chip, Divider, Grid, LinearProgress, Stack, Typography,
} from "@mui/material";
import AddIcon               from "@mui/icons-material/Add";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import AutoAwesomeIcon       from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon      from "@mui/icons-material/ArrowForward";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

import { useAuth }  from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { StatCard, SectionHeader, EmptyState, Spinner } from "@/components/ui";
import api          from "@/services/api";
import { fmtDate, fmtRelative } from "@/utils/format";

// ── Dummy fallback data (used when backend isn't running yet) ─────────────────
const DUMMY_SESSIONS = [
  { id: "s1", title: "Quarterly report analysis", created_at: new Date(Date.now() - 3_600_000).toISOString(), message_count: 14 },
  { id: "s2", title: "Contract review questions",  created_at: new Date(Date.now() - 86_400_000).toISOString(), message_count: 7  },
  { id: "s3", title: "Research paper summary",     created_at: new Date(Date.now() - 172_800_000).toISOString(), message_count: 22 },
];
const DUMMY_DOCS = [
  { id: "d1", filename: "Q3_Financial_Report.pdf",  upload_date: new Date(Date.now() - 7_200_000).toISOString(),  pages: 48 },
  { id: "d2", filename: "Service_Agreement_v2.pdf", upload_date: new Date(Date.now() - 259_200_000).toISOString(), pages: 12 },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function WelcomeBanner({ user, profile }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Box
      sx={{
        borderRadius: 3,
        p: { xs: 3, md: 4 },
        background:
          "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(99,102,241,0.08) 100%)",
        border: "1px solid rgba(245,158,11,0.15)",
        position: "relative",
        overflow: "hidden",
        mb: 4,
        "&::before": {
          content: '""',
          position: "absolute",
          width: 300, height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
          top: -100, right: -100,
        },
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }}
        justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="overline" color="primary.main" letterSpacing={2} display="block">
            {greeting}
          </Typography>
          <Typography variant="h4" fontWeight={700} letterSpacing={-0.5} mt={0.5}>
            {user?.displayName || "Welcome back"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Your AI knowledge base is ready. Ask anything about your documents.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AutoAwesomeIcon />}
          href="/chat"
          sx={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#000",
            whiteSpace: "nowrap",
            flexShrink: 0,
            px: 3,
          }}
        >
          Start chatting
        </Button>
      </Stack>
    </Box>
  );
}

function SessionCard({ session }) {
  const navigate = useNavigate();
  return (
    <Card sx={{ "&:hover": { borderColor: "rgba(245,158,11,0.3)" }, transition: "border-color .2s" }}>
      <CardActionArea onClick={() => navigate(`/chat?session=${session.id}`)} sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 2, flexShrink: 0,
              background: "rgba(99,102,241,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6366f1",
            }}
          >
            <ChatBubbleOutlineIcon fontSize="small" />
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {session.title || "Untitled session"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fmtRelative(session.created_at)} · {session.message_count} messages
            </Typography>
          </Box>
          <ArrowForwardIcon sx={{ color: "text.disabled", fontSize: 18 }} />
        </Stack>
      </CardActionArea>
    </Card>
  );
}

function DocCard({ doc }) {
  return (
    <Card sx={{ "&:hover": { borderColor: "rgba(245,158,11,0.3)" }, transition: "border-color .2s" }}>
      <CardContent sx={{ p: "16px !important" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <InsertDriveFileOutlinedIcon sx={{ color: "primary.main", fontSize: 22, flexShrink: 0 }} />
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {doc.filename}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fmtDate(doc.upload_date)}{doc.pages ? ` · ${doc.pages} pages` : ""}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();

  const [sessions,  setSessions]  = useState([]);
  const [docs,      setDocs]      = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, dRes] = await Promise.allSettled([
          api.get("/api/chat/history?limit=3"),
          api.get("/api/documents?limit=4"),
        ]);
        setSessions(sRes.status === "fulfilled" ? sRes.value.data : DUMMY_SESSIONS);
        setDocs(dRes.status === "fulfilled" ? dRes.value.data : DUMMY_DOCS);
      } catch {
        setSessions(DUMMY_SESSIONS);
        setDocs(DUMMY_DOCS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <WelcomeBanner user={user} profile={profile} />

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} mb={4}>
        {[
          { label: "Documents",     value: docs.length,     icon: <FolderOpenOutlinedIcon />,  color: "#f59e0b", sub: "indexed in ChromaDB" },
          { label: "Chat sessions", value: sessions.length, icon: <ChatBubbleOutlineIcon />,   color: "#6366f1", sub: "this account" },
          { label: "Model",         value: "Llama 3",       icon: <AutoAwesomeIcon />,          color: "#10b981", sub: "running locally via Ollama" },
          { label: "Storage",       value: "Local",         icon: <FolderOpenOutlinedIcon />,  color: "#3b82f6", sub: "ChromaDB + MongoDB" },
        ].map((s) => (
          <Grid item xs={12} sm={6} lg={3} key={s.label}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* ── Recent chats ──────────────────────────────────────────────── */}
        <Grid item xs={12} md={7}>
          <SectionHeader
            title="Recent chats"
            sub="Continue where you left off"
            action={
              <Button size="small" endIcon={<ArrowForwardIcon />} href="/chat"
                sx={{ color: "text.secondary", fontSize: 12 }}>
                View all
              </Button>
            }
          />
          {loading ? <Spinner label="Loading" /> : (
            <Stack spacing={1.5}>
              {sessions.length === 0
                ? <EmptyState icon="💬" title="No chats yet"
                    body="Upload a document and start asking questions."
                    action={<Button variant="outlined" onClick={() => navigate("/chat")}>New chat</Button>} />
                : sessions.map((s) => <SessionCard key={s.id} session={s} />)
              }
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                fullWidth
                onClick={() => navigate("/chat")}
                sx={{ borderStyle: "dashed", color: "text.secondary", borderColor: "divider", mt: 0.5 }}
              >
                New conversation
              </Button>
            </Stack>
          )}
        </Grid>

        {/* ── Recent documents ──────────────────────────────────────────── */}
        <Grid item xs={12} md={5}>
          <SectionHeader
            title="Documents"
            sub="Indexed knowledge base"
            action={
              <Button size="small" endIcon={<ArrowForwardIcon />} href="/documents"
                sx={{ color: "text.secondary", fontSize: 12 }}>
                Manage
              </Button>
            }
          />
          {loading ? <Spinner label="Loading" /> : (
            <Stack spacing={1.5}>
              {docs.length === 0
                ? <EmptyState icon="📄" title="No documents"
                    body="Upload PDFs to build your knowledge base."
                    action={<Button variant="outlined" onClick={() => navigate("/documents")}>Upload</Button>} />
                : docs.map((d) => <DocCard key={d.id} doc={d} />)
              }
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                fullWidth
                onClick={() => navigate("/documents")}
                sx={{ borderStyle: "dashed", color: "text.secondary", borderColor: "divider", mt: 0.5 }}
              >
                Upload document
              </Button>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
