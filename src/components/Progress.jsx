import React, { useMemo } from 'react';
import { getActualTime, formatTime } from '../utils/formatting';

export default function Progress({ solves, isDark }) {
  const dailyData = useMemo(() => {
    if (solves.length === 0) return [];

    const days = {};
    solves.forEach(s => {
      if (!s.timestamp) return;
      const date = new Date(s.timestamp).toISOString().split('T')[0];
      if (!days[date]) days[date] = [];
      days[date].push(s);
    });

    return Object.entries(days)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 14)
      .map(([date, daySolves]) => {
        const times = daySolves.map(getActualTime).filter(t => t !== Infinity);
        const count = daySolves.length;
        const best = times.length > 0 ? Math.min(...times) : null;
        const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null;
        return { date, count, best, avg };
      });
  }, [solves]);

  const calendarData = useMemo(() => {
    const days = {};
    solves.forEach(s => {
      if (!s.timestamp) return;
      const date = new Date(s.timestamp).toISOString().split('T')[0];
      days[date] = (days[date] || 0) + 1;
    });

    const today = new Date();
    const weeks = [];
    for (let w = 0; w < 8; w++) {
      const week = [];
      for (let d = 6; d >= 0; d--) {
        const day = new Date(today);
        day.setDate(day.getDate() - (w * 7 + d));
        const dateStr = day.toISOString().split('T')[0];
        week.push({ date: dateStr, count: days[dateStr] || 0 });
      }
      weeks.push(week);
    }
    return weeks.reverse();
  }, [solves]);

  const maxCount = useMemo(() => {
    let max = 0;
    calendarData.forEach(week => week.forEach(d => { if (d.count > max) max = d.count; }));
    return max || 1;
  }, [calendarData]);

  if (solves.length === 0) {
    return <div className="w-full h-full flex items-center justify-center opacity-50 text-sm">No solves yet</div>;
  }

  return (
    <div className="w-full h-full p-3 overflow-y-auto no-scrollbar">
      {/* Calendar heatmap */}
      <div className="mb-3">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Last 8 weeks</span>
        <div className="flex gap-[3px] mt-1.5">
          {calendarData.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => {
                const intensity = day.count > 0 ? Math.max(0.15, day.count / maxCount) : 0;
                return (
                  <div
                    key={day.date}
                    className="rounded-sm"
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: day.count > 0
                        ? `rgba(34, 197, 94, ${intensity})`
                        : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    }}
                    title={`${day.date}: ${day.count} solve${day.count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="space-y-1">
        {dailyData.slice(0, 5).map(day => (
          <div key={day.date} className={`flex items-center justify-between text-xs py-1.5 px-2 rounded ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
            <span className="text-gray-400 font-mono w-20">{day.date.slice(5)}</span>
            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {day.count} solve{day.count !== 1 ? 's' : ''}
            </span>
            <span className="text-success font-mono text-[11px]">
              {day.best !== null ? `PB ${formatTime(day.best)}` : '-'}
            </span>
            <span className="text-gray-500 font-mono text-[11px]">
              {day.avg !== null ? `Avg ${formatTime(day.avg)}` : '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
