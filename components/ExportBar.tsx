'use client';

import { useState, useCallback } from 'react';
import {
  copyPngToClipboard,
  downloadPng,
  downloadSvg,
  copySvgToClipboard,
} from '@/lib/exportUtils';

interface ExportBarProps {
  chartRef: React.RefObject<HTMLDivElement | null>;
}

export default function ExportBar({ chartRef }: ExportBarProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleExport = useCallback(
    async (action: () => Promise<void>, successMessage: string) => {
      if (!chartRef.current || isExporting) return;
      setIsExporting(true);
      try {
        await action();
        showToast(successMessage);
      } catch (err) {
        showToast(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsExporting(false);
      }
    },
    [chartRef, isExporting, showToast]
  );

  return (
    <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Export
      </h2>

      {/* Primary CTA */}
      <button
        onClick={() =>
          handleExport(
            () => copyPngToClipboard(chartRef.current!),
            'Copied to clipboard — paste into your presentation!'
          )
        }
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="2" width="8" height="10" rx="1.5" />
          <path d="M3 5v8a1.5 1.5 0 001.5 1.5H11" />
        </svg>
        {isExporting ? 'Exporting...' : 'Copy to Clipboard'}
      </button>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() =>
            handleExport(
              () => downloadPng(chartRef.current!),
              'PNG downloaded!'
            )
          }
          disabled={isExporting}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2v6M3 6l3 3 3-3M2 10h8" />
          </svg>
          PNG
        </button>
        <button
          onClick={() =>
            handleExport(
              () => downloadSvg(chartRef.current!),
              'SVG downloaded!'
            )
          }
          disabled={isExporting}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2v6M3 6l3 3 3-3M2 10h8" />
          </svg>
          SVG
        </button>
      </div>

      <button
        onClick={() =>
          handleExport(
            () => copySvgToClipboard(chartRef.current!),
            'SVG markup copied!'
          )
        }
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        Copy SVG Markup
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
