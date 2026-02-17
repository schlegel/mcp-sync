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
  tempDir = await mkdtemp(join(tmpdir(), 'mcp-sync-cli-test-'));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function expectSuccess(result: { stdout: string; stderr: string; exitCode: number }) {
  if (result.exitCode !== 0) {
    console.error('CLI STDERR:', result.stderr);
    console.error('CLI STDOUT:', result.stdout);
  }
  expect(result.exitCode).toBe(0);
}

describe('CLI smoke tests', () => {
  it('shows help', async () => {
    const result = await runCli(['help'], tempDir);
    expectSuccess(result);
    expect(result.stdout).toContain('mcp-sync');
    expect(result.stdout).toContain('init');
    expect(result.stdout).toContain('sync');
  });

  it('shows help with ? alias', async () => {
    const result = await runCli(['?'], tempDir);
    expectSuccess(result);
    expect(result.stdout).toContain('mcp-sync');
  });

  it('shows version', async () => {
    const result = await runCli(['--version'], tempDir);
    expectSuccess(result);
    expect(result.stdout.trim()).toBe('0.1.0');
  });

  it('init creates config file', async () => {
    const result = await runCli(['init', '-y'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Created .mcp-sync.json');

    const config = JSON.parse(await readFile(join(tempDir, '.mcp-sync.json'), 'utf-8'));
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

    const config = JSON.parse(await readFile(join(tempDir, '.mcp-sync.json'), 'utf-8'));
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

    let config = JSON.parse(await readFile(join(tempDir, '.mcp-sync.json'), 'utf-8'));
    expect(config.mcpServers.srv.disabled).toBe(true);

    const enableResult = await runCli(['enable', 'srv'], tempDir);
    expect(enableResult.exitCode).toBe(0);
    expect(enableResult.stdout).toContain('Enabled');

    config = JSON.parse(await readFile(join(tempDir, '.mcp-sync.json'), 'utf-8'));
    expect(config.mcpServers.srv.disabled).toBe(false);
  });

  it('remove deletes server', async () => {
    await runCli(['init', '-y'], tempDir);
    await runCli(['add-json', 'srv', '{"command":"echo"}'], tempDir);
    const result = await runCli(['remove', 'srv', '-y'], tempDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Removed');

    const config = JSON.parse(await readFile(join(tempDir, '.mcp-sync.json'), 'utf-8'));
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

    const config = JSON.parse(await readFile(join(tempDir, '.mcp-sync.json'), 'utf-8'));
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

  it('status --json outputs valid JSON', async () => {
    await runCli(['init', '-y'], tempDir);
    await runCli(['add-json', 'srv', '{"command":"echo"}'], tempDir);
    const result = await runCli(['status', '--json'], tempDir);
    expectSuccess(result);
    const json = JSON.parse(result.stdout);
    expect(json.servers).toHaveLength(1);
    expect(json.servers[0].name).toBe('srv');
    expect(json.servers[0].enabled).toBe(true);
    expect(json.summary.enabled).toBe(1);
  });

  it('list --json outputs valid JSON', async () => {
    await runCli(['init', '-y'], tempDir);
    await runCli(['add-json', 'srv', '{"command":"echo"}'], tempDir);
    const result = await runCli(['list', '--json'], tempDir);
    expectSuccess(result);
    const json = JSON.parse(result.stdout);
    expect(json.srv).toBeDefined();
    expect(json.srv.command).toBe('echo');
  });

  it('validate --json outputs valid JSON', async () => {
    await runCli(['init', '-y'], tempDir);
    const result = await runCli(['validate', '--json'], tempDir);
    expectSuccess(result);
    const json = JSON.parse(result.stdout);
    expect(json.valid).toBe(true);
    expect(json.errors).toEqual([]);
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
