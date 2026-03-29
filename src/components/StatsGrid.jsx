import React, { useMemo } from 'react';
import { calcStatValue, calculateConsistency } from '../utils/stats';

export default function StatsGrid({ statsConfig, solves, onCustomize, isDark }) {
  const totalArea = useMemo(
    () => statsConfig.reduce((acc, block) => acc + ((block.colSpan || 1) * (block.rowSpan || 1)), 0),
    [statsConfig]
  );
  const statsRowsNeeded = Math.max(1, Math.ceil(totalArea / 2));

  const consistency = useMemo(() => calculateConsistency(solves), [solves]);

  return (
    <>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-30">
        <button
          onClick={onCustomize}
          className="bg-success text-black text-xs font-bold px-3 py-1.5 rounded glow-green transition-all shadow-lg"
        >
          Customize Stats
        </button>
      </div>
      <div
        className="grid gap-2 h-full w-full p-3"
        style={{
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gridTemplateRows: `repeat(${statsRowsNeeded}, minmax(0, 1fr))`,
        }}
      >
        {statsConfig.map(block => (
          <div
            key={block.id}
            className={`rounded-lg p-3 flex flex-col justify-between overflow-hidden ${isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`}
            style={{
              gridColumn: `span ${block.colSpan || 1}`,
              gridRow: `span ${block.rowSpan || 1}`,
            }}
          >
            <span className="text-[13px] font-bold text-gray-400 leading-none mb-1">{block.label}</span>
            <div className={`w-full flex-1 flex items-center justify-center font-bold leading-none ${isDark ? 'text-white' : 'text-gray-900'} ${block.rowSpan > 1 ? 'text-[48px]' : 'text-[26px]'}`}>
              {calcStatValue(block, solves)}
            </div>
          </div>
        ))}
        {consistency !== null && (
          <div className={`rounded-lg p-3 flex flex-col justify-between overflow-hidden ${isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`}>
            <span className="text-[13px] font-bold text-gray-400 leading-none mb-1">consistency</span>
            <div className={`w-full flex-1 flex items-center justify-center font-bold leading-none text-[26px] ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {consistency}%
            </div>
          </div>
        )}
      </div>
    </>
  );
}
