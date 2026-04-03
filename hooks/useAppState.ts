import { create } from 'zustand';

export type ChartType = 'waterfall' | 'marimekko' | 'tornado';

interface AppState {
  activeChart: ChartType;
  setActiveChart: (chart: ChartType) => void;
  feedbackOpen: boolean;
  setFeedbackOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useAppState = create<AppState>((set) => ({
  activeChart: 'waterfall',
  setActiveChart: (chart) => set({ activeChart: chart }),
  feedbackOpen: false,
  setFeedbackOpen: (open) => set({ feedbackOpen: open }),
  isDarkMode: true,
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;
      try { localStorage.setItem('waterfall-dark-mode', String(next)); } catch {}
      return { isDarkMode: next };
    }),
}));
