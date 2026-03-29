import React from 'react';
import Dropdown from './Dropdown';

export default function PanelContainer({ panelType, panelOptions, onPanelChange, isDark, children }) {
  return (
    <div className={`rounded-xl relative group h-[280px] flex flex-col w-full shadow-lg transition-all ${
      panelType === 'Stats'
        ? `border-2 ${isDark ? 'border-[#2a323d]' : 'border-gray-200'}`
        : 'border border-transparent'
    } ${isDark ? 'bg-module' : 'bg-white'}`}>
      <div className="absolute top-3 left-3 z-40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
        <Dropdown
          label={panelType}
          options={panelOptions}
          selected={panelType}
          onSelect={onPanelChange}
        />
      </div>
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
