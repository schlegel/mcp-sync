import type { Command } from 'commander';
import { loadProjectConfig } from '../core/config.js';
import { safeValidateConfig } from '../core/schema.js';
import { fileExists, readJsonFile } from '../utils/fs.js';
import { CONFIG_FILENAME } from '../core/constants.js';
import { log } from '../ui/logger.js';
import { c } from '../ui/theme.js';
import { join } from 'node:path';
import { ConfigNotFoundError } from '../utils/errors.js';

export function registerValidate(program: Command): void {
  program
    .command('validate')
    .description('Validate config schema and references')
    .option('--json', 'Output validation result as JSON')
    .action(async (opts: { json?: boolean }) => {
      const configPath = join(process.cwd(), CONFIG_FILENAME);
      const issues: { level: 'error' | 'warn'; msg: string }[] = [];

      // 1. Check file exists
      if (!(await fileExists(configPath))) {
        if (opts.json) {
          console.log(JSON.stringify({ valid: false, errors: ['Config file not found'] }, null, 2));
        } else {
          throw new ConfigNotFoundError(process.cwd());
        }
        return;
      }

      // 2. Parse JSON
      const raw = await readJsonFile(configPath);
      if (!raw) {
        issues.push({ level: 'error', msg: 'Config file contains invalid JSON' });
      } else {
        // 3. Schema validation
        const result = safeValidateConfig(raw);
        if (!result.success) {
          for (const err of result.errors) {
            issues.push({ level: 'error', msg: `Schema: ${err}` });
          }
        } else {
          const config = result.data;

          // 4. Check each server
          for (const [name, server] of Object.entries(config.mcpServers)) {
            if (!server.command || server.command.trim() === '') {
              issues.push({ level: 'error', msg: `Server "${name}": empty command` });
            }

            // Check for env var references
            const envVars: string[] = [];
            const envObj = server.env || {};
            for (const val of Object.values(envObj)) {
              const matches = val.match(/\$\{env:([^}]+)\}/g);
              if (matches) {
                for (const m of matches) {
                  const varName = m.replace('${env:', '').replace('}', '');
                  envVars.push(varName);
                }
              }
            }

            for (const v of envVars) {
              if (!process.env[v]) {
                issues.push({ level: 'warn', msg: `Server "${name}": env var ${v} is not set` });
              }
            }

            // Check args for env var references
            for (const arg of server.args || []) {
              const matches = arg.match(/\$\{env:([^}]+)\}/g);
              if (matches) {
                for (const m of matches) {
                  const varName = m.replace('${env:', '').replace('}', '');
                  if (!process.env[varName]) {
                    issues.push({ level: 'warn', msg: `Server "${name}": env var ${varName} is not set (in args)` });
                  }
                }
              }
            }
          }

          // 5. Check sync clients
          if (config.sync?.clients) {
            const validClients = ['claude-desktop', 'cursor', 'claude-code'];
            for (const cl of config.sync.clients) {
              if (!validClients.includes(cl)) {
                issues.push({ level: 'warn', msg: `Unknown sync client: "${cl}"` });
              }
            }
          }
        }
      }

      // Output
      if (opts.json) {
        const errors = issues.filter((i) => i.level === 'error').map((i) => i.msg);
        const warnings = issues.filter((i) => i.level === 'warn').map((i) => i.msg);
        console.log(JSON.stringify({
          valid: errors.length === 0,
          errors,
          warnings,
        }, null, 2));
        return;
      }

      console.log();
      if (issues.length === 0) {
        log.success(`Config is valid ${c.muted(`(${configPath})`)}`);
        log.blank();
        return;
      }

      const errors = issues.filter((i) => i.level === 'error');
      const warnings = issues.filter((i) => i.level === 'warn');

      if (errors.length > 0) {
        for (const e of errors) {
          log.error(e.msg);
        }
      }
      if (warnings.length > 0) {
        for (const w of warnings) {
          log.warn(w.msg);
        }
      }

      log.blank();
      if (errors.length > 0) {
        log.dim(`${errors.length} error(s), ${warnings.length} warning(s)`);
      } else {
        log.success(`Config is valid with ${warnings.length} warning(s)`);
      }
      log.blank();

      if (errors.length > 0) process.exitCode = 1;
    });
}
