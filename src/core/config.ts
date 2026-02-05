import { resolve, dirname, join } from 'node:path';
import { accessSync } from 'node:fs';
import { CONFIG_FILENAME, getGlobalConfigPath, SCHEMA_URL } from './constants.js';
import { McpxConfigSchema, type McpxConfig, type ServerConfig } from './schema.js';
import { readJsonFile, writeJsonFile, fileExists } from '../utils/fs.js';

export function findConfigPath(startDir?: string): string | null {
  let dir = resolve(startDir || process.cwd());

  while (true) {
    const candidate = join(dir, CONFIG_FILENAME);
    try {
      accessSync(candidate);
      return candidate;
    } catch {
      // continue walking up
    }

    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
}

export async function loadProjectConfig(cwd?: string): Promise<McpxConfig | null> {
  const configPath = findConfigPath(cwd);
  if (!configPath) return null;

  const raw = await readJsonFile<unknown>(configPath);
  if (!raw) return null;

  return McpxConfigSchema.parse(raw);
}

export async function loadGlobalConfig(): Promise<McpxConfig | null> {
  const globalPath = getGlobalConfigPath();
  const raw = await readJsonFile<unknown>(globalPath);
  if (!raw) return null;

  return McpxConfigSchema.parse(raw);
}

export async function loadMergedConfig(cwd?: string): Promise<McpxConfig> {
  const project = await loadProjectConfig(cwd);
  const global = await loadGlobalConfig();

  if (!project && !global) {
    return { mcpServers: {}, sync: { clients: ['claude-desktop', 'cursor', 'claude-code'] } };
  }

  if (!project) return global!;
  if (!global) return project;

  return {
    $schema: project.$schema,
    mcpServers: { ...global.mcpServers, ...project.mcpServers },
    sync: project.sync ?? global.sync,
  };
}

export async function saveProjectConfig(config: McpxConfig, cwd?: string): Promise<void> {
  const dir = resolve(cwd || process.cwd());
  const configPath = join(dir, CONFIG_FILENAME);
  await writeJsonFile(configPath, { $schema: SCHEMA_URL, ...config });
}

export function getConfigDir(cwd?: string): string {
  const configPath = findConfigPath(cwd);
  if (configPath) return dirname(configPath);
  return resolve(cwd || process.cwd());
}

export function createEmptyConfig(): McpxConfig {
  return {
    $schema: SCHEMA_URL,
    mcpServers: {},
    sync: { clients: ['claude-desktop', 'cursor', 'claude-code'] },
  };
}

export function addServer(config: McpxConfig, name: string, server: ServerConfig): McpxConfig {
  return {
    ...config,
    mcpServers: { ...config.mcpServers, [name]: server },
  };
}

export function removeServer(config: McpxConfig, name: string): McpxConfig {
  const { [name]: _, ...rest } = config.mcpServers;
  return { ...config, mcpServers: rest };
}

export function hasServer(config: McpxConfig, name: string): boolean {
  return name in config.mcpServers;
}
