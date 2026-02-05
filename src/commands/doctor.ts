import type { Command } from 'commander';
import { loadMergedConfig } from '../core/config.js';
import { checkAllServers } from '../health/checker.js';
import { checkDependencies } from '../health/diagnostics.js';
import { log, spinner } from '../ui/logger.js';
import { c, sym } from '../ui/theme.js';

export function registerDoctor(program: Command): void {
  program
    .command('doctor')
    .description('Health check all configured MCP servers')
    .option('--server <name>', 'Check a specific server only')
    .action(async (opts: { server?: string }) => {
      const config = await loadMergedConfig();
      const servers = opts.server
        ? { [opts.server]: config.mcpServers[opts.server] }
        : config.mcpServers;

      if (opts.server && !config.mcpServers[opts.server]) {
        log.error(`Server "${opts.server}" not found.`);
        return;
      }

      // Check system dependencies
      console.log();
      log.info(c.bold('System Dependencies'));
      const deps = await checkDependencies();
      for (const dep of deps) {
        if (dep.found) {
          log.success(`${dep.tool} ${c.dim(dep.version ?? '')}`);
        } else {
          log.warn(`${dep.tool} ${c.dim('not found')}`);
        }
      }

      // Check MCP servers
      const serverEntries = Object.entries(servers);
      if (serverEntries.length === 0) {
        log.blank();
        log.dim('No servers to check.');
        return;
      }

      log.blank();
      log.info(c.bold('MCP Servers'));

      const spin = spinner('Checking servers...');
      spin.start();

      const results = await checkAllServers(servers);

      spin.stop();

      for (const result of results) {
        switch (result.status) {
          case 'healthy':
            log.success(
              `${result.server} ${c.dim(`${result.latencyMs}ms`)} ${
                result.serverInfo ? c.muted(`(${result.serverInfo.name} v${result.serverInfo.version})`) : ''
              }`,
            );
            break;
          case 'timeout':
            log.warn(`${result.server} ${c.dim('timed out')}`);
            break;
          case 'not-found':
            log.error(`${result.server} ${c.dim(result.error ?? 'command not found')}`);
            break;
          default:
            log.error(`${result.server} ${c.dim(result.error ?? 'unknown error')}`);
        }
      }

      const healthy = results.filter((r) => r.status === 'healthy').length;
      log.blank();
      log.dim(`${healthy}/${results.length} server(s) healthy`);
      log.blank();
    });
}
