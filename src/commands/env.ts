import type { Command } from 'commander';
import { loadMergedConfig } from '../core/config.js';
import { log } from '../ui/logger.js';
import { c, sym } from '../ui/theme.js';

const ENV_REGEX = /\$\{env:([^}]+)\}/g;

function extractEnvVars(config: Record<string, unknown>): string[] {
  const vars = new Set<string>();
  const json = JSON.stringify(config);
  let match;
  while ((match = ENV_REGEX.exec(json)) !== null) {
    vars.add(match[1]);
  }
  return [...vars].sort();
}

export function registerEnv(program: Command): void {
  program
    .command('env')
    .description('Audit environment variables referenced in config')
    .option('--json', 'Output as JSON')
    .action(async (opts: { json?: boolean }) => {
      const config = await loadMergedConfig();
      const envVars = extractEnvVars(config.mcpServers as Record<string, unknown>);

      if (opts.json) {
        const variables = envVars.map((name) => {
          const value = process.env[name];
          return { name, set: !!value, masked: value ? (value.length > 8 ? value.slice(0, 4) + '****' + value.slice(-4) : '****') : null };
        });
        const found = variables.filter((v) => v.set).length;
        console.log(JSON.stringify({ variables, summary: { found, missing: variables.length - found } }, null, 2));
        return;
      }

      if (envVars.length === 0) {
        log.dim('No environment variables referenced in config.');
        return;
      }

      console.log();
      log.info(c.bold('Environment Variable Audit'));
      console.log();

      let missing = 0;
      let found = 0;

      for (const varName of envVars) {
        const value = process.env[varName];
        if (value) {
          const masked = value.length > 8
            ? value.slice(0, 4) + '*'.repeat(value.length - 8) + value.slice(-4)
            : '****';
          console.log(`  ${sym.dot.green} ${c.white(varName.padEnd(25))} ${c.success('set')} ${c.dim(masked)}`);
          found++;
        } else {
          console.log(`  ${sym.dot.red} ${c.white(varName.padEnd(25))} ${c.error('MISSING')}`);
          missing++;
        }
      }

      console.log();
      if (missing > 0) {
        log.warn(`${missing} variable(s) missing -- sync may produce incomplete configs`);
        log.dim('Set them in your shell or .env file before running owl07 sync');
      } else {
        log.success(`All ${found} variable(s) are set`);
      }
      log.blank();
    });
}
