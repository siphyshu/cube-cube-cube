import React, { useState } from 'react';
import {
  BanIcon, NavigationIcon, CloudIcon, LockIcon, UnlockIcon,
  CopyIcon, RefreshIcon,
  ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowDownIcon,
  RotateCwIcon, RotateCcwIcon,
} from './icons';

function getMoveArrow(move, mod) {
  const base = move[0];
  const isPrime = mod === "'";
  const isDouble = mod === '2';

  let Arrow = null;
  if (base === 'U') Arrow = isPrime ? ArrowRightIcon : ArrowLeftIcon;
  if (base === 'D') Arrow = isPrime ? ArrowLeftIcon : ArrowRightIcon;
  if (base === 'R') Arrow = isPrime ? ArrowDownIcon : ArrowUpIcon;
  if (base === 'L') Arrow = isPrime ? ArrowUpIcon : ArrowDownIcon;
  if (base === 'F') Arrow = isPrime ? RotateCcwIcon : RotateCwIcon;
  if (base === 'B') Arrow = isPrime ? RotateCwIcon : RotateCcwIcon;

  if (isDouble) {
    if (base === 'U') Arrow = ArrowLeftIcon;
    if (base === 'D') Arrow = ArrowRightIcon;
    if (base === 'R') Arrow = ArrowUpIcon;
    if (base === 'L') Arrow = ArrowDownIcon;
    if (base === 'F') Arrow = RotateCwIcon;
    if (base === 'B') Arrow = RotateCcwIcon;
  }

  return { Arrow, isDouble };
}

export default function ScrambleBar({
  scramble,
  scrambleMode,
  showArrows,
  isLocked,
  cloudStatus,
  onToggleScrambleMode,
  onToggleArrows,
  onToggleLock,
  onCopy,
  onNewScramble,
}) {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopy = () => {
    if (!scramble) return;
    navigator.clipboard.writeText(scramble).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1000);
    }).catch(() => {});
  };

  return (
    <div className="text-center w-full max-w-4xl px-2">
      <div className="font-mono text-base md:text-[21px] leading-[1.6] tracking-wide mb-4 sm:mb-6 min-h-[80px] flex items-end justify-center font-medium">
        {scrambleMode ? (
          showArrows && scramble ? (
            <div className="flex flex-wrap justify-center items-end gap-y-2">
              {scramble.split(' ').map((move, i) => {
                if (!move) return null;
                const base = move[0];
                const mod = move.slice(1) || '';
                // Only show arrows for basic single-letter moves
                if (move.length > 2 || (move.length === 2 && !'\'2'.includes(move[1]))) {
                  return <span key={i} className="mx-1">{move}</span>;
                }
                const { Arrow, isDouble } = getMoveArrow(move, mod);
                return (
                  <div key={i} className="flex flex-col items-center mx-1 gap-1">
                    <span>{move}</span>
                    <div className="flex text-primary opacity-90 text-[18px]">
                      {Arrow && <Arrow />}
                      {isDouble && Arrow && <Arrow className="-ml-2" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <span>{scramble}</span>
        ) : null}
      </div>

      <div className="flex gap-4 sm:gap-6 justify-center text-gray-500 mb-4 sm:mb-8 flex-wrap transition-colors">
        <button
          onClick={onToggleScrambleMode}
          className={`transition-colors ${!scrambleMode ? 'text-red-500' : 'hover:text-white'}`}
          title={scrambleMode ? 'Turn Off Scramble' : 'Turn On Scramble'}
        >
          <BanIcon />
        </button>
        {scrambleMode && (
          <>
            <button
              onClick={onToggleArrows}
              className={`transition-colors ${showArrows ? 'text-primary' : 'hover:text-white'}`}
              title="Toggle Move Arrows"
            >
              <NavigationIcon className="w-[18px] h-[18px]" />
            </button>
            <CloudIcon style={{
              transition: 'color 0.2s, filter 0.2s',
              color: cloudStatus === 'success' ? '#22c55e' : cloudStatus === 'error' ? '#ef4444' : 'rgb(107,114,128)',
              filter: cloudStatus === 'success' ? 'drop-shadow(0 0 6px #22c55e)' : cloudStatus === 'error' ? 'drop-shadow(0 0 6px #ef4444)' : 'none',
              pointerEvents: 'none',
              flexShrink: 0,
            }} />
            <button
              onClick={onToggleLock}
              className={`transition-colors ${isLocked ? 'text-primary' : 'hover:text-white'}`}
              title="Lock Scramble"
            >
              {isLocked ? <LockIcon /> : <UnlockIcon />}
            </button>
            <button
              onClick={handleCopy}
              className={`transition-colors ${copyFeedback ? 'text-success' : 'hover:text-white'}`}
              title="Copy Scramble"
            >
              <CopyIcon />
            </button>
            <button onClick={onNewScramble} className="hover:text-white transition-colors" title="New Scramble">
              <RefreshIcon />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
