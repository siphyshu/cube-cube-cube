import React from 'react';
import { formatTime } from '../utils/formatting';

export default function Timer({
  timerState,
  timeMs,
  inspectionTime,
  solves,
  showPbBadge,
  puzzleType,
  onTouchStart,
  onTouchEnd,
  isDark,
}) {
  const timerColor =
    timerState === 'ready' ? 'text-green-500' :
    timerState === 'inspecting' ? (
      inspectionTime <= 3 ? 'text-red-500' :
      inspectionTime <= 8 ? 'text-yellow-500' :
      'text-yellow-300'
    ) : isDark ? 'text-white' : 'text-gray-900';

  const displayValue = () => {
    if (timerState === 'inspecting') {
      return inspectionTime <= 0 ? '+2' : inspectionTime;
    }
    if (timerState === 'idle' && solves.length > 0 && timeMs === solves[0].time) {
      return formatTime(solves[0].time, solves[0].penalty);
    }
    return formatTime(timeMs);
  };

  return (
    <div className="relative group">
      <div className="h-8 mb-2 flex justify-center items-center">
        {showPbBadge && (
          <span key={Date.now()} className="pb-badge bg-[#00ba55] text-white text-sm font-semibold px-4 py-1.5 rounded shadow-[0_0_20px_rgba(0,186,85,0.4)]">
            New {puzzleType} Single PB!
          </span>
        )}
      </div>

      <div
        className={`font-mono text-[80px] sm:text-[110px] md:text-[130px] lg:text-[160px] leading-none font-medium mb-8 sm:mb-12 transition-colors duration-100 ${timerColor} tabular-nums tracking-tight cursor-pointer select-none`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {displayValue()}
      </div>

      {timerState === 'idle' && (
        <div className="md:block absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Press and hold space to prime timer
        </div>
      )}
    </div>
  );
}
