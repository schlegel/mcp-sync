import { describe, it, expect } from 'vitest';
import {
  McpSyncError,
  ConfigNotFoundError,
  ConfigValidationError,
  SyncError,
  HealthCheckError,
} from '../../src/utils/errors.js';

describe('McpSyncError', () => {
  it('creates error with message and code', () => {
    const err = new McpSyncError('test message', 'TEST_CODE');
    expect(err.message).toBe('test message');
    expect(err.code).toBe('TEST_CODE');
    expect(err.name).toBe('McpSyncError');
    expect(err instanceof Error).toBe(true);
  });
});

describe('ConfigNotFoundError', () => {
  it('creates error with search path', () => {
    const err = new ConfigNotFoundError('/my/path');
    expect(err.message).toContain('/my/path');
    expect(err.message).toContain('.mcp-sync.json');
    expect(err.code).toBe('CONFIG_NOT_FOUND');
    expect(err.name).toBe('ConfigNotFoundError');
    expect(err instanceof McpSyncError).toBe(true);
  });
});

describe('ConfigValidationError', () => {
  it('creates error with multiple validation errors', () => {
    const errors = ['field1: required', 'field2: invalid type'];
    const err = new ConfigValidationError(errors);
    expect(err.errors).toEqual(errors);
    expect(err.message).toContain('field1: required');
    expect(err.message).toContain('field2: invalid type');
    expect(err.code).toBe('CONFIG_VALIDATION');
    expect(err.name).toBe('ConfigValidationError');
  });
});

describe('SyncError', () => {
  it('creates error with client and reason', () => {
    const err = new SyncError('cursor', 'permission denied');
    expect(err.message).toContain('cursor');
    expect(err.message).toContain('permission denied');
    expect(err.code).toBe('SYNC_ERROR');
    expect(err.name).toBe('SyncError');
  });
});

describe('HealthCheckError', () => {
  it('creates error with server and reason', () => {
    const err = new HealthCheckError('my-server', 'timed out');
    expect(err.message).toContain('my-server');
    expect(err.message).toContain('timed out');
    expect(err.code).toBe('HEALTH_CHECK');
    expect(err.name).toBe('HealthCheckError');
  });
});
