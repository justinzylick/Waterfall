'use client';

import { useState } from 'react';
import { useMarimekkoData } from '@/hooks/useMarimekkoData';

export default function MarimekkoDataTable() {
  const segments = useMarimekkoData((s) => s.segments);
  const addSegment = useMarimekkoData((s) => s.addSegment);
  const removeSegment = useMarimekkoData((s) => s.removeSegment);
  const updateSegment = useMarimekkoData((s) => s.updateSegment);
  const addStack = useMarimekkoData((s) => s.addStack);
  const removeStack = useMarimekkoData((s) => s.removeStack);
  const updateStack = useMarimekkoData((s) => s.updateStack);
  const loadExample = useMarimekkoData((s) => s.loadExample);

  const [expandedSegment, setExpandedSegment] = useState<string | null>(segments[0]?.id || null);

  return (
    <section aria-label="Marimekko data" className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Data
        </h2>
      </div>

      {/* Segments */}
      <div className="space-y-1">
        {segments.map((seg) => (
          <div key={seg.id} className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
            {/* Segment header */}
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50/50 dark:bg-gray-800/30">
              <button
                onClick={() => setExpandedSegment(expandedSegment === seg.id ? null : seg.id)}
                className="p-0.5 text-gray-400 dark:text-gray-500"
                aria-label={expandedSegment === seg.id ? 'Collapse' : 'Expand'}
              >
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className={`transition-transform ${expandedSegment === seg.id ? 'rotate-90' : ''}`}
                >
                  <path d="M4 2l4 4-4 4" />
                </svg>
              </button>
              <input
                type="text"
                value={seg.label}
                onChange={(e) => updateSegment(seg.id, { label: e.target.value })}
                className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 font-medium"
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Width</span>
              <input
                type="number"
                value={seg.width || ''}
                onChange={(e) => updateSegment(seg.id, { width: Number(e.target.value) || 0 })}
                className="w-14 px-1.5 py-0.5 text-sm text-right bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 rounded outline-none text-gray-900 dark:text-gray-100 tabular-nums"
              />
              <button
                onClick={() => removeSegment(seg.id)}
                className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label={`Remove ${seg.label}`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3l6 6M9 3l-6 6" />
                </svg>
              </button>
            </div>

            {/* Expanded stacks */}
            {expandedSegment === seg.id && (
              <div className="px-2 py-1 space-y-0.5">
                <div className="grid grid-cols-[12px_1fr_60px_20px] gap-1.5 text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wide px-0.5">
                  <span />
                  <span>Category</span>
                  <span className="text-right">Value</span>
                  <span />
                </div>
                {seg.stacks.map((st) => (
                  <div key={st.id} className="grid grid-cols-[12px_1fr_60px_20px] gap-1.5 items-center group">
                    <div
                      className="w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-600 cursor-pointer"
                      style={{ backgroundColor: st.color }}
                      title={st.color}
                    />
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => updateStack(seg.id, st.id, { label: e.target.value })}
                      className="w-full px-1.5 py-1 text-xs bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 rounded outline-none text-gray-900 dark:text-gray-100"
                    />
                    <input
                      type="number"
                      value={st.value || ''}
                      onChange={(e) => updateStack(seg.id, st.id, { value: Number(e.target.value) || 0 })}
                      className="w-full px-1.5 py-1 text-xs text-right bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-500 rounded outline-none text-gray-900 dark:text-gray-100 tabular-nums"
                    />
                    <button
                      onClick={() => removeStack(seg.id, st.id)}
                      className="p-0.5 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition-all"
                      aria-label={`Remove ${st.label}`}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 2l6 6M8 2l-6 6" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addStack(seg.id)}
                  className="text-[10px] text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 px-0.5 py-0.5"
                >
                  + Add category
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={addSegment}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          + Add Segment
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
