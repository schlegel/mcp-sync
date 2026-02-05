import type { Command } from 'commander';
import { loadProjectConfig, getConfigDir } from '../core/config.js';
import { syncToClients } from '../sync/engine.js';
import { log, spinner } from '../ui/logger.js';
import { c, sym } from '../ui/theme.js';
import { ConfigNotFoundError } from '../utils/errors.js';
import type { ClientId } from '../core/constants.js';
import { CLIENT_DISPLAY_NAMES } from '../core/constants.js';

export function registerSync(program: Command): void {
  program
    .command('sync')
    .description('Sync MCP config to Claude Desktop, Cursor, and Claude Code')
    .option('--dry', 'Show what would change without writing')
    .option('--client <clients...>', 'Sync to specific clients only')
    .action(async (opts: { dry?: boolean; client?: string[] }) => {
      const config = await loadProjectConfig();
      if (!config) throw new ConfigNotFoundError(process.cwd());

      const configDir = getConfigDir();
      const clients = opts.client as ClientId[] | undefined;
      const enabledServers = Object.entries(config.mcpServers).filter(([, s]) => !s.disabled);

      if (enabledServers.length === 0) {
        log.warn('No enabled servers to sync. Add servers with owl07 add.');
        return;
      }

      if (opts.dry) {
        log.info(c.bold('Dry run') + ' -- no files will be modified');
        log.blank();
      }

      const spin = spinner('Syncing to clients...');
      spin.start();

      const results = await syncToClients(config, configDir, {
        clients,
        dryRun: opts.dry,
      });

      spin.stop();

      console.log();
      for (const result of results) {
        const name = CLIENT_DISPLAY_NAMES[result.client] ?? result.client;
        if (result.success) {
          log.success(`${name} ${c.muted(sym.arrow)} ${result.serversWritten} server(s) ${c.dim(result.path)}`);
        } else {
          log.error(`${name} ${c.muted(sym.arrow)} ${result.error}`);
        }
      }

      const successCount = results.filter((r) => r.success).length;
      log.blank();
      log.dim(`Synced to ${successCount}/${results.length} client(s)`);
      log.blank();
    });
}
