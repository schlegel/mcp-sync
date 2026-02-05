import crossSpawn from 'cross-spawn';
import { VERSION, JSON_RPC_VERSION } from '../core/constants.js';

interface JsonRpcMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export async function spawnAndPing(
  command: string,
  args: string[],
  env: Record<string, string>,
  timeoutMs: number,
): Promise<{ success: boolean; latencyMs: number; serverInfo?: { name: string; version: string }; error?: string }> {
  return new Promise((resolve) => {
    const start = performance.now();

    const child = crossSpawn(command, args, {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let resolved = false;

    const finish = (result: { success: boolean; serverInfo?: { name: string; version: string }; error?: string }) => {
      if (resolved) return;
      resolved = true;
      const latencyMs = Math.round(performance.now() - start);
      child.kill('SIGTERM');
      clearTimeout(timer);
      resolve({ ...result, latencyMs });
    };

    const timer = setTimeout(() => {
      finish({ success: false, error: `Timed out after ${timeoutMs}ms` });
    }, timeoutMs);

    child.on('error', (err) => {
      finish({ success: false, error: err.message });
    });

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();

      const lines = stdout.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg: JsonRpcMessage = JSON.parse(line.trim());

          if (msg.id === 1 && msg.result) {
            const result = msg.result as { serverInfo?: { name: string; version: string } };
            const serverInfo = result.serverInfo;

            const initialized: JsonRpcMessage = {
              jsonrpc: JSON_RPC_VERSION,
              method: 'notifications/initialized',
            };
            child.stdin?.write(JSON.stringify(initialized) + '\n');

            const ping: JsonRpcMessage = {
              jsonrpc: JSON_RPC_VERSION,
              id: 2,
              method: 'ping',
            };
            child.stdin?.write(JSON.stringify(ping) + '\n');

            finish({ success: true, serverInfo: serverInfo ?? undefined });
          }

          if (msg.id === 2) {
            finish({ success: true });
          }
        } catch {
          // partial line, continue
        }
      }
    });

    child.on('close', () => {
      if (!resolved) {
        finish({ success: false, error: 'Process exited unexpectedly' });
      }
    });

    const initRequest: JsonRpcMessage = {
      jsonrpc: JSON_RPC_VERSION,
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'owl07-doctor', version: VERSION },
      },
    };

    child.stdin?.write(JSON.stringify(initRequest) + '\n');
  });
}
