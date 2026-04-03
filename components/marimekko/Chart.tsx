'use client';

import { useMemo, forwardRef } from 'react';
import { useMarimekkoData } from '@/hooks/useMarimekkoData';
import { useAppState } from '@/hooks/useAppState';
import { computeMarimekkoLayout } from '@/lib/marimekkoUtils';

const MarimekkoChart = forwardRef<HTMLDivElement>(function MarimekkoChart(_, ref) {
  const segments = useMarimekkoData((s) => s.segments);
  const config = useMarimekkoData((s) => s.config);
  const isDarkMode = useAppState((s) => s.isDarkMode);

  const layout = useMemo(
    () => computeMarimekkoLayout(segments, config),
    [segments, config]
  );

  const labelColor = isDarkMode ? '#F3F4F6' : '#1F2937';
  const axisColor = isDarkMode ? '#E5E7EB' : '#6B7280';
  const subtitleColor = isDarkMode ? '#D1D5DB' : '#6B7280';

  const { segments: layoutSegs, margin, innerWidth, innerHeight, uniqueCategories, categoryColors } = layout;

  const lightenColor = (hex: string, amount: number = 0.15) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.min(255, Math.round(r + (255 - r) * amount));
    const lg = Math.min(255, Math.round(g + (255 - g) * amount));
    const lb = Math.min(255, Math.round(b + (255 - b) * amount));
    return `rgb(${lr},${lg},${lb})`;
  };

  // Collect unique colors for gradient defs
  const uniqueColors = Array.from(new Set(
    layoutSegs.flatMap((seg) => seg.stacks.map((st) => st.color))
  ));

  return (
    <div ref={ref} style={{ display: 'inline-block' }}>
      <svg
        width={config.chartWidth}
        height={config.chartHeight}
        viewBox={`0 0 ${config.chartWidth} ${config.chartHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ fontFamily: config.fontFamily }}
      >
        {config.showGradients && (
          <defs>
            {uniqueColors.map((color) => (
              <linearGradient
                key={color}
                id={`mekko-grad-${color.replace('#', '')}`}
                x1="0" y1="0" x2="0" y2="1"
              >
                <stop offset="0%" stopColor={lightenColor(color, 0.2)} />
                <stop offset="100%" stopColor={color} />
              </linearGradient>
            ))}
          </defs>
        )}
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Title */}
          {config.title && (
            <text
              x={innerWidth / 2}
              y={-margin.top + 24}
              textAnchor="middle"
              fill={labelColor}
              fontSize={config.fontSize.title}
              fontWeight="700"
            >
              {config.title}
            </text>
          )}
          {config.subtitle && (
            <text
              x={innerWidth / 2}
              y={-margin.top + 46}
              textAnchor="middle"
              fill={subtitleColor}
              fontSize={config.fontSize.axis}
            >
              {config.subtitle}
            </text>
          )}

          {/* Y-axis percentage labels */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = (pct / 100) * innerHeight;
            return (
              <g key={pct}>
                <line
                  x1={-5}
                  y1={y}
                  x2={innerWidth}
                  y2={y}
                  stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                  strokeWidth={pct === 0 || pct === 100 ? 1 : 0.5}
                  strokeDasharray={pct === 0 || pct === 100 ? 'none' : '3,3'}
                />
                <text
                  x={-8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  fill={axisColor}
                  fontSize={config.fontSize.axis}
                >
                  {100 - pct}%
                </text>
              </g>
            );
          })}

          {/* Segments */}
          {layoutSegs.map((seg) => (
            <g key={seg.id}>
              {/* Stacked bars */}
              {seg.stacks.map((stack) => (
                <g key={stack.id}>
                  <rect
                    x={stack.x}
                    y={stack.y}
                    width={Math.max(stack.width, 0)}
                    height={Math.max(stack.height, 0)}
                    fill={config.showGradients ? `url(#mekko-grad-${stack.color.replace('#', '')})` : stack.color}
                    stroke={isDarkMode ? '#111827' : '#ffffff'}
                    strokeWidth={1}
                  />
                  {/* Percentage label inside bar if tall enough */}
                  {config.showPercentages && stack.height > 18 && stack.width > 30 && (
                    <text
                      x={stack.x + stack.width / 2}
                      y={stack.y + stack.height / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize={config.fontSize.labels}
                      fontWeight="600"
                    >
                      {Math.round(stack.percent)}%
                    </text>
                  )}
                </g>
              ))}

              {/* Segment label at bottom */}
              <text
                x={seg.x + seg.pixelWidth / 2}
                y={innerHeight + 16}
                textAnchor="middle"
                fill={labelColor}
                fontSize={config.fontSize.labels}
                fontWeight="600"
              >
                {seg.label}
              </text>

              {/* Segment width label */}
              {config.showSegmentWidths && (
                <text
                  x={seg.x + seg.pixelWidth / 2}
                  y={innerHeight + 30}
                  textAnchor="middle"
                  fill={axisColor}
                  fontSize={config.fontSize.axis}
                >
                  {Math.round(seg.widthPercent)}%
                </text>
              )}
            </g>
          ))}

          {/* Legend */}
          <g transform={`translate(${innerWidth + 10}, 0)`}>
            {/* Removed — legend is inline; keeping for potential future use */}
          </g>

          {/* Legend at top-right */}
          {uniqueCategories.length > 0 && (
            <g>
              {uniqueCategories.map((cat, i) => {
                const legendX = innerWidth - (uniqueCategories.length - i) * 90;
                return (
                  <g key={cat} transform={`translate(${legendX}, ${-14})`}>
                    <rect width={10} height={10} rx={2} fill={categoryColors.get(cat) || '#888'} />
                    <text x={14} y={9} fill={labelColor} fontSize={config.fontSize.axis}>
                      {cat}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
});

export default MarimekkoChart;
