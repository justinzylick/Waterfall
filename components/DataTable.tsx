'use client';

import { useCallback, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useChartData, type DataRow, type BarType, type AnnotationPosition } from '@/hooks/useChartData';

const TYPE_OPTIONS: { value: BarType; label: string }[] = [
  { value: 'start', label: 'Start' },
  { value: 'increase', label: 'Increase' },
  { value: 'decrease', label: 'Decrease' },
  { value: 'subtotal', label: 'Subtotal' },
  { value: 'end', label: 'End' },
];

function SortableRow({
  row,
  onUpdate,
  onRemove,
  canRemove,
  computedTotal,
}: {
  row: DataRow;
  onUpdate: (id: string, updates: Partial<Omit<DataRow, 'id'>>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  computedTotal: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeColor = row.type === 'increase'
    ? 'text-green-600 dark:text-green-400'
    : row.type === 'decrease'
    ? 'text-red-600 dark:text-red-400'
    : 'text-slate-600 dark:text-slate-400';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group border-b border-gray-100 dark:border-gray-800 py-1"
    >
      <div className="flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 shrink-0 w-5"
          tabIndex={-1}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="4" cy="3" r="1.2" />
            <circle cx="10" cy="3" r="1.2" />
            <circle cx="4" cy="7" r="1.2" />
            <circle cx="10" cy="7" r="1.2" />
            <circle cx="4" cy="11" r="1.2" />
            <circle cx="10" cy="11" r="1.2" />
          </svg>
        </button>
        <textarea
          name={`label-${row.id}`}
          value={row.label}
          onChange={(e) => {
            onUpdate(row.id, { label: e.target.value });
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onFocus={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onBlur={(e) => {
            e.target.style.height = '26px';
          }}
          rows={1}
          wrap="off"
          className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none rounded px-2 py-1 transition-colors resize-none overflow-hidden leading-tight whitespace-nowrap"
          style={{ height: '26px' }}
        />
        {row.type === 'end' || row.type === 'subtotal' ? (
          <div className="w-28 text-sm text-gray-400 dark:text-gray-500 px-2 py-1 tabular-nums text-right italic" title="Auto-calculated">
            {computedTotal.toLocaleString()}
          </div>
        ) : (
          <input
            type="number"
            name={`value-${row.id}`}
            value={row.value}
            onChange={(e) => onUpdate(row.id, { value: parseFloat(e.target.value) || 0 })}
            className="w-28 bg-transparent text-sm text-gray-900 dark:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none rounded px-2 py-1 transition-colors tabular-nums text-right"
          />
        )}
        <select
          name={`type-${row.id}`}
          value={row.type}
          onChange={(e) => onUpdate(row.id, { type: e.target.value as BarType })}
          className={`w-20 bg-white dark:bg-gray-900 text-xs ${typeColor} border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none rounded px-1 py-1 transition-colors cursor-pointer`}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="w-5 shrink-0">
          {canRemove && (
            <button
              onClick={() => onRemove(row.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-all"
              tabIndex={-1}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="3" x2="11" y2="11" />
                <line x1="11" y1="3" x2="3" y2="11" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {/* Annotation input — visible on hover or when annotation has content */}
      <div className={`pl-6 pr-6 pb-0.5 flex items-center gap-1 ${row.annotation ? 'block' : 'hidden group-hover:flex'}`}>
        <input
          type="text"
          name={`annotation-${row.id}`}
          value={row.annotation || ''}
          onChange={(e) => onUpdate(row.id, { annotation: e.target.value })}
          placeholder="Add annotation..."
          className="flex-1 text-xs bg-transparent text-gray-500 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none rounded px-2 py-0.5 italic transition-colors"
        />
        {row.annotation && (
          <button
            onClick={() =>
              onUpdate(row.id, {
                annotationPosition:
                  (row.annotationPosition || 'above') === 'above' ? 'below' : 'above',
              })
            }
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs px-1 py-0.5 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors shrink-0"
            title={`Position: ${row.annotationPosition || 'above'}`}
          >
            {(row.annotationPosition || 'above') === 'above' ? '↑' : '↓'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function DataTable() {
  const rows = useChartData((s) => s.rows);
  const addRow = useChartData((s) => s.addRow);
  const removeRow = useChartData((s) => s.removeRow);
  const updateRow = useChartData((s) => s.updateRow);
  const reorderRows = useChartData((s) => s.reorderRows);
  const sortRows = useChartData((s) => s.sortRows);
  const sortOrder = useChartData((s) => s.sortOrder);
  const loadExample = useChartData((s) => s.loadExample);
  const pasteData = useChartData((s) => s.pasteData);
  const fileInputRef = useRef<HTMLTextAreaElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = rows.findIndex((r) => r.id === active.id);
      const newIndex = rows.findIndex((r) => r.id === over.id);
      reorderRows(oldIndex, newIndex);
    },
    [rows, reorderRows]
  );

  const handlePaste = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      if (text.trim()) pasteData(text);
    }).catch(() => {
      if (fileInputRef.current) {
        fileInputRef.current.classList.remove('hidden');
        fileInputRef.current.focus();
      }
    });
  }, [pasteData]);

  const handleManualPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const text = e.clipboardData.getData('text');
      if (text.trim()) {
        pasteData(text);
        if (fileInputRef.current) {
          fileInputRef.current.classList.add('hidden');
          fileInputRef.current.value = '';
        }
      }
    },
    [pasteData]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Data
        </h2>
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            onClick={() => sortRows(sortOrder === 'magnitude-desc' ? 'none' : 'magnitude-desc')}
            className={`p-1 rounded transition-colors ${sortOrder === 'magnitude-desc' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'}`}
            title="Sort by magnitude (largest first)"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 4.5h6M4 7h4M5 9.5h2" />
            </svg>
          </button>
          <button
            onClick={() => sortRows(sortOrder === 'magnitude-asc' ? 'none' : 'magnitude-asc')}
            className={`p-1 rounded transition-colors ${sortOrder === 'magnitude-asc' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'}`}
            title="Sort by magnitude (smallest first)"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 2.5h2M4 5h4M3 7.5h6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider px-0">
        <div className="w-5 shrink-0" />
        <div className="flex-1 px-2 font-medium">Label</div>
        <div className="w-28 px-2 font-medium text-right">Value</div>
        <div className="w-20 px-1 font-medium">Type</div>
        <div className="w-5 shrink-0" />
      </div>

      {/* Sortable rows */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rows.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {rows.map((row, idx) => {
              // Compute running total up to this row for end/subtotal display
              let runningTotal = 0;
              for (let i = 0; i < idx; i++) {
                const r = rows[i];
                if (r.type === 'start') runningTotal = r.value;
                else if (r.type !== 'end' && r.type !== 'subtotal') runningTotal += r.value;
              }
              if (row.type === 'start') runningTotal = row.value;
              else if (row.type !== 'end' && row.type !== 'subtotal') runningTotal += row.value;

              return (
                <SortableRow
                  key={row.id}
                  row={row}
                  onUpdate={updateRow}
                  onRemove={removeRow}
                  canRemove={rows.length > 1}
                  computedTotal={runningTotal}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Hidden textarea for paste fallback */}
      <textarea
        ref={fileInputRef}
        name="paste-data"
        className="hidden w-full h-20 text-xs p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
        placeholder="Paste your data here (tab-separated: Label, Value, Type)..."
        onPaste={handleManualPaste}
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="6" y1="2" x2="6" y2="10" />
            <line x1="2" y1="6" x2="10" y2="6" />
          </svg>
          Add Row
        </button>
        <button
          onClick={handlePaste}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="1" width="7" height="9" rx="1" />
            <path d="M2 3v7a1 1 0 001 1h5" />
          </svg>
          Paste from Excel
        </button>
        <button
          onClick={loadExample}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 6h8M6 2l4 4-4 4" />
          </svg>
          Load Example
        </button>
      </div>
    </div>
  );
}
