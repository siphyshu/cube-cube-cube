import React, { useMemo } from 'react';
import { CloseIcon } from './icons';
import { calcStatValue } from '../utils/stats';
import { STAT_COUNTS } from '../constants/defaults';

export default function StatsModal({ statsConfig, setStatsConfig, selectedBlockId, setSelectedBlockId, solves, onClose, isDark }) {
  const totalArea = useMemo(
    () => statsConfig.reduce((acc, block) => acc + ((block.colSpan || 1) * (block.rowSpan || 1)), 0),
    [statsConfig]
  );
  const statsRowsNeeded = Math.max(1, Math.ceil(totalArea / 2));

  const selectedBlock = statsConfig.find(b => b.id === selectedBlockId);

  const updateBlock = (updates) => {
    setStatsConfig(prev => prev.map(b => {
      if (b.id !== selectedBlockId) return b;
      const u = { ...b, ...updates };
      if (u.type === 'Single') {
        u.label = u.result === 'Best' ? 'pb' : 'worst';
      } else if (u.type === 'Mean') {
        u.label = `mo${u.count || '?'}` + (u.result === 'Best' ? ' pb' : '');
      } else {
        u.label = `ao${u.count || '?'}` + (u.result === 'Best' ? ' pb' : '');
      }
      return u;
    }));
  };

  const addBlock = () => {
    const newId = Math.max(0, ...statsConfig.map(b => b.id)) + 1;
    const nb = { id: newId, type: 'Average', result: 'Current', label: 'ao5', count: 5, colSpan: 1, rowSpan: 1 };
    setStatsConfig([...statsConfig, nb]);
    setSelectedBlockId(newId);
  };

  const removeBlock = () => {
    if (statsConfig.length <= 1) return;
    const nc = statsConfig.filter(b => b.id !== selectedBlockId);
    setStatsConfig(nc);
    setSelectedBlockId(nc[0].id);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-3xl rounded-xl border shadow-2xl flex flex-col max-h-[90vh] ${isDark ? 'bg-[#12141c] border-white/10' : 'bg-white border-gray-200'}`}>
        <div className={`flex justify-between items-center p-6 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          <div>
            <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Customize Stats</h2>
            <p className="text-sm text-gray-400">Configure your statistics display</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2"><CloseIcon /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div
            className="grid gap-2 h-64 w-full mb-6"
            style={{
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gridTemplateRows: `repeat(${statsRowsNeeded}, minmax(0, 1fr))`,
            }}
          >
            {statsConfig.map(block => (
              <div
                key={block.id}
                onClick={() => setSelectedBlockId(block.id)}
                className={`rounded-lg p-2.5 flex flex-col cursor-pointer overflow-hidden transition-all border-2 ${
                  selectedBlockId === block.id
                    ? 'border-primary shadow-[0_0_15px_rgba(36,107,253,0.3)]'
                    : 'border-transparent hover:bg-white/10'
                } ${isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`}
                style={{
                  gridColumn: `span ${block.colSpan || 1}`,
                  gridRow: `span ${block.rowSpan || 1}`,
                }}
              >
                <span className="text-xs font-bold text-gray-400 leading-none mb-1">{block.label}</span>
                <div className={`w-full flex-1 flex items-center justify-center font-bold leading-none ${isDark ? 'text-white' : 'text-gray-900'} ${block.rowSpan > 1 ? 'text-[48px]' : 'text-[26px]'}`}>
                  {calcStatValue(block, solves)}
                </div>
              </div>
            ))}
          </div>

          <div className={`flex justify-center gap-4 mb-8 border-b pb-8 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
            <button onClick={addBlock} className="bg-primary hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-md glow-blue transition-all">
              Add block
            </button>
            <button onClick={removeBlock} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold px-4 py-2 rounded-md transition-all">
              Remove selected
            </button>
          </div>

          {selectedBlock && (
            <div className="space-y-6 max-w-md mx-auto">
              <h3 className={`text-lg font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedBlock.result} {selectedBlock.type}
              </h3>
              <div>
                <label className={`text-sm font-semibold block mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Stat type</label>
                <div className="flex gap-2">
                  {['Single', 'Average', 'Mean'].map(type => (
                    <button
                      key={type}
                      onClick={() => updateBlock({ type, count: type === 'Single' ? null : (selectedBlock.count || 5) })}
                      className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                        selectedBlock.type === type
                          ? 'bg-primary text-white glow-blue'
                          : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >{type}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`text-sm font-semibold block mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Stat result</label>
                <div className="flex gap-2">
                  {['Best', 'Worst', 'Current'].map(result => {
                    if (selectedBlock.type === 'Single' && result === 'Current') return null;
                    if ((selectedBlock.type === 'Average' || selectedBlock.type === 'Mean') && result === 'Worst') return null;
                    return (
                      <button
                        key={result}
                        onClick={() => updateBlock({ result })}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                          selectedBlock.result === result
                            ? 'bg-primary text-white glow-blue'
                            : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >{result}</button>
                    );
                  })}
                </div>
              </div>
              {(selectedBlock.type === 'Average' || selectedBlock.type === 'Mean') && (
                <div>
                  <label className={`text-sm font-semibold block mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Count</label>
                  <div className="flex gap-2 flex-wrap">
                    {STAT_COUNTS.map(count => (
                      <button
                        key={count}
                        onClick={() => updateBlock({ count })}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                          selectedBlock.count === count
                            ? 'bg-primary text-white glow-blue'
                            : isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >{count}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
