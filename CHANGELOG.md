# Changelog

All notable changes to mcp-sync will be documented in this file.

## [0.2.0] - 2026-02-17

### Changed
- Version bump to 0.2.0

## [0.1.0] - 2026-02-05

### Added
- Initial release
- 17 CLI commands: init, add, add-json, remove, list, status, sync, doctor, import, use, env, diff, enable, disable, export, validate, watch
- 3 sync adapters: Claude Desktop, Cursor, Claude Code
- 6 built-in templates: web, python, fullstack, devops, data, minimal
- Workspace variables: `${workspaceFolder}`, `${env:VAR}`, `${home}`, `${platform}`
- JSON-RPC health checks for MCP servers
- Animated owl-eyes CLI banner
- Config schema validation with Zod v4
- Atomic file writes with backup support
- Import from existing Claude Desktop / Cursor / Claude Code configs
- Beautiful custom help screen (`mcp-sync help` or `mcp-sync ?`)
- `mcp-sync watch` for auto-sync on config changes
- `mcp-sync validate` for config validation
- 147 tests across 14 test files
- CI pipeline (Node 20 + 22)

### Fixed
- `prompts.ts`: Object length check on env variables
- `table.ts`: Removed unused variable
- `spawn.ts`: Removed redundant condition in health check
- `toggle.ts`: Immutable config update pattern
- `banner.ts`: Banner output moved to stderr for pipe-friendly commands
