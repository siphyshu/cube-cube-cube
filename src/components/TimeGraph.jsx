import React, { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { getActualTime } from '../utils/formatting';

export default function TimeGraph({ solves, isDark }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    const times = solves.map(s => getActualTime(s) / 1000);
    const labels = solves.map((_, i) => `${i + 1}`);

    const calcAo5 = (arr, idx) => {
      if (idx < 4) return null;
      const w = arr.slice(idx - 4, idx + 1);
      const sorted = [...w].sort((a, b) => a - b);
      const trimmed = sorted.slice(1, -1);
      return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    };

    const calcStdDev = (arr, idx) => {
      if (idx < 4) return null;
      const w = arr.slice(idx - 4, idx + 1);
      const mean = w.reduce((a, b) => a + b, 0) / w.length;
      const variance = w.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / w.length;
      return Math.sqrt(variance);
    };

    const ao5 = times.map((_, i) => calcAo5(times, i));
    const bandUpper = times.map((_, i) => {
      const sd = calcStdDev(times, i);
      const a = ao5[i];
      return (sd !== null && a !== null) ? a + sd : null;
    });
    const bandLower = times.map((_, i) => {
      const sd = calcStdDev(times, i);
      const a = ao5[i];
      return (sd !== null && a !== null) ? a - sd : null;
    });
    const bestIdx = times.indexOf(Math.min(...times));
    const fmtAxis = (sec) => Math.round(sec) + 's';
    const fmtMin = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      const sFixed = s.toFixed(2);
      return m > 0 ? m + ':' + sFixed.padStart(5, '0') : sFixed;
    };

    if (chartInstance.current) chartInstance.current.destroy();

    const h = canvas.parentElement.clientHeight || 240;
    const solveGrad = ctx.createLinearGradient(0, 0, 0, h);
    solveGrad.addColorStop(0, 'rgba(36, 107, 253, 0.12)');
    solveGrad.addColorStop(0.5, 'rgba(36, 107, 253, 0.03)');
    solveGrad.addColorStop(1, 'rgba(36, 107, 253, 0)');

    const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
    const tickColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
    const xTickColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)';

    const crosshairPlugin = {
      id: 'crosshair',
      afterDraw(chart) {
        const tt = chart.tooltip;
        if (!tt || !tt.getActiveElements().length) return;
        const x = tt.getActiveElements()[0].element.x;
        const yAxis = chart.scales.y;
        const c = chart.ctx;
        c.save();
        c.beginPath();
        c.setLineDash([3, 4]);
        c.moveTo(x, yAxis.top);
        c.lineTo(x, yAxis.bottom);
        c.lineWidth = 1;
        c.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        c.stroke();
        c.restore();
      },
    };

    const pointBg = times.map((_, i) => i === bestIdx ? '#22c55e' : (isDark ? '#181b25' : '#ffffff'));
    const pointBorder = times.map((_, i) => i === bestIdx ? '#22c55e' : '#246bfd');
    const pointSize = times.map((_, i) => i === bestIdx ? 5 : 3);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      plugins: [crosshairPlugin],
      data: {
        labels,
        datasets: [
          { label: '_bandUpper', data: bandUpper, borderColor: 'transparent', backgroundColor: 'transparent', pointRadius: 0, pointHitRadius: 0, fill: false, tension: 0.4, order: 5 },
          { label: '_bandLower', data: bandLower, borderColor: 'rgba(34, 197, 94, 0.15)', borderWidth: 1, backgroundColor: 'rgba(34, 197, 94, 0.06)', pointRadius: 0, pointHitRadius: 0, fill: '-1', tension: 0.4, order: 4 },
          { label: 'Ao5', data: ao5, borderColor: '#22c55e', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: '#22c55e', pointHoverBorderColor: 'rgba(34,197,94,0.25)', pointHoverBorderWidth: 6, fill: false, tension: 0.4, order: 2, borderCapStyle: 'round', borderJoinStyle: 'round' },
          { label: 'Solve', data: times, borderColor: '#246bfd', backgroundColor: solveGrad, borderWidth: 2, pointBackgroundColor: pointBg, pointBorderColor: pointBorder, pointBorderWidth: 2, pointRadius: pointSize, pointHoverRadius: 6, pointHoverBackgroundColor: '#246bfd', pointHoverBorderColor: 'rgba(36,107,253,0.25)', pointHoverBorderWidth: 8, fill: true, tension: 0.3, order: 1, borderCapStyle: 'round', borderJoinStyle: 'round' },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 6, right: 6, bottom: 0, left: 0 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: function(context) {
              let tooltipEl = document.getElementById('chartjs-tooltip-cuboid');
              if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip-cuboid';
                tooltipEl.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;transition:opacity 0.15s ease,transform 0.15s ease;opacity:0;transform:translateY(4px);';
                document.body.appendChild(tooltipEl);
              }
              const tooltip = context.tooltip;
              if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = '0';
                tooltipEl.style.transform = 'translateY(4px)';
                return;
              }
              const idx = tooltip.dataPoints[0].dataIndex;
              const time = times[idx];
              const a5 = ao5[idx];
              const sd = calcStdDev(times, idx);
              const isPB = idx === bestIdx;

              const bgColor = isDark ? 'rgba(12,13,20,0.95)' : 'rgba(255,255,255,0.95)';
              const borderCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
              const textColor = isDark ? '#fff' : '#1a1a2e';
              const subColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';

              let html = `<div style="background:${bgColor};border:1px solid ${borderCol};border-radius:10px;padding:10px 14px;backdrop-filter:blur(12px);min-width:130px;">`;
              html += `<div style="font-family:Inter,sans-serif;font-size:10px;font-weight:600;color:${subColor};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Solve #${labels[idx]}${isPB ? ' <span style="color:#22c55e;">★ PB</span>' : ''}</div>`;
              html += `<div style="display:flex;align-items:baseline;gap:4px;margin-bottom:${a5 !== null ? '5' : '0'}px;"><span style="font-family:'Roboto Mono',monospace;font-size:18px;font-weight:700;color:${textColor};">${fmtMin(time)}</span></div>`;
              if (a5 !== null) {
                html += '<div style="display:flex;justify-content:space-between;gap:12px;">';
                html += `<div style="font-family:'Roboto Mono',monospace;font-size:11px;color:#22c55e;">ao5 ${fmtMin(a5)}</div>`;
                if (sd !== null) html += `<div style="font-family:'Roboto Mono',monospace;font-size:11px;color:${subColor};">±${sd.toFixed(1)}s</div>`;
                html += '</div>';
              }
              html += '</div>';
              tooltipEl.innerHTML = html;
              tooltipEl.style.opacity = '1';
              tooltipEl.style.transform = 'translateY(0)';
              const canvasRect = context.chart.canvas.getBoundingClientRect();
              let left = canvasRect.left + tooltip.caretX + 12;
              let top = canvasRect.top + tooltip.caretY - 30;
              const tipRect = tooltipEl.getBoundingClientRect();
              if (left + tipRect.width > window.innerWidth - 8) left = canvasRect.left + tooltip.caretX - tipRect.width - 12;
              if (top < 8) top = 8;
              tooltipEl.style.left = left + 'px';
              tooltipEl.style.top = top + 'px';
            },
          },
        },
        scales: {
          x: { display: true, grid: { display: false }, ticks: { color: xTickColor, font: { family: 'Roboto Mono', size: 9 }, maxTicksLimit: 10, padding: 4 }, border: { display: false } },
          y: { grid: { color: gridColor, drawTicks: false }, ticks: { color: tickColor, font: { family: 'Roboto Mono', size: 10 }, maxTicksLimit: 5, callback: function(v) { return fmtAxis(v); }, padding: 8 }, border: { display: false } },
        },
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 600, easing: 'easeOutQuart' },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
      const tip = document.getElementById('chartjs-tooltip-cuboid');
      if (tip) { tip.style.opacity = '0'; tip.remove(); }
    };
  }, [solves, isDark]);

  return <canvas ref={chartRef} className="w-full h-full" />;
}
