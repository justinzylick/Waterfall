'use client';

import { useMemo, forwardRef } from 'react';
import { useTornadoData } from '@/hooks/useTornadoData';
import { useAppState } from '@/hooks/useAppState';
import { computeTornadoLayout } from '@/lib/tornadoUtils';
import { formatAxisValue } from '@/lib/formatUtils';

const TornadoChart = forwardRef<HTMLDivElement>(function TornadoChart(_, ref) {
  const categories = useTornadoData((s) => s.categories);
  const config = useTornadoData((s) => s.config);
  const isDarkMode = useAppState((s) => s.isDarkMode);

  const layout = useMemo(
    () => computeTornadoLayout(categories, config),
    [categories, config]
  );

  const labelColor = isDarkMode ? '#E5E7EB' : config.colors.label;
  const axisColor = isDarkMode ? '#D1D5DB' : '#9CA3AF';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
  const subtitleColor = isDarkMode ? '#9CA3AF' : '#9CA3AF';

  const { bars, xScale, centerX, margin, maxValue } = layout;
  const ticks = xScale.ticks(5);

  return (
    <div ref={ref} style={{ display: 'inline-block' }}>
      <svg
        width={config.chartWidth}
        height={config.chartHeight}
        viewBox={`0 0 ${config.chartWidth} ${config.chartHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ fontFamily: config.fontFamily }}
      >
        {/* Gradient defs */}
        {config.showGradients && (
          <defs>
            <linearGradient id="tornado-left-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={config.colors.left} stopOpacity={0.7} />
              <stop offset="100%" stopColor={config.colors.left} />
            </linearGradient>
            <linearGradient id="tornado-right-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={config.colors.right} />
              <stop offset="100%" stopColor={config.colors.right} stopOpacity={0.7} />
            </linearGradient>
          </defs>
        )}

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Title */}
          {config.title && (
            <text
              x={centerX}
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
              x={centerX}
              y={-margin.top + 46}
              textAnchor="middle"
              fill={subtitleColor}
              fontSize={config.fontSize.axis}
            >
              {config.subtitle}
            </text>
          )}

          {/* Side labels */}
          <text
            x={centerX - 20}
            y={-8}
            textAnchor="end"
            fill={config.colors.left}
            fontSize={config.fontSize.labels}
            fontWeight="600"
          >
            {config.leftLabel}
          </text>
          <text
            x={centerX + 20}
            y={-8}
            textAnchor="start"
            fill={config.colors.right}
            fontSize={config.fontSize.labels}
            fontWeight="600"
          >
            {config.rightLabel}
          </text>

          {/* Grid lines — mirrored from center */}
          {ticks.filter(t => t > 0).map((tick) => {
            const offset = xScale(tick);
            return (
              <g key={tick}>
                <line
                  x1={centerX - offset}
                  y1={0}
                  x2={centerX - offset}
                  y2={config.chartHeight - margin.top - margin.bottom}
                  stroke={gridColor}
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <line
                  x1={centerX + offset}
                  y1={0}
                  x2={centerX + offset}
                  y2={config.chartHeight - margin.top - margin.bottom}
                  stroke={gridColor}
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                {/* Axis labels at bottom */}
                <text
                  x={centerX - offset}
                  y={config.chartHeight - margin.top - margin.bottom + 18}
                  textAnchor="middle"
                  fill={axisColor}
                  fontSize={config.fontSize.axis}
                >
                  {formatAxisValue(tick, config.currencySymbol, config.valueFormat, config.decimalPlaces)}
                </text>
                <text
                  x={centerX + offset}
                  y={config.chartHeight - margin.top - margin.bottom + 18}
                  textAnchor="middle"
                  fill={axisColor}
                  fontSize={config.fontSize.axis}
                >
                  {formatAxisValue(tick, config.currencySymbol, config.valueFormat, config.decimalPlaces)}
                </text>
              </g>
            );
          })}

          {/* Center line */}
          <line
            x1={centerX}
            y1={0}
            x2={centerX}
            y2={config.chartHeight - margin.top - margin.bottom}
            stroke={axisColor}
            strokeWidth={1.5}
          />

          {/* Bars */}
          {bars.map((bar) => (
            <g key={bar.id}>
              {/* Left bar */}
              <rect
                x={bar.leftX}
                y={bar.y}
                width={Math.max(bar.leftWidth, 0)}
                height={bar.barH}
                fill={config.showGradients ? 'url(#tornado-left-grad)' : config.colors.left}
                rx={3}
              />

              {/* Right bar */}
              <rect
                x={bar.rightX}
                y={bar.y}
                width={Math.max(bar.rightWidth, 0)}
                height={bar.barH}
                fill={config.showGradients ? 'url(#tornado-right-grad)' : config.colors.right}
                rx={3}
              />

              {/* Category label at center */}
              <text
                x={centerX}
                y={bar.y + bar.barH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={labelColor}
                fontSize={config.fontSize.labels}
                fontWeight="600"
              >
                {bar.label}
              </text>

              {/* Value labels */}
              {config.showValues && (
                <>
                  <text
                    x={bar.leftX - 4}
                    y={bar.y + bar.barH / 2}
                    textAnchor="end"
                    dominantBaseline="central"
                    fill={labelColor}
                    fontSize={config.fontSize.axis}
                    fontWeight="500"
                  >
                    {bar.formattedLeft}
                  </text>
                  <text
                    x={bar.rightX + bar.rightWidth + 4}
                    y={bar.y + bar.barH / 2}
                    textAnchor="start"
                    dominantBaseline="central"
                    fill={labelColor}
                    fontSize={config.fontSize.axis}
                    fontWeight="500"
                  >
                    {bar.formattedRight}
                  </text>
                </>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
});

export default TornadoChart;
