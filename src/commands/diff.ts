import type { Command } from 'commander';
import { loadProjectConfig, getConfigDir } from '../core/config.js';
import { ALL_CLIENTS, CLIENT_DISPLAY_NAMES, type ClientId } from '../core/constants.js';
import { getAdapter } from '../sync/adapters/index.js';
import { createContext, resolveAllServers } from '../core/variables.js';
import { log } from '../ui/logger.js';
import { c, sym, divider } from '../ui/theme.js';
import { ConfigNotFoundError } from '../utils/errors.js';
import type { ServerConfig } from '../core/schema.js';

export function registerDiff(program: Command): void {
  program
    .command('diff')
    .description('Show diff between .mcpx.json and client configs')
    .option('--client <client>', 'Diff against specific client only')
    .action(async (opts: { client?: string }) => {
      const config = await loadProjectConfig();
      if (!config) throw new ConfigNotFoundError(process.cwd());

      const configDir = getConfigDir();
      const ctx = createContext(configDir);

      const enabledServers: Record<string, ServerConfig> = {};
      for (const [name, server] of Object.entries(config.mcpServers)) {
        if (!server.disabled) enabledServers[name] = server;
      }
      const resolved = resolveAllServers(enabledServers, ctx);
      const clients = opts.client ? [opts.client as ClientId] : ALL_CLIENTS;

      let totalDiffs = 0;

      for (const clientId of clients) {
        const adapter = getAdapter(clientId);
        const displayName = CLIENT_DISPLAY_NAMES[clientId] ?? clientId;
        let existing: Record<string, ServerConfig> | null;

        try {
          existing = await adapter.readExistingServers();
        } catch {
          existing = null;
        }

        console.log();
        console.log(`  ${c.bold(displayName)} ${c.dim(adapter.getConfigPath())}`);
        console.log(`  ${divider(45)}`);

        if (!existing) {
          console.log(`  ${c.dim('No config file found')}`);
          if (Object.keys(resolved).length > 0) {
            for (const name of Object.keys(resolved)) {
              console.log(`  ${c.success('+ ' + name)} ${c.dim('(will be added)')}`);
              totalDiffs++;
            }
          }
          continue;
        }

        const allNames = new Set([...Object.keys(resolved), ...Object.keys(existing)]);
        let clientDiffs = 0;

        for (const name of [...allNames].sort()) {
          const inMcpx = name in resolved;
          const inClient = name in existing;

          if (inMcpx && !inClient) {
            console.log(`  ${c.success('+ ' + name)} ${c.dim('(will be added)')}`);
            clientDiffs++;
          } else if (!inMcpx && inClient) {
            console.log(`  ${c.muted('  ' + name)} ${c.dim('(client-only, untouched)')}`);
          } else if (inMcpx && inClient) {
            const mcpxJson = JSON.stringify(resolved[name]);
            const clientJson = JSON.stringify(existing[name]);
            if (mcpxJson === clientJson) {
              console.log(`  ${c.dim('  ' + name)} ${c.success('\u2713 in sync')}`);
            } else {
              console.log(`  ${c.warning('~ ' + name)} ${c.dim('(will be updated)')}`);
              clientDiffs++;
            }
          }
        }

        if (clientDiffs === 0) {
          console.log(`  ${c.success('\u2713 All in sync')}`);
        }

        totalDiffs += clientDiffs;
      }

      console.log();
      if (totalDiffs === 0) {
        log.success('Everything is in sync!');
      } else {
        log.info(`${totalDiffs} change(s) pending -- run ${c.bold('mcpx sync')} to apply`);
      }
      log.blank();
    });
}
