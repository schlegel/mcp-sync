import type { Command } from 'commander';
import { registerInit } from './init.js';
import { registerAdd } from './add.js';
import { registerAddJson } from './add-json.js';
import { registerRemove } from './remove.js';
import { registerList } from './list.js';
import { registerStatus } from './status.js';
import { registerSync } from './sync.js';
import { registerDoctor } from './doctor.js';
import { registerImport } from './import.js';

export function registerCommands(program: Command): void {
  registerInit(program);
  registerAdd(program);
  registerAddJson(program);
  registerRemove(program);
  registerList(program);
  registerStatus(program);
  registerSync(program);
  registerDoctor(program);
  registerImport(program);
}
