import React, { useState, useRef, useEffect } from 'react';
import { CaretDown } from './icons';

export default function Dropdown({ label, options, selected, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt !== selected);

  return (
    <div className="relative z-60" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-primary hover:bg-blue-500 text-white text-sm font-semibold px-3 py-1.5 rounded flex items-center gap-1 transition-all glow-blue ${isOpen ? 'active' : ''}`}
      >
        {label} <CaretDown />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-module border border-white/10 rounded-lg shadow-xl overflow-y-auto max-h-60 py-1 no-scrollbar z-70 dark:bg-[#181b25] light:bg-white">
          {filteredOptions.map(opt => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors ${selected === opt ? 'text-white' : 'text-gray-300'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
