// ──────────────────────────────────────────────────────────────────────────────
//  Contexto de Autenticacao (AuthContext)
//  Passo a passo:
//    1. Cria um contexto React para partilhar estado de autenticacao
//    2. No arranque, verifica se ha token no localStorage e valida-o
//    3. Disponibiliza funcoes: login, register, logout
//    4. Exporta hook useAuth() para consumo nos componentes
// ──────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { extractApiError } from '../utils/error';

// Cria o contexto (inicialmente null)
const AuthContext = createContext(null);

// ─── Provider: envolve a aplicacao e disponibiliza o estado ───────────────────
export const AuthProvider = ({ children }) => {
  // Passo 1: Estado do utilizador (restaurado do localStorage se existir)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hd_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('hd_user');
      localStorage.removeItem('hd_token');
      return null;
    }
  });

  // Passo 2: Estado de loading (enquanto valida o token no arranque)
  const [loading, setLoading] = useState(true);

  // Passo 3: No arranque, verificar se o token ainda e valido
  useEffect(() => {
    const token = localStorage.getItem('hd_token');

    if (token) {
      // 3a: pede ao backend os dados do utilizador atual
      authApi.me()
        .then(res => {
          // 3b: token valido - atualiza os dados do user
          setUser(res.data.user);
          localStorage.setItem('hd_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          // 3c: token invalido/expirado - limpa tudo
          localStorage.removeItem('hd_token');
          localStorage.removeItem('hd_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // 3d: sem token - ja pode mostrar a pagina
      setLoading(false);
    }
  }, []);

  // Guarda token e user no localStorage e estado, com validacao
  const saveAuth = (token, user) => {
    if (!token || !user) throw new Error('Resposta inválida do servidor.');
    localStorage.setItem('hd_token', token);
    localStorage.setItem('hd_user', JSON.stringify(user));
    setUser(user);
  };

  // Passo 4: Funcao de login
  const login = useCallback(async (email, password) => {
    // 4a: envia credenciais para o backend
    const res = await authApi.login({ email, password });
    // 4b: guarda token e dados do utilizador
    saveAuth(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  // Passo 5: Funcao de registo
  const register = useCallback(async (name, email, password) => {
    // 5a: envia dados de registo para o backend
    const res = await authApi.register({ name, email, password });
    // 5b: guarda token e dados do utilizador
    saveAuth(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  // Passo 6: Funcao de logout
  const logout = useCallback(() => {
    // 6a: remove token e dados do localStorage
    localStorage.removeItem('hd_token');
    localStorage.removeItem('hd_user');

    // 6b: limpa o estado do utilizador
    setUser(null);
  }, []);

  // Passo 7: Verifica se o utilizador atual e admin
  const isAdmin = user?.role === 'admin';

  // Passo 8: Disponibiliza tudo atraves do contexto
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook personalizado para consumir o AuthContext ──────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve estar dentro de AuthProvider');
  return ctx;
};
