// ──────────────────────────────────────────────────────────────────────────────
//  Camada de comunicacao com a API (Axios)
//  Passo a passo:
//    1. Cria instancia Axios com URL base e timeout
//    2. Interceta pedidos para injetar token JWT automaticamente
//    3. Interceta respostas: se 401, limpa token e redireciona para login
//    4. Exporta funcoes organizadas por recurso (auth, habits, reminders, admin)
// ──────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

// ─── 1. Instancia central do Axios ───────────────────────────────────────────
const api = axios.create({
  // URL base: vem do .env (VITE_API_URL) ou fallback para localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
});

// ─── 2. Intercetor de pedidos: injeta token JWT em todas as requests ────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── 3. Intercetor de respostas: trata erros de autenticacao ─────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Se o servidor devolveu 401 (nao autorizado), token expirou
    if (err.response?.status === 401) {
      localStorage.removeItem('hd_token');
      localStorage.removeItem('hd_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── 4. API de Autenticacao ──────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  update:   (data) => api.put('/auth/profile', data),
};

// ─── 5. API de Habitos (CRUD + check-in + estatisticas) ──────────────────────
export const habitsApi = {
  list:     ()         => api.get('/habits'),
  get:      (id)       => api.get(`/habits/${id}`),
  create:   (data)     => api.post('/habits', data),
  update:   (id, data) => api.put(`/habits/${id}`, data),
  delete:   (id)       => api.delete(`/habits/${id}`),
  toggle:   (id, data) => api.post(`/habits/${id}/complete`, data),
  stats:    ()         => api.get('/habits/stats/summary'),
};

// ─── 6. API de Lembretes ─────────────────────────────────────────────────────
export const remindersApi = {
  list:   ()         => api.get('/reminders'),
  create: (data)     => api.post('/reminders', data),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  delete: (id)       => api.delete(`/reminders/${id}`),
};

// ─── 7. API de Administracao (apenas para users com role=admin) ──────────────
export const adminApi = {
  stats:      ()         => api.get('/admin/stats'),
  users:      ()         => api.get('/admin/users'),
  toggleUser: (id)       => api.put(`/admin/users/${id}/toggle`),
  changeRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
};

export default api;
