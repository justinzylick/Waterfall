'use client';

import { useRef, useEffect, useState, useCallback, ReactNode } from 'react';
import ExportBar from '@/components/ExportBar';

interface ChartWorkspaceProps {
  sidebar: ReactNode;
  chart: React.ForwardRefExoticComponent<React.RefAttributes<HTMLDivElement>>;
  chartWidth: number;
  chartHeight: number;
}

export default function ChartWorkspace({ sidebar, chart: ChartComponent, chartWidth, chartHeight }: ChartWorkspaceProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [chartScale, setChartScale] = useState(1);

  const updateScale = useCallback(() => {
    const main = mainRef.current;
    if (!main) return;
    const padding = 64;
    const barHeight = 72;
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
  }, [updateScale]);

  return (
    <div className="flex h-[calc(100vh-52px)]">
      <aside aria-label="Chart configuration" className="w-[400px] shrink-0 border-r border-gray-100 dark:border-gray-800 overflow-y-auto p-4 space-y-4">
        {sidebar}
      </aside>

      <main ref={mainRef} id="main-content" aria-label="Chart preview" className="relative flex-1 min-w-0 overflow-hidden flex items-center justify-center p-8 pb-20">
        <div
          className="transparency-grid no-export rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner inline-block"
          style={{ transform: `scale(${chartScale})`, transformOrigin: 'center' }}
        >
          <ChartComponent ref={chartRef} />
        </div>
        <ExportBar chartRef={chartRef} />
      </main>
    </div>
  );
}
