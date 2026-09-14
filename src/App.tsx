import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AnimalsPage from './components/AnimalsPage';
import AnimalProfile from './components/AnimalProfile';
import AdoptionsPage from './components/AdoptionsPage';
import SettingsPage, { applyTheme, THEMES } from './components/SettingsPage';
import './index.css';

/** Layout route: guards auth and renders the shell with <Outlet /> as children */
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  useEffect(() => {
    const savedThemeName = localStorage.getItem('shelter-theme');
    if (savedThemeName) {
      const theme = THEMES.find(t => t.name === savedThemeName);
      if (theme) applyTheme(theme);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route — no Layout, no auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — share Layout and auth guard via ProtectedLayout */}
          <Route element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/animals" element={<AnimalsPage />} />
            <Route path="/animals/:id" element={<AnimalProfile />} />
            <Route path="/adoptions" element={<AdoptionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
