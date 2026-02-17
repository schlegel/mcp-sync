import type { Command } from 'commander';
import { join, resolve } from 'node:path';
import { saveProjectConfig, createEmptyConfig } from '../core/config.js';
import { fileExists } from '../utils/fs.js';
import { log } from '../ui/logger.js';
import { c, sym } from '../ui/theme.js';
import { promptClients, promptConfirm } from '../ui/prompts.js';
import type { ClientId } from '../core/constants.js';
import { getConfigFilename } from '../core/context.js';

export function registerInit(program: Command): void {
  program
    .command('init')
    .description('Initialize mcp-sync in the current project')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .option('--force', 'Overwrite existing config')
    .action(async (opts: { yes?: boolean; force?: boolean }) => {
      const cwd = resolve(process.cwd());
      const configFilename = getConfigFilename();
      const configPath = join(cwd, configFilename);

      if (await fileExists(configPath)) {
        if (!opts.force) {
          log.warn(`${configFilename} already exists. Use --force to overwrite.`);
          return;
        }
      }

      let clients: ClientId[];

      if (opts.yes) {
        clients = ['claude-desktop', 'cursor', 'claude-code'];
      } else {
        clients = await promptClients();
      }

      const config = createEmptyConfig();
      config.sync = { clients };

      await saveProjectConfig(config, cwd);

      log.success(`Created ${c.bold(configFilename)}`);
      log.blank();
      log.dim('Next steps:');
      log.dim(`  mcp-sync add <server-name>    Add an MCP server`);
      log.dim(`  mcp-sync import               Import from existing configs`);
      log.dim(`  mcp-sync sync                 Sync to your AI tools`);
      log.blank();
    });
}
