import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('[Auth] Failed to load current user', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data);
    return res.data;
  };

  const register = async (name, email, password, role) => {
    const res = await API.post('/auth/register', { name, email, password, role });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data);
    return res.data;
  };

  const updateProfile = async (data) => {
    const res = await API.put('/auth/profile', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    }
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
