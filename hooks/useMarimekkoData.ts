import { create } from 'zustand';

export interface MarimekkoStack {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface MarimekkoSegment {
  id: string;
  label: string;
  width: number;
  stacks: MarimekkoStack[];
}

export interface MarimekkoConfig {
  title: string;
  subtitle: string;
  fontFamily: string;
  fontSize: {
    title: number;
    labels: number;
    axis: number;
  };
  chartWidth: number;
  chartHeight: number;
  segmentGap: number;
  showValues: boolean;
  showPercentages: boolean;
  showSegmentWidths: boolean;
  showGradients: boolean;
  currencySymbol: string;
  valueFormat: 'full' | 'abbreviated' | 'percentage';
  decimalPlaces: number;
  colors: string[];
  labelColor: string;
}

export interface MarimekkoStore {
  segments: MarimekkoSegment[];
  config: MarimekkoConfig;

  addSegment: () => void;
  removeSegment: (id: string) => void;
  updateSegment: (id: string, updates: Partial<Omit<MarimekkoSegment, 'id' | 'stacks'>>) => void;
  addStack: (segmentId: string) => void;
  removeStack: (segmentId: string, stackId: string) => void;
  updateStack: (segmentId: string, stackId: string, updates: Partial<Omit<MarimekkoStack, 'id'>>) => void;
  reorderSegments: (oldIndex: number, newIndex: number) => void;
  loadExample: () => void;
  setConfig: (updates: Partial<MarimekkoConfig>) => void;
  setFontSize: (updates: Partial<MarimekkoConfig['fontSize']>) => void;
}

let idCounter = 0;
function genId(prefix = 'ms'): string {
  return `${prefix}-${++idCounter}-${Date.now().toString(36)}`;
}

const DEFAULT_COLORS = [
  '#6366F1', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#EC4899', '#14B8A6', '#3B82F6', '#84CC16',
];

const EXAMPLE_DATA: MarimekkoSegment[] = [
  {
    id: genId(), label: 'Grocery', width: 35,
    stacks: [
      { id: genId('st'), label: 'Spirits', value: 45, color: DEFAULT_COLORS[0] },
      { id: genId('st'), label: 'Beer', value: 30, color: DEFAULT_COLORS[1] },
      { id: genId('st'), label: 'Wine', value: 15, color: DEFAULT_COLORS[2] },
      { id: genId('st'), label: 'RTD', value: 10, color: DEFAULT_COLORS[3] },
    ],
  },
  {
    id: genId(), label: 'Convenience', width: 20,
    stacks: [
      { id: genId('st'), label: 'Spirits', value: 25, color: DEFAULT_COLORS[0] },
      { id: genId('st'), label: 'Beer', value: 50, color: DEFAULT_COLORS[1] },
      { id: genId('st'), label: 'Wine', value: 5, color: DEFAULT_COLORS[2] },
      { id: genId('st'), label: 'RTD', value: 20, color: DEFAULT_COLORS[3] },
    ],
  },
  {
    id: genId(), label: 'Liquor', width: 25,
    stacks: [
      { id: genId('st'), label: 'Spirits', value: 60, color: DEFAULT_COLORS[0] },
      { id: genId('st'), label: 'Beer', value: 15, color: DEFAULT_COLORS[1] },
      { id: genId('st'), label: 'Wine', value: 20, color: DEFAULT_COLORS[2] },
      { id: genId('st'), label: 'RTD', value: 5, color: DEFAULT_COLORS[3] },
    ],
  },
  {
    id: genId(), label: 'On-Premise', width: 20,
    stacks: [
      { id: genId('st'), label: 'Spirits', value: 40, color: DEFAULT_COLORS[0] },
      { id: genId('st'), label: 'Beer', value: 35, color: DEFAULT_COLORS[1] },
      { id: genId('st'), label: 'Wine', value: 15, color: DEFAULT_COLORS[2] },
      { id: genId('st'), label: 'RTD', value: 10, color: DEFAULT_COLORS[3] },
    ],
  },
];

const DEFAULT_CONFIG: MarimekkoConfig = {
  title: '',
  subtitle: '',
  fontFamily: 'Inter',
  fontSize: {
    title: 20,
    labels: 11,
    axis: 10,
  },
  chartWidth: 840,
  chartHeight: 460,
  segmentGap: 3,
  showValues: true,
  showPercentages: true,
  showSegmentWidths: true,
  showGradients: false,
  currencySymbol: '$',
  valueFormat: 'percentage',
  decimalPlaces: 0,
  colors: DEFAULT_COLORS,
  labelColor: '#1F2937',
};

export const useMarimekkoData = create<MarimekkoStore>((set) => ({
  segments: EXAMPLE_DATA,
  config: DEFAULT_CONFIG,

  addSegment: () =>
    set((state) => ({
      segments: [
        ...state.segments,
        {
          id: genId(),
          label: 'New Segment',
          width: 10,
          stacks: [{ id: genId('st'), label: 'Category 1', value: 100, color: state.config.colors[0] }],
        },
      ],
    })),

  removeSegment: (id) =>
    set((state) => ({
      segments: state.segments.filter((s) => s.id !== id),
    })),

  updateSegment: (id, updates) =>
    set((state) => ({
      segments: state.segments.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  addStack: (segmentId) =>
    set((state) => ({
      segments: state.segments.map((s) =>
        s.id === segmentId
          ? {
              ...s,
              stacks: [
                ...s.stacks,
                { id: genId('st'), label: 'New', value: 10, color: state.config.colors[s.stacks.length % state.config.colors.length] },
              ],
            }
          : s
      ),
    })),

  removeStack: (segmentId, stackId) =>
    set((state) => ({
      segments: state.segments.map((s) =>
        s.id === segmentId
          ? { ...s, stacks: s.stacks.filter((st) => st.id !== stackId) }
          : s
      ),
    })),

  updateStack: (segmentId, stackId, updates) =>
    set((state) => ({
      segments: state.segments.map((s) =>
        s.id === segmentId
          ? { ...s, stacks: s.stacks.map((st) => (st.id === stackId ? { ...st, ...updates } : st)) }
          : s
      ),
    })),

  reorderSegments: (oldIndex, newIndex) =>
    set((state) => {
      const next = [...state.segments];
      const [removed] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, removed);
      return { segments: next };
    }),

  loadExample: () =>
    set({
      segments: EXAMPLE_DATA.map((s) => ({
        ...s,
        id: genId(),
        stacks: s.stacks.map((st) => ({ ...st, id: genId('st') })),
      })),
      config: { ...DEFAULT_CONFIG, title: 'Channel Mix by Category' },
    }),

  setConfig: (updates) =>
    set((state) => ({ config: { ...state.config, ...updates } })),

  setFontSize: (updates) =>
    set((state) => ({
      config: { ...state.config, fontSize: { ...state.config.fontSize, ...updates } },
    })),
}));
