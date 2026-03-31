'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useChartData } from '@/hooks/useChartData';
import Chart from '@/components/Chart';
import DataTable from '@/components/DataTable';
import CustomPanel from '@/components/CustomPanel';
import ExportBar from '@/components/ExportBar';
import ScenarioPanel from '@/components/ScenarioPanel';

export default function Home() {
  const chartRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const isDarkMode = useChartData((s) => s.isDarkMode);
  const toggleDarkMode = useChartData((s) => s.toggleDarkMode);
  const chartWidth = useChartData((s) => s.config.chartWidth);
  const chartHeight = useChartData((s) => s.config.chartHeight);
  const [mounted, setMounted] = useState(false);
  const [chartScale, setChartScale] = useState(1);

  useEffect(() => setMounted(true), []);

  const updateScale = useCallback(() => {
    const main = mainRef.current;
    if (!main) return;
    const padding = 64; // p-8 = 32px each side
    const barHeight = 72; // floating export bar + bottom gap
    const availW = main.clientWidth - padding;
    const availH = main.clientHeight - padding - barHeight;
    const scale = Math.min(availW / chartWidth, availH / chartHeight, 2);
    setChartScale(Math.max(scale, 0.5));
  }, [chartWidth, chartHeight]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(main);
    return () => ro.disconnect();
  }, [updateScale, mounted]);

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
      {/* Mobile portrait notice */}
      <div className="mobile-portrait-notice items-center justify-center fixed inset-0 z-50 bg-white dark:bg-gray-950 px-8">
        <div className="text-center space-y-3">
          <svg className="mx-auto text-gray-400 dark:text-gray-500" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M12 18h.01" />
          </svg>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            For the best experience, please rotate your device to landscape mode.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            This tool is optimized for desktop and landscape viewing.
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Image
            src="/diageo-logo-black.svg"
            alt="Diageo"
            width={40}
            height={40}
            className={`shrink-0 ${isDarkMode ? 'hidden' : 'block'}`}
            style={{ width: 40, height: 40 }}
            unoptimized
          />
          <Image
            src="/diageo-logo-gold.svg"
            alt="Diageo"
            width={40}
            height={40}
            className={`shrink-0 ${isDarkMode ? 'block' : 'hidden'}`}
            style={{ width: 40, height: 40 }}
            unoptimized
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
        <aside className="w-[400px] shrink-0 border-r border-gray-100 dark:border-gray-800 overflow-y-auto p-4 space-y-4">
          <DataTable />
          <ScenarioPanel />
          <CustomPanel />
        </aside>

        {/* Chart preview area */}
        <main ref={mainRef} className="relative flex-1 min-w-0 overflow-hidden flex items-center justify-center p-8 pb-20">
          <div
            className="transparency-grid no-export rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner inline-block"
            style={{ transform: `scale(${chartScale})`, transformOrigin: 'center' }}
          >
            <Chart ref={chartRef} />
          </div>
          <ExportBar chartRef={chartRef} />
        </main>
      </div>
    </div>
  );
}
