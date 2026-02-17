import type { Command } from 'commander';
import { watch } from 'node:fs';
import { join } from 'node:path';
import { loadProjectConfig } from '../core/config.js';
import { syncToClients } from '../sync/engine.js';
import { CONFIG_FILENAME } from '../core/constants.js';
import { log } from '../ui/logger.js';
import { c } from '../ui/theme.js';
import { ConfigNotFoundError } from '../utils/errors.js';
import { fileExists } from '../utils/fs.js';

export function registerWatch(program: Command): void {
  program
    .command('watch')
    .description('Watch .mcp-sync.json and auto-sync on changes')
    .option('--client <client>', 'Only sync to specific client')
    .action(async (opts: { client?: string }) => {
      const configPath = join(process.cwd(), CONFIG_FILENAME);

      if (!(await fileExists(configPath))) {
        throw new ConfigNotFoundError(process.cwd());
      }

      console.log();
      log.info(`Watching ${c.bold(c.white(CONFIG_FILENAME))} for changes...`);
      log.dim('Press Ctrl+C to stop');
      log.blank();

      // Initial sync
      try {
        const config = await loadProjectConfig();
        if (config) {
          const result = await syncToClients(config, process.cwd(), {
            clients: opts.client ? [opts.client as 'claude-desktop' | 'cursor' | 'claude-code'] : undefined,
          });
          const synced = result.filter((r) => r.success).length;
          log.success(`Initial sync complete (${synced} client${synced !== 1 ? 's' : ''})`);
        }
      } catch (err) {
        log.error(`Initial sync failed: ${(err as Error).message}`);
      }

      // Debounce timer
      let debounce: ReturnType<typeof setTimeout> | null = null;

      const watcher = watch(configPath, async (eventType) => {
        if (eventType !== 'change') return;

        // Debounce rapid changes (e.g., editors saving multiple times)
        if (debounce) clearTimeout(debounce);
        debounce = setTimeout(async () => {
          const time = new Date().toLocaleTimeString();
          log.dim(`[${time}] Change detected`);

          try {
            const config = await loadProjectConfig();
            if (!config) {
              log.warn('Config file is empty or invalid');
              return;
            }

            const result = await syncToClients(config, process.cwd(), {
              clients: opts.client ? [opts.client as 'claude-desktop' | 'cursor' | 'claude-code'] : undefined,
            });

            const synced = result.filter((r) => r.success).length;
            const failed = result.filter((r) => !r.success).length;

            if (failed === 0) {
              log.success(`Synced to ${synced} client${synced !== 1 ? 's' : ''}`);
            } else {
              log.warn(`${synced} synced, ${failed} failed`);
              for (const r of result.filter((r) => !r.success)) {
                log.dim(`  ${r.client}: ${r.error}`);
              }
            }
          } catch (err) {
            log.error(`Sync failed: ${(err as Error).message}`);
          }
        }, 300);
      });

      // Graceful shutdown
      const cleanup = () => {
        watcher.close();
        if (debounce) clearTimeout(debounce);
        console.log();
        log.dim('Stopped watching');
        process.exit(0);
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);

      // Keep process alive
      await new Promise(() => {});
    });
}
