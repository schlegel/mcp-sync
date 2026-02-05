import type { Command } from 'commander';
import { loadMergedConfig } from '../core/config.js';
import { log } from '../ui/logger.js';
import { c, sym } from '../ui/theme.js';

export function registerStatus(program: Command): void {
  program
    .command('status')
    .description('Quick status overview of configured servers')
    .action(async () => {
      const config = await loadMergedConfig();
      const servers = Object.entries(config.mcpServers);

      if (servers.length === 0) {
        log.dim('No servers configured.');
        return;
      }

      console.log();
      for (const [name, server] of servers) {
        const dot = server.disabled ? sym.dot.gray : sym.dot.green;
        const state = server.disabled ? c.muted('disabled') : c.success('enabled');
        console.log(`  ${dot} ${c.white(name)} ${c.muted(sym.arrow)} ${state}`);
      }
      console.log();

      const enabled = servers.filter(([, s]) => !s.disabled).length;
      const disabled = servers.length - enabled;

      log.dim(`${enabled} enabled, ${disabled} disabled`);
      log.dim(`Sync targets: ${(config.sync?.clients ?? []).join(', ')}`);
      log.blank();
    });
}
