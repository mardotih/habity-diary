import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('stats');

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  useEffect(() => {
    Promise.all([adminApi.stats(), adminApi.users()])
      .then(([s, u]) => { setStats(s.data); setUsers(u.data.users); })
      .catch(() => showToast('Erro ao carregar dados.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    try {
      const res = await adminApi.toggleUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: res.data.user.is_active } : u));
      showToast(res.data.message);
    } catch (err) { showToast(err.response?.data?.error || 'Erro.', 'error'); }
  };

  const changeRole = async (id, role) => {
    try {
      await adminApi.changeRole(id, role);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      showToast('Role actualizado!');
    } catch (err) { showToast(err.response?.data?.error || 'Erro.', 'error'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center"><div className="text-4xl mb-3">⚙️</div>
        <p className="text-ink-400 font-body text-sm">A carregar painel de administração...</p></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg font-body text-sm font-medium animate-slide-up ${
          toast.type === 'success' ? 'bg-sage-600 text-white' : 'bg-red-600 text-white'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">⚙️</div>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Administração</h1>
          <p className="text-ink-400 text-sm font-body mt-1">Painel de controlo do sistema</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total utilizadores', value: stats?.stats?.total_users || 0, icon: '👥', color: 'bg-ink-900 text-white' },
          { label: 'Utilizadores activos', value: stats?.stats?.active_users || 0, icon: '✅', color: 'bg-sage-600 text-white' },
          { label: 'Hábitos activos', value: stats?.stats?.total_habits || 0, icon: '📚', color: 'bg-amber-500 text-white' },
          { label: 'Total check-ins', value: stats?.stats?.total_completions || 0, icon: '🔥', color: 'bg-white border border-ink-100 text-ink-900' },
          { label: 'Check-ins hoje', value: stats?.stats?.today_completions || 0, icon: '📅', color: 'bg-white border border-ink-100 text-ink-900' },
          { label: 'Lembretes activos', value: stats?.stats?.active_reminders || 0, icon: '🔔', color: 'bg-white border border-ink-100 text-ink-900' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl p-5 ${card.color}`}>
            <div className="text-2xl mb-3">{card.icon}</div>
            <p className="font-display text-2xl font-bold">{card.value}</p>
            <p className="text-xs font-body mt-1 opacity-75">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-ink-100">
        {[['stats', '📊 Actividade'], ['users', '👥 Utilizadores']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-body font-medium border-b-2 transition-colors ${
              tab === key ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Activity chart */}
      {tab === 'stats' && (
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 mb-6">Actividade — últimos 30 dias</h2>
          {(stats?.daily_activity || []).length === 0 ? (
            <div className="h-32 flex items-center justify-center text-ink-300 text-sm font-body">Sem dados ainda</div>
          ) : (
            <div className="flex items-end gap-1 h-28">
              {(() => {
                const data = stats?.daily_activity || [];
                const max = Math.max(...data.map(d => parseInt(d.completions)), 1);
                return Array.from({ length: 30 }, (_, i) => {
                  const d = new Date(); d.setDate(d.getDate() - 29 + i);
                  const key = d.toISOString().split('T')[0];
                  const found = data.find(x => x.completed_date?.startsWith(key));
                  const count = found ? parseInt(found.completions) : 0;
                  const isToday = key === new Date().toISOString().split('T')[0];
                  return (
                    <div key={i} title={`${key}: ${count} check-ins`}
                      className="flex-1 rounded-sm transition-all duration-300 cursor-pointer hover:opacity-80"
                      style={{
                        height: `${Math.max((count / max) * 100, 3)}%`,
                        backgroundColor: isToday ? '#f59e0b' : count > 0 ? '#52796f' : '#e8e4db'
                      }} />
                  );
                });
              })()}
            </div>
          )}
          <div className="flex justify-between text-xs font-body text-ink-300 mt-2">
            <span>30 dias atrás</span>
            <span>Hoje</span>
          </div>
        </div>
      )}

      {/* Users table */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>
                  {['Utilizador','Role','Hábitos','Check-ins','Estado','Acções'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-ink-500 font-body uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-ink-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                             style={{ backgroundColor: u.avatar_color || '#6366f1' }}>
                          {u.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink-900 truncate">{u.name}</p>
                          <p className="text-xs text-ink-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                        className={`text-xs font-body px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-ink-100 text-ink-600'
                        }`}>
                        <option value="user">Utilizador</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-ink-600">{u.total_habits || 0}</td>
                    <td className="px-5 py-4 text-sm font-mono text-ink-600">{u.total_completions || 0}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${u.is_active ? 'bg-sage-100 text-sage-700' : 'bg-red-100 text-red-600'}`}>
                        {u.is_active ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleUser(u.id)}
                        className={`text-xs font-body px-3 py-1.5 rounded-lg transition-colors ${
                          u.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                        }`}>
                        {u.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
