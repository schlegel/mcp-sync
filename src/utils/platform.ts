import { homedir, platform } from 'node:os';
import { resolve, join } from 'node:path';

export function getHomeDir(): string {
  return homedir();
}

export function isWindows(): boolean {
  return platform() === 'win32';
}

export function isMac(): boolean {
  return platform() === 'darwin';
}

export function isLinux(): boolean {
  return platform() === 'linux';
}

export function getPlatform(): NodeJS.Platform {
  return platform();
}

export function resolvePath(template: string): string {
  let resolved = template;

  if (resolved.startsWith('~')) {
    resolved = join(homedir(), resolved.slice(1));
  }

  if (isWindows() && resolved.includes('%APPDATA%')) {
    resolved = resolved.replace(/%APPDATA%/g, process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'));
  }

  return resolve(resolved);
}
