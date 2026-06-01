/**
 * ChatPage — full-screen conversational RAG interface.
 * Left panel: session history. Right: chat window.
 */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Avatar, Box, Button, Chip, CircularProgress,
  Divider, IconButton, InputBase, List, ListItem,
  ListItemButton, ListItemText, Paper, Stack, Tooltip, Typography,
} from "@mui/material";
import AddIcon           from "@mui/icons-material/Add";
import SendIcon          from "@mui/icons-material/Send";
import StopIcon          from "@mui/icons-material/Stop";
import MicIcon           from "@mui/icons-material/Mic";
import AutoAwesomeIcon   from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon   from "@mui/icons-material/ContentCopy";
import OpenInNewIcon     from "@mui/icons-material/OpenInNew";

import { useChat }   from "@/hooks/useChat";
import { useToast }  from "@/context/ToastContext";
import { fmtRelative, fmtTime } from "@/utils/format";

// ── TypingIndicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ py: 0.5 }}>
      {[0, 0.2, 0.4].map((d) => (
        <Box
          key={d}
          sx={{
            width: 7, height: 7, borderRadius: "50%",
            background: "rgba(245,158,11,0.6)",
            animation: "bounce 1.2s infinite ease-in-out",
            animationDelay: `${d}s`,
            "@keyframes bounce": {
              "0%,80%,100%": { transform: "scale(0.6)", opacity: 0.4 },
              "40%": { transform: "scale(1)", opacity: 1 },
            },
          }}
        />
      ))}
    </Stack>
  );
}

// ── SourceChip ────────────────────────────────────────────────────────────────
function SourceChip({ source }) {
  return (
    <Chip
      size="small"
      icon={<OpenInNewIcon sx={{ fontSize: "12px !important" }} />}
      label={source.filename ?? source.source ?? "Source"}
      sx={{
        fontSize: 11, height: 22,
        background: "rgba(99,102,241,0.1)",
        color: "#6366f1",
        border: "1px solid rgba(99,102,241,0.2)",
        cursor: "default",
      }}
    />
  );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const { toast } = useToast();
  const isUser = msg.role === "user";

  function copyText() {
    navigator.clipboard.writeText(msg.content);
    toast.success("Copied to clipboard.");
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 1.5,
        mb: 3,
        px: { xs: 0, sm: 1 },
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 32, height: 32, flexShrink: 0,
          background: isUser
            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
            : "linear-gradient(135deg, #f59e0b, #d97706)",
          fontSize: 14,
        }}
      >
        {isUser ? "U" : "✦"}
      </Avatar>

      {/* Bubble */}
      <Box sx={{ maxWidth: { xs: "85%", sm: "72%" } }}>
        <Box
          sx={{
            p: "12px 16px",
            borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
            background: isUser
              ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))"
              : "rgba(232,232,240,0.05)",
            border: "1px solid",
            borderColor: isUser ? "rgba(99,102,241,0.2)" : "rgba(232,232,240,0.07)",
            position: "relative",
          }}
        >
          {msg.loading ? (
            <TypingIndicator />
          ) : (
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.75,
                color: "text.primary",
                fontFamily: "inherit",
              }}
            >
              {msg.content}
            </Typography>
          )}
        </Box>

        {/* Sources */}
        {msg.sources?.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.75} mt={1}>
            {msg.sources.map((s, i) => <SourceChip key={i} source={s} />)}
          </Stack>
        )}

        {/* Meta row */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          mt={0.5}
          justifyContent={isUser ? "flex-end" : "flex-start"}
        >
          <Typography variant="caption" color="text.disabled">
            {fmtTime(msg.timestamp)}
          </Typography>
          {!isUser && !msg.loading && (
            <Tooltip title="Copy" arrow>
              <IconButton size="small" onClick={copyText} sx={{ opacity: 0, ".parent:hover &": { opacity: 1 } }}>
                <ContentCopyIcon sx={{ fontSize: 13, color: "text.disabled" }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

// ── Session sidebar ────────────────────────────────────────────────────────────
function SessionSidebar({ sessions, activeId, onSelect, onNew }) {
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Button
          fullWidth variant="outlined" startIcon={<AddIcon />}
          onClick={onNew}
          sx={{
            borderStyle: "dashed", borderColor: "divider",
            color: "text.secondary", justifyContent: "flex-start", py: 1,
          }}
        >
          New chat
        </Button>
      </Box>
      <Divider sx={{ borderColor: "divider" }} />
      <List dense disablePadding sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {sessions.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ px: 2, py: 2, display: "block" }}>
            No sessions yet
          </Typography>
        )}
        {sessions.map((s) => (
          <ListItem key={s.id} disablePadding>
            <ListItemButton
              selected={s.id === activeId}
              onClick={() => onSelect(s.id)}
              sx={{
                mx: 0.5, borderRadius: 1.5, mb: 0.25,
                "&.Mui-selected": {
                  background: "rgba(245,158,11,0.08)",
                  borderLeft: "2px solid",
                  borderColor: "primary.main",
                },
              }}
            >
              <ListItemText
                primary={s.title || "Untitled"}
                secondary={fmtRelative(s.created_at)}
                primaryTypographyProps={{ variant: "body2", fontWeight: 500, noWrap: true }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

// ── Chat input ─────────────────────────────────────────────────────────────────
function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        p: "10px 14px",
        border: "1px solid",
        borderColor: text ? "rgba(245,158,11,0.4)" : "rgba(232,232,240,0.1)",
        borderRadius: 3,
        background: "rgba(232,232,240,0.04)",
        backdropFilter: "blur(8px)",
        transition: "border-color .2s",
      }}
    >
      <InputBase
        multiline
        maxRows={6}
        fullWidth
        placeholder="Ask anything about your documents…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        disabled={disabled}
        sx={{
          fontSize: 14,
          color: "text.primary",
          "& textarea": { resize: "none" },
          "& ::placeholder": { color: "text.disabled", opacity: 1 },
        }}
      />
      <Stack direction="row" spacing={0.5} flexShrink={0} alignItems="center" pb={0.25}>
        <Tooltip title="Voice input" arrow>
          <IconButton size="small" sx={{ color: "text.disabled" }}>
            <MicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton
          onClick={submit}
          disabled={!text.trim() || disabled}
          size="small"
          sx={{
            background: text.trim() ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(232,232,240,0.06)",
            color: text.trim() ? "#000" : "text.disabled",
            width: 34, height: 34,
            "&:hover": { background: "linear-gradient(135deg, #fbbf24, #f59e0b)" },
            "&.Mui-disabled": { background: "rgba(232,232,240,0.06)", color: "text.disabled" },
            transition: "all .2s",
          }}
        >
          {disabled ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : <SendIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </Stack>
    </Paper>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const initialSession = searchParams.get("session");

  const { messages, sessions, activeId, sending, loading, sendMessage, newSession, selectSession } =
    useChat(initialSession);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 56px)" }}>
      {/* ── Session list (desktop) ──────────────────────────────────── */}
      <Box sx={{ display: { xs: "none", md: "flex" } }}>
        <SessionSidebar
          sessions={sessions}
          activeId={activeId}
          onSelect={selectSession}
          onNew={newSession}
        />
      </Box>

      {/* ── Chat area ────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, md: 4 }, pt: 3 }}>
          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <AutoAwesomeIcon sx={{ fontSize: 48, color: "primary.main", opacity: 0.5, mb: 2 }} />
              <Typography variant="h5" fontWeight={600} color="text.secondary" gutterBottom>
                Ask your documents anything
              </Typography>
              <Typography variant="body2" color="text.disabled" maxWidth={400} mx="auto">
                Upload PDFs in the Documents section, then start a conversation here.
                The AI will answer using your files as context.
              </Typography>
            </Box>
          )}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={28} sx={{ color: "primary.main" }} />
            </Box>
          )}

          {messages.map((m) => (
            <Box key={m.id} className="parent">
              <MessageBubble msg={m} />
            </Box>
          ))}
          <div ref={bottomRef} />
        </Box>

        {/* Input */}
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: 2.5,
            borderTop: "1px solid",
            borderColor: "divider",
            background: "rgba(8,8,16,0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <ChatInput onSend={sendMessage} disabled={sending} />
          <Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={1}>
            Answers are generated by Llama 3 running locally. Always verify important information.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
