import { select, checkbox, input, confirm } from '@inquirer/prompts';
import type { ClientId } from '../core/constants.js';
import { ALL_CLIENTS, CLIENT_DISPLAY_NAMES } from '../core/constants.js';

export async function promptClients(): Promise<ClientId[]> {
  const choices = ALL_CLIENTS.map((id) => ({
    name: CLIENT_DISPLAY_NAMES[id],
    value: id,
    checked: true,
  }));

  return checkbox({
    message: 'Which clients should owl07 sync to?',
    choices,
  });
}

export async function promptServerCommand(): Promise<string> {
  return input({
    message: 'Server command:',
    default: 'npx',
    validate: (val: string) => val.length > 0 || 'Command is required',
  });
}

export async function promptServerArgs(): Promise<string[]> {
  const raw = await input({
    message: 'Server arguments (space-separated):',
    default: '',
  });
  return raw.trim() ? raw.trim().split(/\s+/) : [];
}

export async function promptEnvVars(): Promise<Record<string, string>> {
  const env: Record<string, string> = {};
  let addMore = true;

  while (addMore) {
    addMore = await confirm({
      message: env.length === 0 ? 'Add environment variables?' : 'Add another env var?',
      default: false,
    });

    if (addMore) {
      const key = await input({ message: 'Env var name:', validate: (v: string) => v.length > 0 || 'Required' });
      const value = await input({ message: `Value for ${key}:` });
      env[key] = value;
    }
  }

  return env;
}

export async function promptConfirm(message: string): Promise<boolean> {
  return confirm({ message, default: true });
}

export async function promptSelectServer(servers: string[]): Promise<string> {
  return select({
    message: 'Select a server:',
    choices: servers.map((s) => ({ name: s, value: s })),
  });
}

export async function promptImportServers(
  servers: Array<{ name: string; source: string }>,
): Promise<string[]> {
  const choices = servers.map((s) => ({
    name: `${s.name} (from ${s.source})`,
    value: s.name,
    checked: true,
  }));

  return checkbox({
    message: 'Select servers to import:',
    choices,
  });
}
