import type { Command } from 'commander';
import { join, resolve } from 'node:path';
import { CONFIG_FILENAME, SCHEMA_URL } from '../core/constants.js';
import { saveProjectConfig, createEmptyConfig } from '../core/config.js';
import { fileExists } from '../utils/fs.js';
import { log } from '../ui/logger.js';
import { c, sym } from '../ui/theme.js';
import { promptClients, promptConfirm } from '../ui/prompts.js';
import type { ClientId } from '../core/constants.js';

export function registerInit(program: Command): void {
  program
    .command('init')
    .description('Initialize mcpx in the current project')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .option('--force', 'Overwrite existing config')
    .action(async (opts: { yes?: boolean; force?: boolean }) => {
      const cwd = resolve(process.cwd());
      const configPath = join(cwd, CONFIG_FILENAME);

      if (await fileExists(configPath)) {
        if (!opts.force) {
          log.warn(`${CONFIG_FILENAME} already exists. Use --force to overwrite.`);
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

      log.success(`Created ${c.bold(CONFIG_FILENAME)}`);
      log.blank();
      log.dim('Next steps:');
      log.dim(`  mcpx add <server-name>    Add an MCP server`);
      log.dim(`  mcpx import               Import from existing configs`);
      log.dim(`  mcpx sync                 Sync to your AI tools`);
      log.blank();
    });
}
