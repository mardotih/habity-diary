import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { habitsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TODAY = new Date().toISOString().split('T')[0];

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    try {
      const [hRes, sRes] = await Promise.all([habitsApi.list(), habitsApi.stats()]);
      setHabits(hRes.data.habits);
      setStats(sRes.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleHabit = async (habit) => {
    setToggling(habit.id);
    try {
      const res = await habitsApi.toggle(habit.id, { date: TODAY });
      showToast(res.data.message, res.data.completed ? 'success' : 'info');
      setHabits(prev => prev.map(h =>
        h.id === habit.id ? { ...h, completed_today: res.data.completed } : h
      ));
      if (res.data.completed) {
        setStats(prev => prev ? { ...prev, today_completions: (prev.today_completions || 0) + 1 } : prev);
      } else {
        setStats(prev => prev ? { ...prev, today_completions: Math.max(0, (prev.today_completions || 1) - 1) } : prev);
      }
    } catch { showToast('Erro ao registar.', 'error'); }
    finally { setToggling(null); }
  };

  const completedCount = habits.filter(h => h.completed_today).length;
  const total = habits.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const dayLabels = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const key = d.toISOString().split('T')[0];
    const found = stats?.week_completions?.find(w => w.completed_date?.startsWith(key));
    return { label: dayLabels[d.getDay()], count: found ? parseInt(found.count) : 0, isToday: key === TODAY };
  });
  const maxCount = Math.max(...weekData.map(d => d.count), 1);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3 streak-fire">📖</div>
        <p className="text-ink-400 font-body text-sm">A carregar...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg font-body text-sm font-medium animate-slide-up ${
          toast.type === 'success' ? 'bg-sage-600 text-white' :
          toast.type === 'error'   ? 'bg-red-600 text-white' : 'bg-ink-900 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-ink-400 dark:text-ink-500 font-body text-sm">{greet()},</p>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">{user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm font-body mt-1">
            {new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link to="/habits" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <span>+</span> Novo hábito
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 card-stagger">
        {[
          { icon: '✅', value: `${completedCount}/${total}`, label: 'Hoje', color: 'text-sage-600 dark:text-sage-400' },
          { icon: '🔥', value: stats?.best_streak || 0, label: 'Melhor sequência', color: 'text-amber-500 dark:text-amber-400' },
          { icon: '📚', value: stats?.total_habits || 0, label: 'Total hábitos', color: 'text-ink-600 dark:text-ink-300' },
          { icon: '⭐', value: `${pct}%`, label: 'Taxa hoje', color: 'text-ink-600 dark:text-ink-300' },
        ].map(card => (
          <div key={card.label} className="card-hover p-5">
            <div className="text-2xl mb-3">{card.icon}</div>
            <p className={`font-display text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-ink-400 dark:text-ink-500 text-xs font-body mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
          <div className="card-hover p-6">
            <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100">Progresso de hoje</h2>
            <span className="font-mono text-sm font-semibold text-sage-600">{pct}%</span>
          </div>
          <div className="h-3 bg-ink-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sage-500 to-sage-400 rounded-full transition-all duration-700 ease-out"
                 style={{ width: `${pct}%` }} />
          </div>
          {pct === 100 && (
            <p className="text-center text-sm text-sage-600 font-medium mt-3">
              🎉 Parabéns! Completou todos os hábitos de hoje!
            </p>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Habits list */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-ink-100">Hábitos de hoje</h2>

          {habits.length === 0 ? (
              <div className="card p-12 text-center">
              <div className="text-5xl mb-4">🌱</div>
              <p className="font-display text-lg font-semibold text-ink-700 dark:text-ink-300">Ainda sem hábitos</p>
              <p className="text-ink-400 dark:text-ink-500 text-sm font-body mt-2 mb-6">Comece a construir a sua rotina</p>
              <Link to="/habits" className="btn-primary inline-flex items-center gap-2">
                <span>+</span> Criar primeiro hábito
              </Link>
            </div>
          ) : (
            habits.map((habit, i) => (
              <div key={habit.id}
                className={`card-hover p-4 flex items-center gap-4 animate-slide-up ${
                  habit.completed_today ? 'border-sage-200 bg-sage-50/30 dark:border-sage-700 dark:bg-sage-900/20' : ''
                }`}
                style={{ animationDelay: `${i * 60}ms` }}>

                {/* Color dot */}
                <div className="w-1 h-12 rounded-full flex-shrink-0"
                     style={{ backgroundColor: habit.color || '#6366f1' }} />

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                     style={{ backgroundColor: `${habit.color}22` || '#6366f122' }}>
                  {habit.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-body font-medium text-ink-900 dark:text-ink-100 truncate ${habit.completed_today ? 'line-through text-ink-400 dark:text-ink-500' : ''}`}>
                    {habit.title}
                  </p>
                  <p className="text-xs text-ink-400 dark:text-ink-500 font-body mt-0.5">
                    🏆 {habit.total_completions || 0} vezes completado
                  </p>
                </div>

                {/* Check button */}
                <button
                  onClick={() => toggleHabit(habit)}
                  disabled={toggling === habit.id}
                  role="checkbox" aria-checked={habit.completed_today} aria-label={`Marcar ${habit.title}`}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center flex-shrink-0
                             transition-all duration-200 active:scale-90 ${
                    habit.completed_today
                      ? 'bg-sage-500 border-sage-500 text-white shadow-sm'
                      : 'border-ink-200 hover:border-sage-400 hover:bg-sage-50 dark:border-ink-600 dark:hover:border-sage-500 dark:hover:bg-sage-900/20'
                  }`}>
                  {toggling === habit.id
                    ? <span className="text-sm animate-spin">⏳</span>
                    : habit.completed_today
                      ? <span className="text-sm habit-check-enter">✓</span>
                      : null
                  }
                </button>
              </div>
            ))
          )}
        </div>

        {/* Weekly chart */}
        <div className="lg:col-span-2 card-hover p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-6">Esta semana</h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {weekData.map(day => (
              <div key={day.label} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xs font-mono text-ink-400">{day.count > 0 ? day.count : ''}</span>
                <div className="w-full rounded-t-lg transition-all duration-500 relative"
                     style={{
                       height: `${Math.max((day.count / maxCount) * 100, 4)}%`,
                       backgroundColor: day.isToday ? '#52796f' : day.count > 0 ? '#84a98c' : '#e8e4db'
                     }}>
                  {day.isToday && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  )}
                </div>
                <span className={`text-xs font-body ${day.isToday ? 'text-sage-600 dark:text-sage-400 font-semibold' : 'text-ink-400 dark:text-ink-500'}`}>
                  {day.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between text-xs font-body text-ink-400 dark:text-ink-500">
            <span>Total esta semana</span>
            <span className="font-semibold text-ink-700 dark:text-ink-300">{weekData.reduce((a,b) => a + b.count, 0)} check-ins</span>
          </div>
        </div>
      </div>
    </div>
  );
}
