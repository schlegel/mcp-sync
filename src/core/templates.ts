import type { ServerConfig } from './schema.js';

export interface Template {
  name: string;
  description: string;
  servers: Record<string, ServerConfig>;
}

export const TEMPLATES: Template[] = [
  {
    name: 'web',
    description: 'Web development (filesystem, GitHub, Puppeteer)',
    servers: {
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '${workspaceFolder}'],
        env: {},
        disabled: false,
      },
      github: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: { GITHUB_TOKEN: '${env:GITHUB_TOKEN}' },
        disabled: false,
      },
      puppeteer: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-puppeteer'],
        env: {},
        disabled: false,
      },
    },
  },
  {
    name: 'python',
    description: 'Python / ML stack (filesystem, GitHub, memory)',
    servers: {
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '${workspaceFolder}'],
        env: {},
        disabled: false,
      },
      github: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: { GITHUB_TOKEN: '${env:GITHUB_TOKEN}' },
        disabled: false,
      },
      memory: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
        env: {},
        disabled: false,
      },
    },
  },
  {
    name: 'fullstack',
    description: 'Full-stack (filesystem, GitHub, Postgres, Puppeteer, memory)',
    servers: {
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '${workspaceFolder}'],
        env: {},
        disabled: false,
      },
      github: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: { GITHUB_TOKEN: '${env:GITHUB_TOKEN}' },
        disabled: false,
      },
      postgres: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres', '${env:DATABASE_URL}'],
        env: {},
        disabled: false,
      },
      puppeteer: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-puppeteer'],
        env: {},
        disabled: false,
      },
      memory: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
        env: {},
        disabled: false,
      },
    },
  },
  {
    name: 'devops',
    description: 'DevOps (filesystem, GitHub, Docker, Kubernetes)',
    servers: {
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '${workspaceFolder}'],
        env: {},
        disabled: false,
      },
      github: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: { GITHUB_TOKEN: '${env:GITHUB_TOKEN}' },
        disabled: false,
      },
      'docker-mcp': {
        command: 'npx',
        args: ['-y', 'docker-mcp'],
        env: {},
        disabled: false,
      },
    },
  },
  {
    name: 'minimal',
    description: 'Just the essentials (filesystem, memory)',
    servers: {
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '${workspaceFolder}'],
        env: {},
        disabled: false,
      },
      memory: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
        env: {},
        disabled: false,
      },
    },
  },
  {
    name: 'data',
    description: 'Data engineering (filesystem, Postgres, SQLite, memory)',
    servers: {
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '${workspaceFolder}'],
        env: {},
        disabled: false,
      },
      postgres: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres', '${env:DATABASE_URL}'],
        env: {},
        disabled: false,
      },
      sqlite: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sqlite', '${workspaceFolder}/data.db'],
        env: {},
        disabled: false,
      },
      memory: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
        env: {},
        disabled: false,
      },
    },
  },
];

export function getTemplate(name: string): Template | undefined {
  return TEMPLATES.find((t) => t.name === name);
}

export function listTemplates(): Template[] {
  return TEMPLATES;
}
