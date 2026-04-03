'use client';

import { useState } from 'react';
import { useChartData } from '@/hooks/useChartData';
import ColorPicker from '@/components/ColorPicker';

const PALETTES: Record<string, { increase: string; decrease: string; total: string }> = {
  corporate: { increase: '#2E7D32', decrease: '#C62828', total: '#37474F' },
  modern: { increase: '#0D9488', decrease: '#E11D48', total: '#475569' },
  monochrome: { increase: '#6B7280', decrease: '#374151', total: '#111827' },
  ocean: { increase: '#0284C7', decrease: '#DC2626', total: '#1E293B' },
};

const FONTS = [
  'Inter',
  'Aptos',
  'URW Geometric',
  'Barlow',
  'Outfit',
  'Plus Jakarta Sans',
  'Figtree',
  'Source Sans 3',
  'DM Sans',
  'IBM Plex Sans',
  'Roboto',
  'Helvetica Neue',
  'Georgia',
];

const CURRENCIES = ['$', '€', '£', '¥', ''];

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between py-2.5 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        {title}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      {open && <div id={id} className="pb-3 space-y-2.5">{children}</div>}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const fieldName = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">{label}</span>
      <input
        type="range"
        name={fieldName}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value}${suffix}`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 accent-blue-500"
      />
      <span className="text-xs text-gray-400 dark:text-gray-500 w-10 text-right tabular-nums">
        {value}{suffix}
      </span>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`w-8 h-[18px] rounded-full transition-colors relative ${
          checked ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        aria-hidden="true"
      >
        <div
          className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
          }`}
        />
      </div>
    </label>
  );
}

export default function CustomPanel() {
  const config = useChartData((s) => s.config);
  const setConfig = useChartData((s) => s.setConfig);
  const setColors = useChartData((s) => s.setColors);
  const setFontSize = useChartData((s) => s.setFontSize);

  return (
    <div className="space-y-0">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
        Customize
      </h2>

      {/* Title / Subtitle */}
      <Section title="Title" defaultOpen={false}>
        <input
          type="text"
          name="chart-title"
          aria-label="Chart title"
          value={config.title}
          onChange={(e) => setConfig({ title: e.target.value })}
          placeholder="Chart title..."
          className="w-full text-sm bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 focus:border-blue-400 focus:outline-none"
        />
        <input
          type="text"
          name="chart-subtitle"
          aria-label="Chart subtitle"
          value={config.subtitle}
          onChange={(e) => setConfig({ subtitle: e.target.value })}
          placeholder="Subtitle (optional)..."
          className="w-full text-xs bg-transparent text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 focus:border-blue-400 focus:outline-none"
        />
      </Section>

      {/* Colors */}
      <Section title="Colors" defaultOpen={false}>
        <ColorPicker
          label="Increase"
          value={config.colors.increase}
          onChange={(c) => setColors({ increase: c })}
        />
        <ColorPicker
          label="Decrease"
          value={config.colors.decrease}
          onChange={(c) => setColors({ decrease: c })}
        />
        <ColorPicker
          label="Total"
          value={config.colors.total}
          onChange={(c) => setColors({ total: c })}
        />
        <div className="pt-1">
          <span className="text-xs text-gray-400 dark:text-gray-500 mb-1.5 block">Presets</span>
          <div className="flex gap-2">
            {Object.entries(PALETTES).map(([name, colors]) => (
              <button
                key={name}
                onClick={() => {
                  setColors(colors);
                  setConfig({ palette: name });
                }}
                className={`flex gap-0.5 p-1 rounded-md border transition-colors ${
                  config.palette === name
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                aria-label={`Color preset: ${name}`}
                aria-pressed={config.palette === name}
                title={name}
              >
                {Object.values(colors).map((c, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Fonts */}
      <Section title="Fonts">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Font</span>
          <select
            name="font-family"
            aria-label="Font family"
            value={config.fontFamily}
            onChange={(e) => setConfig({ fontFamily: e.target.value })}
            className="flex-1 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 cursor-pointer"
          >
            {FONTS.map((f) => (
              <option key={f} value={f} className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                {f}
              </option>
            ))}
          </select>
        </div>
        <SliderRow label="Title" value={config.fontSize.title} min={12} max={32} onChange={(v) => setFontSize({ title: v })} suffix="px" />
        <SliderRow label="Labels" value={config.fontSize.labels} min={8} max={18} onChange={(v) => setFontSize({ labels: v })} suffix="px" />
        <SliderRow label="Axis" value={config.fontSize.axis} min={8} max={16} onChange={(v) => setFontSize({ axis: v })} suffix="px" />
      </Section>

      {/* Layout */}
      <Section title="Layout">
        <SliderRow label="Width" value={config.chartWidth} min={400} max={1200} step={10} onChange={(v) => setConfig({ chartWidth: v })} suffix="px" />
        <SliderRow label="Height" value={config.chartHeight} min={300} max={800} step={10} onChange={(v) => setConfig({ chartHeight: v })} suffix="px" />
        <SliderRow label="Bar Width" value={config.barWidth} min={0.2} max={0.9} step={0.05} onChange={(v) => setConfig({ barWidth: v })} />
        <SliderRow label="Spacing" value={config.barGap} min={0.05} max={0.4} step={0.05} onChange={(v) => setConfig({ barGap: v })} />
        <ToggleRow label="Connectors" checked={config.showConnectors} onChange={(v) => setConfig({ showConnectors: v })} />
        <ToggleRow label="Gradients" checked={config.showGradients} onChange={(v) => setConfig({ showGradients: v })} />
        <ToggleRow label="Shadows" checked={config.showShadows} onChange={(v) => setConfig({ showShadows: v })} />
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Y-axis max</span>
          <input
            type="number"
            name="y-axis-max"
            aria-label="Y-axis maximum value"
            value={config.yAxisMax ?? ''}
            onChange={(e) => setConfig({ yAxisMax: e.target.value === '' ? null : parseFloat(e.target.value) })}
            placeholder="Auto"
            className="flex-1 text-xs bg-transparent text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 tabular-nums"
          />
        </div>
      </Section>

      {/* Labels */}
      <Section title="Labels">
        <ToggleRow label="Value labels" checked={config.showValueLabels} onChange={(v) => setConfig({ showValueLabels: v })} />
        <ToggleRow label="Delta labels" checked={config.showDeltaLabels} onChange={(v) => setConfig({ showDeltaLabels: v })} />
        <ToggleRow label="Annotations" checked={config.showAnnotations} onChange={(v) => setConfig({ showAnnotations: v })} />
        <ToggleRow label="Legend" checked={config.showLegend} onChange={(v) => setConfig({ showLegend: v })} />
        {config.showLegend && (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Position</span>
            <select
              name="legend-position"
              aria-label="Legend position"
              value={config.legendPosition || 'top-right'}
              onChange={(e) => setConfig({ legendPosition: e.target.value as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' })}
              className="flex-1 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 cursor-pointer"
            >
              <option value="top-right">Top Right</option>
              <option value="top-center">Top Center</option>
              <option value="top-left">Top Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </div>
        )}
        <ToggleRow label="Y-axis" checked={config.showYAxis} onChange={(v) => setConfig({ showYAxis: v })} />

        <div className="pt-2 pb-1">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Bold</span>
        </div>
        <ToggleRow label="X-axis labels" checked={config.boldXAxis} onChange={(v) => setConfig({ boldXAxis: v })} />
        <ToggleRow label="Y-axis labels" checked={config.boldYAxis} onChange={(v) => setConfig({ boldYAxis: v })} />
        <ToggleRow label="Value labels" checked={config.boldValueLabels} onChange={(v) => setConfig({ boldValueLabels: v })} />
        <ToggleRow label="Delta labels" checked={config.boldDeltaLabels} onChange={(v) => setConfig({ boldDeltaLabels: v })} />
        <ToggleRow label="Legend" checked={config.boldLegend} onChange={(v) => setConfig({ boldLegend: v })} />

        <div className="pt-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Start bar label</span>
        </div>
        <input
          type="text"
          name="start-bar-label"
          aria-label="Start bar label"
          value={config.startBarLabel}
          onChange={(e) => setConfig({ startBarLabel: e.target.value })}
          placeholder="e.g. F26 H1 Trend"
          className="w-full text-xs bg-transparent text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 focus:border-blue-400 focus:outline-none"
        />

        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Format</span>
          <select
            name="value-format"
            aria-label="Value format"
            value={config.valueFormat}
            onChange={(e) => setConfig({ valueFormat: e.target.value as 'full' | 'abbreviated' | 'percentage' })}
            className="flex-1 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 cursor-pointer"
          >
            <option value="full">Full ($1,000,000)</option>
            <option value="abbreviated">Abbreviated ($1.0M)</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Negatives</span>
          <select
            name="negative-format"
            aria-label="Negative number format"
            value={config.negativeFormat}
            onChange={(e) => setConfig({ negativeFormat: e.target.value as 'minus' | 'parentheses' })}
            className="flex-1 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 cursor-pointer"
          >
            <option value="parentheses">Parentheses ($1M)</option>
            <option value="minus">Minus -$1M</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Currency</span>
          <div className="flex gap-1">
            {CURRENCIES.map((c) => (
              <button
                key={c || 'none'}
                onClick={() => setConfig({ currencySymbol: c })}
                aria-label={c ? `Currency: ${c}` : 'No currency symbol'}
                aria-pressed={config.currencySymbol === c}
                className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                  config.currencySymbol === c
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                }`}
              >
                {c || 'None'}
              </button>
            ))}
          </div>
        </div>

        <SliderRow label="Decimals" value={config.decimalPlaces} min={0} max={2} onChange={(v) => setConfig({ decimalPlaces: v })} />

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Delta base</span>
          <select
            name="delta-base"
            aria-label="Delta calculation base"
            value={config.deltaBase}
            onChange={(e) => setConfig({ deltaBase: e.target.value as 'start' | 'previous' })}
            className="flex-1 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 cursor-pointer"
          >
            <option value="start">Relative to start</option>
            <option value="previous">Relative to previous</option>
          </select>
        </div>
      </Section>
    </div>
  );
}
