import { useState, useCallback, useMemo, useEffect } from 'react';
import { makeId, solveFingerprint } from '../utils/ids';
import { getActualTime } from '../utils/formatting';
import {
  syncToSheets,
  deleteFromSheets,
  updatePenaltyOnSheets,
  fetchSheetsTimestamps,
  pushSolvesToSheets,
} from '../utils/sheetsSync';

function loadSolves(key) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    // Migrate old numeric IDs
    return parsed.map(s => ({
      ...s,
      id: (!s.id || typeof s.id === 'number') ? makeId() : s.id,
      timestamp: s.timestamp || (typeof s.id === 'number' ? Math.floor(s.id) : 0),
      comment: s.comment || '',
    }));
  } catch {
    return [];
  }
}

export function useSolves(sessionKey = 'cuboid-solves') {
  const [solves, setSolves] = useState(() => loadSolves(sessionKey));

  // Re-load when session key changes
  useEffect(() => {
    setSolves(loadSolves(sessionKey));
  }, [sessionKey]);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(sessionKey, JSON.stringify(solves));
    } catch { /* storage full */ }
  }, [sessionKey, solves]);

  const addSolve = useCallback((time, penalty, scramble, scrambleMode) => {
    const now = Date.now();
    const newSolve = {
      id: makeId(),
      time,
      penalty: penalty || '',
      scramble: scrambleMode ? scramble : 'No Scramble',
      timestamp: now,
      comment: '',
    };

    let isPb = false;
    setSolves(prev => {
      const validTimes = prev.map(getActualTime).filter(t => t !== Infinity);
      const actualNewTime = getActualTime(newSolve);
      if (actualNewTime !== Infinity && (validTimes.length === 0 || actualNewTime < Math.min(...validTimes))) {
        isPb = true;
      }
      return [newSolve, ...prev];
    });

    syncToSheets(newSolve);
    return { newSolve, isPb };
  }, []);

  const deleteSolve = useCallback((id) => {
    let timestampToDelete = null;
    setSolves(prev => {
      const target = prev.find(s => s.id === id);
      if (target) timestampToDelete = target.timestamp;
      return prev.filter(s => s.id !== id);
    });
    setTimeout(() => {
      if (timestampToDelete) deleteFromSheets(timestampToDelete);
    }, 0);
  }, []);

  const togglePenalty = useCallback((id, type) => {
    setSolves(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        return { ...s, penalty: s.penalty === type ? '' : type };
      });
      const updatedSolve = updated.find(s => s.id === id);
      if (updatedSolve?.timestamp) {
        updatePenaltyOnSheets(updatedSolve.timestamp, updatedSolve.penalty);
      }
      return updated;
    });
  }, []);

  const updateComment = useCallback((id, comment) => {
    setSolves(prev => prev.map(s => s.id === id ? { ...s, comment } : s));
  }, []);

  const removeDuplicates = useCallback(() => {
    setSolves(prev => {
      const seenTs = new Set();
      const seenFps = new Set();
      return prev.filter(s => {
        const tsKey = String(s.timestamp);
        const fp = solveFingerprint(s);
        if ((s.timestamp && seenTs.has(tsKey)) || seenFps.has(fp)) return false;
        if (s.timestamp) seenTs.add(tsKey);
        seenFps.add(fp);
        return true;
      });
    });
  }, []);

  const duplicateCount = useMemo(() => {
    const seenTs = new Set();
    const seenFps = new Set();
    let count = 0;
    solves.forEach(s => {
      const tsKey = String(s.timestamp);
      const fp = solveFingerprint(s);
      if ((s.timestamp && seenTs.has(tsKey)) || seenFps.has(fp)) { count++; return; }
      if (s.timestamp) seenTs.add(tsKey);
      seenFps.add(fp);
    });
    return count;
  }, [solves]);

  const handleExportCSV = useCallback(() => {
    if (solves.length === 0) return;
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Time (ms),Penalty,Scramble,Timestamp\n' +
      solves.map(s => `${s.time},${s.penalty},"${s.scramble}",${s.timestamp || ''}`).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `cuboid_solves_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [solves]);

  const handleImportCSV = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').slice(1);
        const importedSolves = lines.filter(line => line.trim()).map(line => {
          const parts = line.split(',');
          const time = parseInt(parts[0]?.trim());
          const penalty = parts[1]?.trim() || '';
          const scrambleMatch = line.match(/"([^"]*)"/);
          const scramble = scrambleMatch ? scrambleMatch[1] : parts[2]?.trim() || '';
          const lastField = parts[parts.length - 1]?.trim();
          const timestamp = lastField && /^\d{10,}$/.test(lastField) ? parseInt(lastField) : 0;
          if (!isNaN(time)) {
            return { id: makeId(), time, penalty, scramble, timestamp: timestamp || Date.now(), comment: '' };
          }
          return null;
        }).filter(Boolean);

        if (importedSolves.length === 0) return;

        setSolves(prev => {
          const existingTs = new Set(prev.map(s => String(s.timestamp)).filter(t => t !== '0'));
          const existingFps = new Set(prev.map(solveFingerprint));
          const toAdd = importedSolves.filter(imp => {
            if (imp.timestamp && existingTs.has(String(imp.timestamp))) return false;
            if (existingFps.has(solveFingerprint(imp))) return false;
            return true;
          });
          if (toAdd.length === 0) return prev;
          const merged = [...prev, ...toAdd];
          merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          return merged;
        });

        fetchSheetsTimestamps().then(sheetsTimestamps => {
          if (sheetsTimestamps === null) return;
          const solvesToPush = importedSolves.filter(s =>
            s.timestamp && !sheetsTimestamps.has(String(s.timestamp))
          );
          if (solvesToPush.length > 0) pushSolvesToSheets(solvesToPush);
        });
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return {
    solves,
    setSolves,
    addSolve,
    deleteSolve,
    togglePenalty,
    updateComment,
    removeDuplicates,
    duplicateCount,
    handleExportCSV,
    handleImportCSV,
  };
}
