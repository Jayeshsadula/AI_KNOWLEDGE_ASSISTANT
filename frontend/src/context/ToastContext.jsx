/**
 * ToastContext — lightweight global notification system.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success("File uploaded!");
 *   toast.error("Something went wrong.");
 *   toast.info("Processing...");
 */
import { createContext, useCallback, useContext, useState } from "react";
import { Alert, Snackbar, Stack } from "@mui/material";

const ToastCtx = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, severity = "info", duration = 4000) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, severity, duration }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, ms) => push(msg, "success", ms),
    error:   (msg, ms) => push(msg, "error",   ms ?? 6000),
    info:    (msg, ms) => push(msg, "info",     ms),
    warning: (msg, ms) => push(msg, "warning",  ms),
  };

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}

      {/* Stacked toasts — bottom-right */}
      <Stack
        spacing={1}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          maxWidth: 380,
          width: "calc(100vw - 48px)",
        }}
      >
        {toasts.map((t) => (
          <Snackbar
            key={t.id}
            open
            autoHideDuration={t.duration}
            onClose={() => remove(t.id)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            sx={{ position: "relative", bottom: "auto", right: "auto", left: "auto", transform: "none" }}
          >
            <Alert
              severity={t.severity}
              onClose={() => remove(t.id)}
              variant="filled"
              sx={{
                width: "100%",
                fontSize: 13,
                alignItems: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                borderRadius: 2,
              }}
            >
              {t.message}
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </ToastCtx.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};
