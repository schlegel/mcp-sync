#!/usr/bin/env node

import { Command } from 'commander';
import { registerCommands } from '../commands/index.js';
import { displayBanner } from '../ui/banner.js';
import { handleError } from '../utils/errors.js';
import { VERSION, DESCRIPTION } from '../core/constants.js';

const program = new Command();

program
  .name('owl07')
  .description(DESCRIPTION)
  .version(VERSION)
  .hook('preAction', () => {
    displayBanner();
  });

registerCommands(program);

program.parseAsync(process.argv).catch(handleError);
