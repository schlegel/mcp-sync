import type { Command } from 'commander';
import { loadProjectConfig, saveProjectConfig, removeServer, hasServer } from '../core/config.js';
import { log } from '../ui/logger.js';
import { c } from '../ui/theme.js';
import { promptConfirm } from '../ui/prompts.js';
import { ConfigNotFoundError } from '../utils/errors.js';

export function registerRemove(program: Command): void {
  program
    .command('remove <name>')
    .description('Remove an MCP server from the project config')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (name: string, opts: { yes?: boolean }) => {
      const config = await loadProjectConfig();
      if (!config) throw new ConfigNotFoundError(process.cwd());

      if (!hasServer(config, name)) {
        log.warn(`Server "${name}" not found in config.`);
        return;
      }

      if (!opts.yes) {
        const ok = await promptConfirm(`Remove server "${name}"?`);
        if (!ok) return;
      }

      const updated = removeServer(config, name);
      await saveProjectConfig(updated);

      log.success(`Removed server ${c.bold(name)}`);
    });
}
