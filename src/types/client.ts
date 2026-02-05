import type { ClientId } from '../core/constants.js';
import type { ServerConfig } from '../core/schema.js';

export interface ClientAdapter {
  readonly clientId: ClientId;
  readonly displayName: string;

  detect(): Promise<boolean>;
  getConfigPath(): string;
  readExistingServers(): Promise<Record<string, ServerConfig> | null>;
  writeServers(servers: Record<string, ServerConfig>): Promise<void>;
  backup(): Promise<string | null>;
}

export interface SyncResult {
  client: ClientId;
  success: boolean;
  path: string;
  serversWritten: number;
  error?: string;
  backupPath?: string;
}

export interface SyncManifest {
  [clientId: string]: string[];
}
