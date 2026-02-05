import type { Command } from 'commander';
import { loadProjectConfig, getConfigDir } from '../core/config.js';
import { ALL_CLIENTS, CLIENT_DISPLAY_NAMES, type ClientId } from '../core/constants.js';
import { createContext, resolveAllServers } from '../core/variables.js';
import { log } from '../ui/logger.js';
import { c } from '../ui/theme.js';
import { ConfigNotFoundError } from '../utils/errors.js';
import type { ServerConfig } from '../core/schema.js';

function formatForClient(servers: Record<string, ServerConfig>): Record<string, unknown> {
  const formatted: Record<string, unknown> = {};
  for (const [name, server] of Object.entries(servers)) {
    const entry: Record<string, unknown> = { command: server.command };
    if (server.args && server.args.length > 0) entry.args = server.args;
    if (server.env && Object.keys(server.env).length > 0) entry.env = server.env;
    formatted[name] = entry;
  }
  return formatted;
}

export function registerExport(program: Command): void {
  program
    .command('export')
    .description('Export resolved config as JSON (pipe to file or clipboard)')
    .option('--client <client>', 'Format for specific client', 'claude-desktop')
    .option('--pretty', 'Pretty-print output', true)
    .option('--raw', 'Output without wrapper (servers only)')
    .action(async (opts: { client: string; pretty: boolean; raw?: boolean }) => {
      const config = await loadProjectConfig();
      if (!config) throw new ConfigNotFoundError(process.cwd());

      const clientId = opts.client as ClientId;
      if (!ALL_CLIENTS.includes(clientId)) {
        log.error(`Unknown client "${opts.client}". Valid: ${ALL_CLIENTS.join(', ')}`);
        return;
      }

      const configDir = getConfigDir();
      const ctx = createContext(configDir);

      const enabledServers: Record<string, ServerConfig> = {};
      for (const [name, server] of Object.entries(config.mcpServers)) {
        if (!server.disabled) enabledServers[name] = server;
      }

      const resolved = resolveAllServers(enabledServers, ctx);
      const formatted = formatForClient(resolved);

      const output = opts.raw
        ? formatted
        : { mcpServers: formatted };

      const json = opts.pretty
        ? JSON.stringify(output, null, 2)
        : JSON.stringify(output);

      // Output raw JSON to stdout (pipe-friendly)
      process.stdout.write(json + '\n');
    });
}
