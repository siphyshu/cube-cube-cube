import React from 'react';
import { CloseIcon } from './icons';

const SHORTCUTS = [
  { key: 'Space', action: 'Hold to prime timer, release to start' },
  { key: 'Space', action: 'Press while running to stop timer' },
  { key: 'Escape', action: 'Cancel running timer' },
  { key: 'Delete', action: 'Delete last solve' },
  { key: '1', action: 'Remove penalty from last solve' },
  { key: '2', action: 'Toggle +2 on last solve' },
  { key: '3', action: 'Toggle DNF on last solve' },
  { key: '?', action: 'Show this shortcuts panel' },
];

export default function ShortcutsModal({ onClose, isDark }) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-xl border shadow-2xl p-6 slide-in ${isDark ? 'bg-[#12141c] border-white/10' : 'bg-white border-gray-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2"><CloseIcon /></button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
              <kbd className={`font-mono text-sm px-2 py-0.5 rounded border font-semibold ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-100 border-gray-200 text-gray-800'}`}>
                {s.key}
              </kbd>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{s.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
