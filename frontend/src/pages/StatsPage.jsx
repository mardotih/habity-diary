import { useState, useEffect } from 'react';
import { habitsApi } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import HabitCalendar from '../components/HabitCalendar';

const COLORS_PIE = ['#52796f', '#84a98c', '#cad2c5', '#f59e0b', '#6366f1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-3 py-2 text-sm font-body border border-ink-200 dark:border-ink-700 shadow-lg">
        <p className="text-ink-600 dark:text-ink-300 font-semibold">{label}</p>
        <p className="text-sage-600 dark:text-sage-400">{payload[0].value} check-ins</p>
      </div>
    );
  }
  return null;
};

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([habitsApi.stats(), habitsApi.list()])
      .then(([s, h]) => { if (!cancelled) { setStats(s.data); setHabits(h.data.habits); } })
      .catch(err => { if (!cancelled) setError(err.message || 'Erro ao carregar estatísticas.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center"><div className="text-4xl mb-3">⚠️</div>
        <p className="text-ink-400 dark:text-ink-500 font-body text-sm">{error}</p></div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center"><div className="text-4xl mb-3 streak-fire">📊</div>
        <p className="text-ink-400 dark:text-ink-500 font-body text-sm">A carregar estatísticas...</p></div>
    </div>
  );

  const weekData = (() => {
    const labels = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - 6 + i);
      const key = d.toISOString().split('T')[0];
      const found = stats?.week_completions?.find(w => w.completed_date?.startsWith(key));
      return { dia: labels[d.getDay()], completions: found ? parseInt(found.count) : 0 };
    });
  })();

  const monthlyData = (stats?.monthly_data || []).map(m => ({
    mês: new Date(m.month).toLocaleDateString('pt-PT', { month: 'short' }),
    total: parseInt(m.total)
  }));

  const pieData = habits.slice(0, 5).map((h, i) => ({
    name: h.title.length > 15 ? h.title.slice(0, 15) + '…' : h.title,
    value: parseInt(h.total_completions) || 0,
    color: COLORS_PIE[i % COLORS_PIE.length]
  })).filter(d => d.value > 0);

  const completionRate = habits.length > 0
    ? Math.round((habits.filter(h => h.completed_today).length / habits.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Estatísticas</h1>
        <p className="text-ink-400 dark:text-ink-500 text-sm font-body mt-1">Acompanhe o seu progresso ao longo do tempo</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Hábitos activos', value: stats?.total_habits || 0, icon: '📚', bg: 'bg-ink-900 dark:bg-ink-200', text: 'text-white dark:text-ink-900' },
          { label: 'Concluídos hoje', value: stats?.today_completions || 0, icon: '✅', bg: 'bg-sage-600', text: 'text-white' },
          { label: 'Total check-ins', value: monthlyData.reduce((a,b) => a + b.total, 0), icon: '🔥', bg: 'bg-amber-500', text: 'text-white' },
          { label: 'Taxa hoje', value: `${completionRate}%`, icon: '📈', bg: 'bg-white border border-ink-100 dark:bg-ink-900 dark:border-ink-800', text: 'text-ink-900 dark:text-ink-200' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl p-5 ${card.bg} transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
            <div className="text-2xl mb-3">{card.icon}</div>
            <p className={`font-display text-2xl font-bold ${card.text}`}>{card.value}</p>
            <p className={`text-xs font-body mt-1 ${card.text} opacity-70`}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-6">Check-ins — Últimos 7 dias</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekData} barSize={32}>
            <XAxis dataKey="dia" tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: '#8c7f6a' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fontFamily: 'DM Sans', fill: '#8c7f6a' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="completions" name="Check-ins" radius={[6, 6, 0, 0]}>
              {weekData.map((entry, index) => (
                <Cell key={index} fill={entry.completions > 0 ? '#52796f' : '#e8e4db'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly line chart */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-6">Evolução mensal</h2>
          {monthlyData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-ink-300 dark:text-ink-600 text-sm font-body">
              Sem dados suficientes ainda
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4db" />
                <XAxis dataKey="mês" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#8c7f6a' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#8c7f6a' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#52796f" strokeWidth={2.5}
                      dot={{ fill: '#52796f', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart — top habits */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-6">Top hábitos</h2>
          {pieData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-ink-300 dark:text-ink-600 text-sm font-body">
              Complete hábitos para ver aqui
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                     dataKey="value" nameKey="name" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} check-ins`]} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, fontFamily: 'DM Sans', color: '#5e5140' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* GitHub-style calendar */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">Calendário de hábitos</h2>
        <HabitCalendar data={stats?.calendar_data || []} months={6} />
      </div>

      {/* Habits ranking */}
      {habits.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-5">Ranking de hábitos</h2>
          <div className="space-y-3">
            {[...habits].sort((a, b) => (b.total_completions || 0) - (a.total_completions || 0)).map((h, i) => {
              const maxC = Math.max(...habits.map(x => x.total_completions || 0), 1);
              const pct = Math.round(((h.total_completions || 0) / maxC) * 100);
              return (
                <div key={h.id} className="flex items-center gap-4">
                  <span className="w-6 text-sm font-mono text-ink-400 dark:text-ink-500 text-right">#{i+1}</span>
                  <span className="text-xl">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-body font-medium text-ink-800 dark:text-ink-200 truncate">{h.title}</span>
                      <span className="text-xs font-mono text-ink-500 dark:text-ink-400 ml-2 flex-shrink-0">{h.total_completions || 0}×</span>
                    </div>
                    <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                           style={{ width: `${pct}%`, backgroundColor: h.color || '#52796f' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
