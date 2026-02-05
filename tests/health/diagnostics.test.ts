import { describe, it, expect } from 'vitest';
import { checkDependencies } from '../../src/health/diagnostics.js';

describe('checkDependencies', () => {
  it('returns results for all 5 tools', async () => {
    const results = await checkDependencies();
    expect(results).toHaveLength(5);

    const tools = results.map((r) => r.tool);
    expect(tools).toContain('node');
    expect(tools).toContain('npx');
    expect(tools).toContain('python');
    expect(tools).toContain('uvx');
    expect(tools).toContain('docker');
  });

  it('node is always found (we are running in node)', async () => {
    const results = await checkDependencies();
    const node = results.find((r) => r.tool === 'node');
    expect(node?.found).toBe(true);
    expect(node?.version).toBeTruthy();
  });

  it('npx is always found (comes with node)', async () => {
    const results = await checkDependencies();
    const npx = results.find((r) => r.tool === 'npx');
    expect(npx?.found).toBe(true);
  });

  it('each result has tool and found fields', async () => {
    const results = await checkDependencies();
    for (const result of results) {
      expect(result.tool).toBeTruthy();
      expect(typeof result.found).toBe('boolean');
    }
  });
});
