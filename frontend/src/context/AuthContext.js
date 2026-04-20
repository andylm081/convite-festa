import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const AuthContext = createContext(null);

// Retry helper — tenta até `attempts` vezes com `delay` ms entre tentativas
async function withRetry(fn, attempts = 3, delay = 2000) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const status = err.response?.status;
      // Só retentar em erros de servidor (500/503), não em erro de credencial (401)
      if (status === 401 || status === 403 || i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLoading(false);
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Verifica token com retry — se o banco demorar, tenta novamente
    // IMPORTANTE: só apaga o token se for erro 401 (inválido/expirado)
    // Para erros 500/503 (banco acordando), mantém o token e tenta de novo
    withRetry(() => axios.get(`${API_BASE}/api/auth/me`), 3, 2000)
      .then(res => setAdmin(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          // Token inválido ou expirado — apaga
          localStorage.removeItem('admin_token');
          delete axios.defaults.headers.common['Authorization'];
        }
        // Para 500/503: mantém o token, usuário continua logado
        // O admin ainda consegue usar o painel se as próximas chamadas funcionarem
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    // Login com retry automático (banco pode estar acordando)
    const res = await withRetry(
      () => axios.post(`${API_BASE}/api/auth/login`, { email, password }),
      3,    // até 3 tentativas
      2000  // 2s entre tentativas
    );
    const { access_token } = res.data;
    localStorage.setItem('admin_token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    const meRes = await axios.get(`${API_BASE}/api/auth/me`);
    setAdmin(meRes.data);
    return meRes.data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
