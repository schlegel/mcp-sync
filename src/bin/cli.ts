#!/usr/bin/env node

import { Command } from 'commander';
import { registerCommands } from '../commands/index.js';
import { displayBannerAnimated } from '../ui/banner.js';
import { handleError } from '../utils/errors.js';
import { VERSION, DESCRIPTION } from '../core/constants.js';

const program = new Command();

program
  .name('owl07')
  .description(DESCRIPTION)
  .version(VERSION, '-V, --version', 'Show version number')
  .hook('preAction', async (_thisCommand, actionCommand) => {
    // Skip banner for help, ?, watch, and default (no-args)
    const name = actionCommand.name();
    if (name === 'help' || name === '?' || name === 'watch' || name === 'owl07') return;
    await displayBannerAnimated();
  });

registerCommands(program);

program.parseAsync(process.argv).catch(handleError);
