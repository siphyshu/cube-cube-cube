import { formatTime, getActualTime } from './formatting';

export function calculateAverage(solves, count) {
  if (solves.length < count) return '-';
  const recent = solves.slice(0, count).map(getActualTime);
  const dnfs = recent.filter(t => t === Infinity).length;
  if (dnfs > 1) return 'DNF';
  recent.sort((a, b) => a - b);
  const trimmed = recent.slice(1, -1);
  if (trimmed.includes(Infinity)) return 'DNF';
  const sum = trimmed.reduce((acc, val) => acc + val, 0);
  return formatTime(sum / trimmed.length);
}

export function calculateMean(solves, count) {
  if (solves.length < count) return '-';
  const recent = solves.slice(0, count).map(getActualTime);
  if (recent.some(t => t === Infinity)) return 'DNF';
  const sum = recent.reduce((acc, val) => acc + val, 0);
  return formatTime(sum / recent.length);
}

export function calcStatValue(config, allSolves) {
  const validTimes = allSolves.map(getActualTime).filter(t => t !== Infinity);
  if (validTimes.length === 0) return allSolves.length > 0 ? 'DNF' : '-';

  if (config.type === 'Single') {
    if (config.result === 'Best') return formatTime(Math.min(...validTimes));
    if (config.result === 'Worst') return formatTime(Math.max(...validTimes));
  } else if (config.type === 'Mean') {
    if (!config.count) {
      return formatTime(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
    }
    if (config.result === 'Current') return calculateMean(allSolves, config.count);
    if (config.result === 'Best') {
      let bestMean = Infinity;
      for (let i = 0; i <= allSolves.length - config.count; i++) {
        const meanStr = calculateMean(allSolves.slice(i, i + config.count), config.count);
        if (meanStr !== 'DNF' && meanStr !== '-') {
          const meanNum = parseFloat(meanStr) * 1000;
          if (meanNum < bestMean) bestMean = meanNum;
        }
      }
      return bestMean === Infinity ? '-' : formatTime(bestMean);
    }
  } else {
    if (!config.count) {
      return formatTime(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
    }
    if (config.result === 'Current') return calculateAverage(allSolves, config.count);
    if (config.result === 'Best') {
      let bestAvg = Infinity;
      for (let i = 0; i <= allSolves.length - config.count; i++) {
        const avgStr = calculateAverage(allSolves.slice(i, i + config.count), config.count);
        if (avgStr !== 'DNF' && avgStr !== '-') {
          const avgNum = parseFloat(avgStr) * 1000;
          if (avgNum < bestAvg) bestAvg = avgNum;
        }
      }
      return bestAvg === Infinity ? '-' : formatTime(bestAvg);
    }
  }
  return '-';
}

export function calculateConsistency(solves, count = 12) {
  if (solves.length < count) return null;
  const recent = solves.slice(0, count).map(getActualTime).filter(t => t !== Infinity);
  if (recent.length < 3) return null;
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recent.length;
  const stddev = Math.sqrt(variance);
  return ((stddev / mean) * 100).toFixed(1);
}
