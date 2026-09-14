import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('shelter-access-token');
    const savedUser = localStorage.getItem('shelter-user');
    if (token && savedUser) {
      setAccessToken(token);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    localStorage.setItem('shelter-access-token', data.accessToken);
    localStorage.setItem('shelter-refresh-token', data.refreshToken);
    localStorage.setItem('shelter-user', JSON.stringify(data.user));
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    const token = localStorage.getItem('shelter-access-token');
    if (token) {
      authService.logout(token).catch(() => {});
    }
    localStorage.removeItem('shelter-access-token');
    localStorage.removeItem('shelter-refresh-token');
    localStorage.removeItem('shelter-user');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated: !!accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
