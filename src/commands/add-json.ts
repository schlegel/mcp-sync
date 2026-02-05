import type { Command } from 'commander';
import { loadProjectConfig, saveProjectConfig, addServer, hasServer } from '../core/config.js';
import { ServerConfigSchema } from '../core/schema.js';
import { log } from '../ui/logger.js';
import { c } from '../ui/theme.js';
import { ConfigNotFoundError, ConfigValidationError } from '../utils/errors.js';

export function registerAddJson(program: Command): void {
  program
    .command('add-json <name> <json>')
    .description('Add an MCP server using raw JSON config')
    .action(async (name: string, json: string) => {
      const config = await loadProjectConfig();
      if (!config) throw new ConfigNotFoundError(process.cwd());

      if (hasServer(config, name)) {
        log.warn(`Server "${name}" already exists. Remove it first.`);
        return;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(json);
      } catch {
        throw new ConfigValidationError(['Invalid JSON: ' + json]);
      }

      const result = ServerConfigSchema.safeParse(parsed);
      if (!result.success) {
        const errors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
        throw new ConfigValidationError(errors);
      }

      const updated = addServer(config, name, result.data);
      await saveProjectConfig(updated);

      log.success(`Added server ${c.bold(name)}`);
    });
}
