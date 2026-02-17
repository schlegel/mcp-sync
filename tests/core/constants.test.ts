import { describe, it, expect } from 'vitest';
import {
  VERSION,
  NAME,
  CONFIG_FILENAME,
  ALL_CLIENTS,
  CLIENT_DISPLAY_NAMES,
  getClientConfigPath,
  getGlobalConfigDir,
  getGlobalConfigPath,
  getSyncManifestPath,
} from '../../src/core/constants.js';

describe('constants', () => {
  it('VERSION is 0.1.0', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('NAME is mcp-sync', () => {
    expect(NAME).toBe('mcp-sync');
  });

  it('CONFIG_FILENAME is .mcp-sync.json', () => {
    expect(CONFIG_FILENAME).toBe('.mcp-sync.json');
  });

  it('ALL_CLIENTS has 3 entries', () => {
    expect(ALL_CLIENTS).toEqual(['claude-desktop', 'cursor', 'claude-code']);
  });

  it('CLIENT_DISPLAY_NAMES maps all clients', () => {
    for (const client of ALL_CLIENTS) {
      expect(CLIENT_DISPLAY_NAMES[client]).toBeTruthy();
    }
    expect(CLIENT_DISPLAY_NAMES['claude-desktop']).toBe('Claude Desktop');
    expect(CLIENT_DISPLAY_NAMES['cursor']).toBe('Cursor');
    expect(CLIENT_DISPLAY_NAMES['claude-code']).toBe('Claude Code');
  });
});

describe('getClientConfigPath', () => {
  it('returns path for claude-desktop', () => {
    const path = getClientConfigPath('claude-desktop');
    expect(path).toContain('claude_desktop_config.json');
  });

  it('returns project path for cursor', () => {
    const path = getClientConfigPath('cursor', 'project', '/my/project');
    expect(path).toContain('.cursor');
    expect(path).toContain('mcp.json');
  });

  it('returns project path for claude-code', () => {
    const path = getClientConfigPath('claude-code', 'project', '/my/project');
    expect(path).toContain('.mcp.json');
  });
});

describe('global paths', () => {
  it('getGlobalConfigDir contains .mcp-sync', () => {
    expect(getGlobalConfigDir()).toContain('.mcp-sync');
  });

  it('getGlobalConfigPath contains config.json', () => {
    expect(getGlobalConfigPath()).toContain('config.json');
  });

  it('getSyncManifestPath contains sync-manifest.json', () => {
    expect(getSyncManifestPath()).toContain('sync-manifest.json');
  });
});
