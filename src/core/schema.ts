import { z } from 'zod';

export const ServerConfigSchema = z.object({
  command: z.string().min(1, 'command is required'),
  args: z.array(z.string()).optional().default([]),
  env: z.record(z.string(), z.string()).optional().default({}),
  disabled: z.boolean().optional().default(false),
});

export const SyncConfigSchema = z.object({
  clients: z.array(
    z.enum(['claude-desktop', 'cursor', 'claude-code']),
  ).default(['claude-desktop', 'cursor', 'claude-code']),
});

export const McpxConfigSchema = z.object({
  $schema: z.string().optional(),
  mcpServers: z.record(z.string(), ServerConfigSchema).default({}),
  sync: SyncConfigSchema.optional().default({ clients: ['claude-desktop', 'cursor', 'claude-code'] }),
});

export type McpxConfig = z.infer<typeof McpxConfigSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type SyncConfig = z.infer<typeof SyncConfigSchema>;

export function validateConfig(data: unknown): McpxConfig {
  return McpxConfigSchema.parse(data);
}

export function safeValidateConfig(data: unknown): { success: true; data: McpxConfig } | { success: false; errors: string[] } {
  const result = McpxConfigSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data };

  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`,
  );
  return { success: false, errors };
}
