import type { Command } from 'commander';
import chalk from 'chalk';
import { VERSION } from '../core/constants.js';
import { getConfigFilename } from '../core/context.js';

const glow = chalk.hex('#58A6FF');
const violet = chalk.hex('#BC8CFF');
const ghost = chalk.hex('#484f58');
const green = chalk.hex('#3FB950');
const orange = chalk.hex('#FFA657');
const dim = chalk.hex('#6e7681');
const white = chalk.hex('#e6edf3');

function cmd(name: string, desc: string, alias?: string): string {
  const aliasStr = alias ? ghost(` (${alias})`) : '';
  return `  ${glow.bold(name.padEnd(28))}${aliasStr}${alias ? ' ' : ''}${dim(desc)}`;
}

function section(title: string): string {
  return `\n  ${orange.bold(title)}`;
}

function buildHelp(): string {
  const configFilename = getConfigFilename();
  const lines = [
    '',
    `  ${glow.bold('OWL')}${violet.bold('07')} ${ghost(`v${VERSION}`)}  ${ghost('─')}  ${dim('Project-first MCP server manager')}`,
    '',
    `  ${dim('Usage:')}  ${white('mcp-sync')} ${green('<command>')} ${dim('[options]')}`,
    '',
    section('Setup'),
    cmd('init', `Create ${configFilename} in current project`),
    cmd('use <template>', 'Apply preset (web, python, fullstack, devops, data, minimal)'),
    cmd('import', 'Import servers from existing Claude/Cursor configs'),
    '',
    section('Servers'),
    cmd('add <name>', 'Add a server interactively'),
    cmd('add-json <name> <json>', 'Add a server from JSON string'),
    cmd('remove <name>', 'Remove a server'),
    cmd('enable <name>', 'Enable a disabled server'),
    cmd('disable <name>', 'Disable without removing'),
    '',
    section('View'),
    cmd('list', 'List all configured servers', 'ls'),
    cmd('status', 'Quick status overview'),
    cmd('env', 'Audit environment variables in config'),
    cmd('diff', 'Show diff between config and clients'),
    cmd('export', 'Export resolved config as JSON'),
    `  ${dim('  All view commands support')} ${green('--json')} ${dim('for machine-readable output')}`,
    '',
    section('Sync & Health'),
    cmd('sync', 'Push config to Claude Desktop / Cursor / Claude Code'),
    cmd('sync --dry', 'Preview sync without writing files'),
    cmd('doctor', 'Health check servers + system dependencies'),
    cmd('validate', 'Validate config schema and references'),
    cmd('watch', `Watch ${configFilename} and auto-sync on changes`),
    '',
    section('Examples'),
    `  ${dim('$')} ${white('mcp-sync init')}`,
    `  ${dim('$')} ${white('mcp-sync use fullstack')}`,
    `  ${dim('$')} ${white('mcp-sync add-json github \'{"command":"npx","args":["-y","@modelcontextprotocol/server-github"]}\'')}`,
    `  ${dim('$')} ${white('mcp-sync sync')}`,
    `  ${dim('$')} ${white('mcp-sync doctor')}`,
    '',
    `  ${dim('Docs:')}  ${glow('https://github.com/schlegel/mcp-sync')}`,
    `  ${dim('npm:')}   ${glow('https://www.npmjs.com/package/mcp-sync')}`,
    '',
  ];

  return lines.join('\n');
}

function printHelp(): void {
  console.log(buildHelp());
}

export function registerHelp(program: Command): void {
  // Override default help output with our styled version
  program.configureHelp({
    formatHelp: () => '',
  });
  program.addHelpCommand(false);

  program
    .command('help')
    .description('Show this help screen')
    .action(() => {
      printHelp();
    });

  // ? alias
  program
    .command('?', { hidden: true })
    .action(() => {
      printHelp();
    });

  // Override -h / --help to show our styled help
  // Use process.stdout.write with callback to flush before exit (piped stdout)
  program.on('option:help', () => {
    process.stdout.write(buildHelp() + '\n', () => process.exit(0));
  });

  // Show help when no command given
  program.action(() => {
    printHelp();
  });
}
