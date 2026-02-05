import type { DiagnosticResult } from '../types/health.js';
import { execCommand, commandExists } from '../utils/process.js';

const TOOLS = ['node', 'npx', 'python', 'uvx', 'docker'];

export async function checkDependencies(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  for (const tool of TOOLS) {
    const found = commandExists(tool);
    let version: string | undefined;

    if (found) {
      try {
        const { stdout } = await execCommand(tool, ['--version'], { timeout: 5000 });
        version = stdout.trim().split('\n')[0];
      } catch {
        version = undefined;
      }
    }

    results.push({ tool, found, version });
  }

  return results;
}
