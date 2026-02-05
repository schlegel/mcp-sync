import type { Command } from 'commander';
import { loadProjectConfig, saveProjectConfig, addServer, hasServer } from '../core/config.js';
import { log } from '../ui/logger.js';
import { c } from '../ui/theme.js';
import { promptServerCommand, promptServerArgs, promptEnvVars } from '../ui/prompts.js';
import { ConfigNotFoundError } from '../utils/errors.js';

export function registerAdd(program: Command): void {
  program
    .command('add <name>')
    .description('Add an MCP server to the project config')
    .option('-c, --command <cmd>', 'Server command (e.g., npx, node)')
    .option('-a, --args <args...>', 'Server arguments')
    .option('-e, --env <env...>', 'Environment variables as KEY=VALUE')
    .option('--disabled', 'Add as disabled')
    .action(async (name: string, opts: { command?: string; args?: string[]; env?: string[]; disabled?: boolean }) => {
      const config = await loadProjectConfig();
      if (!config) throw new ConfigNotFoundError(process.cwd());

      if (hasServer(config, name)) {
        log.warn(`Server "${name}" already exists. Remove it first.`);
        return;
      }

      let command = opts.command;
      let args = opts.args;
      let env: Record<string, string> = {};

      if (!command) {
        command = await promptServerCommand();
        args = await promptServerArgs();
        env = await promptEnvVars();
      }

      if (opts.env) {
        for (const pair of opts.env) {
          const [k, ...rest] = pair.split('=');
          env[k] = rest.join('=');
        }
      }

      const updated = addServer(config, name, {
        command: command!,
        args: args ?? [],
        env: Object.keys(env).length > 0 ? env : {},
        disabled: opts.disabled ?? false,
      });

      await saveProjectConfig(updated);
      log.success(`Added server ${c.bold(name)}`);
    });
}
