import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppThemeProvider } from "@/context/ThemeContext";
import { ToastProvider }    from "@/context/ToastContext";
import { AuthProvider }     from "@/context/AuthContext";
import ProtectedRoute       from "@/components/auth/ProtectedRoute";
import AppLayout            from "@/components/layout/AppLayout";
import LandingPage   from "@/pages/LandingPage";
import Login         from "@/pages/Login";
import Register      from "@/pages/Register";
import Dashboard     from "@/pages/Dashboard";
import ChatPage      from "@/pages/ChatPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ProfilePage   from "@/pages/ProfilePage";
import SettingsPage  from "@/pages/SettingsPage";
import AdminPage     from "@/pages/AdminPage";

export default function App() {
  return (
    <AppThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"         element={<LandingPage />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/chat"      element={<ProtectedRoute><AppLayout><ChatPage /></AppLayout></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><AppLayout><DocumentsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/profile"   element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
              <Route path="/settings"  element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin"     element={<ProtectedRoute><AppLayout><AdminPage /></AppLayout></ProtectedRoute>} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </AppThemeProvider>
  );
}
