/**
 * SettingsPage — model selection, voice, and appearance preferences.
 */
import { useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Divider,
  FormControl, FormControlLabel, MenuItem, Select,
  Stack, Switch, Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { SectionHeader } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import api from "@/services/api";

const MODELS = [
  { value: "llama3",        label: "Llama 3 8B",     badge: "Default" },
  { value: "llama3:70b",    label: "Llama 3 70B",    badge: "Large" },
  { value: "mistral",       label: "Mistral 7B",      badge: "" },
  { value: "mixtral",       label: "Mixtral 8x7B",    badge: "Fast" },
  { value: "codellama",     label: "Code Llama",      badge: "Code" },
];

function SettingRow({ label, sub, control }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }}
      justifyContent="space-between" spacing={1.5} py={2}>
      <Box>
        <Typography variant="body2" fontWeight={500}>{label}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Box>
      <Box flexShrink={0}>{control}</Box>
    </Stack>
  );
}

function Section({ title, children }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: "24px !important" }}>
        <Typography variant="overline" color="text.secondary" letterSpacing={2} display="block" mb={1}>
          {title}
        </Typography>
        <Divider sx={{ borderColor: "divider", mb: 1 }} />
        {children}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();

  const [model,       setModel]       = useState("llama3");
  const [ttsEnabled,  setTtsEnabled]  = useState(false);
  const [sttEnabled,  setSttEnabled]  = useState(true);
  const [streamResp,  setStreamResp]  = useState(true);
  const [saving,      setSaving]      = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.put("/api/settings", { model, tts_enabled: ttsEnabled, stt_enabled: sttEnabled, stream: streamResp });
      toast.success("Settings saved.");
    } catch {
      toast.error("Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 720, mx: "auto" }}>
      <SectionHeader title="Settings" sub="Configure your AI assistant preferences" />

      {/* ── Model ──────────────────────────────────────────────────────── */}
      <Section title="Model">
        <SettingRow
          label="Ollama model"
          sub="The LLM used to generate answers. Must be pulled with `ollama pull <model>`."
          control={
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select value={model} onChange={(e) => setModel(e.target.value)}
                sx={{ fontSize: 14 }}>
                {MODELS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <span>{m.label}</span>
                      {m.badge && (
                        <Chip label={m.badge} size="small"
                          sx={{ height: 18, fontSize: 10, background: "rgba(245,158,11,0.1)", color: "primary.main" }} />
                      )}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          }
        />
        <Divider sx={{ borderColor: "divider" }} />
        <SettingRow
          label="Stream responses"
          sub="Show the answer as it is generated rather than waiting for completion."
          control={
            <Switch checked={streamResp} onChange={(e) => setStreamResp(e.target.checked)}
              sx={{ "& .MuiSwitch-thumb": { background: streamResp ? "#f59e0b" : undefined } }} />
          }
        />
      </Section>

      {/* ── Voice ──────────────────────────────────────────────────────── */}
      <Section title="Voice">
        <SettingRow
          label="Voice input (Speech-to-text)"
          sub="Speak your questions using the microphone button in Chat."
          control={
            <Switch checked={sttEnabled} onChange={(e) => setSttEnabled(e.target.checked)} />
          }
        />
        <Divider sx={{ borderColor: "divider" }} />
        <SettingRow
          label="Voice output (Text-to-speech)"
          sub="Have the assistant read its answers aloud."
          control={
            <Switch checked={ttsEnabled} onChange={(e) => setTtsEnabled(e.target.checked)} />
          }
        />
      </Section>

      {/* ── Appearance ─────────────────────────────────────────────────── */}
      <Section title="Appearance">
        <SettingRow
          label="Theme"
          sub="Light mode is coming soon."
          control={
            <Chip label="Dark" size="small"
              sx={{ background: "rgba(245,158,11,0.1)", color: "primary.main", border: "1px solid rgba(245,158,11,0.2)" }} />
          }
        />
      </Section>

      {/* ── Save ───────────────────────────────────────────────────────── */}
      <Box textAlign="right">
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={save}
          disabled={saving}
          sx={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#000", px: 3,
          }}
        >
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </Box>
    </Box>
  );
}
