import type { Command } from 'commander';
import { loadMergedConfig } from '../core/config.js';
import { log } from '../ui/logger.js';
import { c, sym } from '../ui/theme.js';
import { renderTable, statusDot, type Column } from '../ui/table.js';

export function registerList(program: Command): void {
  program
    .command('list')
    .alias('ls')
    .description('List all configured MCP servers')
    .option('--json', 'Output as JSON')
    .action(async (opts: { json?: boolean }) => {
      const config = await loadMergedConfig();
      const servers = Object.entries(config.mcpServers);

      if (servers.length === 0) {
        log.dim('No servers configured. Run owl07 add <name> to add one.');
        return;
      }

      if (opts.json) {
        console.log(JSON.stringify(config.mcpServers, null, 2));
        return;
      }

      const columns: Column[] = [
        { key: 'status', label: '', width: 3 },
        { key: 'name', label: 'Server', width: 20 },
        { key: 'command', label: 'Command', width: 30 },
        { key: 'args', label: 'Args', width: 40 },
      ];

      const rows = servers.map(([name, config]) => ({
        status: statusDot(config.disabled),
        name: config.disabled ? c.muted(name) : c.white(name),
        command: c.accent(config.command),
        args: c.dim((config.args ?? []).join(' ')),
      }));

      console.log();
      console.log(renderTable(columns, rows));
      console.log();
      log.dim(`${servers.length} server(s) configured`);
      log.blank();
    });
}
