import { create } from 'zustand';

export interface TornadoCategory {
  id: string;
  label: string;
  leftValue: number;
  rightValue: number;
}

export interface TornadoConfig {
  title: string;
  subtitle: string;
  categoryLabel: string;
  leftLabel: string;
  rightLabel: string;
  colors: {
    left: string;
    right: string;
    label: string;
  };
  fontFamily: string;
  fontSize: {
    title: number;
    labels: number;
    axis: number;
  };
  chartWidth: number;
  chartHeight: number;
  barHeight: number;
  barGap: number;
  showValues: boolean;
  showPercentages: boolean;
  showGradients: boolean;
  sortByMagnitude: boolean;
  currencySymbol: string;
  valueFormat: 'full' | 'abbreviated';
  negativeFormat: 'minus' | 'parentheses';
  decimalPlaces: number;
}

export interface TornadoStore {
  categories: TornadoCategory[];
  config: TornadoConfig;

  addCategory: () => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, updates: Partial<Omit<TornadoCategory, 'id'>>) => void;
  reorderCategories: (oldIndex: number, newIndex: number) => void;
  loadExample: () => void;
  setConfig: (updates: Partial<TornadoConfig>) => void;
  setColors: (updates: Partial<TornadoConfig['colors']>) => void;
  setFontSize: (updates: Partial<TornadoConfig['fontSize']>) => void;
}

let idCounter = 0;
function genId(): string {
  return `tc-${++idCounter}-${Date.now().toString(36)}`;
}

const EXAMPLE_DATA: TornadoCategory[] = [
  { id: genId(), label: 'NAW', leftValue: 185, rightValue: 210 },
  { id: genId(), label: 'Vodka', leftValue: 120, rightValue: 95 },
  { id: genId(), label: 'Tequila', leftValue: 75, rightValue: 130 },
  { id: genId(), label: 'Rum', leftValue: 60, rightValue: 45 },
  { id: genId(), label: 'Cordials', leftValue: 35, rightValue: 44 },
  { id: genId(), label: 'RTD', leftValue: 90, rightValue: 10 },
  { id: genId(), label: 'RTS', leftValue: 55, rightValue: 42 },
];

const DEFAULT_CONFIG: TornadoConfig = {
  title: '',
  subtitle: '',
  categoryLabel: 'Segment',
  leftLabel: 'Competitor',
  rightLabel: 'Diageo',
  colors: {
    left: '#6366F1',
    right: '#F43F5E',
    label: '#1F2937',
  },
  fontFamily: 'Inter',
  fontSize: {
    title: 20,
    labels: 12,
    axis: 11,
  },
  chartWidth: 840,
  chartHeight: 460,
  barHeight: 0.7,
  barGap: 0.15,
  showValues: true,
  showPercentages: false,
  showGradients: true,
  sortByMagnitude: false,
  currencySymbol: '$',
  valueFormat: 'abbreviated',
  negativeFormat: 'parentheses',
  decimalPlaces: 1,
};

export const useTornadoData = create<TornadoStore>((set) => ({
  categories: EXAMPLE_DATA,
  config: DEFAULT_CONFIG,

  addCategory: () =>
    set((state) => ({
      categories: [
        ...state.categories,
        { id: genId(), label: 'New Category', leftValue: 0, rightValue: 0 },
      ],
    })),

  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  reorderCategories: (oldIndex, newIndex) =>
    set((state) => {
      const next = [...state.categories];
      const [removed] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, removed);
      return { categories: next };
    }),

  loadExample: () =>
    set({
      categories: EXAMPLE_DATA.map((c) => ({ ...c, id: genId() })),
      config: { ...DEFAULT_CONFIG, title: 'Category Share Comparison' },
    }),

  setConfig: (updates) =>
    set((state) => ({ config: { ...state.config, ...updates } })),

  setColors: (updates) =>
    set((state) => ({
      config: { ...state.config, colors: { ...state.config.colors, ...updates } },
    })),

  setFontSize: (updates) =>
    set((state) => ({
      config: { ...state.config, fontSize: { ...state.config.fontSize, ...updates } },
    })),
}));
