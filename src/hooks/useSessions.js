import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { makeId } from '../utils/ids';

export function useSessions() {
  const [sessions, setSessions] = useLocalStorage('cuboid-sessions', {
    default: {
      id: 'default',
      name: 'Default',
      puzzleType: '3x3',
      createdAt: Date.now(),
    },
  });

  const [activeSessionId, setActiveSessionId] = useLocalStorage('cuboid-active-session', 'default');

  const activeSession = useMemo(() => {
    return sessions[activeSessionId] || sessions['default'] || Object.values(sessions)[0];
  }, [sessions, activeSessionId]);

  const createSession = useCallback((name, puzzleType = '3x3') => {
    const id = makeId();
    setSessions(prev => ({
      ...prev,
      [id]: { id, name, puzzleType, createdAt: Date.now() },
    }));
    setActiveSessionId(id);
    return id;
  }, [setSessions, setActiveSessionId]);

  const renameSession = useCallback((id, newName) => {
    setSessions(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], name: newName } };
    });
  }, [setSessions]);

  const deleteSession = useCallback((id) => {
    if (id === 'default') return;
    setSessions(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (activeSessionId === id) setActiveSessionId('default');
    // Clean up localStorage for this session's solves
    try { localStorage.removeItem(`cuboid-solves-${id}`); } catch { /* */ }
  }, [setSessions, activeSessionId, setActiveSessionId]);

  const setSessionPuzzleType = useCallback((puzzleType) => {
    setSessions(prev => {
      const session = prev[activeSessionId];
      if (!session) return prev;
      return { ...prev, [activeSessionId]: { ...session, puzzleType } };
    });
  }, [setSessions, activeSessionId]);

  const sessionList = useMemo(() => {
    return Object.values(sessions).sort((a, b) => a.createdAt - b.createdAt);
  }, [sessions]);

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    renameSession,
    deleteSession,
    setSessionPuzzleType,
    sessionList,
  };
}
