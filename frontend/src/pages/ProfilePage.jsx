import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) return showToast('As senhas não coincidem.', 'error');
    if (form.password && form.password.length < 6) return showToast('Senha deve ter 6+ caracteres.', 'error');
    setSaving(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;
      await authApi.update(payload);
      showToast('Perfil actualizado com sucesso!');
      setForm(p => ({ ...p, password: '', confirm: '' }));
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao actualizar.', 'error');
    } finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg font-body text-sm font-medium animate-slide-up ${
          toast.type === 'success' ? 'bg-sage-600 text-white' : 'bg-red-600 text-white'
        }`}>{toast.msg}</div>
      )}

      <div>
        <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">O meu perfil</h1>
        <p className="text-ink-400 dark:text-ink-500 text-sm font-body mt-1">Gerencie as suas informações pessoais</p>
      </div>

      {/* Avatar */}
      <div className="card p-8 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg"
             style={{ backgroundColor: user?.avatar_color || '#6366f1' }}>
          {initials}
        </div>
        <div className="text-center">
          <p className="font-display text-xl font-bold text-ink-900 dark:text-ink-100">{user?.name}</p>
          <p className="text-ink-400 dark:text-ink-500 text-sm font-body">{user?.email}</p>
          <span className={`badge mt-2 ${user?.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300'}`}>
            {user?.role === 'admin' ? '👑 Administrador' : '✨ Utilizador'}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-8">
        <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-6">Editar informações</h2>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="label">Nome completo</label>
            <input name="name" value={form.name} onChange={handle} className="input-field" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user?.email} className="input-field bg-ink-50 dark:bg-ink-800/50 cursor-not-allowed" disabled />
            <p className="text-xs text-ink-400 dark:text-ink-500 font-body mt-1">O email não pode ser alterado.</p>
          </div>

          <div className="pt-2 border-t border-ink-100 dark:border-ink-800">
            <h3 className="font-body font-semibold text-ink-800 dark:text-ink-200 mb-4">Alterar senha</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Nova senha (deixe em branco para manter)</label>
                <input name="password" type="password" value={form.password} onChange={handle}
                  className="input-field" placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="label">Confirmar nova senha</label>
                <input name="confirm" type="password" value={form.confirm} onChange={handle}
                  className="input-field" placeholder="Repita a nova senha" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? 'A guardar...' : '💾 Guardar alterações'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-100 dark:border-red-900/50">
        <h2 className="font-display text-lg font-semibold text-red-700 dark:text-red-400 mb-3">Zona de perigo</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400 font-body mb-4">Terminar sessão em todos os dispositivos.</p>
        <button onClick={logout} className="btn-danger flex items-center gap-2">
          🚪 Terminar sessão
        </button>
      </div>
    </div>
  );
}
