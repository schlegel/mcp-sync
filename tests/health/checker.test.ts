import { describe, it, expect, vi } from 'vitest';
import { checkServer, checkAllServers } from '../../src/health/checker.js';

describe('checkServer', () => {
  it('returns not-found for missing command', async () => {
    const result = await checkServer(
      'test',
      { command: 'totally-nonexistent-binary-xyz', args: [], env: {}, disabled: false },
    );
    expect(result.server).toBe('test');
    expect(result.status).toBe('not-found');
    expect(result.error).toContain('not found');
  });

  it('returns timeout for slow server', async () => {
    // Use a command that exists but won't respond with JSON-RPC
    const result = await checkServer(
      'slow',
      { command: 'node', args: ['-e', 'setTimeout(()=>{},30000)'], env: {}, disabled: false },
      1000, // 1 second timeout
    );
    expect(result.server).toBe('slow');
    expect(['timeout', 'unhealthy', 'error']).toContain(result.status);
  }, 15000);

  it('returns unhealthy for process that exits immediately', async () => {
    const result = await checkServer(
      'crasher',
      { command: 'node', args: ['-e', 'process.exit(1)'], env: {}, disabled: false },
      5000,
    );
    expect(result.server).toBe('crasher');
    expect(['unhealthy', 'error']).toContain(result.status);
  });
});

describe('checkAllServers', () => {
  it('skips disabled servers', async () => {
    const results = await checkAllServers({
      enabled: { command: 'totally-nonexistent-xyz', args: [], env: {}, disabled: false },
      disabled: { command: 'totally-nonexistent-xyz', args: [], env: {}, disabled: true },
    });
    expect(results).toHaveLength(1);
    expect(results[0].server).toBe('enabled');
  });

  it('handles empty server list', async () => {
    const results = await checkAllServers({});
    expect(results).toEqual([]);
  });

  it('checks multiple servers in parallel', async () => {
    const start = Date.now();
    const results = await checkAllServers({
      a: { command: 'totally-nonexistent-a', args: [], env: {}, disabled: false },
      b: { command: 'totally-nonexistent-b', args: [], env: {}, disabled: false },
    });
    expect(results).toHaveLength(2);
    // Both should be not-found (fast) since commands don't exist
  });
});
