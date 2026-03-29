import { PUZZLE_TYPES } from '../constants/defaults';

const OPPOSITES = { U: 'D', D: 'U', L: 'R', R: 'L', F: 'B', B: 'F' };

function isOpposite(move1, move2) {
  return OPPOSITES[move1] === move2;
}

export function generateScramble(puzzleType = '3x3') {
  const config = PUZZLE_TYPES[puzzleType];
  if (!config) return '';

  const { moves, modifiers, length } = config;
  const scramble = [];
  let lastMove = '';
  let secondLastMove = '';

  for (let i = 0; i < length; i++) {
    let move;
    do {
      move = moves[Math.floor(Math.random() * moves.length)];
    } while (
      move === lastMove ||
      isOpposite(move, lastMove) ||
      (move === secondLastMove && isOpposite(lastMove, move))
    );

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(move + modifier);
    secondLastMove = lastMove;
    lastMove = move;
  }

  return scramble.join(' ');
}

export function getScrambledState(scrambleStr, puzzleType = '3x3') {
  if (!scrambleStr) return null;

  const config = PUZZLE_TYPES[puzzleType];
  if (!config || !config.hasVisual) return null;

  const size = config.size;

  if (size === 3) return getScrambledState3x3(scrambleStr);
  if (size === 2) return getScrambledState2x2(scrambleStr);

  return null;
}

function getScrambledState3x3(scrambleStr) {
  const state = {
    U: Array(9).fill('#ffffff'),
    L: Array(9).fill('#ff9826'),
    F: Array(9).fill('#43ff43'),
    R: Array(9).fill('#ff4343'),
    B: Array(9).fill('#246bfd'),
    D: Array(9).fill('#ffff49'),
  };

  const cycle = (f1, i1, f2, i2, f3, i3, f4, i4) => {
    const temp = state[f4][i4];
    state[f4][i4] = state[f3][i3];
    state[f3][i3] = state[f2][i2];
    state[f2][i2] = state[f1][i1];
    state[f1][i1] = temp;
  };

  const rotateFaceCW = (f) => {
    const face = state[f];
    const temp = [...face];
    face[0] = temp[6]; face[1] = temp[3]; face[2] = temp[0];
    face[3] = temp[7]; face[4] = temp[4]; face[5] = temp[1];
    face[6] = temp[8]; face[7] = temp[5]; face[8] = temp[2];
  };

  const applyMoveCW = (move) => {
    rotateFaceCW(move);
    if (move === 'U') { cycle('B',2,'R',2,'F',2,'L',2); cycle('B',1,'R',1,'F',1,'L',1); cycle('B',0,'R',0,'F',0,'L',0); }
    else if (move === 'D') { cycle('F',6,'R',6,'B',6,'L',6); cycle('F',7,'R',7,'B',7,'L',7); cycle('F',8,'R',8,'B',8,'L',8); }
    else if (move === 'F') { cycle('U',6,'R',0,'D',2,'L',8); cycle('U',7,'R',3,'D',1,'L',5); cycle('U',8,'R',6,'D',0,'L',2); }
    else if (move === 'B') { cycle('U',2,'L',0,'D',6,'R',8); cycle('U',1,'L',3,'D',7,'R',5); cycle('U',0,'L',6,'D',8,'R',2); }
    else if (move === 'L') { cycle('U',0,'B',8,'D',0,'F',0); cycle('U',3,'B',5,'D',3,'F',3); cycle('U',6,'B',2,'D',6,'F',6); }
    else if (move === 'R') { cycle('F',2,'U',2,'B',6,'D',2); cycle('F',5,'U',5,'B',3,'D',5); cycle('F',8,'U',8,'B',0,'D',8); }
  };

  const moves = scrambleStr.split(' ');
  for (const m of moves) {
    if (!m) continue;
    const face = m[0];
    if (!state[face]) continue;
    const mod = m[1];
    let times = 1;
    if (mod === "'") times = 3;
    else if (mod === '2') times = 2;
    for (let i = 0; i < times; i++) applyMoveCW(face);
  }

  return state;
}

function getScrambledState2x2(scrambleStr) {
  const state = {
    U: Array(4).fill('#ffffff'),
    L: Array(4).fill('#ff9826'),
    F: Array(4).fill('#43ff43'),
    R: Array(4).fill('#ff4343'),
    B: Array(4).fill('#246bfd'),
    D: Array(4).fill('#ffff49'),
  };

  const cycle = (f1, i1, f2, i2, f3, i3, f4, i4) => {
    const temp = state[f4][i4];
    state[f4][i4] = state[f3][i3];
    state[f3][i3] = state[f2][i2];
    state[f2][i2] = state[f1][i1];
    state[f1][i1] = temp;
  };

  const rotateFaceCW = (f) => {
    const face = state[f];
    const temp = [...face];
    face[0] = temp[2]; face[1] = temp[0];
    face[2] = temp[3]; face[3] = temp[1];
  };

  const applyMoveCW = (move) => {
    rotateFaceCW(move);
    if (move === 'U') { cycle('B',1,'R',1,'F',1,'L',1); cycle('B',0,'R',0,'F',0,'L',0); }
    else if (move === 'R') { cycle('F',1,'U',1,'B',2,'D',1); cycle('F',3,'U',3,'B',0,'D',3); }
    else if (move === 'F') { cycle('U',2,'R',0,'D',1,'L',3); cycle('U',3,'R',2,'D',0,'L',1); }
  };

  const moves = scrambleStr.split(' ');
  for (const m of moves) {
    if (!m) continue;
    const face = m[0];
    if (!state[face]) continue;
    const mod = m[1];
    let times = 1;
    if (mod === "'") times = 3;
    else if (mod === '2') times = 2;
    for (let i = 0; i < times; i++) applyMoveCW(face);
  }

  return state;
}
