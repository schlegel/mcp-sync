import type { Command } from 'commander';
import { loadProjectConfig, saveProjectConfig } from '../core/config.js';
import { log } from '../ui/logger.js';
import { c, sym } from '../ui/theme.js';
import { ConfigNotFoundError } from '../utils/errors.js';

export function registerEnable(program: Command): void {
  program
    .command('enable <name>')
    .description('Enable a disabled MCP server')
    .action(async (name: string) => {
      const config = await loadProjectConfig();
      if (!config) throw new ConfigNotFoundError(process.cwd());

      if (!(name in config.mcpServers)) {
        log.error(`Server "${name}" not found in config.`);
        return;
      }

      if (!config.mcpServers[name].disabled) {
        log.dim(`${name} is already enabled.`);
        return;
      }

      const updated = {
        ...config,
        mcpServers: {
          ...config.mcpServers,
          [name]: { ...config.mcpServers[name], disabled: false },
        },
      };
      await saveProjectConfig(updated);

      console.log();
      log.success(`Enabled ${c.bold(c.white(name))}`);
      log.dim('Run owl07 sync to apply changes');
      log.blank();
    });
}

export function registerDisable(program: Command): void {
  program
    .command('disable <name>')
    .description('Disable an MCP server without removing it')
    .action(async (name: string) => {
      const config = await loadProjectConfig();
      if (!config) throw new ConfigNotFoundError(process.cwd());

      if (!(name in config.mcpServers)) {
        log.error(`Server "${name}" not found in config.`);
        return;
      }

      if (config.mcpServers[name].disabled) {
        log.dim(`${name} is already disabled.`);
        return;
      }

      const updated = {
        ...config,
        mcpServers: {
          ...config.mcpServers,
          [name]: { ...config.mcpServers[name], disabled: true },
        },
      };
      await saveProjectConfig(updated);

      console.log();
      log.success(`Disabled ${c.bold(c.muted(name))}`);
      log.dim('Run owl07 sync to apply changes');
      log.blank();
    });
}
