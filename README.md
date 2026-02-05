<div align="center">

# mcpx

**Project-first MCP server manager.**
**Like `.env` + Homebrew for MCP servers.**

[![npm](https://img.shields.io/npm/v/mcpx?color=58A6FF&style=flat-square)](https://www.npmjs.com/package/mcpx)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-3FB950?style=flat-square)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-BC8CFF?style=flat-square)](https://modelcontextprotocol.io)

</div>

---

## The Problem

MCP configs are a mess:

- Scattered across Claude Desktop, Cursor, and Claude Code
- Global configs pollute every project with irrelevant servers
- No version control -- team members set up MCP manually
- Absolute paths break across machines
- No way to check if your servers actually work

## The Solution

One `.mcpx.json` per project. Version controlled. Synced everywhere.

```bash
npx mcpx init
```

---

## Quickstart

```bash
# Initialize in your project
npx mcpx init

# Add servers
npx mcpx add-json filesystem '{"command":"npx","args":["-y","@modelcontextprotocol/server-filesystem","${workspaceFolder}"]}'
npx mcpx add-json github '{"command":"npx","args":["-y","@modelcontextprotocol/server-github"],"env":{"GITHUB_TOKEN":"${env:GITHUB_TOKEN}"}}'

# See what you've got
npx mcpx list

# Sync to all your AI tools
npx mcpx sync

# Health check
npx mcpx doctor
```

---

## How It Works

```
.mcpx.json (in your project root)
    |
    |--- mcpx sync --->  Claude Desktop config
    |--- mcpx sync --->  Cursor .cursor/mcp.json
    |--- mcpx sync --->  Claude Code .mcp.json
```

1. Define MCP servers in `.mcpx.json` (like `.eslintrc`)
2. Use workspace variables for portability (`${workspaceFolder}`, `${env:API_KEY}`)
3. Commit to git -- your whole team gets the same MCP setup
4. Run `mcpx sync` to push configs to all your AI tools
5. Run `mcpx doctor` to verify everything works

---

## Config Format

```json
{
  "$schema": "https://raw.githubusercontent.com/aditya-ai-architect/mcpx/main/schema/mcpx.schema.json",
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"],
      "disabled": false
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  },
  "sync": {
    "clients": ["claude-desktop", "cursor", "claude-code"]
  }
}
```

### Workspace Variables

| Variable | Resolves To |
|----------|------------|
| `${workspaceFolder}` | Directory containing `.mcpx.json` |
| `${env:VAR_NAME}` | Environment variable value |
| `${home}` | User home directory |
| `${platform}` | `win32`, `darwin`, or `linux` |

Variables stay as templates in `.mcpx.json` and are resolved at sync time -- making configs portable across machines.

---

## Commands

| Command | Description |
|---------|-------------|
| `mcpx init` | Create `.mcpx.json` in current project |
| `mcpx add <name>` | Add server interactively |
| `mcpx add-json <name> <json>` | Add server from JSON string |
| `mcpx remove <name>` | Remove a server |
| `mcpx list` | List all configured servers |
| `mcpx status` | Quick status overview |
| `mcpx sync` | Sync to Claude Desktop / Cursor / Claude Code |
| `mcpx sync --dry` | Preview sync without writing files |
| `mcpx doctor` | Health check all servers + system deps |
| `mcpx import` | Import from existing client configs |
| `mcpx use <template>` | Apply preset template (web, python, fullstack, devops, data, minimal) |
| `mcpx env` | Audit environment variables referenced in config |
| `mcpx diff` | Show diff between `.mcpx.json` and client configs |
| `mcpx enable <name>` | Enable a disabled server |
| `mcpx disable <name>` | Disable a server without removing it |
| `mcpx export` | Export resolved config as JSON (pipe-friendly) |

---

## Templates

Get started fast with prebuilt server bundles:

```bash
npx mcpx use web        # filesystem + GitHub + Puppeteer
npx mcpx use python     # filesystem + GitHub + memory
npx mcpx use fullstack  # filesystem + GitHub + Postgres + Puppeteer + memory
npx mcpx use devops     # filesystem + GitHub + Docker
npx mcpx use data       # filesystem + Postgres + SQLite + memory
npx mcpx use minimal    # filesystem + memory
```

Templates merge into your existing config -- they never overwrite servers you already have.

---

## Comparison

| Feature | mcpx | MCPM.sh | mcptools | MetaMCP |
|---------|------|---------|----------|---------|
| **Project-first config** | `.mcpx.json` per project | Global profiles | Global aggregation | Docker proxy |
| **Multi-client sync** | Claude Desktop + Cursor + Claude Code | Partial | No | No |
| **Git-friendly** | Workspace variables | No | No | No |
| **Zero install** | `npx mcpx` | `pip install` | Go binary | Docker |
| **Health checks** | JSON-RPC ping | No | No | No |
| **Import existing** | From all clients | No | Scan only | No |
| **Language** | TypeScript | Python | Go | TypeScript |

---

## Sync Targets

| Client | Config Path |
|--------|-------------|
| **Claude Desktop** | `%APPDATA%\Claude\claude_desktop_config.json` (Win) |
| | `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) |
| **Cursor** | `.cursor/mcp.json` (project) |
| **Claude Code** | `.mcp.json` (project) |

mcpx **merges** your servers into existing configs -- it never deletes servers you added manually.

---

## Requirements

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

---

## License

MIT

---

<div align="center">

**Built by [Aditya Gaurav](https://github.com/aditya-ai-architect)**

</div>
