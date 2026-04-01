export type ValueFormat = 'full' | 'abbreviated' | 'percentage';
export type NegativeFormat = 'minus' | 'parentheses';

export function formatCurrency(
  value: number,
  options: {
    symbol?: string;
    format?: ValueFormat;
    negativeFormat?: NegativeFormat;
    decimalPlaces?: number;
    startValue?: number;
  } = {}
): string {
  const {
    symbol = '$',
    format = 'full',
    negativeFormat = 'parentheses',
    decimalPlaces = 0,
    startValue,
  } = options;

  if (format === 'percentage' && startValue !== undefined && startValue !== 0) {
    const pct = ((value - startValue) / Math.abs(startValue)) * 100;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
  }

  const absValue = Math.abs(value);
  let formatted: string;

  if (format === 'abbreviated') {
    formatted = abbreviateNumber(absValue, decimalPlaces);
  } else {
    formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(absValue);
  }

  const withSymbol = symbol ? `${symbol}${formatted}` : formatted;

  if (value < 0) {
    return negativeFormat === 'parentheses'
      ? `(${withSymbol})`
      : `-${withSymbol}`;
  }

  return withSymbol;
}

export function abbreviateNumber(value: number, decimalPlaces: number = 1): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return (value / 1e12).toFixed(decimalPlaces) + 'T';
  if (abs >= 1e9) return (value / 1e9).toFixed(decimalPlaces) + 'B';
  if (abs >= 1e6) return (value / 1e6).toFixed(decimalPlaces) + 'M';
  if (abs >= 1e3) return (value / 1e3).toFixed(decimalPlaces) + 'K';
  return value.toFixed(decimalPlaces);
}

export function formatDelta(
  value: number,
  base: number,
): string {
  if (base === 0) return '—';
  const pct = (value / Math.abs(base)) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

export function formatAxisValue(
  value: number,
  symbol: string = '$',
  abbreviated: boolean = true,
): string {
  if (abbreviated) {
    return symbol + abbreviateNumber(Math.abs(value));
  }
  return symbol + new Intl.NumberFormat('en-US').format(Math.abs(value));
}

export interface ParsedRow {
  label: string;
  value: number;
  type?: string;
  annotation?: string;
}

export function parsePastedData(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  const rows: ParsedRow[] = [];

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 2) continue;

    const label = parts[0].trim();
    const rawValue = parts[1].trim().replace(/[$,()]/g, '');
    const value = parseFloat(rawValue);

    if (!label || isNaN(value)) continue;

    // Check if the original value had parentheses (negative in accounting)
    const isNegative = parts[1].includes('(') && parts[1].includes(')');
    const finalValue = isNegative ? -Math.abs(value) : value;

    const type = parts[2]?.trim().toLowerCase();
    const annotation = parts[3]?.trim() || undefined;
    rows.push({
      label,
      value: finalValue,
      type: type && ['start', 'increase', 'decrease', 'subtotal', 'end'].includes(type)
        ? type
        : undefined,
      annotation,
    });
  }

  return rows;
}
