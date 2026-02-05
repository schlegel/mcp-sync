import { c } from './theme.js';
import { VERSION } from '../core/constants.js';

let shown = false;

export function displayBanner(): void {
  if (shown) return;
  shown = true;
  console.log();
  console.log(`  ${c.bold(c.primary('mcpx'))} ${c.muted(`v${VERSION}`)}`);
  console.log(`  ${c.dim('Project-first MCP server manager')}`);
  console.log();
}
