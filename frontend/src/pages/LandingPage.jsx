/**
 * LandingPage — public-facing marketing page.
 * Dark editorial with amber accents and a hero grid layout.
 */
import { Box, Button, Chip, Grid, Stack, Typography } from "@mui/material";
import { ThemeProvider }     from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import AutoAwesomeIcon        from "@mui/icons-material/AutoAwesome";
import LockOutlinedIcon       from "@mui/icons-material/LockOutlined";
import BoltIcon               from "@mui/icons-material/Bolt";
import { appTheme }           from "@/config/theme";
import { CssBaseline }        from "@mui/material";

const FEATURES = [
  {
    icon: "📄",
    title: "Upload any PDF",
    body: "Drop in research papers, contracts, reports — anything. The system extracts, chunks, and indexes every page.",
  },
  {
    icon: "🔍",
    title: "RAG-powered answers",
    body: "Every answer is grounded in your documents. Relevant passages are retrieved and shown as source citations.",
  },
  {
    icon: "🤖",
    title: "Runs on Llama 3",
    body: "No API keys. No data leaves your machine. Llama 3 via Ollama runs entirely locally.",
  },
  {
    icon: "💬",
    title: "Conversational memory",
    body: "Follow-up questions keep full context from earlier in the session — no need to repeat yourself.",
  },
  {
    icon: "🎙️",
    title: "Voice in & out",
    body: "Speak your questions and listen to answers read aloud. Hands-free knowledge retrieval.",
  },
  {
    icon: "🔐",
    title: "Firebase authentication",
    body: "Email / password and Google Sign-In. Each user's documents and sessions are completely isolated.",
  },
];

export default function LandingPage() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "#080810",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background orbs */}
        {[
          { top: -200, right: -200, color: "rgba(245,158,11,0.07)", size: 700 },
          { bottom: -200, left: -200, color: "rgba(99,102,241,0.06)", size: 600 },
        ].map((o, i) => (
          <Box
            key={i}
            aria-hidden
            sx={{
              position: "absolute",
              width: o.size, height: o.size, borderRadius: "50%",
              background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
              top: o.top, right: o.right, bottom: o.bottom, left: o.left,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* ── Navbar ─────────────────────────────────────────────────── */}
        <Stack
          direction="row" alignItems="center" justifyContent="space-between"
          sx={{ px: { xs: 3, md: 6 }, py: 3, position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{
              width: 28, height: 28, borderRadius: 1,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>✦</Box>
            <Typography variant="body1" fontWeight={700} letterSpacing={-0.3}
              sx={{ fontFamily: "monospace" }}>
              AI Knowledge
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button component={RouterLink} to="/login" variant="text"
              sx={{ color: "text.secondary", fontSize: 14 }}>Sign in</Button>
            <Button component={RouterLink} to="/register" variant="contained"
              sx={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", px: 2.5 }}>
              Get started
            </Button>
          </Stack>
        </Stack>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <Box sx={{ textAlign: "center", pt: { xs: 8, md: 12 }, pb: 8, px: 3, position: "relative", zIndex: 1 }}>
          <Chip
            icon={<BoltIcon sx={{ fontSize: "14px !important", color: "primary.main !important" }} />}
            label="Llama 3 · ChromaDB · Runs locally"
            sx={{
              mb: 4, fontSize: 12, height: 28,
              background: "rgba(245,158,11,0.08)",
              color: "primary.main",
              border: "1px solid rgba(245,158,11,0.2)",
              fontFamily: "monospace",
            }}
          />
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              fontSize: { xs: 36, md: 60, lg: 72 },
              letterSpacing: -2,
              lineHeight: 1.1,
              maxWidth: 860,
              mx: "auto",
              mb: 3,
              fontFamily: "monospace",
              background: "linear-gradient(135deg, #e8e8f0 0%, rgba(232,232,240,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Chat with your<br />
            <Box component="span" sx={{
              background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              documents
            </Box>
            , locally.
          </Typography>

          <Typography variant="h6" color="text.secondary" fontWeight={400}
            sx={{ maxWidth: 560, mx: "auto", lineHeight: 1.7, mb: 5, fontSize: { xs: 16, md: 18 } }}>
            Upload PDFs. Ask questions. Get answers with citations.
            Powered by Llama 3 via Ollama — no cloud, no API costs.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink} to="/register"
              variant="contained" size="large"
              startIcon={<AutoAwesomeIcon />}
              sx={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000",
                px: 4, py: 1.5, fontSize: 15, fontWeight: 700,
                "&:hover": { boxShadow: "0 0 32px rgba(245,158,11,0.35)" },
              }}
            >
              Start for free
            </Button>
            <Button
              component={RouterLink} to="/login"
              variant="outlined" size="large"
              startIcon={<LockOutlinedIcon />}
              sx={{
                borderColor: "rgba(232,232,240,0.15)", color: "text.secondary",
                px: 4, py: 1.5, fontSize: 15,
                "&:hover": { borderColor: "rgba(232,232,240,0.3)", background: "rgba(232,232,240,0.03)" },
              }}
            >
              Sign in
            </Button>
          </Stack>
        </Box>

        {/* ── Features ───────────────────────────────────────────────── */}
        <Box sx={{ px: { xs: 3, md: 6 }, pb: 12, position: "relative", zIndex: 1, maxWidth: 1100, mx: "auto" }}>
          <Grid container spacing={2.5}>
            {FEATURES.map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f.title}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid rgba(232,232,240,0.07)",
                    background: "rgba(232,232,240,0.02)",
                    height: "100%",
                    transition: "border-color .2s, background .2s",
                    "&:hover": {
                      borderColor: "rgba(245,158,11,0.2)",
                      background: "rgba(245,158,11,0.03)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 28, mb: 1.5 }}>{f.icon}</Typography>
                  <Typography variant="body1" fontWeight={700} mb={0.75}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{f.body}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
