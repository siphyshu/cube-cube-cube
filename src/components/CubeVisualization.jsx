import React, { useMemo } from 'react';

export default function CubeVisualization({ cubeState, puzzleSize = 3 }) {
  const visualMap = useMemo(() => {
    if (!cubeState) return Array(12).fill(null);
    return [
      null, cubeState.U, null, null,
      cubeState.L, cubeState.F, cubeState.R, cubeState.B,
      null, cubeState.D, null, null,
    ];
  }, [cubeState]);

  const faceClass = puzzleSize === 2 ? 'cube-face cube-face-2' :
                    puzzleSize === 4 ? 'cube-face cube-face-4' :
                    puzzleSize === 5 ? 'cube-face cube-face-5' :
                    'cube-face';

  if (!cubeState) {
    return <div className="opacity-30 text-sm">Scramble Disabled</div>;
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-3">
      <div className="cube-grid aspect-[4/3]">
        {visualMap.map((face, i) => (
          <div key={i} className={face ? faceClass : ''}>
            {face && face.map((color, j) => (
              <div key={j} className="cube-sticker" style={{ backgroundColor: color }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
