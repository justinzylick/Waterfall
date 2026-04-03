'use client';

import { useState, useCallback } from 'react';
import {
  copyPngToClipboard,
  downloadPng,
  downloadSvg,
  downloadPptx,
} from '@/lib/exportUtils';
import { useAppState } from '@/hooks/useAppState';

interface ExportBarProps {
  chartRef: React.RefObject<HTMLDivElement | null>;
}

export default function ExportBar({ chartRef }: ExportBarProps) {
  const isDarkMode = useAppState((s) => s.isDarkMode);
  const toggleDarkMode = useAppState((s) => s.toggleDarkMode);
  const [toast, setToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    const announcer = document.getElementById('toast-announcer');
    if (announcer) announcer.textContent = message;
    setTimeout(() => {
      setToast(null);
      if (announcer) announcer.textContent = '';
    }, 2500);
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
    <>
      <div className="no-export absolute bottom-4 left-4 right-4 z-10 flex items-center justify-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 rounded-xl shadow-sm">
        {/* Primary actions */}
        <button
          onClick={() =>
            handleExport(
              () => copyPngToClipboard(chartRef.current!),
              'Copied — paste into your presentation!'
            )
          }
          disabled={isExporting}
          aria-label="Copy chart as PNG to clipboard"
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="2" width="8" height="10" rx="1.5" />
            <path d="M3 5v8a1.5 1.5 0 001.5 1.5H11" />
          </svg>
          {isExporting ? 'Exporting...' : 'Copy'}
        </button>

        <button
          onClick={() =>
            handleExport(
              () => downloadPptx(chartRef.current!, undefined, { isDarkMode, toggleDarkMode }),
              'PPTX downloaded!'
            )
          }
          disabled={isExporting}
          aria-label="Download chart as PPTX"
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 3v7M5 7l3 3 3-3M3 12h10" />
          </svg>
          PPTX
        </button>

        {/* Secondary actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              handleExport(
                () => downloadPng(chartRef.current!),
                'PNG downloaded!'
              )
            }
            disabled={isExporting}
            aria-label="Download chart as PNG"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 rounded-lg transition-colors"
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
            aria-label="Download chart as SVG"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2v6M3 6l3 3 3-3M2 10h8" />
            </svg>
            SVG
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div role="status" className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
