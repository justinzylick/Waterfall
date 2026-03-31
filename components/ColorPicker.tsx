'use client';

import { useRef } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldName = `color-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => inputRef.current?.click()}
        className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer shrink-0 shadow-sm"
        style={{ backgroundColor: value }}
      />
      <input
        ref={inputRef}
        type="color"
        name={fieldName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">{label}</span>
      <input
        type="text"
        name={`${fieldName}-hex`}
        value={value}
        onChange={(e) => {
          if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
            onChange(e.target.value);
          }
        }}
        className="w-[72px] text-xs text-gray-600 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 font-mono"
      />
    </div>
  );
}
