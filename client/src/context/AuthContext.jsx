import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('agritech_token');
    const savedUser = localStorage.getItem('agritech_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('agritech_token');
        localStorage.removeItem('agritech_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('agritech_token', data.token);
    localStorage.setItem('agritech_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('agritech_token', data.token);
    localStorage.setItem('agritech_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('agritech_token');
    localStorage.removeItem('agritech_user');
    setUser(null);
  };

  const value = { user, loading, login, register, logout, isAdmin: user?.role === 'admin' };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
