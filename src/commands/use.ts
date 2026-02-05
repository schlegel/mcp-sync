import type { Command } from 'commander';
import { loadProjectConfig, saveProjectConfig, createEmptyConfig, addServer } from '../core/config.js';
import { getTemplate, listTemplates } from '../core/templates.js';
import { log } from '../ui/logger.js';
import { c, sym } from '../ui/theme.js';
import { CONFIG_FILENAME } from '../core/constants.js';
import { fileExists } from '../utils/fs.js';
import { join, resolve } from 'node:path';

export function registerUse(program: Command): void {
  program
    .command('use [template]')
    .description('Apply a preset MCP server template (web, python, fullstack, devops, data, minimal)')
    .option('--list', 'List available templates')
    .action(async (templateName: string | undefined, opts: { list?: boolean }) => {
      if (opts.list || !templateName) {
        console.log();
        log.info(c.bold('Available Templates'));
        console.log();

        for (const t of listTemplates()) {
          const serverNames = Object.keys(t.servers).join(', ');
          console.log(`  ${c.accent(t.name.padEnd(12))} ${c.white(t.description)}`);
          console.log(`  ${' '.repeat(12)} ${c.dim(serverNames)}`);
          console.log();
        }

        log.dim('Usage: mcpx use <template>');
        log.blank();
        return;
      }

      const template = getTemplate(templateName);
      if (!template) {
        log.error(`Template "${templateName}" not found.`);
        log.dim(`Available: ${listTemplates().map((t) => t.name).join(', ')}`);
        return;
      }

      const cwd = resolve(process.cwd());
      const configPath = join(cwd, CONFIG_FILENAME);
      let config = (await fileExists(configPath))
        ? (await loadProjectConfig()) ?? createEmptyConfig()
        : createEmptyConfig();

      let added = 0;
      for (const [name, server] of Object.entries(template.servers)) {
        if (!(name in config.mcpServers)) {
          config = addServer(config, name, server);
          added++;
        }
      }

      await saveProjectConfig(config, cwd);

      console.log();
      log.success(`Applied template ${c.bold(c.accent(template.name))}`);
      console.log();

      for (const [name, server] of Object.entries(template.servers)) {
        console.log(`  ${sym.check} ${c.white(name)} ${c.dim(server.command + ' ' + (server.args ?? []).join(' '))}`);
      }

      console.log();
      if (added < Object.keys(template.servers).length) {
        log.dim(`${added} new, ${Object.keys(template.servers).length - added} already existed`);
      }
      log.dim('Run mcpx sync to push to your AI tools');
      log.blank();
    });
}
