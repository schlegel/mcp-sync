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
    .description('Show diff between .mcp-sync.json and client configs')
    .option('--client <client>', 'Diff against specific client only')
    .option('--json', 'Output as JSON')
    .action(async (opts: { client?: string; json?: boolean }) => {
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
      const jsonClients: Array<{ clientId: string; displayName: string; configPath: string; diffs: Array<{ server: string; status: string }>; count: number }> = [];

      for (const clientId of clients) {
        const adapter = getAdapter(clientId);
        const displayName = CLIENT_DISPLAY_NAMES[clientId] ?? clientId;
        let existing: Record<string, ServerConfig> | null;

        try {
          existing = await adapter.readExistingServers();
        } catch {
          existing = null;
        }

        const diffs: Array<{ server: string; status: string }> = [];

        if (!existing) {
          for (const name of Object.keys(resolved)) {
            diffs.push({ server: name, status: 'added' });
          }
        } else {
          const allNames = new Set([...Object.keys(resolved), ...Object.keys(existing)]);
          for (const name of [...allNames].sort()) {
            const inOwl = name in resolved;
            const inClient = name in existing;

            if (inOwl && !inClient) {
              diffs.push({ server: name, status: 'added' });
            } else if (!inOwl && inClient) {
              diffs.push({ server: name, status: 'client-only' });
            } else if (inOwl && inClient) {
              const mcpSyncJson = JSON.stringify(resolved[name]);
              const clientJson = JSON.stringify(existing[name]);
              diffs.push({ server: name, status: mcpSyncJson === clientJson ? 'in-sync' : 'updated' });
            }
          }
        }

        const count = diffs.filter((d) => d.status === 'added' || d.status === 'updated').length;
        totalDiffs += count;
        jsonClients.push({ clientId, displayName, configPath: adapter.getConfigPath(), diffs, count });

        if (!opts.json) {
          console.log();
          console.log(`  ${c.bold(displayName)} ${c.dim(adapter.getConfigPath())}`);
          console.log(`  ${divider(45)}`);

          if (!existing) {
            console.log(`  ${c.dim('No config file found')}`);
            for (const d of diffs) {
              console.log(`  ${c.success('+ ' + d.server)} ${c.dim('(will be added)')}`);
            }
          } else {
            for (const d of diffs) {
              if (d.status === 'added') console.log(`  ${c.success('+ ' + d.server)} ${c.dim('(will be added)')}`);
              else if (d.status === 'client-only') console.log(`  ${c.muted('  ' + d.server)} ${c.dim('(client-only, untouched)')}`);
              else if (d.status === 'in-sync') console.log(`  ${c.dim('  ' + d.server)} ${c.success('\u2713 in sync')}`);
              else if (d.status === 'updated') console.log(`  ${c.warning('~ ' + d.server)} ${c.dim('(will be updated)')}`);
            }
            if (count === 0) console.log(`  ${c.success('\u2713 All in sync')}`);
          }
        }
      }

      if (opts.json) {
        console.log(JSON.stringify({ clients: jsonClients, summary: { totalDiffs } }, null, 2));
        return;
      }

      console.log();
      if (totalDiffs === 0) {
        log.success('Everything is in sync!');
      } else {
        log.info(`${totalDiffs} change(s) pending -- run ${c.bold('mcp-sync sync')} to apply`);
      }
      log.blank();
    });
}
