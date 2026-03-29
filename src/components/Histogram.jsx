import React, { useRef, useEffect, useMemo } from 'react';
import { Chart } from 'chart.js/auto';
import { getActualTime } from '../utils/formatting';

export default function Histogram({ solves, isDark }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const validTimes = useMemo(() =>
    solves.map(s => getActualTime(s) / 1000).filter(t => t !== Infinity),
    [solves]
  );

  useEffect(() => {
    if (!chartRef.current || validTimes.length < 2) return;
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) chartInstance.current.destroy();

    const min = Math.floor(Math.min(...validTimes));
    const max = Math.ceil(Math.max(...validTimes));
    const bucketSize = Math.max(1, Math.ceil((max - min) / 15));
    const buckets = {};

    for (let i = min; i <= max; i += bucketSize) {
      buckets[i] = 0;
    }

    validTimes.forEach(t => {
      const bucket = Math.floor((t - min) / bucketSize) * bucketSize + min;
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    });

    const best = Math.min(...validTimes);
    const bestBucket = Math.floor((best - min) / bucketSize) * bucketSize + min;

    const labels = Object.keys(buckets).map(Number).sort((a, b) => a - b);
    const data = labels.map(l => buckets[l]);
    const colors = labels.map(l => l === bestBucket ? 'rgba(34, 197, 94, 0.7)' : 'rgba(36, 107, 253, 0.5)');
    const borderColors = labels.map(l => l === bestBucket ? '#22c55e' : '#246bfd');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(l => `${l}s`),
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? 'rgba(12,13,20,0.95)' : 'rgba(255,255,255,0.95)',
            titleColor: isDark ? '#fff' : '#1a1a2e',
            bodyColor: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderWidth: 1,
            callbacks: {
              title: (items) => `${items[0].label} - ${parseInt(items[0].label) + bucketSize}s`,
              label: (item) => `${item.raw} solve${item.raw !== 1 ? 's' : ''}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', font: { family: 'Roboto Mono', size: 9 } },
            border: { display: false },
          },
          y: {
            grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' },
            ticks: { color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)', font: { family: 'Roboto Mono', size: 10 }, stepSize: 1 },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [validTimes, isDark]);

  if (validTimes.length < 2) {
    return <div className="w-full h-full flex items-center justify-center opacity-50 text-sm">Need at least 2 solves</div>;
  }

  return (
    <div className="w-full h-full p-3">
      <canvas ref={chartRef} className="w-full h-full" />
    </div>
  );
}
