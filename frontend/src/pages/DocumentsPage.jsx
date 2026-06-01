/**
 * DocumentsPage — manage the RAG knowledge base.
 * Drag-and-drop upload + progress + indexed document list.
 */
import { useCallback, useRef, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip,
  CircularProgress, Grid, IconButton, LinearProgress,
  Stack, Tooltip, Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon      from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon  from "@mui/icons-material/InsertDriveFileOutlined";
import DeleteOutlineIcon            from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon       from "@mui/icons-material/CheckCircleOutline";

import { useDocuments } from "@/hooks/useDocuments";
import { SectionHeader, EmptyState, Spinner } from "@/components/ui";
import { fmtDate, fmtBytes } from "@/utils/format";

// ── Upload zone ───────────────────────────────────────────────────────────────
function UploadZone({ onFile, uploading, progress }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const accept = (files) => {
    const pdf = Array.from(files).find((f) => f.type === "application/pdf");
    if (!pdf) return;
    onFile(pdf);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files);
  }, []);

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      sx={{
        border: "2px dashed",
        borderColor: dragging ? "primary.main" : uploading ? "rgba(245,158,11,0.3)" : "rgba(232,232,240,0.12)",
        borderRadius: 3,
        p: { xs: 4, md: 6 },
        textAlign: "center",
        cursor: uploading ? "not-allowed" : "pointer",
        transition: "all .2s",
        background: dragging ? "rgba(245,158,11,0.05)" : "rgba(232,232,240,0.02)",
        "&:hover": { borderColor: "rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.03)" },
        mb: 4,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => accept(e.target.files)}
      />

      {uploading ? (
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} thickness={2} sx={{ color: "primary.main" }} />
          <Typography variant="body2" color="text.secondary">Uploading & indexing…</Typography>
          <Box sx={{ width: "100%", maxWidth: 280 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6, borderRadius: 3,
                background: "rgba(232,232,240,0.1)",
                "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #f59e0b, #d97706)" },
              }}
            />
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {progress}%
            </Typography>
          </Box>
        </Stack>
      ) : (
        <Stack spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 2,
              background: "rgba(245,158,11,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "primary.main",
            }}
          >
            <CloudUploadOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Drop a PDF here or{" "}
              <Box component="span" sx={{ color: "primary.main" }}>browse</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              PDF files only · Max 50 MB
            </Typography>
          </Box>
        </Stack>
      )}
    </Box>
  );
}

// ── Document card ──────────────────────────────────────────────────────────────
function DocCard({ doc, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Card>
      <CardContent sx={{ p: "16px 20px !important" }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2, flexShrink: 0,
              background: "rgba(245,158,11,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "primary.main",
            }}
          >
            <InsertDriveFileOutlinedIcon />
          </Box>

          <Box flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {doc.filename}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" mt={0.5} flexWrap="wrap">
              <Typography variant="caption" color="text.secondary">
                {fmtDate(doc.upload_date)}
              </Typography>
              {doc.size && (
                <Typography variant="caption" color="text.secondary">
                  {fmtBytes(doc.size)}
                </Typography>
              )}
              {doc.pages && (
                <Typography variant="caption" color="text.secondary">
                  {doc.pages} pages
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Status */}
          <Chip
            icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
            label="Indexed"
            size="small"
            sx={{
              fontSize: 11, height: 22, flexShrink: 0,
              background: "rgba(16,185,129,0.1)", color: "#10b981",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          />

          {/* Delete */}
          {confirming ? (
            <Stack direction="row" spacing={0.5}>
              <Button size="small" color="error" onClick={() => { onDelete(doc.id); setConfirming(false); }}
                sx={{ minWidth: 0, px: 1.5, fontSize: 12 }}>Delete</Button>
              <Button size="small" onClick={() => setConfirming(false)}
                sx={{ minWidth: 0, px: 1.5, fontSize: 12, color: "text.secondary" }}>Cancel</Button>
            </Stack>
          ) : (
            <Tooltip title="Delete document" arrow>
              <IconButton size="small" onClick={() => setConfirming(true)}
                sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const { docs, loading, uploading, uploadProgress, upload, remove } = useDocuments();

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 860, mx: "auto" }}>
      <SectionHeader
        title="Documents"
        sub={`${docs.length} file${docs.length !== 1 ? "s" : ""} indexed in your knowledge base`}
      />

      <Alert severity="info" sx={{ mb: 3, fontSize: 13 }}>
        Uploaded PDFs are chunked, embedded, and stored in ChromaDB. The AI uses them as context when you ask questions in Chat.
      </Alert>

      <UploadZone onFile={upload} uploading={uploading} progress={uploadProgress} />

      {loading ? (
        <Spinner label="Loading documents" />
      ) : docs.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No documents yet"
          body="Upload your first PDF to start building your knowledge base."
        />
      ) : (
        <Stack spacing={1.5}>
          {docs.map((d) => <DocCard key={d.id} doc={d} onDelete={remove} />)}
        </Stack>
      )}
    </Box>
  );
}
