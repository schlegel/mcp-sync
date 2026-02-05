# Contributing to owl07

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/aditya-ai-architect/owl07.git
cd owl07
npm install
npm run build
npm run test
```

## Project Structure

```
src/
  bin/cli.ts          CLI entry point
  core/               Config, schema, variables, templates, constants
  commands/           All CLI command handlers
  sync/               Sync engine + client adapters
  health/             Server health checks + diagnostics
  ui/                 Banner, logger, theme, prompts, table
  utils/              File ops, JSON, errors, platform
tests/                Vitest test suite (mirrors src/ structure)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build with tsup (ESM, node20 target) |
| `npm run dev` | Build in watch mode |
| `npm run test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Type check with tsc |

## Guidelines

- **TypeScript** only, strict mode
- **ESM** modules (`import`/`export`, not `require`)
- Run `npm run lint && npm run test` before submitting
- Keep dependencies minimal
- Banner output goes to **stderr**, command output to **stdout**
- All config mutations should be **immutable** (spread, don't mutate)

## Adding a New Command

1. Create `src/commands/your-command.ts`
2. Export `registerYourCommand(program: Command)`
3. Add to `src/commands/index.ts`
4. Add to `src/commands/help.ts` in the right category
5. Add tests in `tests/commands/`

## Adding a Sync Adapter

1. Create `src/sync/adapters/your-client.ts` extending `BaseAdapter`
2. Implement `getConfigPath()`, `readExistingServers()`, `writeServers()`
3. Register in `src/sync/adapters/index.ts`
4. Add to `src/core/constants.ts` (`ClientId`, `ALL_CLIENTS`)

## Reporting Issues

Use [GitHub Issues](https://github.com/aditya-ai-architect/owl07/issues). Include:
- Node.js version (`node --version`)
- OS and version
- Steps to reproduce
- Expected vs actual behavior

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
