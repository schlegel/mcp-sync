import type { ClientId } from '../../core/constants.js';
import type { ClientAdapter } from '../../types/client.js';
import { ClaudeDesktopAdapter } from './claude-desktop.js';
import { CursorAdapter } from './cursor.js';
import { ClaudeCodeAdapter } from './claude-code.js';

const adapters: Record<ClientId, () => ClientAdapter> = {
  'claude-desktop': () => new ClaudeDesktopAdapter(),
  'cursor': () => new CursorAdapter(),
  'claude-code': () => new ClaudeCodeAdapter(),
};

export function getAdapter(clientId: ClientId): ClientAdapter {
  const factory = adapters[clientId];
  if (!factory) throw new Error(`Unknown client: ${clientId}`);
  return factory();
}

export function getAllAdapters(): ClientAdapter[] {
  return Object.values(adapters).map((f) => f());
}

export async function detectInstalledClients(): Promise<ClientId[]> {
  const results: ClientId[] = [];
  for (const [id, factory] of Object.entries(adapters)) {
    const adapter = factory();
    if (await adapter.detect()) results.push(id as ClientId);
  }
  return results;
}
