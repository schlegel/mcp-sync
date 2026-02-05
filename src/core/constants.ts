import { homedir, platform } from 'node:os';
import { join } from 'node:path';

export const VERSION = '0.1.0';
export const NAME = 'owl07';
export const DESCRIPTION = 'Project-first MCP server manager. Like dotenv + Homebrew for MCP servers.';

export const CONFIG_FILENAME = '.owl07.json';
export const GLOBAL_CONFIG_DIR = '.owl07';
export const GLOBAL_CONFIG_FILENAME = 'config.json';
export const SYNC_MANIFEST_FILENAME = 'sync-manifest.json';
export const BACKUP_SUFFIX = '.owl07-backup';
export const SCHEMA_URL = 'https://raw.githubusercontent.com/aditya-ai-architect/owl07/main/schema/owl07.schema.json';

export const HEALTH_CHECK_TIMEOUT_MS = 10_000;
export const JSON_RPC_VERSION = '2.0' as const;

export type ClientId = 'claude-desktop' | 'cursor' | 'claude-code';

export const ALL_CLIENTS: ClientId[] = ['claude-desktop', 'cursor', 'claude-code'];

export const CLIENT_DISPLAY_NAMES: Record<ClientId, string> = {
  'claude-desktop': 'Claude Desktop',
  'cursor': 'Cursor',
  'claude-code': 'Claude Code',
};

function getAppDataDir(): string {
  const p = platform();
  if (p === 'win32') return process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
  if (p === 'darwin') return join(homedir(), 'Library', 'Application Support');
  return process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
}

export function getClientConfigPath(client: ClientId, scope: 'global' | 'project' = 'global', projectDir?: string): string {
  const home = homedir();
  const appData = getAppDataDir();
  const cwd = projectDir || process.cwd();

  switch (client) {
    case 'claude-desktop':
      if (platform() === 'win32') return join(appData, 'Claude', 'claude_desktop_config.json');
      if (platform() === 'darwin') return join(appData, 'Claude', 'claude_desktop_config.json');
      return join(home, '.config', 'Claude', 'claude_desktop_config.json');

    case 'cursor':
      if (scope === 'project') return join(cwd, '.cursor', 'mcp.json');
      if (platform() === 'win32') return join(home, '.cursor', 'mcp.json');
      return join(home, '.cursor', 'mcp.json');

    case 'claude-code':
      if (scope === 'project') return join(cwd, '.mcp.json');
      return join(home, '.claude.json');
  }
}

export function getGlobalConfigDir(): string {
  return join(homedir(), GLOBAL_CONFIG_DIR);
}

export function getGlobalConfigPath(): string {
  return join(getGlobalConfigDir(), GLOBAL_CONFIG_FILENAME);
}

export function getSyncManifestPath(): string {
  return join(getGlobalConfigDir(), SYNC_MANIFEST_FILENAME);
}
