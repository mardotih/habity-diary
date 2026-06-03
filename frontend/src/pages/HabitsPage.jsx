import { useState, useEffect, useCallback } from 'react';
import { habitsApi } from '../services/api';

const ICONS = ['✅','🏃','📚','💧','🧘','💪','🥗','😴','✍️','🎯','🎨','🎵','🌿','🧹','💊','🚴','🌅','🙏'];
const COLORS = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#f97316','#06b6d4','#84cc16'];

const DEFAULT_FORM = { title: '', description: '', icon: '✅', color: '#6366f1', frequency: 'daily', target_days: 7, goal_type: 'daily', goal_value: 1 };

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  const load = useCallback(async () => {
    try {
      const res = await habitsApi.list();
      setHabits(res.data.habits);
    } catch { showToast('Erro ao carregar hábitos.', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(DEFAULT_FORM); setShowModal(true); };
  const openEdit = (h) => { setEditing(h); setForm({ title: h.title, description: h.description || '', icon: h.icon, color: h.color, frequency: h.frequency, target_days: h.target_days, goal_type: h.goal_type || 'daily', goal_value: h.goal_value || 1 }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(DEFAULT_FORM); };

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim()) return showToast('O título é obrigatório.', 'error');
    setSaving(true);
    try {
      if (editing) {
        const res = await habitsApi.update(editing.id, form);
        setHabits(prev => prev.map(h => h.id === editing.id ? { ...h, ...res.data.habit } : h));
        showToast('Hábito actualizado!');
      } else {
        const res = await habitsApi.create(form);
        setHabits(prev => [...prev, { ...res.data.habit, total_completions: 0, completed_today: false }]);
        showToast('Hábito criado! 🎉');
      }
      closeModal();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao guardar.', 'error');
    } finally { setSaving(false); }
  };

  const deleteHabit = async (id) => {
    setDeleting(id);
    try {
      await habitsApi.delete(id);
      setHabits(prev => prev.filter(h => h.id !== id));
      showToast('Hábito eliminado.');
    } catch { showToast('Erro ao eliminar.', 'error'); }
    finally { setDeleting(null); setConfirmDelete(null); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg font-body text-sm font-medium animate-slide-up ${
          toast.type === 'success' ? 'bg-sage-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-ink-900 text-white'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Os meus hábitos</h1>
          <p className="text-ink-400 dark:text-ink-500 text-sm font-body mt-1">{habits.length} hábito{habits.length !== 1 ? 's' : ''} activo{habits.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <span>+</span> Novo hábito
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="card p-6 animate-pulse"><div className="h-5 bg-ink-100 dark:bg-ink-800 rounded w-2/3 mb-3"/><div className="h-4 bg-ink-100 dark:bg-ink-800 rounded w-1/2"/></div>)}
        </div>
      ) : habits.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-5">🌱</div>
          <h2 className="font-display text-2xl font-semibold text-ink-800 dark:text-ink-200 mb-2">Nenhum hábito ainda</h2>
          <p className="text-ink-400 dark:text-ink-500 font-body mb-8">Crie o seu primeiro hábito e comece a sua jornada</p>
          <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 mx-auto">
            <span>+</span> Criar primeiro hábito
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {habits.map((habit, i) => (
            <div key={habit.id} className="card-hover p-5 animate-slide-up group"
                 style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                     style={{ backgroundColor: `${habit.color}22` }}>
                  {habit.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-body font-semibold text-ink-900 dark:text-ink-100 truncate">{habit.title}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => openEdit(habit)} aria-label="Editar hábito"
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors text-sm">
                        ✏️
                      </button>
                      <button onClick={() => setConfirmDelete(habit.id)} aria-label="Eliminar hábito"
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-ink-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm">
                        🗑️
                      </button>
                    </div>
                  </div>
                  {habit.description && (
                    <p className="text-ink-400 dark:text-ink-500 text-xs font-body mt-1 line-clamp-2">{habit.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="badge bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                      {habit.frequency === 'daily' ? '📅 Diário' : '📆 Semanal'}
                    </span>
                    <span className="text-xs text-ink-400 dark:text-ink-500 font-body">
                      🏆 {habit.total_completions || 0}×
                    </span>
                    {habit.goal_value > 1 && (
                      <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        🎯 {habit.goal_type === 'daily' ? 'Dia' : habit.goal_type === 'weekly' ? 'Sem' : 'Mês'}: {habit.goal_value}
                      </span>
                    )}
                    {habit.completed_today && (
                      <span className="badge bg-sage-500/20 text-sage-700 dark:text-sage-300">✓ Hoje</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1 rounded-full" style={{ backgroundColor: `${habit.color}40` }}>
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width: `${Math.min(((habit.total_completions || 0) / Math.max(habit.goal_value || habit.target_days, 1)) * 100, 100)}%`, backgroundColor: habit.color }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm dark:bg-ink-950/60" onClick={() => setConfirmDelete(null)} />
          <div className="relative card p-8 w-full max-w-sm animate-slide-up text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100 mb-2">Eliminar hábito</h3>
            <p className="text-ink-500 dark:text-ink-400 text-sm font-body mb-6">Esta acção não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={() => deleteHabit(confirmDelete)} disabled={deleting === confirmDelete}
                className="btn-danger flex-1">
                {deleting === confirmDelete ? 'A eliminar...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm dark:bg-ink-950/60" onClick={closeModal} />
          <div className="relative card p-8 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100 mb-6">
              {editing ? 'Editar hábito' : 'Novo hábito'}
            </h2>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">Título *</label>
                <input name="title" value={form.title} onChange={handle}
                  className="input-field" placeholder="Ex: Beber 2L de água" required />
              </div>

              <div>
                <label className="label">Descrição (opcional)</label>
                <textarea name="description" value={form.description} onChange={handle}
                  className="input-field resize-none" rows={2} placeholder="Detalhes sobre este hábito..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Frequência</label>
                  <select name="frequency" value={form.frequency} onChange={handle} className="input-field">
                    <option value="daily">📅 Diário</option>
                    <option value="weekly">📆 Semanal</option>
                  </select>
                </div>
                <div>
                  <label className="label">Dias alvo</label>
                  <input name="target_days" type="number" min="1" max="7" value={form.target_days} onChange={handle}
                    className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tipo de meta</label>
                  <select name="goal_type" value={form.goal_type} onChange={handle} className="input-field">
                    <option value="daily">🎯 Por dia</option>
                    <option value="weekly">🎯 Por semana</option>
                    <option value="monthly">🎯 Por mês</option>
                  </select>
                </div>
                <div>
                  <label className="label">Valor da meta</label>
                  <input name="goal_value" type="number" min="1" max="99" value={form.goal_value} onChange={handle}
                    className="input-field" placeholder="Ex: 3" />
                </div>
              </div>

              <div>
                <label className="label">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button type="button" key={icon} onClick={() => setForm(p => ({ ...p, icon }))} aria-label={`Ícone ${icon}`}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        form.icon === icon ? 'bg-ink-900 dark:bg-ink-200 shadow-md scale-110' : 'bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700'
                      }`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Cor</label>
                <div className="flex gap-3 flex-wrap">
                  {COLORS.map(color => (
                    <button type="button" key={color} onClick={() => setForm(p => ({ ...p, color }))} aria-label={`Cor ${color}`}
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-ink-700 scale-110 dark:ring-offset-ink-900' : 'hover:scale-105'}`} />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl border border-ink-100 bg-ink-50 dark:border-ink-800 dark:bg-ink-800/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                     style={{ backgroundColor: `${form.color}22` }}>{form.icon}</div>
                <div>
                  <p className="font-body font-medium text-ink-900 dark:text-ink-100">{form.title || 'Pré-visualização'}</p>
                  <p className="text-xs text-ink-400 dark:text-ink-500 font-body">{form.frequency === 'daily' ? 'Diário' : 'Semanal'}</p>
                </div>
                <div className="ml-auto w-2 h-10 rounded-full" style={{ backgroundColor: form.color }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'A guardar...' : editing ? 'Actualizar' : 'Criar hábito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
