import { useState, useEffect, useCallback } from 'react';
import { remindersApi, habitsApi } from '../services/api';

const DAYS = [
  { label: 'Seg', value: 1 }, { label: 'Ter', value: 2 }, { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 }, { label: 'Sex', value: 5 }, { label: 'Sáb', value: 6 }, { label: 'Dom', value: 7 },
];

const DEFAULT_FORM = { habit_id: '', label: '', reminder_time: '08:00', days_of_week: '1,2,3,4,5,6,7' };

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  const load = useCallback(async () => {
    try {
      const [rRes, hRes] = await Promise.all([remindersApi.list(), habitsApi.list()]);
      setReminders(rRes.data.reminders);
      setHabits(hRes.data.habits);
    } catch { showToast('Erro ao carregar.', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleDay = (day) => {
    const current = form.days_of_week.split(',').filter(Boolean).map(Number);
    const next = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort();
    setForm(p => ({ ...p, days_of_week: next.join(',') }));
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.days_of_week) return showToast('Seleccione pelo menos um dia.', 'error');
    setSaving(true);
    try {
      const res = await remindersApi.create(form);
      setReminders(prev => [...prev, res.data.reminder]);
      showToast('Lembrete criado! 🔔');
      setShowModal(false);
      setForm(DEFAULT_FORM);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao criar.', 'error');
    } finally { setSaving(false); }
  };

  const toggleActive = async (r) => {
    try {
      const res = await remindersApi.update(r.id, { ...r, is_active: !r.is_active });
      setReminders(prev => prev.map(x => x.id === r.id ? res.data.reminder : x));
    } catch { showToast('Erro ao actualizar.', 'error'); }
  };

  const deleteReminder = async (id) => {
    try {
      await remindersApi.delete(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      showToast('Lembrete eliminado.');
    } catch { showToast('Erro ao eliminar.', 'error'); }
    setConfirmDelete(null);
  };

  const formatDays = (str) => {
    if (!str) return '';
    const vals = str.split(',').map(Number);
    if (vals.length === 7) return 'Todos os dias';
    if (JSON.stringify(vals) === JSON.stringify([1,2,3,4,5])) return 'Dias úteis';
    return vals.map(v => DAYS.find(d => d.value === v)?.label).filter(Boolean).join(', ');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg font-body text-sm font-medium animate-slide-up ${
          toast.type === 'success' ? 'bg-sage-600 text-white' : 'bg-red-600 text-white'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Lembretes</h1>
          <p className="text-ink-400 dark:text-ink-500 text-sm font-body mt-1">Nunca esqueça os seus hábitos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> Novo lembrete
        </button>
      </div>

      {/* Info banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl dark:bg-amber-900/20 dark:border-amber-800/50 flex items-start gap-3">
        <span className="text-xl">🔔</span>
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 font-body">Como funcionam os lembretes</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-body mt-1">
            Os lembretes são processados pelo servidor a cada minuto. Em produção, seriam enviados por email ou notificação push. Aqui ficam registados no log do servidor.
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="card p-5 animate-pulse h-20" />)}
        </div>
      ) : reminders.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🔕</div>
          <h2 className="font-display text-xl font-semibold text-ink-800 dark:text-ink-200 mb-2">Nenhum lembrete activo</h2>
          <p className="text-ink-400 dark:text-ink-500 text-sm font-body mb-6">Configure lembretes para manter a consistência</p>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2 mx-auto">
            <span>+</span> Criar lembrete
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r, i) => (
            <div key={r.id} className={`card-hover p-5 flex items-center gap-4 animate-slide-up ${!r.is_active ? 'opacity-50' : ''}`}
                 style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${r.is_active ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-ink-100 dark:bg-ink-800'}`}>
                {r.habit_icon || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-ink-900 dark:text-ink-100 truncate">
                  {r.habit_title || r.label || 'Lembrete geral'}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-sm font-semibold text-sage-600 dark:text-sage-400">⏰ {r.reminder_time?.slice(0,5)}</span>
                  <span className="text-xs text-ink-400 dark:text-ink-500 font-body">📅 {formatDays(r.days_of_week)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle */}
                <button onClick={() => toggleActive(r)} aria-label={r.is_active ? 'Desactivar lembrete' : 'Activar lembrete'}
                  role="switch" aria-checked={r.is_active}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${r.is_active ? 'bg-sage-500' : 'bg-ink-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${r.is_active ? 'translate-x-5' : ''}`} />
                </button>
                <button onClick={() => setConfirmDelete(r)} aria-label="Eliminar lembrete"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-ink-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm dark:bg-ink-950/60" onClick={() => setConfirmDelete(null)} />
          <div className="relative card p-8 w-full max-w-sm animate-slide-up text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100 mb-2">Eliminar lembrete</h3>
            <p className="text-ink-500 dark:text-ink-400 text-sm font-body mb-6">Tem a certeza? Esta acção não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={() => deleteReminder(confirmDelete.id)} className="btn-danger flex-1">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm dark:bg-ink-950/60" onClick={() => setShowModal(false)} />
          <div className="relative card p-8 w-full max-w-md animate-slide-up">
            <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100 mb-6">Novo lembrete</h2>
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">Hábito (opcional)</label>
                <select name="habit_id" value={form.habit_id}
                  onChange={e => setForm(p => ({ ...p, habit_id: e.target.value }))} className="input-field">
                  <option value="">— Lembrete geral —</option>
                  {habits.map(h => <option key={h.id} value={h.id}>{h.icon} {h.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Mensagem (opcional)</label>
                <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                  className="input-field" placeholder="Ex: Hora de meditar!" />
              </div>
              <div>
                <label className="label">Hora</label>
                <input type="time" value={form.reminder_time}
                  onChange={e => setForm(p => ({ ...p, reminder_time: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="label">Dias da semana</label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map(day => {
                    const selected = form.days_of_week.split(',').map(Number).includes(day.value);
                    return (
                      <button type="button" key={day.value} onClick={() => toggleDay(day.value)}
                        className={`w-10 h-10 rounded-xl text-xs font-semibold font-body transition-all ${
                          selected ? 'bg-ink-900 text-white shadow-sm dark:bg-ink-200 dark:text-ink-900' : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700'
                        }`}>
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setForm(p => ({ ...p, days_of_week: '1,2,3,4,5,6,7' }))}
                    className="text-xs text-sage-600 dark:text-sage-400 font-body hover:underline">Todos</button>
                  <button type="button" onClick={() => setForm(p => ({ ...p, days_of_week: '1,2,3,4,5' }))}
                    className="text-xs text-sage-600 dark:text-sage-400 font-body hover:underline">Dias úteis</button>
                  <button type="button" onClick={() => setForm(p => ({ ...p, days_of_week: '6,7' }))}
                    className="text-xs text-sage-600 dark:text-sage-400 font-body hover:underline">Fim-de-semana</button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'A criar...' : '🔔 Criar lembrete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
