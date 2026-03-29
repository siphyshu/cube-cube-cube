export function formatTime(ms, penalty = '') {
  if (penalty === 'DNF') return 'DNF';
  let actualMs = ms;
  if (penalty === '+2') actualMs += 2000;
  if (actualMs < 0) return '0.00';
  const totalSeconds = Math.floor(actualMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const decimals = Math.floor((actualMs % 1000) / 10);
  let timeStr = '';
  if (minutes > 0) {
    timeStr = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${decimals.toString().padStart(2, '0')}`;
  } else {
    timeStr = `${remainingSeconds}.${decimals.toString().padStart(2, '0')}`;
  }
  if (penalty === '+2') timeStr += '+';
  return timeStr;
}

export function getActualTime(solve) {
  if (solve.penalty === 'DNF') return Infinity;
  if (solve.penalty === '+2') return solve.time + 2000;
  return solve.time;
}
