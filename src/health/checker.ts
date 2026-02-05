import type { ServerConfig } from '../core/schema.js';
import type { HealthResult } from '../types/health.js';
import { HEALTH_CHECK_TIMEOUT_MS } from '../core/constants.js';
import { spawnAndPing } from './spawn.js';
import { commandExists } from '../utils/process.js';

export async function checkServer(
  name: string,
  config: ServerConfig,
  timeout = HEALTH_CHECK_TIMEOUT_MS,
): Promise<HealthResult> {
  if (!commandExists(config.command)) {
    return {
      server: name,
      status: 'not-found',
      error: `Command "${config.command}" not found in PATH`,
    };
  }

  try {
    const result = await spawnAndPing(
      config.command,
      config.args ?? [],
      config.env ?? {},
      timeout,
    );

    if (result.success) {
      return {
        server: name,
        status: 'healthy',
        latencyMs: result.latencyMs,
        serverInfo: result.serverInfo,
      };
    }

    if (result.error?.includes('Timed out')) {
      return { server: name, status: 'timeout', latencyMs: result.latencyMs, error: result.error };
    }

    return { server: name, status: 'unhealthy', latencyMs: result.latencyMs, error: result.error };
  } catch (err) {
    return {
      server: name,
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function checkAllServers(
  servers: Record<string, ServerConfig>,
  timeout = HEALTH_CHECK_TIMEOUT_MS,
): Promise<HealthResult[]> {
  const entries = Object.entries(servers).filter(([, s]) => !s.disabled);
  const results = await Promise.all(
    entries.map(([name, config]) => checkServer(name, config, timeout)),
  );
  return results;
}
