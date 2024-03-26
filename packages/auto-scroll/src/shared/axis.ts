const vertical = {
  start: 'top',
  end: 'bottom',
  point: 'y',
  size: 'height',
} as const;

const horizontal = {
  start: 'left',
  end: 'right',
  point: 'x',
  size: 'width',
} as const;

export const axisLookup = {
  vertical: {
    mainAxis: vertical,
    crossAxis: horizontal,
  },
  horizontal: {
    mainAxis: horizontal,
    crossAxis: vertical,
  },
} as const;
