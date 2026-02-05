export interface HealthResult {
  server: string;
  status: 'healthy' | 'unhealthy' | 'timeout' | 'not-found' | 'error';
  latencyMs?: number;
  serverInfo?: { name: string; version: string };
  toolCount?: number;
  error?: string;
}

export interface DiagnosticResult {
  tool: string;
  found: boolean;
  version?: string;
}
