import type { ClientId } from '../../core/constants.js';
import type { ServerConfig } from '../../core/schema.js';
import type { ClientAdapter } from '../../types/client.js';
import { readJsonFile, writeJsonFile, createBackup, fileExists } from '../../utils/fs.js';

export abstract class BaseAdapter implements ClientAdapter {
  abstract readonly clientId: ClientId;
  abstract readonly displayName: string;
  abstract getConfigPath(): string;

  async detect(): Promise<boolean> {
    const configPath = this.getConfigPath();
    return fileExists(configPath);
  }

  async readExistingServers(): Promise<Record<string, ServerConfig> | null> {
    const configPath = this.getConfigPath();
    const data = await readJsonFile<{ mcpServers?: Record<string, ServerConfig> }>(configPath);
    return data?.mcpServers ?? null;
  }

  async writeServers(servers: Record<string, ServerConfig>): Promise<void> {
    const configPath = this.getConfigPath();
    const existing = await readJsonFile<Record<string, unknown>>(configPath) ?? {};

    const merged = {
      ...existing,
      mcpServers: {
        ...(existing.mcpServers as Record<string, unknown> ?? {}),
        ...this.formatServers(servers),
      },
    };

    await writeJsonFile(configPath, merged);
  }

  async backup(): Promise<string | null> {
    const configPath = this.getConfigPath();
    return createBackup(configPath);
  }

  protected formatServers(servers: Record<string, ServerConfig>): Record<string, unknown> {
    const formatted: Record<string, unknown> = {};
    for (const [name, config] of Object.entries(servers)) {
      const entry: Record<string, unknown> = {
        command: config.command,
        args: config.args ?? [],
      };
      if (config.env && Object.keys(config.env).length > 0) {
        entry.env = config.env;
      }
      formatted[name] = entry;
    }
    return formatted;
  }
}
