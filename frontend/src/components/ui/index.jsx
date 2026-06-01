/** Reusable UI primitives used across all pages. */
import { Box, Card, CardContent, CircularProgress, Typography, Stack } from "@mui/material";

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 40, label }) {
  return (
    <Box
      sx={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 2, py: 8,
      }}
    >
      <CircularProgress size={size} thickness={2} sx={{ color: "primary.main" }} />
      {label && (
        <Typography variant="caption" color="text.secondary" letterSpacing={2} textTransform="uppercase">
          {label}
        </Typography>
      )}
    </Box>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = "primary.main" }) {
  return (
    <Card>
      <CardContent sx={{ p: "20px !important" }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1.5}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, color, fontFamily: "monospace" }}>
              {value}
            </Typography>
            {sub && (
              <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                {sub}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `rgba(245,158,11,0.1)`,
              color,
              fontSize: 22,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body, action }) {
  return (
    <Box
      sx={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", py: 10, px: 3, textAlign: "center", gap: 2,
      }}
    >
      <Box sx={{ fontSize: 52, opacity: 0.25 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={600} color="text.secondary">
        {title}
      </Typography>
      {body && (
        <Typography variant="body2" color="text.disabled" maxWidth={360}>
          {body}
        </Typography>
      )}
      {action}
    </Box>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, action }) {
  return (
    <Stack direction="row" alignItems="flex-end" justifyContent="space-between" mb={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} letterSpacing={-0.5}>{title}</Typography>
        {sub && <Typography variant="body2" color="text.secondary" mt={0.25}>{sub}</Typography>}
      </Box>
      {action}
    </Stack>
  );
}
