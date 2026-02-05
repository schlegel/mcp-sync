import crossSpawn from 'cross-spawn';

export async function execCommand(
  command: string,
  args: string[],
  options?: { timeout?: number; env?: Record<string, string> },
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = crossSpawn(command, args, {
      env: { ...process.env, ...options?.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
    child.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

    const timer = options?.timeout
      ? setTimeout(() => {
          child.kill('SIGTERM');
          reject(new Error(`Command timed out after ${options.timeout}ms`));
        }, options.timeout)
      : null;

    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code ?? 1 });
    });

    child.on('error', (err) => {
      if (timer) clearTimeout(timer);
      reject(err);
    });
  });
}

export function commandExists(command: string): boolean {
  try {
    const result = crossSpawn.sync(command, ['--version'], { stdio: 'pipe' });
    return result.error === null || result.error === undefined;
  } catch {
    return false;
  }
}
