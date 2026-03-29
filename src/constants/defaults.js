export const DEFAULT_STATS_CONFIG = [
  { id: 1, type: 'Single', result: 'Best', label: 'pb', count: null, colSpan: 1, rowSpan: 2 },
  { id: 2, type: 'Single', result: 'Worst', label: 'worst', count: null, colSpan: 1, rowSpan: 1 },
  { id: 3, type: 'Average', result: 'Current', label: 'avg', count: null, colSpan: 1, rowSpan: 1 },
  { id: 4, type: 'Average', result: 'Best', label: 'ao5 pb', count: 5, colSpan: 1, rowSpan: 1 },
  { id: 5, type: 'Average', result: 'Current', label: 'ao5', count: 5, colSpan: 1, rowSpan: 1 },
  { id: 6, type: 'Average', result: 'Best', label: 'ao12 pb', count: 12, colSpan: 1, rowSpan: 1 },
  { id: 7, type: 'Average', result: 'Current', label: 'ao12', count: 12, colSpan: 1, rowSpan: 1 },
];

export const PANEL_OPTIONS = [
  'Solves', 'Stats', 'Scramble', 'Time Graph', 'Histogram', 'Progress',
  'Export CSV', 'Import CSV', 'None',
];

export const PUZZLE_TYPES = {
  '2x2': {
    name: '2x2',
    size: 2,
    length: 9,
    moves: ['U', 'R', 'F'],
    modifiers: ['', "'", '2'],
    hasVisual: true,
  },
  '3x3': {
    name: '3x3',
    size: 3,
    length: 20,
    moves: ['U', 'D', 'L', 'R', 'F', 'B'],
    modifiers: ['', "'", '2'],
    hasVisual: true,
  },
  '4x4': {
    name: '4x4',
    size: 4,
    length: 40,
    moves: ['U', 'D', 'L', 'R', 'F', 'B', 'Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw'],
    modifiers: ['', "'", '2'],
    hasVisual: false,
  },
  '5x5': {
    name: '5x5',
    size: 5,
    length: 60,
    moves: ['U', 'D', 'L', 'R', 'F', 'B', 'Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw'],
    modifiers: ['', "'", '2'],
    hasVisual: false,
  },
  '6x6': {
    name: '6x6',
    size: 6,
    length: 80,
    moves: ['U', 'D', 'L', 'R', 'F', 'B', 'Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw', '3Uw', '3Dw', '3Lw', '3Rw', '3Fw', '3Bw'],
    modifiers: ['', "'", '2'],
    hasVisual: false,
  },
  '7x7': {
    name: '7x7',
    size: 7,
    length: 100,
    moves: ['U', 'D', 'L', 'R', 'F', 'B', 'Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw', '3Uw', '3Dw', '3Lw', '3Rw', '3Fw', '3Bw'],
    modifiers: ['', "'", '2'],
    hasVisual: false,
  },
};

export const STAT_COUNTS = [3, 5, 12, 25, 50, 100, 200, 500, 1000];

export const INSPECTION_TIMES = {
  WARNING_8: 8,
  WARNING_12: 12,
  PLUS_2: 15,
  DNF: 17,
};
