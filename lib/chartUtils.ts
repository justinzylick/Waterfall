import { scaleLinear, scaleBand } from 'd3-scale';
import { min, max } from 'd3-array';
import type { DataRow, ChartConfig } from '@/hooks/useChartData';
import { formatCurrency, formatDelta } from '@/lib/formatUtils';

export interface BarLayout {
  id: string;
  label: string;
  value: number;
  type: DataRow['type'];
  x: number;
  barWidth: number;
  yTop: number;
  yBottom: number;
  height: number;
  runningStart: number;
  runningEnd: number;
  formattedValue: string;
  deltaPercent: string;
  totalDeltaPercent: string;
  isNegative: boolean;
}

export interface ConnectorLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface WaterfallLayout {
  bars: BarLayout[];
  connectors: ConnectorLine[];
  yScale: (value: number) => number;
  xScale: (value: string) => number | undefined;
  yTicks: number[];
  chartInnerWidth: number;
  chartInnerHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export function computeWaterfallLayout(
  rows: DataRow[],
  config: ChartConfig
): WaterfallLayout {
  if (rows.length === 0) {
    const margin = { top: 60, right: 30, bottom: 60, left: 70 };
    return {
      bars: [],
      connectors: [],
      yScale: (v: number) => scaleLinear().domain([0, 100]).range([config.chartHeight - margin.top - margin.bottom, 0])(v) ?? 0,
      xScale: (v: string) => scaleBand<string>().domain([]).range([0, config.chartWidth - margin.left - margin.right])(v),
      yTicks: [],
      chartInnerWidth: config.chartWidth - margin.left - margin.right,
      chartInnerHeight: config.chartHeight - margin.top - margin.bottom,
      margin,
    };
  }

  const margin = {
    top: config.title ? 70 : 40,
    right: 30,
    bottom: 80,
    left: config.showYAxis ? 80 : 30,
  };

  const innerWidth = config.chartWidth - margin.left - margin.right;
  const innerHeight = config.chartHeight - margin.top - margin.bottom;

  // Compute running totals
  let runningTotal = 0;
  const startValue = rows[0]?.value || 0;
  const barData: Array<{
    id: string;
    label: string;
    value: number;
    type: DataRow['type'];
    runningStart: number;
    runningEnd: number;
  }> = [];

  for (const row of rows) {
    if (row.type === 'start' || row.type === 'end' || row.type === 'subtotal') {
      const barStart = 0;
      const barEnd = row.value;
      barData.push({
        id: row.id,
        label: row.label,
        value: row.value,
        type: row.type,
        runningStart: barStart,
        runningEnd: barEnd,
      });
      runningTotal = row.value;
    } else {
      const barStart = runningTotal;
      const barEnd = runningTotal + row.value;
      barData.push({
        id: row.id,
        label: row.label,
        value: row.value,
        type: row.type,
        runningStart: barStart,
        runningEnd: barEnd,
      });
      runningTotal = barEnd;
    }
  }

  // Compute y-domain: zoom into the range where the running totals live
  // For total bars (start/end/subtotal), only use their runningEnd value (not 0)
  const runningTotals = barData.map((b) => b.runningEnd);
  // For change bars, include both start and end
  const changeEndpoints = barData
    .filter((b) => b.type !== 'start' && b.type !== 'end' && b.type !== 'subtotal')
    .flatMap((b) => [b.runningStart, b.runningEnd]);
  const allRelevantValues = [...runningTotals, ...changeEndpoints];
  const yMin = min(allRelevantValues) ?? 0;
  const yMax = max(allRelevantValues) ?? 100;
  const yRange = yMax - yMin;
  // Use more padding when values are clustered (bridge chart) vs spread out
  const yPadding = Math.max(yRange * 0.2, yMax * 0.02);
  const yDomainMin = yMin - yPadding;
  const yDomainMax = yMax + yPadding;

  // Scales
  const xScale = scaleBand<string>()
    .domain(barData.map((b) => b.id))
    .range([0, innerWidth])
    .padding(config.barGap);

  const yScale = scaleLinear()
    .domain([yDomainMin, yDomainMax])
    .range([innerHeight, 0])
    .nice();

  const yTicks = yScale.ticks(6);

  // Compute bar pixel positions
  const bandwidth = xScale.bandwidth();
  const barPixelWidth = bandwidth * config.barWidth;
  const barOffset = (bandwidth - barPixelWidth) / 2;

  const y = (v: number) => yScale(v) ?? 0;

  const bars: BarLayout[] = barData.map((b) => {
    const x = (xScale(b.id) ?? 0) + barOffset;
    const isTotal = b.type === 'start' || b.type === 'end' || b.type === 'subtotal';
    // Total bars extend from chart bottom to their value
    const yTop = y(b.runningEnd);
    const yBottom = isTotal ? innerHeight : y(Math.min(b.runningStart, b.runningEnd));
    const yTopFinal = isTotal ? yTop : y(Math.max(b.runningStart, b.runningEnd));
    const height = Math.max(yBottom - yTopFinal, 1);

    const previousBar = barData[barData.indexOf(b) - 1];
    const deltaBase = config.deltaBase === 'start'
      ? startValue
      : (previousBar?.runningEnd ?? startValue);

    return {
      id: b.id,
      label: b.label,
      value: b.value,
      type: b.type,
      x,
      barWidth: barPixelWidth,
      yTop: yTopFinal,
      yBottom,
      height,
      runningStart: b.runningStart,
      runningEnd: b.runningEnd,
      isNegative: b.value < 0,
      formattedValue: formatCurrency(b.value, {
        symbol: config.currencySymbol,
        format: config.valueFormat,
        negativeFormat: config.negativeFormat,
        decimalPlaces: config.decimalPlaces,
        startValue,
      }),
      deltaPercent: formatDelta(b.value, deltaBase),
      totalDeltaPercent: (b.type === 'end' || b.type === 'subtotal') && startValue !== 0
        ? formatDelta(b.value - startValue, startValue)
        : '',
    };
  });

  // Compute connector lines
  const connectors: ConnectorLine[] = [];
  for (let i = 0; i < bars.length - 1; i++) {
    const current = bars[i];
    const next = bars[i + 1];
    const currentEnd = barData[i];

    // Connect from end of current bar to start of next bar
    const connectY = y(currentEnd.runningEnd);
    connectors.push({
      x1: current.x + current.barWidth,
      y1: connectY,
      x2: next.x,
      y2: connectY,
    });
  }

  return {
    bars,
    connectors,
    yScale: y,
    xScale: (v: string) => xScale(v),
    yTicks,
    chartInnerWidth: innerWidth,
    chartInnerHeight: innerHeight,
    margin,
  };
}

export function roundedBarPath(
  x: number,
  yTop: number,
  width: number,
  height: number,
  radius: number,
  type: DataRow['type'],
  isNegative: boolean,
): string {
  const r = Math.min(radius, height / 2, width / 2);

  if (type === 'start' || type === 'end' || type === 'subtotal') {
    // Total bars: round top corners only
    return `
      M ${x},${yTop + height}
      L ${x},${yTop + r}
      Q ${x},${yTop} ${x + r},${yTop}
      L ${x + width - r},${yTop}
      Q ${x + width},${yTop} ${x + width},${yTop + r}
      L ${x + width},${yTop + height}
      Z
    `;
  }

  if (isNegative) {
    // Decrease: round bottom corners
    return `
      M ${x},${yTop}
      L ${x + width},${yTop}
      L ${x + width},${yTop + height - r}
      Q ${x + width},${yTop + height} ${x + width - r},${yTop + height}
      L ${x + r},${yTop + height}
      Q ${x},${yTop + height} ${x},${yTop + height - r}
      Z
    `;
  }

  // Increase: round top corners
  return `
    M ${x},${yTop + height}
    L ${x},${yTop + r}
    Q ${x},${yTop} ${x + r},${yTop}
    L ${x + width - r},${yTop}
    Q ${x + width},${yTop} ${x + width},${yTop + r}
    L ${x + width},${yTop + height}
    Z
  `;
}
