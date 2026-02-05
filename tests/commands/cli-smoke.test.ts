import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import crossSpawn from 'cross-spawn';

const CLI = join(__dirname, '..', '..', 'dist', 'bin', 'cli.js');

function runCli(args: string[], cwd: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = crossSpawn('node', [CLI, ...args], {
      cwd,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
    child.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('CLI timed out after 15s'));
    }, 15000);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code ?? 1 });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'owl07-cli-test-'));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('CLI smoke tests', () => {
  it('shows help', async () => {
    const result = await runCli(['--help'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('owl07');
    expect(result.stdout).toContain('init');
    expect(result.stdout).toContain('sync');
  });

  it('shows version', async () => {
    const result = await runCli(['--version'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe('0.1.0');
  });

  it('init creates config file', async () => {
    const result = await runCli(['init', '-y'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Created .owl07.json');

    const config = JSON.parse(await readFile(join(tempDir, '.owl07.json'), 'utf-8'));
    expect(config.mcpServers).toEqual({});
    expect(config.sync.clients).toHaveLength(3);
  });

  it('add-json adds server', async () => {
    await runCli(['init', '-y'], tempDir);
    const result = await runCli(
      ['add-json', 'test-server', '{"command":"echo","args":["hello"]}'],
      tempDir,
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Added server test-server');

    const config = JSON.parse(await readFile(join(tempDir, '.owl07.json'), 'utf-8'));
    expect(config.mcpServers['test-server'].command).toBe('echo');
  });

  it('list shows servers', async () => {
    await runCli(['init', '-y'], tempDir);
    await runCli(['add-json', 'myserver', '{"command":"echo"}'], tempDir);
    const result = await runCli(['list'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('myserver');
  });

  it('status shows enabled/disabled count', async () => {
    await runCli(['init', '-y'], tempDir);
    await runCli(['add-json', 'srv1', '{"command":"echo"}'], tempDir);
    const result = await runCli(['status'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('1 enabled');
  });

  it('disable and enable toggle server', async () => {
    await runCli(['init', '-y'], tempDir);
    await runCli(['add-json', 'srv', '{"command":"echo"}'], tempDir);

    const disableResult = await runCli(['disable', 'srv'], tempDir);
    expect(disableResult.exitCode).toBe(0);
    expect(disableResult.stdout).toContain('Disabled');

    let config = JSON.parse(await readFile(join(tempDir, '.owl07.json'), 'utf-8'));
    expect(config.mcpServers.srv.disabled).toBe(true);

    const enableResult = await runCli(['enable', 'srv'], tempDir);
    expect(enableResult.exitCode).toBe(0);
    expect(enableResult.stdout).toContain('Enabled');

    config = JSON.parse(await readFile(join(tempDir, '.owl07.json'), 'utf-8'));
    expect(config.mcpServers.srv.disabled).toBe(false);
  });

  it('remove deletes server', async () => {
    await runCli(['init', '-y'], tempDir);
    await runCli(['add-json', 'srv', '{"command":"echo"}'], tempDir);
    const result = await runCli(['remove', 'srv', '-y'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Removed');

    const config = JSON.parse(await readFile(join(tempDir, '.owl07.json'), 'utf-8'));
    expect(config.mcpServers.srv).toBeUndefined();
  });

  it('use --list shows templates', async () => {
    const result = await runCli(['use', '--list'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('web');
    expect(result.stdout).toContain('python');
    expect(result.stdout).toContain('fullstack');
  });

  it('use applies template', async () => {
    await runCli(['init', '-y'], tempDir);
    const result = await runCli(['use', 'minimal'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Applied template');

    const config = JSON.parse(await readFile(join(tempDir, '.owl07.json'), 'utf-8'));
    expect(config.mcpServers.filesystem).toBeDefined();
    expect(config.mcpServers.memory).toBeDefined();
  });

  it('export outputs JSON', async () => {
    await runCli(['init', '-y'], tempDir);
    await runCli(['add-json', 'srv', '{"command":"echo"}'], tempDir);
    const result = await runCli(['export'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('mcpServers');
  });

  it('env shows no vars message for empty config', async () => {
    await runCli(['init', '-y'], tempDir);
    const result = await runCli(['env'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('No environment variables');
  });

  it('add-json rejects invalid JSON', async () => {
    await runCli(['init', '-y'], tempDir);
    const result = await runCli(['add-json', 'bad', '{invalid}'], tempDir);
    expect(result.exitCode).toBe(1);
  });

  it('add-json rejects duplicate server', async () => {
    await runCli(['init', '-y'], tempDir);
    await runCli(['add-json', 'srv', '{"command":"echo"}'], tempDir);
    const result = await runCli(['add-json', 'srv', '{"command":"echo"}'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('already exists');
  });

  it('enable rejects non-existent server', async () => {
    await runCli(['init', '-y'], tempDir);
    const result = await runCli(['enable', 'nope'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('not found');
  });

  it('full workflow: init → add → list → disable → enable → export → remove', async () => {
    let r = await runCli(['init', '-y'], tempDir);
    expect(r.exitCode).toBe(0);

    r = await runCli(['add-json', 'test', '{"command":"echo","args":["hello"]}'], tempDir);
    expect(r.exitCode).toBe(0);

    r = await runCli(['list'], tempDir);
    expect(r.stdout).toContain('test');

    r = await runCli(['disable', 'test'], tempDir);
    expect(r.stdout).toContain('Disabled');

    r = await runCli(['enable', 'test'], tempDir);
    expect(r.stdout).toContain('Enabled');

    r = await runCli(['export'], tempDir);
    expect(r.stdout).toContain('echo');

    r = await runCli(['remove', 'test', '-y'], tempDir);
    expect(r.stdout).toContain('Removed');
  });
});
