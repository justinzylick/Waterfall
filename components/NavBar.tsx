'use client';

import Image from 'next/image';
import { useAppState, ChartType } from '@/hooks/useAppState';

const NAV_ITEMS: { key: ChartType; label: string }[] = [
  { key: 'waterfall', label: 'Waterfall' },
  { key: 'marimekko', label: 'Marimekko' },
  { key: 'tornado', label: 'Tornado' },
];

export default function NavBar() {
  const activeChart = useAppState((s) => s.activeChart);
  const setActiveChart = useAppState((s) => s.setActiveChart);
  const isDarkMode = useAppState((s) => s.isDarkMode);
  const toggleDarkMode = useAppState((s) => s.toggleDarkMode);
  const setFeedbackOpen = useAppState((s) => s.setFeedbackOpen);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800">
      {/* Logo + title */}
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
            Chart Lab
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">
            Strategic Accounts & Customer Development
          </span>
        </div>
      </div>

      {/* Chart type nav */}
      <nav className="flex items-center gap-1" aria-label="Chart type">
        {NAV_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveChart(key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeChart === key
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            aria-current={activeChart === key ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Feedback */}
        <button
          onClick={() => setFeedbackOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          aria-label="Send feedback"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H4l-3 3V3a1 1 0 011-1z" />
          </svg>
          Feedback
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
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
      </div>
    </header>
  );
}
