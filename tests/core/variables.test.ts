import { describe, it, expect } from 'vitest';
import {
  resolveVariables,
  resolveServerConfig,
  resolveAllServers,
  createContext,
  type VariableContext,
} from '../../src/core/variables.js';

function mockContext(overrides?: Partial<VariableContext>): VariableContext {
  return {
    workspaceFolder: '/projects/myapp',
    home: '/home/testuser',
    platform: 'linux',
    env: { GITHUB_TOKEN: 'ghp_test123', DATABASE_URL: 'postgres://localhost/db' },
    ...overrides,
  };
}

describe('resolveVariables', () => {
  const ctx = mockContext();

  it('resolves ${workspaceFolder}', () => {
    expect(resolveVariables('${workspaceFolder}/src', ctx)).toBe('/projects/myapp/src');
  });

  it('resolves ${home}', () => {
    expect(resolveVariables('${home}/.config', ctx)).toBe('/home/testuser/.config');
  });

  it('resolves ${platform}', () => {
    expect(resolveVariables('${platform}', ctx)).toBe('linux');
  });

  it('resolves ${env:VAR_NAME}', () => {
    expect(resolveVariables('${env:GITHUB_TOKEN}', ctx)).toBe('ghp_test123');
  });

  it('resolves missing env var to empty string', () => {
    expect(resolveVariables('${env:NONEXISTENT}', ctx)).toBe('');
  });

  it('resolves multiple variables in one string', () => {
    const result = resolveVariables('${workspaceFolder}/data on ${platform}', ctx);
    expect(result).toBe('/projects/myapp/data on linux');
  });

  it('leaves strings without variables unchanged', () => {
    expect(resolveVariables('npx', ctx)).toBe('npx');
    expect(resolveVariables('', ctx)).toBe('');
    expect(resolveVariables('hello world', ctx)).toBe('hello world');
  });

  it('leaves unknown patterns unchanged', () => {
    expect(resolveVariables('${unknown}', ctx)).toBe('${unknown}');
  });
});

describe('resolveServerConfig', () => {
  const ctx = mockContext();

  it('resolves command, args, and env', () => {
    const result = resolveServerConfig(
      {
        command: 'npx',
        args: ['-y', 'server', '${workspaceFolder}'],
        env: { TOKEN: '${env:GITHUB_TOKEN}' },
        disabled: false,
      },
      ctx,
    );
    expect(result.command).toBe('npx');
    expect(result.args).toEqual(['-y', 'server', '/projects/myapp']);
    expect(result.env).toEqual({ TOKEN: 'ghp_test123' });
    expect(result.disabled).toBe(false);
  });

  it('handles missing args and env', () => {
    const result = resolveServerConfig(
      { command: 'echo', args: undefined as any, env: undefined as any, disabled: false },
      ctx,
    );
    expect(result.args).toEqual([]);
    expect(result.env).toEqual({});
  });
});

describe('resolveAllServers', () => {
  const ctx = mockContext();

  it('resolves all servers', () => {
    const servers = {
      fs: { command: 'npx', args: ['${workspaceFolder}'], env: {}, disabled: false },
      gh: { command: 'npx', args: ['github'], env: { TOKEN: '${env:GITHUB_TOKEN}' }, disabled: false },
    };
    const result = resolveAllServers(servers, ctx);
    expect(result.fs.args).toEqual(['/projects/myapp']);
    expect(result.gh.env).toEqual({ TOKEN: 'ghp_test123' });
  });

  it('handles empty servers', () => {
    expect(resolveAllServers({}, ctx)).toEqual({});
  });
});

describe('createContext', () => {
  it('creates context with configDir as workspaceFolder', () => {
    const ctx = createContext('/my/project');
    expect(ctx.workspaceFolder).toBe('/my/project');
    expect(typeof ctx.home).toBe('string');
    expect(typeof ctx.platform).toBe('string');
    expect(ctx.env).toBeDefined();
  });
});
