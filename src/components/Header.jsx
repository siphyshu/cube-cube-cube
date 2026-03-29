import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Keyboard } from 'lucide-react';
import { CubeIcon, CaretDown } from './icons';
import { PUZZLE_TYPES } from '../constants/defaults';
import SessionSelector from './SessionSelector';

export default function Header({
  puzzleType,
  onPuzzleTypeChange,
  isDark,
  onToggleTheme,
  onShowShortcuts,
  sessionList,
  activeSessionId,
  onSessionSelect,
  onSessionCreate,
  onSessionRename,
  onSessionDelete,
  inspectionEnabled,
  onToggleInspection,
  soundEnabled,
  onToggleSound,
}) {
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const puzzleRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (puzzleRef.current && !puzzleRef.current.contains(e.target)) setPuzzleOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const puzzleTypes = Object.keys(PUZZLE_TYPES);

  return (
    <header className="flex flex-wrap items-center justify-between p-4 gap-2 relative z-10">
      <div className="flex items-center gap-3">
        {/* Puzzle type selector */}
        <div className="relative" ref={puzzleRef}>
          <button
            onClick={() => setPuzzleOpen(!puzzleOpen)}
            className={`flex gap-2 font-bold text-lg items-center opacity-80 hover:opacity-100 transition-opacity ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <CubeIcon />
            <span>{puzzleType}</span>
            <CaretDown />
          </button>
          {puzzleOpen && (
            <div className={`absolute top-full left-0 mt-1 w-32 rounded-lg shadow-xl overflow-hidden py-1 z-50 border ${isDark ? 'bg-[#181b25] border-white/10' : 'bg-white border-gray-200'}`}>
              {puzzleTypes.map(pt => (
                <button
                  key={pt}
                  onClick={() => { onPuzzleTypeChange(pt); setPuzzleOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                    pt === puzzleType
                      ? 'text-primary font-bold'
                      : isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Session selector */}
        <SessionSelector
          sessionList={sessionList}
          activeSessionId={activeSessionId}
          onSelect={onSessionSelect}
          onCreate={onSessionCreate}
          onRename={onSessionRename}
          onDelete={onSessionDelete}
          isDark={isDark}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Settings dropdown */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'}`}
            title="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
          {settingsOpen && (
            <div className={`absolute top-full right-0 mt-1 w-52 rounded-lg shadow-xl overflow-hidden py-1 z-50 border ${isDark ? 'bg-[#181b25] border-white/10' : 'bg-white border-gray-200'}`}>
              <button
                onClick={onToggleInspection}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>Inspection (15s)</span>
                <span className={`text-xs font-bold ${inspectionEnabled ? 'text-success' : 'text-gray-500'}`}>
                  {inspectionEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
              <button
                onClick={onToggleSound}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>Sounds</span>
                <span className={`text-xs font-bold ${soundEnabled ? 'text-success' : 'text-gray-500'}`}>
                  {soundEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Shortcuts button */}
        <button
          onClick={onShowShortcuts}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'}`}
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard size={18} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'}`}
          title="Toggle Theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
