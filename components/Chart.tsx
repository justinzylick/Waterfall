'use client';

import { useMemo, forwardRef } from 'react';
import { useChartData } from '@/hooks/useChartData';
import { computeWaterfallLayout } from '@/lib/chartUtils';
import { formatAxisValue } from '@/lib/formatUtils';

const Chart = forwardRef<HTMLDivElement>(function Chart(_, ref) {
  const rows = useChartData((s) => s.rows);
  const config = useChartData((s) => s.config);
  const isDarkMode = useChartData((s) => s.isDarkMode);

  const layout = useMemo(
    () => computeWaterfallLayout(rows, config),
    [rows, config]
  );

  // Adaptive colors for dark/light mode
  const labelColor = isDarkMode ? '#E5E7EB' : config.colors.label;
  const axisColor = isDarkMode ? '#D1D5DB' : '#9CA3AF';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
  const subtitleColor = isDarkMode ? '#9CA3AF' : '#9CA3AF';
  const legendColor = isDarkMode ? '#D1D5DB' : '#9CA3AF';

  const { bars, connectors, yScale, yTicks, margin } = layout;

  const getBarColor = (type: string) => {
    if (type === 'start' || type === 'end' || type === 'subtotal') return config.colors.total;
    if (type === 'increase') return config.colors.increase;
    return config.colors.decrease;
  };

  const lightenColor = (hex: string, amount: number = 0.15) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.min(255, Math.round(r + (255 - r) * amount));
    const lg = Math.min(255, Math.round(g + (255 - g) * amount));
    const lb = Math.min(255, Math.round(b + (255 - b) * amount));
    return `rgb(${lr},${lg},${lb})`;
  };

  return (
    <div ref={ref} style={{ width: config.chartWidth, height: config.chartHeight }}>
      <svg
        width={config.chartWidth}
        height={config.chartHeight}
        viewBox={`0 0 ${config.chartWidth} ${config.chartHeight}`}
        style={{ fontFamily: config.fontFamily }}
      >
        {/* Gradient definitions */}
        {config.showGradients && (
          <defs>
            {['increase', 'decrease', 'total'].map((type) => {
              const color = type === 'total'
                ? config.colors.total
                : type === 'increase'
                ? config.colors.increase
                : config.colors.decrease;
              return (
                <linearGradient
                  key={type}
                  id={`grad-${type}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={lightenColor(color, 0.2)} />
                  <stop offset="100%" stopColor={color} />
                </linearGradient>
              );
            })}
            {config.showShadows && (
              <filter id="bar-shadow" x="-5%" y="-5%" width="120%" height="120%">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.12" />
              </filter>
            )}
          </defs>
        )}

        {/* Chart area */}
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y-axis grid lines */}
          {config.showYAxis &&
            yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={0}
                  y1={yScale(tick)}
                  x2={layout.chartInnerWidth}
                  y2={yScale(tick)}
                  stroke={gridColor}
                  strokeWidth={0.5}
                  strokeDasharray="4,4"
                  opacity={0.5}
                />
                <text
                  x={-10}
                  y={yScale(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={config.fontSize.axis}
                  fontWeight={config.boldYAxis ? 700 : 400}
                  fill={legendColor}
                >
                  {formatAxisValue(tick, config.currencySymbol)}
                </text>
              </g>
            ))}

          {/* Connector lines */}
          {config.showConnectors &&
            connectors.map((c, i) => (
              <line
                key={i}
                x1={c.x1}
                y1={c.y1}
                x2={c.x2}
                y2={c.y2}
                stroke={config.colors.connector}
                strokeWidth={1}
                strokeDasharray="3,3"
                opacity={0.6}
              />
            ))}

          {/* Bars */}
          {bars.map((bar) => {
            const fillType = bar.type === 'start' || bar.type === 'end' || bar.type === 'subtotal'
              ? 'total'
              : bar.type;
            const fillColor = config.showGradients
              ? `url(#grad-${fillType})`
              : getBarColor(bar.type);

            return (
              <g key={bar.id}>
                <rect
                  x={bar.x}
                  y={bar.yTop}
                  width={bar.barWidth}
                  height={bar.height}
                  rx={3}
                  fill={fillColor}
                  filter={config.showShadows ? 'url(#bar-shadow)' : undefined}
                />

                {/* Value label */}
                {config.showValueLabels && (
                  <text
                    x={bar.x + bar.barWidth / 2}
                    y={
                      bar.type === 'start' || bar.type === 'end' || bar.type === 'subtotal'
                        ? bar.yTop - 8
                        : bar.isNegative
                        ? bar.yBottom + 16
                        : bar.yTop - 8
                    }
                    textAnchor="middle"
                    fontSize={config.fontSize.labels}
                    fontWeight={config.boldValueLabels ? 700 : 500}
                    fill={labelColor}
                  >
                    {bar.formattedValue}
                  </text>
                )}

                {/* Annotation label */}
                {config.showAnnotations && bar.annotation && (
                  <text
                    x={bar.x + bar.barWidth / 2}
                    y={
                      bar.annotationPosition === 'below'
                        ? bar.isNegative
                          ? bar.yBottom + (config.showValueLabels ? 32 : 16)
                          : bar.yBottom + 16
                        : bar.yTop - (config.showValueLabels ? 24 : 8)
                    }
                    textAnchor="middle"
                    fontSize={config.fontSize.labels - 2}
                    fontStyle="italic"
                    fill={labelColor}
                    opacity={0.7}
                  >
                    {bar.annotation}
                  </text>
                )}

                {/* Delta label on change bars */}
                {config.showDeltaLabels &&
                  bar.type !== 'start' &&
                  bar.type !== 'end' &&
                  bar.type !== 'subtotal' && (
                    <text
                      x={bar.x + bar.barWidth / 2}
                      y={bar.yTop + bar.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={config.fontSize.labels - 1}
                      fontWeight={config.boldDeltaLabels ? 700 : 500}
                      fill="#fff"
                      opacity={0.9}
                    >
                      {bar.deltaPercent}
                    </text>
                  )}

                {/* Total % change label on end/subtotal bars */}
                {bar.totalDeltaPercent && (
                  <text
                    x={bar.x + bar.barWidth / 2}
                    y={bar.yTop + 20}
                    textAnchor="middle"
                    fontSize={config.fontSize.labels - 1}
                    fontWeight={config.boldDeltaLabels ? 700 : 600}
                    fill="#fff"
                    opacity={0.85}
                  >
                    {bar.totalDeltaPercent}
                  </text>
                )}

                {/* X-axis label */}
                <g transform={`translate(${bar.x + bar.barWidth / 2}, ${layout.chartInnerHeight + 12})`}>
                  {bar.label.split('\n').map((line, lineIdx) => (
                    <text
                      key={lineIdx}
                      x={0}
                      y={lineIdx * (config.fontSize.axis + 2)}
                      textAnchor="middle"
                      fontSize={config.fontSize.axis}
                      fontWeight={config.boldXAxis ? 700 : 400}
                      fill={axisColor}
                    >
                      {line}
                    </text>
                  ))}
                </g>

                {/* Start bar trend label */}
                {bar.type === 'start' && config.startBarLabel && (
                  <text
                    x={bar.x + bar.barWidth / 2}
                    y={bar.yTop + (bar.yBottom - bar.yTop) / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={config.fontSize.labels - 1}
                    fontWeight={600}
                    fill="#fff"
                    opacity={0.9}
                  >
                    {config.startBarLabel}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Title */}
        {config.title && (
          <text
            x={config.chartWidth / 2}
            y={28}
            textAnchor="middle"
            fontSize={config.fontSize.title}
            fontWeight={700}
            fill={labelColor}
          >
            {config.title}
          </text>
        )}

        {/* Subtitle */}
        {config.subtitle && (
          <text
            x={config.chartWidth / 2}
            y={48}
            textAnchor="middle"
            fontSize={config.fontSize.title - 6}
            fontWeight={400}
            fill={subtitleColor}
          >
            {config.subtitle}
          </text>
        )}

        {/* Legend */}
        {config.showLegend && (() => {
          const legendWidth = 240;
          const pos = config.legendPosition || 'top-right';
          const lx = pos.includes('center')
            ? (config.chartWidth - legendWidth) / 2
            : pos.includes('right')
            ? config.chartWidth - margin.right - legendWidth
            : margin.left;
          const ly = pos.includes('top')
            ? margin.top - 20
            : config.chartHeight - 16;
          return (
          <g transform={`translate(${lx}, ${ly})`}>
            {[
              { label: 'Increase', color: config.colors.increase },
              { label: 'Decrease', color: config.colors.decrease },
              { label: 'Total', color: config.colors.total },
            ].map((item, i) => (
              <g key={item.label} transform={`translate(${i * 80}, 0)`}>
                <rect
                  x={0}
                  y={-5}
                  width={12}
                  height={12}
                  rx={2}
                  fill={item.color}
                />
                <text
                  x={16}
                  y={5}
                  fontSize={10}
                  fontWeight={config.boldLegend ? 700 : 400}
                  fill={legendColor}
                >
                  {item.label}
                </text>
              </g>
            ))}
          </g>
          );
        })()}
      </svg>
    </div>
  );
});

export default Chart;
