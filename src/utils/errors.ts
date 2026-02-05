export class Owl07Error extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'Owl07Error';
  }
}

export class ConfigNotFoundError extends Owl07Error {
  constructor(searchPath: string) {
    super(`No .owl07.json found in ${searchPath} or any parent directory`, 'CONFIG_NOT_FOUND');
    this.name = 'ConfigNotFoundError';
  }
}

export class ConfigValidationError extends Owl07Error {
  constructor(public errors: string[]) {
    super(`Invalid config:\n${errors.map(e => `  - ${e}`).join('\n')}`, 'CONFIG_VALIDATION');
    this.name = 'ConfigValidationError';
  }
}

export class SyncError extends Owl07Error {
  constructor(client: string, reason: string) {
    super(`Sync to ${client} failed: ${reason}`, 'SYNC_ERROR');
    this.name = 'SyncError';
  }
}

export class HealthCheckError extends Owl07Error {
  constructor(server: string, reason: string) {
    super(`Health check for "${server}" failed: ${reason}`, 'HEALTH_CHECK');
    this.name = 'HealthCheckError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof Owl07Error) {
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
