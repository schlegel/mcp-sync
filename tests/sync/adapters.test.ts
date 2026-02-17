import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getAdapter, getAllAdapters, detectInstalledClients } from '../../src/sync/adapters/index.js';
import { ClaudeCodeAdapter } from '../../src/sync/adapters/claude-code.js';
import { ClaudeDesktopAdapter } from '../../src/sync/adapters/claude-desktop.js';
import { CursorAdapter } from '../../src/sync/adapters/cursor.js';
import { readJsonFile } from '../../src/utils/fs.js';

describe('getAdapter', () => {
  it('returns ClaudeDesktopAdapter for claude-desktop', () => {
    const adapter = getAdapter('claude-desktop');
    expect(adapter.clientId).toBe('claude-desktop');
    expect(adapter.displayName).toBe('Claude Desktop');
  });

  it('returns CursorAdapter for cursor', () => {
    const adapter = getAdapter('cursor');
    expect(adapter.clientId).toBe('cursor');
    expect(adapter.displayName).toBe('Cursor');
  });

  it('returns ClaudeCodeAdapter for claude-code', () => {
    const adapter = getAdapter('claude-code');
    expect(adapter.clientId).toBe('claude-code');
    expect(adapter.displayName).toBe('Claude Code');
  });

  it('throws for unknown client', () => {
    expect(() => getAdapter('unknown' as any)).toThrow('Unknown client');
  });
});

describe('getAllAdapters', () => {
  it('returns 3 adapters', () => {
    const adapters = getAllAdapters();
    expect(adapters).toHaveLength(3);
  });

  it('includes all client types', () => {
    const adapters = getAllAdapters();
    const ids = adapters.map((a) => a.clientId);
    expect(ids).toContain('claude-desktop');
    expect(ids).toContain('cursor');
    expect(ids).toContain('claude-code');
  });
});

describe('adapter config paths', () => {
  it('claude-desktop path contains claude_desktop_config.json', () => {
    const adapter = new ClaudeDesktopAdapter();
    expect(adapter.getConfigPath()).toContain('claude_desktop_config.json');
  });

  it('claude-code path contains .mcp.json', () => {
    const adapter = new ClaudeCodeAdapter();
    expect(adapter.getConfigPath()).toContain('.mcp.json');
  });

  it('cursor path contains mcp.json', () => {
    const adapter = new CursorAdapter();
    expect(adapter.getConfigPath()).toContain('mcp.json');
  });
});

describe('BaseAdapter.writeServers', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'mcp-sync-adapter-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('formatServers strips disabled flag and empty env', () => {
    // Test through ClaudeCodeAdapter to check formatServers behavior
    const adapter = new ClaudeCodeAdapter();
    const formatted = (adapter as any).formatServers({
      test: { command: 'npx', args: ['-y', 'server'], env: {}, disabled: false },
    });
    expect(formatted.test).toEqual({ command: 'npx', args: ['-y', 'server'] });
    expect(formatted.test.env).toBeUndefined();
    expect(formatted.test.disabled).toBeUndefined();
  });

  it('formatServers includes non-empty env', () => {
    const adapter = new ClaudeCodeAdapter();
    const formatted = (adapter as any).formatServers({
      test: { command: 'npx', args: [], env: { KEY: 'val' }, disabled: false },
    });
    expect(formatted.test.env).toEqual({ KEY: 'val' });
  });
});

describe('detectInstalledClients', () => {
  it('returns array of client IDs', async () => {
    const clients = await detectInstalledClients();
    expect(Array.isArray(clients)).toBe(true);
    for (const id of clients) {
      expect(['claude-desktop', 'cursor', 'claude-code']).toContain(id);
    }
  });
});
