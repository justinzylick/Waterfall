'use client';

import { useTornadoData } from '@/hooks/useTornadoData';

export default function TornadoDataTable() {
  const categories = useTornadoData((s) => s.categories);
  const addCategory = useTornadoData((s) => s.addCategory);
  const removeCategory = useTornadoData((s) => s.removeCategory);
  const updateCategory = useTornadoData((s) => s.updateCategory);
  const loadExample = useTornadoData((s) => s.loadExample);
  const config = useTornadoData((s) => s.config);
  const setConfig = useTornadoData((s) => s.setConfig);

  return (
    <section aria-label="Tornado data" className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Data
        </h2>
      </div>

      {/* Column headers — editable */}
      <div className="grid grid-cols-[1fr_80px_80px_28px] gap-2 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1">
        <input
          type="text"
          value={config.categoryLabel}
          onChange={(e) => setConfig({ categoryLabel: e.target.value })}
          className="text-[10px] font-medium uppercase tracking-wide bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 rounded px-1 py-0.5 outline-none text-gray-400 dark:text-gray-500 focus:text-gray-900 dark:focus:text-gray-100 transition-colors"
        />
        <input
          type="text"
          value={config.leftLabel}
          onChange={(e) => setConfig({ leftLabel: e.target.value })}
          className="text-right text-[10px] font-medium uppercase tracking-wide bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 rounded px-1 py-0.5 outline-none text-gray-400 dark:text-gray-500 focus:text-gray-900 dark:focus:text-gray-100 transition-colors"
        />
        <input
          type="text"
          value={config.rightLabel}
          onChange={(e) => setConfig({ rightLabel: e.target.value })}
          className="text-right text-[10px] font-medium uppercase tracking-wide bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 rounded px-1 py-0.5 outline-none text-gray-400 dark:text-gray-500 focus:text-gray-900 dark:focus:text-gray-100 transition-colors"
        />
        <span />
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {categories.map((cat) => (
          <div key={cat.id} className="grid grid-cols-[1fr_80px_80px_28px] gap-2 items-center group">
            <input
              type="text"
              value={cat.label}
              onChange={(e) => updateCategory(cat.id, { label: e.target.value })}
              className="w-full px-2 py-1.5 text-sm bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-md outline-none text-gray-900 dark:text-gray-100 transition-colors"
            />
            <input
              type="number"
              value={cat.leftValue || ''}
              onChange={(e) => updateCategory(cat.id, { leftValue: Number(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 text-sm text-right bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-md outline-none text-gray-900 dark:text-gray-100 transition-colors tabular-nums"
            />
            <input
              type="number"
              value={cat.rightValue || ''}
              onChange={(e) => updateCategory(cat.id, { rightValue: Number(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 text-sm text-right bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-md outline-none text-gray-900 dark:text-gray-100 transition-colors tabular-nums"
            />
            <button
              onClick={() => removeCategory(cat.id)}
              className="p-1 rounded text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition-all"
              aria-label={`Remove ${cat.label}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l8 8M11 3l-8 8" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={addCategory}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          + Add Row
        </button>
        <button
          onClick={loadExample}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
        >
          Load Example
        </button>
      </div>
    </section>
  );
}
