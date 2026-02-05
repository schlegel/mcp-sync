import { homedir, platform } from 'node:os';
import type { ServerConfig } from './schema.js';

export interface VariableContext {
  workspaceFolder: string;
  home: string;
  platform: NodeJS.Platform;
  env: Record<string, string | undefined>;
}

export function createContext(configDir: string): VariableContext {
  return {
    workspaceFolder: configDir,
    home: homedir(),
    platform: platform(),
    env: process.env as Record<string, string | undefined>,
  };
}

const VARIABLE_REGEX = /\$\{(workspaceFolder|home|platform|env:([^}]+))\}/g;

export function resolveVariables(value: string, ctx: VariableContext): string {
  return value.replace(VARIABLE_REGEX, (match, varName: string, envKey: string) => {
    if (varName === 'workspaceFolder') return ctx.workspaceFolder;
    if (varName === 'home') return ctx.home;
    if (varName === 'platform') return ctx.platform;
    if (varName.startsWith('env:')) {
      const val = ctx.env[envKey];
      return val ?? '';
    }
    return match;
  });
}

export function resolveServerConfig(server: ServerConfig, ctx: VariableContext): ServerConfig {
  return {
    command: resolveVariables(server.command, ctx),
    args: server.args?.map((a) => resolveVariables(a, ctx)) ?? [],
    env: server.env
      ? Object.fromEntries(
          Object.entries(server.env).map(([k, v]) => [k, resolveVariables(v, ctx)]),
        )
      : {},
    disabled: server.disabled,
  };
}

export function resolveAllServers(
  servers: Record<string, ServerConfig>,
  ctx: VariableContext,
): Record<string, ServerConfig> {
  const resolved: Record<string, ServerConfig> = {};
  for (const [name, config] of Object.entries(servers)) {
    resolved[name] = resolveServerConfig(config, ctx);
  }
  return resolved;
}
