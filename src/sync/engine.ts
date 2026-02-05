import type { ClientId } from '../core/constants.js';
import type { Owl07Config, ServerConfig } from '../core/schema.js';
import type { SyncResult, SyncManifest } from '../types/client.js';
import { getAdapter } from './adapters/index.js';
import { getSyncManifestPath } from '../core/constants.js';
import { readJsonFile, writeJsonFile } from '../utils/fs.js';
import { createContext, resolveAllServers } from '../core/variables.js';

export async function syncToClients(
  config: Owl07Config,
  configDir: string,
  options?: { clients?: ClientId[]; dryRun?: boolean },
): Promise<SyncResult[]> {
  const clients = options?.clients ?? config.sync?.clients ?? ['claude-desktop', 'cursor', 'claude-code'];
  const ctx = createContext(configDir);

  const enabledServers: Record<string, ServerConfig> = {};
  for (const [name, server] of Object.entries(config.mcpServers)) {
    if (!server.disabled) enabledServers[name] = server;
  }

  const resolved = resolveAllServers(enabledServers, ctx);
  const results: SyncResult[] = [];
  const manifest = await loadManifest();

  for (const clientId of clients) {
    const adapter = getAdapter(clientId);

    try {
      if (options?.dryRun) {
        results.push({
          client: clientId,
          success: true,
          path: adapter.getConfigPath(),
          serversWritten: Object.keys(resolved).length,
        });
        continue;
      }

      await adapter.backup();
      await adapter.writeServers(resolved);

      manifest[clientId] = Object.keys(resolved);

      results.push({
        client: clientId,
        success: true,
        path: adapter.getConfigPath(),
        serversWritten: Object.keys(resolved).length,
      });
    } catch (err) {
      results.push({
        client: clientId,
        success: false,
        path: adapter.getConfigPath(),
        serversWritten: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (!options?.dryRun) {
    await saveManifest(manifest);
  }

  return results;
}

async function loadManifest(): Promise<SyncManifest> {
  return (await readJsonFile<SyncManifest>(getSyncManifestPath())) ?? {};
}

async function saveManifest(manifest: SyncManifest): Promise<void> {
  await writeJsonFile(getSyncManifestPath(), manifest);
}
