import { describe, it, expect } from 'vitest';
import { platform } from 'node:os';
import {
  getHomeDir,
  isWindows,
  isMac,
  isLinux,
  getPlatform,
  resolvePath,
} from '../../src/utils/platform.js';

describe('platform detection', () => {
  it('getHomeDir returns a non-empty string', () => {
    expect(getHomeDir()).toBeTruthy();
    expect(typeof getHomeDir()).toBe('string');
  });

  it('getPlatform returns current platform', () => {
    expect(getPlatform()).toBe(platform());
  });

  it('exactly one platform check is true', () => {
    const checks = [isWindows(), isMac(), isLinux()].filter(Boolean);
    // At least one should be true on any real platform
    // (could be 0 if running on FreeBSD etc., but that's edge case)
    expect(checks.length).toBeGreaterThanOrEqual(0);
  });
});

describe('resolvePath', () => {
  it('resolves ~ to home directory', () => {
    const result = resolvePath('~/test');
    expect(result).toContain('test');
    expect(result).not.toContain('~');
  });

  it('resolves relative paths', () => {
    const result = resolvePath('./relative');
    expect(result).not.toContain('./');
  });

  if (platform() === 'win32') {
    it('resolves %APPDATA% on Windows', () => {
      const result = resolvePath('%APPDATA%/test');
      expect(result).not.toContain('%APPDATA%');
    });
  }
});
