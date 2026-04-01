import { create } from 'zustand';
import { parsePastedData } from '@/lib/formatUtils';

export type BarType = 'start' | 'increase' | 'decrease' | 'subtotal' | 'end';
export type ValueFormat = 'full' | 'abbreviated' | 'percentage';
export type NegativeFormat = 'minus' | 'parentheses';
export type DeltaBase = 'start' | 'previous';
export type LegendPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
export type SortOrder = 'none' | 'magnitude-desc' | 'magnitude-asc';

export type AnnotationPosition = 'above' | 'below';

export interface DataRow {
  id: string;
  label: string;
  value: number;
  type: BarType;
  annotation?: string;
  annotationPosition?: AnnotationPosition;
}

export interface ChartConfig {
  colors: {
    increase: string;
    decrease: string;
    total: string;
    connector: string;
    label: string;
  };
  palette: string;
  fontFamily: string;
  fontSize: {
    title: number;
    labels: number;
    axis: number;
  };
  title: string;
  subtitle: string;
  barWidth: number;
  barGap: number;
  showConnectors: boolean;
  showGradients: boolean;
  showShadows: boolean;
  showValueLabels: boolean;
  showDeltaLabels: boolean;
  showLegend: boolean;
  showYAxis: boolean;
  valueFormat: ValueFormat;
  negativeFormat: NegativeFormat;
  currencySymbol: string;
  decimalPlaces: number;
  deltaBase: DeltaBase;
  chartWidth: number;
  chartHeight: number;
  boldXAxis: boolean;
  boldYAxis: boolean;
  boldLegend: boolean;
  boldValueLabels: boolean;
  boldDeltaLabels: boolean;
  startBarLabel: string;
  legendPosition: LegendPosition;
  yAxisMax: number | null;
  showAnnotations: boolean;
}

export interface ChartStore {
  rows: DataRow[];
  config: ChartConfig;
  isDarkMode: boolean;
  sortOrder: SortOrder;
  originalRows: DataRow[] | null;

  addRow: () => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, updates: Partial<Omit<DataRow, 'id'>>) => void;
  reorderRows: (oldIndex: number, newIndex: number) => void;
  sortRows: (order: SortOrder) => void;
  loadExample: () => void;
  pasteData: (text: string) => void;
  setConfig: (updates: Partial<ChartConfig>) => void;
  setColors: (updates: Partial<ChartConfig['colors']>) => void;
  setFontSize: (updates: Partial<ChartConfig['fontSize']>) => void;
  loadScenario: (rows: DataRow[], config: ChartConfig) => void;
  toggleDarkMode: () => void;
}

let idCounter = 0;
function genId(): string {
  return `row-${++idCounter}-${Date.now().toString(36)}`;
}

function autoDetectType(value: number, index: number, total: number): BarType {
  if (index === 0) return 'start';
  if (index === total - 1) return 'end';
  return value >= 0 ? 'increase' : 'decrease';
}

const EXAMPLE_DATA: DataRow[] = [
  { id: genId(), label: 'F26 H1 RSV', value: 100000000, type: 'start' },
  { id: genId(), label: 'L24W Trend', value: -2500000, type: 'decrease' },
  { id: genId(), label: 'Risk', value: -1500000, type: 'decrease' },
  { id: genId(), label: 'Opportunities', value: 2000000, type: 'increase', annotation: 'Distribution gains' },
  { id: genId(), label: 'YR 1 Innovation\n(F27 launches)', value: 700000, type: 'increase' },
  { id: genId(), label: 'YR 2 Innovation\n(F26 launches)', value: -250000, type: 'decrease' },
  { id: genId(), label: 'F27 H1 RSV\nProjection', value: 0, type: 'end' },
];

const DEFAULT_CONFIG: ChartConfig = {
  colors: {
    increase: '#2E7D32',
    decrease: '#C62828',
    total: '#37474F',
    connector: '#9CA3AF',
    label: '#1F2937',
  },
  palette: 'corporate',
  fontFamily: 'Inter',
  fontSize: {
    title: 20,
    labels: 12,
    axis: 11,
  },
  title: '',
  subtitle: '',
  barWidth: 0.75,
  barGap: 0.1,
  showConnectors: true,
  showGradients: true,
  showShadows: false,
  showValueLabels: true,
  showDeltaLabels: true,
  showLegend: false,
  showYAxis: true,
  valueFormat: 'abbreviated',
  negativeFormat: 'parentheses',
  currencySymbol: '$',
  decimalPlaces: 1,
  deltaBase: 'start',
  chartWidth: 840,
  chartHeight: 460,
  boldXAxis: true,
  boldYAxis: true,
  boldLegend: true,
  boldValueLabels: true,
  boldDeltaLabels: true,
  startBarLabel: '-0.7%',
  legendPosition: 'top-right',
  yAxisMax: null,
  showAnnotations: true,
};

export const useChartData = create<ChartStore>((set) => ({
  rows: EXAMPLE_DATA,
  config: DEFAULT_CONFIG,
  isDarkMode: true,
  sortOrder: 'none' as SortOrder,
  originalRows: null,

  addRow: () =>
    set((state) => ({
      rows: [
        ...state.rows,
        { id: genId(), label: 'New Item', value: 0, type: 'increase' },
      ],
      sortOrder: 'none' as SortOrder,
      originalRows: null,
    })),

  removeRow: (id) =>
    set((state) => ({
      rows: state.rows.filter((r) => r.id !== id),
      sortOrder: 'none' as SortOrder,
      originalRows: null,
    })),

  updateRow: (id, updates) =>
    set((state) => ({
      rows: state.rows.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  reorderRows: (oldIndex, newIndex) =>
    set((state) => {
      const newRows = [...state.rows];
      const [removed] = newRows.splice(oldIndex, 1);
      newRows.splice(newIndex, 0, removed);
      return { rows: newRows, sortOrder: 'none' as SortOrder, originalRows: null };
    }),

  sortRows: (order) =>
    set((state) => {
      if (order === 'none') {
        return {
          rows: state.originalRows ? state.originalRows : state.rows,
          sortOrder: 'none' as SortOrder,
          originalRows: null,
        };
      }

      // Snapshot original order on first sort
      const originalRows = state.originalRows || [...state.rows];
      // Always sort from original order to avoid compounding sorts
      const newRows = [...originalRows];

      // Find indices of change bars (increase/decrease)
      const changeIndices: number[] = [];
      const changeBars: DataRow[] = [];
      newRows.forEach((r, i) => {
        if (r.type === 'increase' || r.type === 'decrease') {
          changeIndices.push(i);
          changeBars.push(r);
        }
      });

      // Sort change bars by absolute value
      changeBars.sort((a, b) =>
        order === 'magnitude-desc'
          ? Math.abs(b.value) - Math.abs(a.value)
          : Math.abs(a.value) - Math.abs(b.value)
      );

      // Place sorted bars back at their original positions
      changeIndices.forEach((idx, i) => {
        newRows[idx] = changeBars[i];
      });

      return { rows: newRows, sortOrder: order, originalRows };
    }),

  loadExample: () =>
    set({
      rows: EXAMPLE_DATA.map((r) => ({ ...r, id: genId() })),
      config: { ...DEFAULT_CONFIG, title: 'Revenue Bridge \u2014 F26 to F27' },
      sortOrder: 'none' as SortOrder,
      originalRows: null,
    }),

  pasteData: (text) =>
    set((state) => {
      const parsed = parsePastedData(text);
      if (parsed.length === 0) return state;
      const rows: DataRow[] = parsed.map((p, i) => ({
        id: genId(),
        label: p.label,
        value: p.value,
        type: (p.type as BarType) || autoDetectType(p.value, i, parsed.length),
        annotation: p.annotation,
      }));
      return { rows, sortOrder: 'none' as SortOrder, originalRows: null };
    }),

  setConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),

  setColors: (updates) =>
    set((state) => ({
      config: {
        ...state.config,
        colors: { ...state.config.colors, ...updates },
      },
    })),

  setFontSize: (updates) =>
    set((state) => ({
      config: {
        ...state.config,
        fontSize: { ...state.config.fontSize, ...updates },
      },
    })),

  loadScenario: (rows, config) =>
    set({ rows, config, sortOrder: 'none' as SortOrder, originalRows: null }),

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;
      try { localStorage.setItem('waterfall-dark-mode', String(next)); } catch {}
      return { isDarkMode: next };
    }),
}));
