import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  fileExists,
  ensureDir,
  readJsonFile,
  writeJsonFile,
  atomicWrite,
  createBackup,
} from '../../src/utils/fs.js';

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'owl07-fs-test-'));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('fileExists', () => {
  it('returns true for existing file', async () => {
    const filePath = join(tempDir, 'test.txt');
    await writeFile(filePath, 'hello');
    expect(await fileExists(filePath)).toBe(true);
  });

  it('returns false for non-existing file', async () => {
    expect(await fileExists(join(tempDir, 'nope.txt'))).toBe(false);
  });
});

describe('ensureDir', () => {
  it('creates nested directories', async () => {
    const nested = join(tempDir, 'a', 'b', 'c');
    await ensureDir(nested);
    expect(existsSync(nested)).toBe(true);
  });

  it('does not fail on existing directory', async () => {
    await ensureDir(tempDir);
    expect(existsSync(tempDir)).toBe(true);
  });
});

describe('readJsonFile', () => {
  it('reads valid JSON file', async () => {
    const filePath = join(tempDir, 'data.json');
    await writeFile(filePath, '{"key": "value"}');
    const data = await readJsonFile<{ key: string }>(filePath);
    expect(data).toEqual({ key: 'value' });
  });

  it('handles trailing commas', async () => {
    const filePath = join(tempDir, 'data.json');
    await writeFile(filePath, '{"key": "value",}');
    const data = await readJsonFile<{ key: string }>(filePath);
    expect(data).toEqual({ key: 'value' });
  });

  it('returns null for non-existing file', async () => {
    expect(await readJsonFile(join(tempDir, 'nope.json'))).toBeNull();
  });

  it('returns null for invalid JSON', async () => {
    const filePath = join(tempDir, 'bad.json');
    await writeFile(filePath, 'not json at all');
    expect(await readJsonFile(filePath)).toBeNull();
  });
});

describe('writeJsonFile', () => {
  it('writes formatted JSON', async () => {
    const filePath = join(tempDir, 'out.json');
    await writeJsonFile(filePath, { key: 'value' });
    const content = await readFile(filePath, 'utf-8');
    expect(JSON.parse(content)).toEqual({ key: 'value' });
    expect(content).toContain('\n'); // pretty printed
  });

  it('creates parent directories', async () => {
    const filePath = join(tempDir, 'nested', 'deep', 'out.json');
    await writeJsonFile(filePath, { ok: true });
    const data = await readJsonFile<{ ok: boolean }>(filePath);
    expect(data).toEqual({ ok: true });
  });
});

describe('atomicWrite', () => {
  it('writes content atomically', async () => {
    const filePath = join(tempDir, 'atomic.txt');
    await atomicWrite(filePath, 'hello world');
    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe('hello world');
  });

  it('does not leave tmp file behind', async () => {
    const filePath = join(tempDir, 'atomic.txt');
    await atomicWrite(filePath, 'test');
    expect(existsSync(filePath + '.tmp')).toBe(false);
  });
});

describe('createBackup', () => {
  it('creates backup of existing file', async () => {
    const filePath = join(tempDir, 'config.json');
    await writeFile(filePath, '{"original": true}');
    const backupPath = await createBackup(filePath);
    expect(backupPath).toBe(filePath + '.owl07-backup');
    const content = await readFile(backupPath!, 'utf-8');
    expect(content).toBe('{"original": true}');
  });

  it('returns null for non-existing file', async () => {
    const result = await createBackup(join(tempDir, 'nope.json'));
    expect(result).toBeNull();
  });

  it('uses custom suffix', async () => {
    const filePath = join(tempDir, 'config.json');
    await writeFile(filePath, 'data');
    const backupPath = await createBackup(filePath, '.bak');
    expect(backupPath).toBe(filePath + '.bak');
  });
});
