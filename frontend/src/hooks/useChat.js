import { useCallback, useEffect, useRef, useState } from "react";
import { chatService } from "@/services/chatService";
import { useToast } from "@/context/ToastContext";

export function useChat(sessionId = null) {
  const [messages,   setMessages]   = useState([]);
  const [sessions,   setSessions]   = useState([]);
  const [activeId,   setActiveId]   = useState(sessionId);
  const [sending,    setSending]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const { toast } = useToast();
  const abortRef = useRef(null);

  // ── Load sessions list ──────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const data = await chatService.getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch { /* silent — dashboard shows toast */ }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // ── Load messages for active session ────────────────────────────────────
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    setLoading(true);
    chatService.getSession(activeId)
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => toast.error("Could not load chat history."))
      .finally(() => setLoading(false));
  }, [activeId]);

  // ── Send a message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(async (content, documentIds = []) => {
    if (!content.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    // Placeholder for streaming assistant turn
    const placeholderId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, role: "assistant", content: "", timestamp: new Date().toISOString(), loading: true },
    ]);

    try {
      const resp = await chatService.sendMessage({
        message: content,
        session_id: activeId,
        document_ids: documentIds,
      });

      // Update placeholder with real response
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                ...m,
                id: resp.message_id ?? placeholderId,
                content: resp.answer,
                sources: resp.sources,
                loading: false,
                timestamp: resp.timestamp ?? m.timestamp,
              }
            : m
        )
      );

      // If backend returned a new session id, track it
      if (resp.session_id && resp.session_id !== activeId) {
        setActiveId(resp.session_id);
        fetchSessions();
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== placeholderId));
      toast.error(err.response?.data?.detail ?? "Failed to get a response.");
    } finally {
      setSending(false);
    }
  }, [activeId, fetchSessions]);

  const newSession = useCallback(() => {
    setActiveId(null);
    setMessages([]);
  }, []);

  const selectSession = useCallback((id) => {
    setActiveId(id);
  }, []);

  return {
    messages,
    sessions,
    activeId,
    sending,
    loading,
    sendMessage,
    newSession,
    selectSession,
    refetchSessions: fetchSessions,
  };
}
