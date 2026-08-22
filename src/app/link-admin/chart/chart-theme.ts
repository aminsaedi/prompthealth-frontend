import { ChartConfiguration } from 'chart.js';

/* The house palette, so a chart cannot introduce a colour the rest of the page
 * does not use. Kept as plain strings because Chart.js is handed values, not
 * class names, and the SCSS tokens are not readable from TypeScript. */
export const CHART_COLORS = {
  primary: '#4264D0',
  primaryDark: '#12339E',
  primaryFaint: 'rgba(66, 100, 208, 0.12)',
  secondary: '#00B2EA',
  success: '#12C132',
  warning: '#FDB813',
  error: '#EA4242',
  line: '#D6D8E7',
  label: '#656871',
  body: '#293148',
  white: '#FFFFFF',
};

/* Enough distinct hues for a top-ten ranking, ordered so the first few are the
 * ones the rest of the interface already uses. */
export const CHART_SERIES = [
  '#4264D0', '#00B2EA', '#12C132', '#FDB813', '#EA4242',
  '#8E6FE0', '#0E9B8A', '#D06C42', '#5B7FA6', '#A0A3BD',
];

const font = { fontFamily: 'Roboto, sans-serif', fontColor: CHART_COLORS.label, fontSize: 12 };

/* Counts, so the axis must not offer to show half a click. */
const countAxis = (label: string) => ({
  ticks: { beginAtZero: true, precision: 0, ...font },
  gridLines: { color: CHART_COLORS.line, drawBorder: false, zeroLineColor: CHART_COLORS.line },
  scaleLabel: label ? { display: true, labelString: label, ...font } : { display: false },
});

const categoryAxis = () => ({
  ticks: { ...font, maxRotation: 0, autoSkipPadding: 12 },
  gridLines: { display: false, drawBorder: false },
});

export const baseOptions = (): any => ({
  legend: { display: false },
  tooltips: {
    backgroundColor: CHART_COLORS.body,
    titleFontFamily: 'Roboto, sans-serif',
    bodyFontFamily: 'Roboto, sans-serif',
    cornerRadius: 6,
    displayColors: true,
    intersect: false,
    mode: 'index',
  },
  hover: { intersect: false, mode: 'index' },
  layout: { padding: { top: 4, right: 4 } },
});

/* A daily series of people and bots. Two lines rather than a stack: the
 * question is usually "did real traffic move", and a stack makes that harder
 * to read, not easier. */
export const trendConfig = (
  days: string[],
  humans: number[],
  bots: number[],
): ChartConfiguration => ({
  type: 'line',
  data: {
    labels: days,
    datasets: [
      {
        label: 'People',
        data: humans,
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primaryFaint,
        borderWidth: 2,
        pointRadius: days.length > 45 ? 0 : 2,
        pointHoverRadius: 4,
        pointBackgroundColor: CHART_COLORS.primary,
        fill: true,
        lineTension: 0.25,
      },
      {
        label: 'Bots',
        data: bots,
        borderColor: CHART_COLORS.label,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [4, 3],
        pointRadius: 0,
        pointHoverRadius: 3,
        fill: false,
        lineTension: 0.25,
      },
    ],
  },
  options: {
    ...baseOptions(),
    legend: { display: true, position: 'bottom', labels: { ...font, boxWidth: 12, usePointStyle: true } },
    scales: { xAxes: [categoryAxis()], yAxes: [countAxis('')] },
  } as any,
});

/* A ranking. Horizontal, because the labels are host names and campaign names
 * and those do not fit under a vertical bar. */
export const rankingConfig = (labels: string[], values: number[], title = 'Clicks'): ChartConfiguration => ({
  type: 'horizontalBar',
  data: {
    labels,
    datasets: [{
      label: title,
      data: values,
      backgroundColor: CHART_COLORS.primary,
      hoverBackgroundColor: CHART_COLORS.primaryDark,
      barThickness: 14,
      maxBarThickness: 18,
    }],
  },
  options: {
    ...baseOptions(),
    tooltips: { ...baseOptions().tooltips, mode: 'nearest', intersect: true },
    hover: { mode: 'nearest', intersect: true },
    scales: { xAxes: [countAxis('')], yAxes: [categoryAxis()] },
  } as any,
});

/* A split of a whole — device mix, destination health. A doughnut rather than a
 * pie so the total can sit in the middle where it is actually legible. */
export const splitConfig = (labels: string[], values: number[], colors: string[]): ChartConfiguration => ({
  type: 'doughnut',
  data: {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors,
      borderColor: CHART_COLORS.white,
      borderWidth: 2,
    }],
  },
  options: {
    ...baseOptions(),
    cutoutPercentage: 68,
    legend: { display: true, position: 'right', labels: { ...font, boxWidth: 10, usePointStyle: true } },
    tooltips: { ...baseOptions().tooltips, mode: 'nearest', intersect: true },
    hover: { mode: 'nearest', intersect: true },
  } as any,
});
