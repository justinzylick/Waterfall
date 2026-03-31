'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useChartData } from '@/hooks/useChartData';
import Chart from '@/components/Chart';
import DataTable from '@/components/DataTable';
import CustomPanel from '@/components/CustomPanel';
import ExportBar from '@/components/ExportBar';

export default function Home() {
  const chartRef = useRef<HTMLDivElement>(null);
  const isDarkMode = useChartData((s) => s.isDarkMode);
  const toggleDarkMode = useChartData((s) => s.toggleDarkMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Image
            src={isDarkMode ? '/diageo-logo-gold.svg' : '/diageo-logo-black.svg'}
            alt="Diageo"
            width={32}
            height={32}
            className="shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight leading-tight">
              Diageo SA Waterfall Builder
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">
              Strategic Accounts & Customer Development
            </span>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isDarkMode ? 'Light mode' : 'Dark mode'}
        >
          {isDarkMode ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="9" r="4" />
              <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15.1 10.4A6.5 6.5 0 017.6 2.9 7 7 0 1015.1 10.4z" />
            </svg>
          )}
        </button>
      </header>

      {/* Main layout */}
      <div className="flex h-[calc(100vh-52px)]">
        {/* Left sidebar */}
        <aside className="w-[340px] shrink-0 border-r border-gray-100 dark:border-gray-800 overflow-y-auto p-4 space-y-4">
          <DataTable />
          <CustomPanel />
          <ExportBar chartRef={chartRef} />
        </aside>

        {/* Chart preview area */}
        <main className="flex-1 min-w-0 overflow-auto flex items-center justify-center p-8">
          <div className="transparency-grid no-export rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner inline-block">
            <Chart ref={chartRef} />
          </div>
        </main>
      </div>
    </div>
  );
}
