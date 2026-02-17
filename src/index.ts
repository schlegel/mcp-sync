export { loadProjectConfig, loadGlobalConfig, loadMergedConfig, saveProjectConfig } from './core/config.js';
export { McpSyncConfigSchema, ServerConfigSchema, validateConfig, safeValidateConfig } from './core/schema.js';
export type { McpSyncConfig, ServerConfig, SyncConfig } from './core/schema.js';
export { resolveVariables, resolveServerConfig, createContext } from './core/variables.js';
export { syncToClients } from './sync/engine.js';
export { checkAllServers, checkServer } from './health/checker.js';
export type { HealthResult, DiagnosticResult } from './types/health.js';
export type { SyncResult, ClientAdapter } from './types/client.js';
