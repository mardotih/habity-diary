function HabitCalendar({ data, months = 6 }) {
  if (!data || data.length === 0) return null;

  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const dateMap = {};
  data.forEach(d => { dateMap[d.completed_date?.split('T')[0]] = parseInt(d.count) || 0; });

  const weeks = [];
  let cursor = new Date(startDate);
  while (cursor <= today) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const key = cursor.toISOString().split('T')[0];
      week.push({ date: key, count: dateMap[key] || 0, isFuture: cursor > today });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const maxCount = Math.max(...Object.values(dateMap), 1);

  const getIntensity = (count) => {
    if (count === 0) return '';
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 'bg-sage-200 dark:bg-sage-900';
    if (ratio <= 0.5) return 'bg-sage-400 dark:bg-sage-700';
    if (ratio <= 0.75) return 'bg-sage-600 dark:bg-sage-500';
    return 'bg-sage-800 dark:bg-sage-300';
  };

  const monthLabels = [];
  let lastMonth = '';
  weeks.forEach((week, wi) => {
    const midDate = week[3]?.date;
    if (midDate) {
      const m = new Date(midDate).toLocaleDateString('pt-PT', { month: 'short' });
      if (m !== lastMonth) {
        monthLabels.push({ label: m, week: wi });
        lastMonth = m;
      }
    }
  });

  const dayLabels = ['Seg', 'Qua', 'Sex'];

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex flex-col gap-1">
        <div className="flex gap-0.5 ml-8">
          {monthLabels.map((ml, i) => {
            const nextWeek = monthLabels[i + 1]?.week || weeks.length;
            return (
              <div key={ml.label}
                className="text-[10px] text-ink-400 dark:text-ink-500 font-body font-medium"
                style={{ width: `${(nextWeek - ml.week) * 14}px`, minWidth: 28 }}>
                {ml.label}
              </div>
            );
          })}
        </div>
        <div className="flex gap-0.5">
          <div className="flex flex-col gap-0.5 mr-1 justify-around py-0.5">
            {dayLabels.map(d => (
              <span key={d} className="text-[10px] text-ink-400 dark:text-ink-500 font-body h-[14px] leading-[14px]">{d}</span>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map(day => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} check-ins`}
                  className={`w-[14px] h-[14px] rounded-[3px] transition-colors duration-200 ${getIntensity(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-8 mt-1">
          <span className="text-[10px] text-ink-400 dark:text-ink-500 font-body">Menos</span>
          {['', 'bg-sage-200 dark:bg-sage-900', 'bg-sage-400 dark:bg-sage-700', 'bg-sage-600 dark:bg-sage-500', 'bg-sage-800 dark:bg-sage-300'].map(cls => (
            <div key={cls} className={`w-[12px] h-[12px] rounded-[2px] ${cls || 'bg-ink-100 dark:bg-ink-800'}`} />
          ))}
          <span className="text-[10px] text-ink-400 dark:text-ink-500 font-body">Mais</span>
        </div>
      </div>
    </div>
  );
}

export default HabitCalendar;
