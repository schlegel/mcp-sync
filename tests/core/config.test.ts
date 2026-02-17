import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  findConfigPath,
  loadProjectConfig,
  saveProjectConfig,
  createEmptyConfig,
  addServer,
  removeServer,
  hasServer,
  loadMergedConfig,
} from '../../src/core/config.js';
import { CONFIG_FILENAME } from '../../src/core/constants.js';

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'mcp-sync-test-'));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('findConfigPath', () => {
  it('finds config in current directory', async () => {
    const configPath = join(tempDir, CONFIG_FILENAME);
    await writeFile(configPath, '{}');
    const found = findConfigPath(tempDir);
    expect(found).toBe(configPath);
  });

  it('walks up to parent directory', async () => {
    const childDir = join(tempDir, 'child', 'deep');
    await mkdir(childDir, { recursive: true });
    await writeFile(join(tempDir, CONFIG_FILENAME), '{}');
    const found = findConfigPath(childDir);
    expect(found).toBe(join(tempDir, CONFIG_FILENAME));
  });

  it('returns null when no config found', () => {
    const found = findConfigPath(tempDir);
    expect(found).toBeNull();
  });
});

describe('loadProjectConfig', () => {
  it('loads valid config', async () => {
    const config = {
      mcpServers: { test: { command: 'echo' } },
    };
    await writeFile(join(tempDir, CONFIG_FILENAME), JSON.stringify(config));
    const loaded = await loadProjectConfig(tempDir);
    expect(loaded).not.toBeNull();
    expect(loaded!.mcpServers.test.command).toBe('echo');
  });

  it('returns null when no config exists', async () => {
    const loaded = await loadProjectConfig(tempDir);
    expect(loaded).toBeNull();
  });

  it('handles config with trailing commas', async () => {
    const json = '{\n  "mcpServers": {\n    "test": { "command": "echo", },\n  },\n}';
    await writeFile(join(tempDir, CONFIG_FILENAME), json);
    const loaded = await loadProjectConfig(tempDir);
    expect(loaded).not.toBeNull();
    expect(loaded!.mcpServers.test.command).toBe('echo');
  });
});

describe('saveProjectConfig', () => {
  it('writes config with schema URL', async () => {
    const config = createEmptyConfig();
    await saveProjectConfig(config, tempDir);

    const loaded = await loadProjectConfig(tempDir);
    expect(loaded).not.toBeNull();
    expect(loaded!.$schema).toBeDefined();
    expect(loaded!.mcpServers).toEqual({});
  });
});

describe('createEmptyConfig', () => {
  it('returns config with empty servers and all clients', () => {
    const config = createEmptyConfig();
    expect(config.mcpServers).toEqual({});
    expect(config.sync.clients).toEqual(['claude-desktop', 'cursor', 'claude-code']);
    expect(config.$schema).toBeDefined();
  });
});

describe('addServer', () => {
  it('adds server to config', () => {
    const config = createEmptyConfig();
    const updated = addServer(config, 'test', { command: 'echo', args: [], env: {}, disabled: false });
    expect(updated.mcpServers.test.command).toBe('echo');
    // Original should be unchanged (immutable)
    expect(config.mcpServers.test).toBeUndefined();
  });

  it('overwrites existing server', () => {
    let config = createEmptyConfig();
    config = addServer(config, 'test', { command: 'echo', args: [], env: {}, disabled: false });
    config = addServer(config, 'test', { command: 'node', args: [], env: {}, disabled: false });
    expect(config.mcpServers.test.command).toBe('node');
  });
});

describe('removeServer', () => {
  it('removes server from config', () => {
    let config = createEmptyConfig();
    config = addServer(config, 'test', { command: 'echo', args: [], env: {}, disabled: false });
    const updated = removeServer(config, 'test');
    expect(updated.mcpServers.test).toBeUndefined();
    // Original should still have it (immutable)
    expect(config.mcpServers.test).toBeDefined();
  });

  it('handles removing non-existent server', () => {
    const config = createEmptyConfig();
    const updated = removeServer(config, 'nonexistent');
    expect(updated.mcpServers).toEqual({});
  });
});

describe('hasServer', () => {
  it('returns true for existing server', () => {
    const config = addServer(createEmptyConfig(), 'test', { command: 'echo', args: [], env: {}, disabled: false });
    expect(hasServer(config, 'test')).toBe(true);
  });

  it('returns false for non-existing server', () => {
    expect(hasServer(createEmptyConfig(), 'test')).toBe(false);
  });
});

describe('loadMergedConfig', () => {
  it('returns defaults when no config exists', async () => {
    const config = await loadMergedConfig(tempDir);
    expect(config.mcpServers).toEqual({});
    expect(config.sync.clients).toEqual(['claude-desktop', 'cursor', 'claude-code']);
  });

  it('returns project config when available', async () => {
    const projectConfig = {
      mcpServers: { test: { command: 'echo' } },
      sync: { clients: ['cursor'] },
    };
    await writeFile(join(tempDir, CONFIG_FILENAME), JSON.stringify(projectConfig));
    const config = await loadMergedConfig(tempDir);
    expect(config.mcpServers.test).toBeDefined();
    expect(config.sync.clients).toEqual(['cursor']);
  });
});
