'use client';

import { useState, useEffect } from 'react';
import { useChartData } from '@/hooks/useChartData';
import type { ChartConfig, DataRow } from '@/hooks/useChartData';

interface SavedScenario {
  id: string;
  name: string;
  rows: DataRow[];
  config: ChartConfig;
  savedAt: number;
}

const STORAGE_KEY = 'waterfall-scenarios';

function loadFromStorage(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(scenarios: SavedScenario[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ScenarioPanel() {
  const rows = useChartData((s) => s.rows);
  const config = useChartData((s) => s.config);
  const loadScenario = useChartData((s) => s.loadScenario);

  const [open, setOpen] = useState(false);
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setScenarios(loadFromStorage());
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    const scenario: SavedScenario = {
      id: Date.now().toString(36),
      name: name.trim(),
      rows: rows.map((r) => ({ ...r })),
      config: { ...config, colors: { ...config.colors }, fontSize: { ...config.fontSize } },
      savedAt: Date.now(),
    };
    const updated = [scenario, ...scenarios];
    setScenarios(updated);
    saveToStorage(updated);
    setName('');
    setSaving(false);
  };

  const handleLoad = (scenario: SavedScenario) => {
    loadScenario(scenario.rows, scenario.config);
  };

  const handleDelete = (id: string) => {
    const updated = scenarios.filter((s) => s.id !== id);
    setScenarios(updated);
    saveToStorage(updated);
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="scenario-list"
        className="w-full flex items-center justify-between py-2.5 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        Scenarios
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <div id="scenario-list" className="pb-3 space-y-2">
          {/* Save UI */}
          {saving ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                name="scenario-name"
                aria-label="Scenario name"
                placeholder="Scenario name..."
                autoFocus
                className="flex-1 min-w-0 text-xs bg-transparent text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-40 px-1.5 py-1.5"
              >
                Save
              </button>
              <button
                onClick={() => { setSaving(false); setName(''); }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1 py-1.5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSaving(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-1"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2.5v7M2.5 6h7" />
              </svg>
              Save Current
            </button>
          )}

          {/* Scenario list */}
          {scenarios.length === 0 && !saving && (
            <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
              No saved scenarios yet.
            </p>
          )}

          {scenarios.map((s) => (
            <div
              key={s.id}
              className="group flex items-center gap-1.5 px-1 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {s.name}
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500">
                  {s.rows.length} bars &middot; {timeAgo(s.savedAt)}
                </div>
              </div>
              <button
                onClick={() => handleLoad(s)}
                aria-label={`Load scenario ${s.name}`}
                className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-1.5 py-0.5 rounded border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
              >
                Load
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all p-0.5"
                aria-label={`Delete scenario ${s.name}`}
                title="Delete scenario"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3l6 6M9 3l-6 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
