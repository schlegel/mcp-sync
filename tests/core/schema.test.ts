import { describe, it, expect } from 'vitest';
import {
  Owl07ConfigSchema,
  ServerConfigSchema,
  validateConfig,
  safeValidateConfig,
} from '../../src/core/schema.js';

describe('ServerConfigSchema', () => {
  it('parses minimal server config', () => {
    const result = ServerConfigSchema.parse({ command: 'npx' });
    expect(result.command).toBe('npx');
    expect(result.args).toEqual([]);
    expect(result.env).toEqual({});
    expect(result.disabled).toBe(false);
  });

  it('parses full server config', () => {
    const result = ServerConfigSchema.parse({
      command: 'npx',
      args: ['-y', 'server'],
      env: { KEY: 'value' },
      disabled: true,
    });
    expect(result.command).toBe('npx');
    expect(result.args).toEqual(['-y', 'server']);
    expect(result.env).toEqual({ KEY: 'value' });
    expect(result.disabled).toBe(true);
  });

  it('rejects empty command', () => {
    expect(() => ServerConfigSchema.parse({ command: '' })).toThrow();
  });

  it('rejects missing command', () => {
    expect(() => ServerConfigSchema.parse({})).toThrow();
  });

  it('rejects wrong types', () => {
    expect(() => ServerConfigSchema.parse({ command: 123 })).toThrow();
    expect(() => ServerConfigSchema.parse({ command: 'npx', args: 'not-array' })).toThrow();
    expect(() => ServerConfigSchema.parse({ command: 'npx', disabled: 'yes' })).toThrow();
  });
});

describe('Owl07ConfigSchema', () => {
  it('parses minimal config', () => {
    const result = Owl07ConfigSchema.parse({ mcpServers: {} });
    expect(result.mcpServers).toEqual({});
    expect(result.sync.clients).toEqual(['claude-desktop', 'cursor', 'claude-code']);
  });

  it('parses config with servers', () => {
    const result = Owl07ConfigSchema.parse({
      mcpServers: {
        test: { command: 'echo' },
      },
    });
    expect(result.mcpServers.test.command).toBe('echo');
    expect(result.mcpServers.test.args).toEqual([]);
  });

  it('parses config with $schema', () => {
    const result = Owl07ConfigSchema.parse({
      $schema: 'https://example.com/schema.json',
      mcpServers: {},
    });
    expect(result.$schema).toBe('https://example.com/schema.json');
  });

  it('parses config with custom sync clients', () => {
    const result = Owl07ConfigSchema.parse({
      mcpServers: {},
      sync: { clients: ['cursor'] },
    });
    expect(result.sync.clients).toEqual(['cursor']);
  });

  it('rejects invalid client names', () => {
    expect(() =>
      Owl07ConfigSchema.parse({
        mcpServers: {},
        sync: { clients: ['invalid-client'] },
      }),
    ).toThrow();
  });

  it('applies defaults for optional fields', () => {
    const result = Owl07ConfigSchema.parse({ mcpServers: {} });
    expect(result.sync).toBeDefined();
    expect(result.sync.clients).toHaveLength(3);
  });
});

describe('validateConfig', () => {
  it('returns parsed config for valid input', () => {
    const result = validateConfig({ mcpServers: {} });
    expect(result.mcpServers).toEqual({});
  });

  it('applies defaults for empty object (Zod v4 behavior)', () => {
    // {} is valid because mcpServers has .default({})
    const result = validateConfig({});
    expect(result.mcpServers).toEqual({});
    expect(result.sync.clients).toEqual(['claude-desktop', 'cursor', 'claude-code']);
  });

  it('throws for truly invalid input', () => {
    expect(() => validateConfig(null)).toThrow();
    expect(() => validateConfig('string')).toThrow();
    expect(() => validateConfig(42)).toThrow();
  });
});

describe('safeValidateConfig', () => {
  it('returns success for valid config', () => {
    const result = safeValidateConfig({ mcpServers: {} });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mcpServers).toEqual({});
    }
  });

  it('returns success for empty object (defaults applied)', () => {
    // Zod v4: {} gets defaults for mcpServers and sync
    const result = safeValidateConfig({});
    expect(result.success).toBe(true);
  });

  it('returns errors for non-object input', () => {
    const result = safeValidateConfig('not an object');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('returns errors for invalid server', () => {
    const result = safeValidateConfig({
      mcpServers: { bad: { command: '' } },
    });
    expect(result.success).toBe(false);
  });
});
