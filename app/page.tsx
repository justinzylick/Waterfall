'use client';

import { useEffect, useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useChartData } from '@/hooks/useChartData';
import { useTornadoData } from '@/hooks/useTornadoData';
import { useMarimekkoData } from '@/hooks/useMarimekkoData';
import NavBar from '@/components/NavBar';
import ChartWorkspace from '@/components/ChartWorkspace';
import FeedbackDrawer from '@/components/FeedbackDrawer';
import Chart from '@/components/waterfall/Chart';
import DataTable from '@/components/waterfall/DataTable';
import CustomPanel from '@/components/waterfall/CustomPanel';
import ScenarioPanel from '@/components/waterfall/ScenarioPanel';
import TornadoChart from '@/components/tornado/Chart';
import TornadoDataTable from '@/components/tornado/DataTable';
import TornadoCustomPanel from '@/components/tornado/CustomPanel';
import MarimekkoChart from '@/components/marimekko/Chart';
import MarimekkoDataTable from '@/components/marimekko/DataTable';
import MarimekkoCustomPanel from '@/components/marimekko/CustomPanel';

export default function Home() {
  const isDarkMode = useAppState((s) => s.isDarkMode);
  const toggleDarkMode = useAppState((s) => s.toggleDarkMode);
  const activeChart = useAppState((s) => s.activeChart);
  const chartWidth = useChartData((s) => s.config.chartWidth);
  const chartHeight = useChartData((s) => s.config.chartHeight);
  const tornadoWidth = useTornadoData((s) => s.config.chartWidth);
  const tornadoHeight = useTornadoData((s) => s.config.chartHeight);
  const marimekkoWidth = useMarimekkoData((s) => s.config.chartWidth);
  const marimekkoHeight = useMarimekkoData((s) => s.config.chartHeight);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydrate dark mode from localStorage on mount
    try {
      const saved = localStorage.getItem('waterfall-dark-mode');
      if (saved === 'false' && useAppState.getState().isDarkMode) {
        toggleDarkMode();
      }
    } catch {}
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* Skip navigation link */}
      <a href="#main-content" className="skip-link">
        Skip to chart
      </a>

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

      <NavBar />

      {activeChart === 'waterfall' && (
        <ChartWorkspace
          sidebar={
            <>
              <DataTable />
              <ScenarioPanel />
              <CustomPanel />
            </>
          }
          chart={Chart}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
        />
      )}

      {activeChart === 'marimekko' && (
        <ChartWorkspace
          sidebar={
            <>
              <MarimekkoDataTable />
              <MarimekkoCustomPanel />
            </>
          }
          chart={MarimekkoChart}
          chartWidth={marimekkoWidth}
          chartHeight={marimekkoHeight}
        />
      )}

      {activeChart === 'tornado' && (
        <ChartWorkspace
          sidebar={
            <>
              <TornadoDataTable />
              <TornadoCustomPanel />
            </>
          }
          chart={TornadoChart}
          chartWidth={tornadoWidth}
          chartHeight={tornadoHeight}
        />
      )}

      <FeedbackDrawer />

      {/* Live region for screen reader toast announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="toast-announcer" />
    </div>
  );
}
