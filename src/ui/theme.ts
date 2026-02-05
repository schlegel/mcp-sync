import chalk from 'chalk';

export const c = {
  primary: chalk.hex('#58A6FF'),
  success: chalk.hex('#3FB950'),
  warning: chalk.hex('#D29922'),
  error: chalk.hex('#F85149'),
  muted: chalk.hex('#8B949E'),
  accent: chalk.hex('#BC8CFF'),
  highlight: chalk.hex('#FFA657'),
  dim: chalk.dim,
  bold: chalk.bold,
  underline: chalk.underline,
  white: chalk.white,
};

export const sym = {
  check: c.success('\u2713'),
  cross: c.error('\u2717'),
  warn: c.warning('\u25B2'),
  info: c.primary('\u25CF'),
  arrow: c.muted('\u2192'),
  bullet: c.muted('\u2022'),
  line: '\u2500',
  dot: {
    green: c.success('\u25CF'),
    red: c.error('\u25CF'),
    gray: c.muted('\u25CB'),
    yellow: c.warning('\u25CF'),
  },
};

export function divider(width = 50): string {
  return c.muted(sym.line.repeat(width));
}

export function indent(text: string, level = 1): string {
  const pad = '  '.repeat(level);
  return text.split('\n').map((line) => pad + line).join('\n');
}

export function label(key: string, value: string): string {
  return `${c.muted(key + ':')} ${value}`;
}
