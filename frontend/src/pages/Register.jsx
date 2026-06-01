import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Checkbox, CircularProgress, Divider,
  FormControlLabel, IconButton, InputAdornment, Link,
  LinearProgress, Stack, TextField, Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useAuth } from "@/hooks/useAuth";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6366f1" },
    background: { default: "#0a0a0f", paper: "rgba(255,255,255,0.04)" },
    text: { primary: "#f1f5f9", secondary: "rgba(241,245,249,0.55)" },
  },
  typography: { fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" },
  shape: { borderRadius: 12 },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.05)",
          "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
          "&:hover fieldset": { borderColor: "rgba(99,102,241,0.5)" },
          "&.Mui-focused fieldset": { borderColor: "#6366f1" },
        },
      },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
  },
});

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const score = passwordStrength(password);
  return (
    <Box sx={{ mt: -0.5 }}>
      <LinearProgress variant="determinate" value={score * 25}
        sx={{
          height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)",
          "& .MuiLinearProgress-bar": { background: strengthColor[score] },
        }} />
      <Typography variant="caption" sx={{ color: strengthColor[score], fontSize: 11 }}>
        {strengthLabel[score]}
      </Typography>
    </Box>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.25-.164-1.84H9v3.48h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
    </svg>
  );
}

export default function Register() {
  const { register, loginWithGoogle, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);
  useEffect(() => { clearError(); setLocalError(""); }, [email, password, confirm]);
  useEffect(() => { if (isAuthenticated) navigate("/dashboard", { replace: true }); }, [isAuthenticated]);

  const displayError = localError || error;

  function validate() {
    if (!displayName.trim()) return "Please enter your name.";
    if (!email) return "Please enter your email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    if (!agreed) return "Please accept the terms to continue.";
    return null;
  }

  async function handleRegister(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setLocalError(err); return; }
    setSubmitting(true);
    try { await register(email, password, displayName.trim()); }
    catch (_) {}
    finally { setSubmitting(false); }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try { await loginWithGoogle(); }
    catch (_) {}
    finally { setGoogleLoading(false); }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0a1a 100%)",
      }} />
      <Box sx={{
        position: "relative", zIndex: 1, minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 4,
      }}>
        <Box sx={{
          width: "100%", maxWidth: 440,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 3, p: { xs: 3, sm: 4.5 },
          boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 1.5,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>?</Box>
            <Typography variant="h6" sx={{
              fontWeight: 700, letterSpacing: -0.5,
              background: "linear-gradient(90deg, #f1f5f9 0%, rgba(241,245,249,0.7) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>AI Knowledge</Typography>
          </Stack>

          <Typography variant="h5" fontWeight={700} mb={0.5} letterSpacing={-0.5}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3.5}>
            Start chatting with your documents in seconds.
          </Typography>

          {displayError && (
            <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}
              onClose={() => { clearError(); setLocalError(""); }}>
              {displayError}
            </Alert>
          )}

          <Stack component="form" onSubmit={handleRegister} spacing={2}>
            <TextField
              inputRef={nameRef} label="Full name" value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name" fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Email address" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box>
              <TextField
                label="Password" type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password" fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                        {showPassword
                          ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                          : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <PasswordStrengthBar password={password} />
            </Box>
            <TextField
              label="Confirm password" type={showConfirm ? "text" : "password"}
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password" fullWidth
              error={!!confirm && confirm !== password}
              helperText={confirm && confirm !== password ? "Passwords do not match" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((p) => !p)} edge="end" size="small">
                      {showConfirm
                        ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                        : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={
                <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: "primary.main" } }}
                  size="small" />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  I agree to the <Link href="#" sx={{ color: "primary.main" }}>Terms</Link>
                  {" "}and <Link href="#" sx={{ color: "primary.main" }}>Privacy Policy</Link>
                </Typography>
              }
            />
            <Button type="submit" variant="contained" fullWidth disabled={submitting}
              sx={{
                py: 1.4,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                "&:hover": { background: "linear-gradient(135deg, #5254cc 0%, #7c3aed 100%)" },
              }}>
              {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Create account"}
            </Button>
          </Stack>

          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.08)" }}>
            <Typography variant="caption" color="text.secondary" px={1}>or</Typography>
          </Divider>

          <Button fullWidth variant="outlined" onClick={handleGoogle} disabled={googleLoading}
            startIcon={googleLoading ? null : <GoogleIcon />}
            sx={{
              py: 1.3, borderColor: "rgba(255,255,255,0.12)", color: "text.primary",
              "&:hover": { borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.04)" },
            }}>
            {googleLoading ? <CircularProgress size={20} /> : "Sign up with Google"}
          </Button>

          <Typography variant="body2" color="text.secondary" textAlign="center" mt={3.5}>
            Already have an account?{" "}
            <Link component={RouterLink} to="/login" sx={{ color: "primary.main", fontWeight: 600 }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
