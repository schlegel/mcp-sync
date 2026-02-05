import type { Command } from 'commander';
import { loadProjectConfig, saveProjectConfig, addServer, createEmptyConfig } from '../core/config.js';
import { ALL_CLIENTS, CLIENT_DISPLAY_NAMES, type ClientId } from '../core/constants.js';
import { getAdapter } from '../sync/adapters/index.js';
import { log, spinner } from '../ui/logger.js';
import { c, sym } from '../ui/theme.js';
import { promptImportServers, promptConfirm } from '../ui/prompts.js';
import type { ServerConfig } from '../core/schema.js';

interface DiscoveredServer {
  name: string;
  source: ClientId;
  config: ServerConfig;
}

export function registerImport(program: Command): void {
  program
    .command('import')
    .description('Import MCP servers from existing client configs')
    .option('--from <client>', 'Import from specific client (claude-desktop, cursor, claude-code)')
    .option('--all', 'Import all discovered servers without prompting')
    .action(async (opts: { from?: string; all?: boolean }) => {
      const clients = opts.from ? [opts.from as ClientId] : ALL_CLIENTS;
      const discovered: DiscoveredServer[] = [];

      const spin = spinner('Scanning client configs...');
      spin.start();

      for (const clientId of clients) {
        try {
          const adapter = getAdapter(clientId);
          const servers = await adapter.readExistingServers();
          if (servers) {
            for (const [name, config] of Object.entries(servers)) {
              discovered.push({ name, source: clientId, config });
            }
          }
        } catch {
          // Client not installed or config not readable
        }
      }

      spin.stop();

      if (discovered.length === 0) {
        log.dim('No MCP servers found in any client configs.');
        return;
      }

      console.log();
      log.info(`Found ${c.bold(String(discovered.length))} server(s):`);
      for (const s of discovered) {
        console.log(`  ${sym.bullet} ${c.white(s.name)} ${c.muted(`from ${CLIENT_DISPLAY_NAMES[s.source]}`)}`);
      }
      log.blank();

      let selected: string[];
      if (opts.all) {
        selected = discovered.map((s) => s.name);
      } else {
        selected = await promptImportServers(
          discovered.map((s) => ({ name: s.name, source: CLIENT_DISPLAY_NAMES[s.source] })),
        );
      }

      if (selected.length === 0) {
        log.dim('No servers selected.');
        return;
      }

      let config = (await loadProjectConfig()) ?? createEmptyConfig();

      for (const name of selected) {
        const server = discovered.find((s) => s.name === name);
        if (server) {
          config = addServer(config, name, server.config);
        }
      }

      await saveProjectConfig(config);
      log.success(`Imported ${selected.length} server(s)`);
      log.dim('Run mcpx list to see them, mcpx sync to sync to clients.');
      log.blank();
    });
}
