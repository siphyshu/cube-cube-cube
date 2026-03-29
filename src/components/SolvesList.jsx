import React, { useState, useRef } from 'react';
import { formatTime } from '../utils/formatting';
import { CloseIcon, EmptyCubeIcon } from './icons';

export default function SolvesList({
  solves,
  togglePenalty,
  deleteSolve,
  updateComment,
  duplicateCount,
  removeDuplicates,
  isDark,
}) {
  const [editingId, setEditingId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const inputRef = useRef(null);

  const handleStartEdit = (solve) => {
    setEditingId(solve.id);
    setCommentText(solve.comment || '');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSaveComment = () => {
    if (editingId) {
      updateComment(editingId, commentText);
      setEditingId(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-3">
      {duplicateCount > 0 && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 mb-2 flex-shrink-0">
          <span className="text-red-400 text-xs font-semibold">
            {duplicateCount} duplicate{duplicateCount > 1 ? 's' : ''} detected
          </span>
          <button onClick={removeDuplicates} className="text-red-400 hover:text-white text-xs font-bold underline transition-colors ml-2">
            Remove all
          </button>
        </div>
      )}
      {solves.length === 0 ? (
        <div className="text-center opacity-50 flex flex-col items-center justify-center h-full">
          <EmptyCubeIcon />
          <p className="text-sm">No solves yet</p>
        </div>
      ) : (
        <div className="overflow-y-auto no-scrollbar flex-1">
          {solves.map((s, idx) => (
            <div key={s.id} className="solve-row">
              <div
                className="flex justify-between items-center py-2 text-sm font-mono group/row px-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                onClick={() => handleStartEdit(s)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-white/40 font-bold w-6">{solves.length - idx}.</span>
                  <div className="flex flex-col">
                    <span className={`font-bold text-[15px] ${s.penalty === 'DNF' ? 'text-gray-500 line-through' : 'text-[#22c55e]'}`}>
                      {formatTime(s.time, s.penalty)}
                    </span>
                    {s.comment && (
                      <span className="text-[11px] text-gray-500 font-sans truncate max-w-[120px]">{s.comment}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 font-bold text-xs tracking-wider" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => togglePenalty(s.id, '+2')}
                    className={`transition-colors ${s.penalty === '+2' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                  >+2</button>
                  <button
                    onClick={() => togglePenalty(s.id, 'DNF')}
                    className={`transition-colors ${s.penalty === 'DNF' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                  >DNF</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSolve(s.id); }}
                    className="text-gray-500 hover:text-white ml-2 flex items-center justify-center"
                  ><CloseIcon /></button>
                </div>
              </div>
              {editingId === s.id && (
                <div className="px-3 pb-2 comment-input">
                  <input
                    ref={inputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onBlur={handleSaveComment}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveComment(); if (e.key === 'Escape') setEditingId(null); }}
                    placeholder="Add a comment (e.g. OLL skip)..."
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-gray-500 outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
