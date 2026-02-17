import chalk from 'chalk';
import { VERSION } from '../core/constants.js';

let shown = false;

// ──── Colors ────
const glow = chalk.hex('#58A6FF');
const violet = chalk.hex('#BC8CFF');
const ghost = chalk.hex('#484f58');

// ──── Simple static banner ────

const BANNER_LINES = [
  '',
  '   ███╗   ███╗ ██████╗██████╗       ███████╗██╗   ██╗███╗   ██╗ ██████╗',
  '   ████╗ ████║██╔════╝██╔══██╗      ██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝',
  '   ██╔████╔██║██║     ██████╔╝█████╗███████╗ ╚████╔╝ ██╔██╗ ██║██║     ',
  '   ██║╚██╔╝██║██║     ██╔═══╝ ╚════╝╚════██║  ╚██╔╝  ██║╚██╗██║██║     ',
  '   ██║ ╚═╝ ██║╚██████╗██║           ███████║   ██║   ██║ ╚████║╚██████╗',
  '   ╚═╝     ╚═╝ ╚═════╝╚═╝           ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝',
  '',
];

function displayBannerStatic(): void {
  process.stderr.write('\n');
  
  // Display banner with colors
  for (let i = 0; i < BANNER_LINES.length; i++) {
    const line = BANNER_LINES[i];
    if (i === 0 || i === BANNER_LINES.length - 1) {
      process.stderr.write(line + '\n');
    } else if (i <= 3) {
      process.stderr.write(glow(line) + '\n');
    } else {
      process.stderr.write(violet(line) + '\n');
    }
  }
  
  process.stderr.write(`   ${ghost(`v${VERSION} · Project-first MCP server manager`)}\n`);
  process.stderr.write('\n');
}

export async function displayBannerAnimated(): Promise<void> {
  if (shown) return;
  shown = true;
  displayBannerStatic();
}

export function displayBanner(): void {
  if (shown) return;
  shown = true;
  displayBannerStatic();
}
