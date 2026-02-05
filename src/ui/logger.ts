import ora, { type Ora } from 'ora';
import { c, sym } from './theme.js';

export const log = {
  info(msg: string): void {
    console.log(`  ${sym.info} ${msg}`);
  },
  success(msg: string): void {
    console.log(`  ${sym.check} ${msg}`);
  },
  warn(msg: string): void {
    console.log(`  ${sym.warn} ${c.warning(msg)}`);
  },
  error(msg: string): void {
    console.log(`  ${sym.cross} ${c.error(msg)}`);
  },
  dim(msg: string): void {
    console.log(`  ${c.dim(msg)}`);
  },
  blank(): void {
    console.log();
  },
  step(index: number, total: number, msg: string): void {
    console.log(`  ${c.muted(`[${index}/${total}]`)} ${msg}`);
  },
};

export function spinner(text: string): Ora {
  return ora({ text: `  ${text}`, color: 'cyan', indent: 0 });
}
