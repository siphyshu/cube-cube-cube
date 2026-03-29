import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';

import { useLocalStorage } from './hooks/useLocalStorage';
import { useTimer } from './hooks/useTimer';
import { useTheme } from './hooks/useTheme';
import { useSessions } from './hooks/useSessions';
import { useSolves } from './hooks/useSolves';

import { generateScramble, getScrambledState } from './utils/scramble';
import { getActualTime, formatTime } from './utils/formatting';
import { playTimerClick, playPbSound } from './utils/sounds';

import { DEFAULT_STATS_CONFIG, PANEL_OPTIONS, PUZZLE_TYPES } from './constants/defaults';

import Header from './components/Header';
import Timer from './components/Timer';
import ScrambleBar from './components/ScrambleBar';
import CubeVisualization from './components/CubeVisualization';
import SolvesList from './components/SolvesList';
import StatsGrid from './components/StatsGrid';
import StatsModal from './components/StatsModal';
import TimeGraph from './components/TimeGraph';
import Histogram from './components/Histogram';
import Progress from './components/Progress';
import PanelContainer from './components/PanelContainer';
import ShortcutsModal from './components/ShortcutsModal';

export default function App() {
  const { isDark, toggleTheme } = useTheme();

  // Sessions
  const {
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    renameSession,
    deleteSession,
    setSessionPuzzleType,
    sessionList,
  } = useSessions();

  const puzzleType = activeSession?.puzzleType || '3x3';

  // Solves — use session-keyed storage
  const storageKey = `cuboid-solves-${activeSessionId}`;
  const {
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
  } = useSolves(storageKey);

  // Stats config
  const [statsConfig, setStatsConfig] = useLocalStorage('cuboid-stats', DEFAULT_STATS_CONFIG);
  const [panels, setPanels] = useLocalStorage('cuboid-panels', ['Solves', 'Stats', 'Scramble']);
  const [scrambleMode, setScrambleMode] = useLocalStorage('cuboid-scramble-mode', true);
  const [showArrows, setShowArrows] = useLocalStorage('cuboid-show-arrows', false);
  const [isLocked, setIsLocked] = useLocalStorage('cuboid-is-locked', false);
  const [scramble, setScramble] = useLocalStorage('cuboid-current-scramble', '', { raw: true });
  const [inspectionEnabled, setInspectionEnabled] = useLocalStorage('cuboid-inspection', false);
  const [soundEnabled, setSoundEnabled] = useLocalStorage('cuboid-sound', false);

  // UI state
  const [cubeState, setCubeState] = useState(null);
  const [showPbBadge, setShowPbBadge] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const pbBadgeTimer = useRef(null);

  useEffect(() => {
    if (showPbBadge) {
      clearTimeout(pbBadgeTimer.current);
      pbBadgeTimer.current = setTimeout(() => setShowPbBadge(false), 2850);
    }
    return () => clearTimeout(pbBadgeTimer.current);
  }, [showPbBadge]);

  // Handle solve completion
  const handleSolveComplete = useCallback((finalTime, inspectionPenalty) => {
    const { isPb } = addSolve(finalTime, inspectionPenalty, scramble, scrambleMode);

    if (isPb) {
      setShowPbBadge(true);
      if (soundEnabled) playPbSound();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#246bfd', '#ffffff'],
      });
    } else {
      setShowPbBadge(false);
    }

    if (soundEnabled) playTimerClick();

    if (!isLocked && scrambleMode) {
      const next = generateScramble(puzzleType);
      setScramble(next);
      setCubeState(getScrambledState(next, puzzleType));
    }
  }, [addSolve, scramble, isLocked, scrambleMode, puzzleType, setScramble, soundEnabled]);

  // Timer
  const {
    timerState,
    timeMs,
    inspectionTime,
    setTimeMs,
    primeTimer,
    releasePrime,
    stopTimer,
    cancelTimer,
    handleInspectionRelease,
  } = useTimer({
    inspectionEnabled,
    soundEnabled,
    onSolveComplete: handleSolveComplete,
  });

  // Scramble effects
  useEffect(() => {
    if (scrambleMode && scramble === '') setScramble(generateScramble(puzzleType));
  }, []);

  useEffect(() => {
    if (scrambleMode && scramble) setCubeState(getScrambledState(scramble, puzzleType));
    else setCubeState(null);
  }, [scramble, scrambleMode, puzzleType]);

  const toggleScrambleMode = useCallback(() => {
    if (!scrambleMode) {
      const next = generateScramble(puzzleType);
      setScramble(next);
      setScrambleMode(true);
    } else {
      setScramble('');
      setScrambleMode(false);
    }
  }, [scrambleMode, puzzleType, setScramble, setScrambleMode]);

  const handleNewScramble = useCallback(() => {
    setScramble(generateScramble(puzzleType));
  }, [puzzleType, setScramble]);

  const handlePuzzleTypeChange = useCallback((newType) => {
    setSessionPuzzleType(newType);
    if (scrambleMode) {
      const next = generateScramble(newType);
      setScramble(next);
      setCubeState(getScrambledState(next, newType));
    }
  }, [scrambleMode, setScramble, setSessionPuzzleType]);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    if (isModalOpen || showShortcuts) return;
    e.preventDefault();
    if (timerState === 'idle') { primeTimer(); setShowPbBadge(false); }
    else if (timerState === 'running') stopTimer();
    else if (timerState === 'inspecting') { /* ready to start during inspection on release */ }
  }, [timerState, primeTimer, stopTimer, isModalOpen, showShortcuts]);

  const handleTouchEnd = useCallback((e) => {
    if (isModalOpen || showShortcuts) return;
    e.preventDefault();
    if (timerState === 'ready') releasePrime();
    else if (timerState === 'inspecting') handleInspectionRelease();
  }, [timerState, releasePrime, handleInspectionRelease, isModalOpen, showShortcuts]);

  // Keyboard handler
  useEffect(() => {
    if (isModalOpen || showShortcuts) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (e.repeat) return;
        if (timerState === 'idle') { primeTimer(); setShowPbBadge(false); }
        else if (timerState === 'running') stopTimer();
      } else if (e.code === 'Escape') {
        if (timerState === 'running' || timerState === 'inspecting') cancelTimer();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (timerState === 'idle' && solves.length > 0) deleteSolve(solves[0].id);
      } else if (e.key === '1' && timerState === 'idle' && solves.length > 0) {
        if (solves[0].penalty) togglePenalty(solves[0].id, solves[0].penalty);
      } else if (e.key === '2' && timerState === 'idle' && solves.length > 0) {
        togglePenalty(solves[0].id, '+2');
      } else if (e.key === '3' && timerState === 'idle' && solves.length > 0) {
        togglePenalty(solves[0].id, 'DNF');
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        setShowShortcuts(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (timerState === 'ready') releasePrime();
        else if (timerState === 'inspecting') handleInspectionRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [timerState, primeTimer, releasePrime, stopTimer, cancelTimer, handleInspectionRelease, isModalOpen, showShortcuts, solves, deleteSolve, togglePenalty]);

  // Panel rendering
  const renderPanelContent = (type) => {
    const validGraphSolves = [...solves].reverse().filter(s => getActualTime(s) !== Infinity);

    switch (type) {
      case 'Solves':
        return (
          <SolvesList
            solves={solves}
            togglePenalty={togglePenalty}
            deleteSolve={deleteSolve}
            updateComment={updateComment}
            duplicateCount={duplicateCount}
            removeDuplicates={removeDuplicates}
            isDark={isDark}
          />
        );
      case 'Stats':
        return (
          <StatsGrid
            statsConfig={statsConfig}
            solves={solves}
            onCustomize={() => setIsModalOpen(true)}
            isDark={isDark}
          />
        );
      case 'Scramble':
        return (
          <CubeVisualization
            cubeState={cubeState}
            puzzleSize={PUZZLE_TYPES[puzzleType]?.size || 3}
          />
        );
      case 'Time Graph':
        if (validGraphSolves.length < 2) {
          return <div className="w-full h-full flex items-center justify-center opacity-50 text-sm">Need at least 2 valid solves</div>;
        }
        return (
          <div className="w-full h-full flex flex-col" style={{ padding: '12px 10px 8px' }}>
            <div className="flex-1 w-full relative" style={{ minHeight: 0 }}>
              <TimeGraph solves={validGraphSolves} isDark={isDark} />
            </div>
            <div className="flex gap-5 justify-center pt-1.5" style={{ flexShrink: 0 }}>
              <div className="flex items-center gap-1.5">
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#246bfd', boxShadow: '0 0 6px rgba(36,107,253,0.5)' }} />
                <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Solves</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div style={{ width: 14, height: 2, borderRadius: 1, background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.4)' }} />
                <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>Ao5</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div style={{ width: 12, height: 8, borderRadius: 2, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }} />
                <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>&plusmn;1&sigma;</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
                <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>PB</span>
              </div>
            </div>
          </div>
        );
      case 'Histogram':
        return <Histogram solves={validGraphSolves} isDark={isDark} />;
      case 'Progress':
        return <Progress solves={solves} isDark={isDark} />;
      case 'None':
        return <div className="w-full h-full flex items-center justify-center opacity-30 text-sm">Empty Panel</div>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans overflow-x-hidden relative ${isDark ? 'bg-bg' : 'bg-bg-light'}`}>
      <Header
        puzzleType={puzzleType}
        onPuzzleTypeChange={handlePuzzleTypeChange}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onShowShortcuts={() => setShowShortcuts(true)}
        sessionList={sessionList}
        activeSessionId={activeSessionId}
        onSessionSelect={setActiveSessionId}
        onSessionCreate={(name) => createSession(name, puzzleType)}
        onSessionRename={renameSession}
        onSessionDelete={deleteSession}
        inspectionEnabled={inspectionEnabled}
        onToggleInspection={() => setInspectionEnabled(prev => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
      />

      <main className="flex-1 flex flex-col items-center justify-center py-4 px-4 min-h-[35vh]">
        <ScrambleBar
          scramble={scramble}
          scrambleMode={scrambleMode}
          showArrows={showArrows}
          isLocked={isLocked}
          cloudStatus={cloudStatus}
          onToggleScrambleMode={toggleScrambleMode}
          onToggleArrows={() => setShowArrows(prev => !prev)}
          onToggleLock={() => setIsLocked(prev => !prev)}
          onCopy={() => {}}
          onNewScramble={handleNewScramble}
        />

        <Timer
          timerState={timerState}
          timeMs={timeMs}
          inspectionTime={inspectionTime}
          solves={solves}
          showPbBadge={showPbBadge}
          puzzleType={puzzleType}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          isDark={isDark}
        />
      </main>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 p-4 lg:p-6 bg-transparent w-full max-w-[1400px] mx-auto mt-auto">
        {panels.map((panelType, index) => (
          <PanelContainer
            key={`${panelType}-${index}`}
            panelType={panelType}
            panelOptions={PANEL_OPTIONS}
            onPanelChange={(newVal) => {
              if (newVal === 'Export CSV') handleExportCSV();
              else if (newVal === 'Import CSV') handleImportCSV();
              else {
                const p = [...panels];
                p[index] = newVal;
                setPanels(p);
              }
            }}
            isDark={isDark}
          >
            {renderPanelContent(panelType)}
          </PanelContainer>
        ))}
      </div>

      {isModalOpen && (
        <StatsModal
          statsConfig={statsConfig}
          setStatsConfig={setStatsConfig}
          selectedBlockId={selectedBlockId}
          setSelectedBlockId={setSelectedBlockId}
          solves={solves}
          onClose={() => setIsModalOpen(false)}
          isDark={isDark}
        />
      )}

      {showShortcuts && (
        <ShortcutsModal
          onClose={() => setShowShortcuts(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
