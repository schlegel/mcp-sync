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
import { registerUse } from './use.js';
import { registerEnv } from './env.js';
import { registerDiff } from './diff.js';
import { registerEnable, registerDisable } from './toggle.js';
import { registerExport } from './export.js';

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
  registerUse(program);
  registerEnv(program);
  registerDiff(program);
  registerEnable(program);
  registerDisable(program);
  registerExport(program);
}
