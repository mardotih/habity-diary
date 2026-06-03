import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Início' },
  { to: '/habits',    icon: '✅', label: 'Hábitos' },
  { to: '/stats',     icon: '📊', label: 'Estatísticas' },
  { to: '/reminders', icon: '🔔', label: 'Lembretes' },
  { to: '/profile',   icon: '👤', label: 'Perfil' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-ink-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl streak-fire">📖</span>
          <div>
            <h1 className="font-display text-lg font-bold text-ink-900 leading-tight">Diário de</h1>
            <h1 className="font-display text-lg font-bold text-sage-600 leading-tight">Hábitos</h1>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-6 py-4 border-b border-ink-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
               style={{ backgroundColor: user?.avatar_color || '#6366f1' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-900 truncate">{user?.name}</p>
            <p className="text-xs text-ink-400 truncate">{user?.role === 'admin' ? '👑 Admin' : '✨ Utilizador'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-ink-900 text-ink-50 shadow-sm'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }`
            }>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink to="/admin" onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive ? 'bg-amber-500 text-white' : 'text-amber-600 hover:bg-amber-50'
              }`
            }>
            <span className="text-base">⚙️</span>
            Administração
          </NavLink>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-ink-100">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-500
                     hover:bg-red-50 hover:text-red-600 transition-all duration-200">
          <span>🚪</span> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-ink-100 fixed inset-y-0 left-0 z-30 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white h-full flex flex-col shadow-xl animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-ink-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-ink-100">
            <div className="space-y-1">
              <span className="block w-5 h-0.5 bg-ink-900" />
              <span className="block w-5 h-0.5 bg-ink-900" />
              <span className="block w-5 h-0.5 bg-ink-900" />
            </div>
          </button>
          <span className="font-display font-bold text-ink-900">📖 Diário de Hábitos</span>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
               style={{ backgroundColor: user?.avatar_color || '#6366f1' }}>
            {initials}
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
