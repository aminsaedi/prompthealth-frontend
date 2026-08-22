export interface ITrendPaths {
  line: string;
  area: string;
  peak: number;
}

/* One SVG path for a daily series. A bar per day works for a week and becomes a
 * hairline comb at a year, so both the overview and the per-link drawer draw the
 * same shape from the same code. */
export function buildTrendPaths(values: number[], width: number, height: number): ITrendPaths {
  const peak = values.reduce((max, value) => Math.max(max, value || 0), 0);

  if (values.length < 2) {
    return { line: '', area: '', peak };
  }

  const scale = Math.max(1, peak);
  /* A pixel of headroom top and bottom keeps the stroke from being clipped at
   * the peak and along the baseline. */
  const usable = height - 2;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = 1 + usable - ((value || 0) / scale) * usable;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return {
    line: `M${points.join('L')}`,
    area: `M0,${height}L${points.join('L')}L${width},${height}Z`,
    peak,
  };
}
