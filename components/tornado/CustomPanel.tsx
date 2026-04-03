'use client';

import { useState } from 'react';
import { useTornadoData } from '@/hooks/useTornadoData';
import ColorPicker from '@/components/ColorPicker';

const FONTS = [
  'Inter', 'Aptos', 'URW Geometric', 'Barlow', 'Outfit',
  'Plus Jakarta Sans', 'Figtree', 'Source Sans 3', 'DM Sans',
  'IBM Plex Sans', 'Roboto', 'Helvetica Neue', 'Georgia',
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
          width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      {open && <div id={id} className="pb-3 space-y-3">{children}</div>}
    </div>
  );
}

export default function TornadoCustomPanel() {
  const config = useTornadoData((s) => s.config);
  const setConfig = useTornadoData((s) => s.setConfig);
  const setColors = useTornadoData((s) => s.setColors);

  return (
    <section aria-label="Chart customization" className="space-y-1">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Customize
      </h2>

      <Section title="Title">
        <div className="space-y-2 px-1">
          <input
            type="text"
            value={config.title}
            onChange={(e) => setConfig({ title: e.target.value })}
            placeholder="Chart title"
            className="w-full px-2 py-1.5 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-md outline-none text-gray-900 dark:text-gray-100 focus:border-blue-500"
          />
          <input
            type="text"
            value={config.subtitle}
            onChange={(e) => setConfig({ subtitle: e.target.value })}
            placeholder="Subtitle"
            className="w-full px-2 py-1.5 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-md outline-none text-gray-900 dark:text-gray-100 focus:border-blue-500"
          />
        </div>
      </Section>

      <Section title="Colors">
        <div className="space-y-2 px-1">
          <ColorPicker label="Left" value={config.colors.left} onChange={(c) => setColors({ left: c })} />
          <ColorPicker label="Right" value={config.colors.right} onChange={(c) => setColors({ right: c })} />
        </div>
      </Section>

      <Section title="Fonts">
        <div className="space-y-2 px-1">
          <select
            value={config.fontFamily}
            onChange={(e) => setConfig({ fontFamily: e.target.value })}
            className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md outline-none text-gray-900 dark:text-gray-100"
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Layout">
        <div className="space-y-3 px-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Show values</span>
            <button
              onClick={() => setConfig({ showValues: !config.showValues })}
              className={`relative w-9 h-5 rounded-full transition-colors ${config.showValues ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              role="switch"
              aria-checked={config.showValues}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${config.showValues ? 'translate-x-4' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Gradients</span>
            <button
              onClick={() => setConfig({ showGradients: !config.showGradients })}
              className={`relative w-9 h-5 rounded-full transition-colors ${config.showGradients ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              role="switch"
              aria-checked={config.showGradients}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${config.showGradients ? 'translate-x-4' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Sort by magnitude</span>
            <button
              onClick={() => setConfig({ sortByMagnitude: !config.sortByMagnitude })}
              className={`relative w-9 h-5 rounded-full transition-colors ${config.sortByMagnitude ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              role="switch"
              aria-checked={config.sortByMagnitude}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${config.sortByMagnitude ? 'translate-x-4' : ''}`} />
            </button>
          </div>

          {/* Format */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">Format</span>
            <select
              value={config.valueFormat}
              onChange={(e) => setConfig({ valueFormat: e.target.value as 'full' | 'abbreviated' })}
              className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md outline-none text-gray-900 dark:text-gray-100"
            >
              <option value="abbreviated">Abbreviated</option>
              <option value="full">Full</option>
            </select>
          </div>

          {/* Currency */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">Currency</span>
            <div className="flex gap-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c || 'none'}
                  onClick={() => setConfig({ currencySymbol: c })}
                  className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                    config.currencySymbol === c
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {c || 'None'}
                </button>
              ))}
            </div>
          </div>

          {/* Decimals */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-16 shrink-0">Decimals</span>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={config.decimalPlaces}
              onChange={(e) => setConfig({ decimalPlaces: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-4 text-right tabular-nums">{config.decimalPlaces}</span>
          </div>
        </div>
      </Section>
    </section>
  );
}
