import type { MarimekkoSegment, MarimekkoConfig } from '@/hooks/useMarimekkoData';

export interface StackRect {
  id: string;
  label: string;
  value: number;
  percent: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SegmentLayout {
  id: string;
  label: string;
  width: number;
  widthPercent: number;
  x: number;
  pixelWidth: number;
  stacks: StackRect[];
}

export interface MarimekkoLayout {
  segments: SegmentLayout[];
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
  uniqueCategories: string[];
  categoryColors: Map<string, string>;
}

export function computeMarimekkoLayout(
  segments: MarimekkoSegment[],
  config: MarimekkoConfig
): MarimekkoLayout {
  const margin = {
    top: config.title ? 70 : 30,
    right: 20,
    bottom: 50,
    left: 55,
  };

  const innerWidth = config.chartWidth - margin.left - margin.right;
  const innerHeight = config.chartHeight - margin.top - margin.bottom;

  const totalWidth = segments.reduce((sum, s) => sum + Math.abs(s.width), 0) || 1;
  const totalGap = config.segmentGap * (segments.length - 1);
  const availableWidth = innerWidth - totalGap;

  // Build unique category list and color map from first occurrence
  const categoryColors = new Map<string, string>();
  const seen = new Set<string>();
  segments.forEach((seg) => {
    seg.stacks.forEach((st) => {
      if (!seen.has(st.label)) {
        seen.add(st.label);
        categoryColors.set(st.label, st.color);
      }
    });
  });
  const uniqueCategories = Array.from(seen);

  let xCursor = 0;
  const layoutSegments: SegmentLayout[] = segments.map((seg) => {
    const widthPercent = (seg.width / totalWidth) * 100;
    const pixelWidth = (seg.width / totalWidth) * availableWidth;
    const x = xCursor;
    xCursor += pixelWidth + config.segmentGap;

    // Compute stack percentages
    const stackTotal = seg.stacks.reduce((sum, st) => sum + Math.abs(st.value), 0) || 1;
    let yCursor = 0;

    const stacks: StackRect[] = seg.stacks.map((st) => {
      const percent = (Math.abs(st.value) / stackTotal) * 100;
      const height = (percent / 100) * innerHeight;
      const rect: StackRect = {
        id: st.id,
        label: st.label,
        value: st.value,
        percent,
        color: st.color,
        x,
        y: yCursor,
        width: pixelWidth,
        height,
      };
      yCursor += height;
      return rect;
    });

    return {
      id: seg.id,
      label: seg.label,
      width: seg.width,
      widthPercent,
      x,
      pixelWidth,
      stacks,
    };
  });

  return {
    segments: layoutSegments,
    margin,
    innerWidth,
    innerHeight,
    uniqueCategories,
    categoryColors,
  };
}
