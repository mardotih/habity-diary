// ──────────────────────────────────────────────────────────────────────────────
//  Componente principal da aplicacao React
//  Passo a passo:
//    1. Envolve tudo no AuthProvider (contexto de autenticacao)
//    2. Configura o React Router com rotas publicas e privadas
//    3. PrivateRoute redireciona para /login se nao estiver autenticado
//    4. AdminRoute so deixa passar utilizadores com role=admin
// ──────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HabitsPage from './pages/HabitsPage';
import StatsPage from './pages/StatsPage';
import RemindersPage from './pages/RemindersPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// ─── Componente para proteger rotas que precisam de autenticacao ─────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Se ainda esta a verificar o token, mostra ecra de loading
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 streak-fire">📖</div>
        <p className="text-ink-500 font-body">A carregar...</p>
      </div>
    </div>
  );

  // Se nao ha user autenticado, redireciona para o login
  return user ? children : <Navigate to="/login" replace />;
};

// ─── Componente para proteger rotas de administrador ─────────────────────────
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 streak-fire">📖</div>
        <p className="text-ink-500 font-body">A carregar...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── Componente para paginas publicas (login/register) ──────────────────────
//     Se o utilizador ja estiver logado, redireciona para o dashboard
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// ─── Componente principal que define todas as rotas da aplicacao ──────────────
export default function App() {
  return (
    // Passo 1: AuthProvider disponibiliza estado de autenticacao a toda a app
    <AuthProvider>

      {/* Passo 2: ErrorBoundary captura erros nao tratados */}
      <ErrorBoundary>

        {/* Passo 3: BrowserRouter gere a navegacao por URL */}
        <BrowserRouter>

          {/* Passo 4: Definicao de todas as rotas */}
          <Routes>

            {/* Rotas publicas (so acessiveis se nao estiver logado) */}
            <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Rotas privadas (necessitam de autenticacao) */}
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"  element={<DashboardPage />} />
              <Route path="habits"     element={<HabitsPage />} />
              <Route path="stats"      element={<StatsPage />} />
              <Route path="reminders"  element={<RemindersPage />} />
              <Route path="profile"    element={<ProfilePage />} />
              {/* Rota de admin (requer privilegios especiais) */}
              <Route path="admin"      element={<AdminRoute><AdminPage /></AdminRoute>} />
            </Route>

            {/* Rota fallback: mostra pagina 404 personalizada */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

        </BrowserRouter>

      </ErrorBoundary>
    </AuthProvider>
  );
}
