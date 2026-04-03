import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';
import type { TornadoCategory, TornadoConfig } from '@/hooks/useTornadoData';
import { formatCurrency } from '@/lib/formatUtils';

export interface TornadoBarLayout {
  id: string;
  label: string;
  leftValue: number;
  rightValue: number;
  y: number;
  barH: number;
  leftX: number;
  leftWidth: number;
  rightX: number;
  rightWidth: number;
  formattedLeft: string;
  formattedRight: string;
}

export interface TornadoLayout {
  bars: TornadoBarLayout[];
  xScale: ReturnType<typeof scaleLinear<number>>;
  yScale: ReturnType<typeof scaleBand<string>>;
  centerX: number;
  margin: { top: number; right: number; bottom: number; left: number };
  maxValue: number;
}

export function computeTornadoLayout(
  categories: TornadoCategory[],
  config: TornadoConfig
): TornadoLayout {
  const margin = {
    top: config.title ? 70 : 30,
    right: 40,
    bottom: 50,
    left: 40,
  };

  const innerWidth = config.chartWidth - margin.left - margin.right;
  const innerHeight = config.chartHeight - margin.top - margin.bottom;
  const centerX = innerWidth / 2;

  // Sort if needed
  let sorted = [...categories];
  if (config.sortByMagnitude) {
    sorted.sort((a, b) => (Math.abs(b.leftValue) + Math.abs(b.rightValue)) - (Math.abs(a.leftValue) + Math.abs(a.rightValue)));
  }

  const maxVal = max(sorted, (d) => Math.max(Math.abs(d.leftValue), Math.abs(d.rightValue))) || 1;

  const yScale = scaleBand<string>()
    .domain(sorted.map((c) => c.id))
    .range([0, innerHeight])
    .padding(config.barGap);

  // Each side gets half the width
  const halfWidth = centerX - 10; // 10px gap from center for labels
  const xScale = scaleLinear<number>()
    .domain([0, maxVal])
    .range([0, halfWidth])
    .nice();

  const bandHeight = yScale.bandwidth();
  const barH = bandHeight * config.barHeight;
  const barOffset = (bandHeight - barH) / 2;

  const bars: TornadoBarLayout[] = sorted.map((cat) => {
    const y = (yScale(cat.id) || 0) + barOffset;
    const leftWidth = xScale(Math.abs(cat.leftValue));
    const rightWidth = xScale(Math.abs(cat.rightValue));

    return {
      id: cat.id,
      label: cat.label,
      leftValue: cat.leftValue,
      rightValue: cat.rightValue,
      y,
      barH,
      leftX: centerX - leftWidth,
      leftWidth,
      rightX: centerX,
      rightWidth,
      formattedLeft: formatCurrency(cat.leftValue, config.currencySymbol, config.valueFormat, config.decimalPlaces, config.negativeFormat),
      formattedRight: formatCurrency(cat.rightValue, config.currencySymbol, config.valueFormat, config.decimalPlaces, config.negativeFormat),
    };
  });

  return { bars, xScale, yScale, centerX, margin, maxValue: maxVal };
}
