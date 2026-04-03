'use client';

import { useState } from 'react';
import { useMarimekkoData } from '@/hooks/useMarimekkoData';

const FONTS = [
  'Inter', 'Aptos', 'URW Geometric', 'Barlow', 'Outfit',
  'Plus Jakarta Sans', 'Figtree', 'Source Sans 3', 'DM Sans',
  'IBM Plex Sans', 'Roboto', 'Helvetica Neue', 'Georgia',
];

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

export default function MarimekkoCustomPanel() {
  const config = useMarimekkoData((s) => s.config);
  const setConfig = useMarimekkoData((s) => s.setConfig);

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
            <span className="text-xs text-gray-500 dark:text-gray-400">Show percentages</span>
            <button
              onClick={() => setConfig({ showPercentages: !config.showPercentages })}
              className={`relative w-9 h-5 rounded-full transition-colors ${config.showPercentages ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              role="switch"
              aria-checked={config.showPercentages}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${config.showPercentages ? 'translate-x-4' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Show segment widths</span>
            <button
              onClick={() => setConfig({ showSegmentWidths: !config.showSegmentWidths })}
              className={`relative w-9 h-5 rounded-full transition-colors ${config.showSegmentWidths ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              role="switch"
              aria-checked={config.showSegmentWidths}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${config.showSegmentWidths ? 'translate-x-4' : ''}`} />
            </button>
          </div>

          {/* Segment gap */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Segment gap</span>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={config.segmentGap}
              onChange={(e) => setConfig({ segmentGap: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-4 text-right tabular-nums">{config.segmentGap}</span>
          </div>
        </div>
      </Section>
    </section>
  );
}
