import { c, sym } from './theme.js';

export interface Column {
  key: string;
  label: string;
  width?: number;
  color?: (val: string) => string;
}

export function renderTable(columns: Column[], rows: Record<string, string>[]): string {
  const widths = columns.map((col) => {
    const maxData = rows.reduce((max, row) => Math.max(max, (row[col.key] || '').length), 0);
    return col.width || Math.max(col.label.length, maxData) + 2;
  });

  const header = columns
    .map((col, i) => c.bold(col.label.padEnd(widths[i])))
    .join('  ');

  const separator = columns
    .map((_, i) => c.muted('\u2500'.repeat(widths[i])))
    .join('  ');

  const body = rows.map((row) =>
    columns
      .map((col, i) => {
        const val = row[col.key] || '';
        const padded = val.padEnd(widths[i]);
        return col.color ? col.color(padded) : padded;
      })
      .join('  '),
  );

  return ['  ' + header, '  ' + separator, ...body.map((r) => '  ' + r)].join('\n');
}

export function renderKeyValue(pairs: [string, string][]): string {
  const maxKey = pairs.reduce((max, [k]) => Math.max(max, k.length), 0);
  return pairs
    .map(([k, v]) => `  ${c.muted(k.padEnd(maxKey + 1))} ${v}`)
    .join('\n');
}

export function statusDot(disabled: boolean | undefined): string {
  return disabled ? sym.dot.gray : sym.dot.green;
}
