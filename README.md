<div align="center">

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner.svg">
  <img alt="mcp-sync - Project-first MCP server manager" src="assets/banner.svg" width="680">
</picture>

<br>

**Like `.env` + Homebrew for MCP servers.**

[![npm](https://img.shields.io/npm/v/mcp-sync?color=58A6FF&style=flat-square)](https://www.npmjs.com/package/mcp-sync)
[![CI](https://img.shields.io/github/actions/workflow/status/schlegel/mcp-sync/ci.yml?style=flat-square&label=CI)](https://github.com/schlegel/mcp-sync/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-3FB950?style=flat-square)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-BC8CFF?style=flat-square)](https://modelcontextprotocol.io)
[![Node](https://img.shields.io/badge/Node-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

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

One `.mcp-sync.json` per project. Version controlled. Synced everywhere.

```bash
npx mcp-sync init
```

---

## Quickstart

```bash
# Initialize in your project
npx mcp-sync init

# Start with a template (web, python, fullstack, devops, data, minimal)
npx mcp-sync use fullstack

# Or add servers manually
npx mcp-sync add-json filesystem '{"command":"npx","args":["-y","@modelcontextprotocol/server-filesystem","${workspaceFolder}"]}'

# See what you've got
npx mcp-sync list

# Sync to all your AI tools
npx mcp-sync sync

# Health check
npx mcp-sync doctor
```

---

## CLI Preview

<div align="center">
<img src="assets/demo.svg" alt="mcp-sync CLI demo" width="680">
</div>

The CLI features an animated owl-eyes banner that plays on startup:

```
   ╭───────╮     ╭───────╮    ██  █   █ █      ██  ████
   │       │     │       │   █  █ █   █ █     █  █    █
   │   ◉   │     │   ◉   │   █  █ █ █ █ █     █  █   █
   │       │     │       │   █  █ ██ ██ █     █  █  █
   ╰───────╯     ╰───────╯    ██   █ █  ████   ██  █

   v0.1.0 · Project-first MCP server manager
```

The eyes animate in TTY terminals -- they look around, blink, and glow. Non-TTY environments (pipes, CI) get the static version.

---

## How It Works

```
.mcp-sync.json (in your project root)
    |
    |--- mcp-sync sync --->  Claude Desktop config
    |--- mcp-sync sync --->  Cursor .cursor/mcp.json
    |--- mcp-sync sync --->  Claude Code .mcp.json
```

1. Define MCP servers in `.mcp-sync.json` (like `.eslintrc`)
2. Use workspace variables for portability (`${workspaceFolder}`, `${env:API_KEY}`)
3. Commit to git -- your whole team gets the same MCP setup
4. Run `mcp-sync sync` to push configs to all your AI tools
5. Run `mcp-sync doctor` to verify everything works

---

## Config Format

```json
{
  "$schema": "https://raw.githubusercontent.com/schlegel/mcp-sync/main/schema/mcp-sync.schema.json",
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"]
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
| `${workspaceFolder}` | Directory containing `.mcp-sync.json` |
| `${env:VAR_NAME}` | Environment variable value |
| `${home}` | User home directory |
| `${platform}` | `win32`, `darwin`, or `linux` |

Variables stay as templates in `.mcp-sync.json` and are resolved at sync time -- making configs portable across machines.

---

## Commands

| Command | Description |
|---------|-------------|
| `mcp-sync init` | Create `.mcp-sync.json` in current project |
| `mcp-sync add <name>` | Add server interactively |
| `mcp-sync add-json <name> <json>` | Add server from JSON string |
| `mcp-sync remove <name>` | Remove a server |
| `mcp-sync list` | List all configured servers |
| `mcp-sync status` | Quick status overview |
| `mcp-sync sync` | Sync to Claude Desktop / Cursor / Claude Code |
| `mcp-sync sync --dry` | Preview sync without writing files |
| `mcp-sync doctor` | Health check all servers + system deps |
| `mcp-sync import` | Import from existing client configs |
| `mcp-sync use <template>` | Apply preset template |
| `mcp-sync env` | Audit environment variables referenced in config |
| `mcp-sync diff` | Show diff between `.mcp-sync.json` and client configs |
| `mcp-sync enable <name>` | Enable a disabled server |
| `mcp-sync disable <name>` | Disable a server without removing it |
| `mcp-sync export` | Export resolved config as JSON (pipe-friendly) |

---

## Templates

Get started fast with prebuilt server bundles:

```bash
npx mcp-sync use web        # filesystem + GitHub + Puppeteer
npx mcp-sync use python     # filesystem + GitHub + memory
npx mcp-sync use fullstack  # filesystem + GitHub + Postgres + Puppeteer + memory
npx mcp-sync use devops     # filesystem + GitHub + Docker
npx mcp-sync use data       # filesystem + Postgres + SQLite + memory
npx mcp-sync use minimal    # filesystem + memory
```

Templates merge into your existing config -- they never overwrite servers you already have.

---

## Comparison

| Feature | mcp-sync | MCPM.sh | mcptools | MetaMCP |
|---------|-------|---------|----------|---------|
| **Project-first config** | `.mcp-sync.json` per project | Global profiles | Global aggregation | Docker proxy |
| **Multi-client sync** | Claude Desktop + Cursor + Claude Code | Partial | No | No |
| **Git-friendly** | Workspace variables | No | No | No |
| **Zero install** | `npx mcp-sync` | `pip install` | Go binary | Docker |
| **Health checks** | JSON-RPC ping | No | No | No |
| **Import existing** | From all clients | No | Scan only | No |
| **Templates** | 6 presets | No | No | No |

---

## Sync Targets

| Client | Config Path |
|--------|-------------|
| **Claude Desktop** | `%APPDATA%\Claude\claude_desktop_config.json` (Win) / `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) |
| **Cursor** | `.cursor/mcp.json` (project) |
| **Claude Code** | `.mcp.json` (project) |

mcp-sync **merges** your servers into existing configs -- it never deletes servers you added manually.

---

## Requirements

- **Node.js** >= 20.0.0
- **npm** >= 8.0.0

---

## License

MIT

---

<div align="center">

**Built by [Aditya Gaurav](https://github.com/schlegel)**

</div>
