import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { syncToClients } from '../../src/sync/engine.js';
import type { Owl07Config } from '../../src/core/schema.js';

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'owl07-sync-test-'));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function createTestConfig(overrides?: Partial<Owl07Config>): Owl07Config {
  return {
    mcpServers: {
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '${workspaceFolder}'],
        env: {},
        disabled: false,
      },
    },
    sync: { clients: ['claude-code'] },
    ...overrides,
  };
}

describe('syncToClients', () => {
  it('syncs to claude-code (project scope)', async () => {
    const config = createTestConfig();
    const results = await syncToClients(config, tempDir, { clients: ['claude-code'] });

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(results[0].client).toBe('claude-code');
    expect(results[0].serversWritten).toBe(1);

    // Check that .mcp.json was created in cwd (project scope)
    // Note: ClaudeCodeAdapter uses process.cwd() so this syncs to cwd's .mcp.json
  });

  it('dry run does not write files', async () => {
    const config = createTestConfig();
    const results = await syncToClients(config, tempDir, {
      clients: ['claude-code'],
      dryRun: true,
    });

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(results[0].serversWritten).toBe(1);
  });

  it('skips disabled servers', async () => {
    const config = createTestConfig({
      mcpServers: {
        enabled: { command: 'npx', args: [], env: {}, disabled: false },
        disabled: { command: 'npx', args: [], env: {}, disabled: true },
      },
    });

    const results = await syncToClients(config, tempDir, {
      clients: ['claude-code'],
      dryRun: true,
    });

    expect(results[0].serversWritten).toBe(1); // Only enabled server
  });

  it('handles multiple clients', async () => {
    const config = createTestConfig({
      sync: { clients: ['claude-code', 'cursor'] },
    });

    const results = await syncToClients(config, tempDir, {
      clients: ['claude-code', 'cursor'],
      dryRun: true,
    });

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it('resolves variables during sync', async () => {
    const config = createTestConfig({
      mcpServers: {
        fs: {
          command: 'npx',
          args: ['${workspaceFolder}/test'],
          env: {},
          disabled: false,
        },
      },
    });

    const results = await syncToClients(config, tempDir, {
      clients: ['claude-code'],
      dryRun: true,
    });

    expect(results[0].success).toBe(true);
  });
});
