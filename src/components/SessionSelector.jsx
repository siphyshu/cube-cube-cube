import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, CloseIcon } from './icons';

export default function SessionSelector({
  sessionList,
  activeSessionId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  isDark,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setIsCreating(false);
        setEditingId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCreating && inputRef.current) inputRef.current.focus();
  }, [isCreating]);

  const activeSession = sessionList.find(s => s.id === activeSessionId);

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim());
      setNewName('');
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  const handleRename = (id) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'}`}
      >
        {activeSession?.name || 'Default'}
        <CaretDown />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 w-56 rounded-lg shadow-xl overflow-hidden py-1 z-50 border ${isDark ? 'bg-[#181b25] border-white/10' : 'bg-white border-gray-200'}`}>
          {sessionList.map(session => (
            <div key={session.id} className={`flex items-center group ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
              {editingId === session.id ? (
                <input
                  className={`flex-1 px-3 py-2 text-sm bg-transparent outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRename(session.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRename(session.id); if (e.key === 'Escape') setEditingId(null); }}
                  autoFocus
                />
              ) : (
                <button
                  className={`flex-1 text-left px-3 py-2 text-sm font-medium transition-colors ${activeSessionId === session.id ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}
                  onClick={() => { onSelect(session.id); setIsOpen(false); }}
                  onDoubleClick={() => { setEditingId(session.id); setEditName(session.name); }}
                >
                  {session.name}
                  <span className="ml-1 text-[10px] text-gray-500">{session.puzzleType}</span>
                </button>
              )}
              {session.id !== 'default' && (
                <button
                  className="px-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                  onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          ))}

          <div className={`border-t mt-1 pt-1 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
            {isCreating ? (
              <div className="px-3 py-2">
                <input
                  ref={inputRef}
                  className={`w-full text-sm bg-transparent border-b outline-none pb-1 ${isDark ? 'text-white border-white/20 focus:border-primary' : 'text-gray-900 border-gray-200 focus:border-primary'}`}
                  placeholder="Session name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setIsCreating(false); }}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${isDark ? 'text-primary hover:bg-white/5' : 'text-primary hover:bg-gray-50'}`}
              >
                + New Session
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
