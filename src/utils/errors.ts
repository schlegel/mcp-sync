export class McpSyncError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'McpSyncError';
  }
}

export class ConfigNotFoundError extends McpSyncError {
  constructor(searchPath: string) {
    super(`No .mcp-sync.json found in ${searchPath} or any parent directory`, 'CONFIG_NOT_FOUND');
    this.name = 'ConfigNotFoundError';
  }
}

export class ConfigValidationError extends McpSyncError {
  constructor(public errors: string[]) {
    super(`Invalid config:\n${errors.map(e => `  - ${e}`).join('\n')}`, 'CONFIG_VALIDATION');
    this.name = 'ConfigValidationError';
  }
}

export class SyncError extends McpSyncError {
  constructor(client: string, reason: string) {
    super(`Sync to ${client} failed: ${reason}`, 'SYNC_ERROR');
    this.name = 'SyncError';
  }
}

export class HealthCheckError extends McpSyncError {
  constructor(server: string, reason: string) {
    super(`Health check for "${server}" failed: ${reason}`, 'HEALTH_CHECK');
    this.name = 'HealthCheckError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof McpSyncError) {
    console.error(`\n  Error: ${error.message}\n`);
    process.exit(1);
  }

  if (error instanceof Error) {
    console.error(`\n  Unexpected error: ${error.message}\n`);
    if (process.env.DEBUG) console.error(error.stack);
    process.exit(1);
  }

  console.error(`\n  Unknown error: ${String(error)}\n`);
  process.exit(1);
}
