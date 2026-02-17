#!/usr/bin/env node

import { Command } from 'commander';
import { registerCommands } from '../commands/index.js';
import { displayBannerAnimated } from '../ui/banner.js';
import { handleError } from '../utils/errors.js';
import { VERSION, DESCRIPTION } from '../core/constants.js';
import { setConfigFilename } from '../core/context.js';

const program = new Command();

program
  .name('mcp-sync')
  .description(DESCRIPTION)
  .version(VERSION, '-V, --version', 'Show version number')
  .option('-c, --config <filename>', 'Config filename (default: mcps.json)', 'mcps.json')
  .hook('preAction', async (_thisCommand, actionCommand) => {
    // Set global config filename from options
    const opts = program.opts() as { config?: string };
    if (opts.config) {
      setConfigFilename(opts.config);
    }
    
    // Skip banner for help, ?, watch, and default (no-args)
    const name = actionCommand.name();
    if (name === 'help' || name === '?' || name === 'watch' || name === 'mcp-sync') return;
    await displayBannerAnimated();
  });

registerCommands(program);

program.parseAsync(process.argv).catch(handleError);
