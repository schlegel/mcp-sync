import chalk from 'chalk';
import { VERSION } from '../core/constants.js';

let shown = false;

// ──── Colors ────
const glow = chalk.hex('#58A6FF');
const ember = chalk.hex('#FFA657');
const frost = chalk.hex('#E6EDF3');
const ghost = chalk.hex('#484f58');
const violet = chalk.hex('#BC8CFF');

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearLines(n: number): void {
  for (let i = 0; i < n; i++) {
    process.stderr.write('\x1B[1A\x1B[2K');
  }
}

// ──── Block-letter OWL07 logo (5 lines tall) ────

const OWL_ROWS = [
  ' ██  █   █ █   ',
  '█  █ █   █ █   ',
  '█  █ █ █ █ █   ',
  '█  █ ██ ██ █   ',
  ' ██   █ █  ████',
];

const NUM_ROWS = [
  ' ██  ████',
  '█  █    █',
  '█  █   █ ',
  '█  █  █  ',
  ' ██  █   ',
];

function logoLines(): string[] {
  return OWL_ROWS.map((owl, i) =>
    `${glow.bold(owl)}  ${violet.bold(NUM_ROWS[i])}`,
  );
}

// ──── Big eye rendering ────

type PupilPos = 'left' | 'center' | 'right';

function pupilRow(pupil: string, pos: PupilPos): string {
  switch (pos) {
    case 'left':
      return `${ghost('│')}  ${pupil}    ${ghost('│')}`;
    case 'center':
      return `${ghost('│')}   ${pupil}   ${ghost('│')}`;
    case 'right':
      return `${ghost('│')}    ${pupil}  ${ghost('│')}`;
  }
}

// Eye frame = 26 visible chars: 3 indent + 9 box + 5 gap + 9 box
const EYE_WIDTH = 26;
const PAD = ' '.repeat(EYE_WIDTH);

function makeEyeLines(
  leftPupil: string,
  rightPupil: string,
  pos: PupilPos = 'center',
  gap = 5,
): string[] {
  const sp = ' '.repeat(gap);
  const empty = `${ghost('│')}       ${ghost('│')}`;
  return [
    `   ${ghost('╭───────╮')}${sp}${ghost('╭───────╮')}`,
    `   ${empty}${sp}${empty}`,
    `   ${pupilRow(leftPupil, pos)}${sp}${pupilRow(rightPupil, pos)}`,
    `   ${empty}${sp}${empty}`,
    `   ${ghost('╰───────╯')}${sp}${ghost('╰───────╯')}`,
  ];
}

function blinkLines(): string[] {
  return [
    PAD,
    PAD,
    `   ${ghost('╶━━━━━━━╴')}     ${ghost('╶━━━━━━━╴')}`,
    PAD,
    PAD,
  ];
}

function dotLines(): string[] {
  return [
    PAD,
    PAD,
    `       ${glow('•')}             ${glow('•')}    `,
    PAD,
    PAD,
  ];
}

// ──── Combine eyes + logo ────

function buildFrame(eyes: string[], logo: string[]): string[] {
  return eyes.map((line, i) => `${line}   ${logo[i]}`);
}

// ──── Pupils ────
const PUPIL = {
  open: glow('◉'),
  big: ember.bold('◎'),
  empty: ghost('○'),
  glow: frost.bold('◉'),
};

const FRAME_LINES = 5;

function writeFrame(lines: string[]): void {
  for (const line of lines) {
    process.stderr.write(line + '\n');
  }
}

// ──── Animated banner ────

export async function displayBannerAnimated(): Promise<void> {
  if (shown) return;
  shown = true;

  if (!process.stderr.isTTY) {
    displayBannerStatic();
    return;
  }

  const logo = logoLines();

  process.stderr.write('\n');

  // Phase 1: Dots appear
  writeFrame(buildFrame(dotLines(), logo));
  await sleep(200);

  // Phase 2: Empty eyes form
  clearLines(FRAME_LINES);
  writeFrame(buildFrame(makeEyeLines(PUPIL.empty, PUPIL.empty), logo));
  await sleep(150);

  // Phase 3: Eyes open
  clearLines(FRAME_LINES);
  writeFrame(buildFrame(makeEyeLines(PUPIL.open, PUPIL.open), logo));
  await sleep(300);

  // Phase 4: Look left
  clearLines(FRAME_LINES);
  writeFrame(buildFrame(makeEyeLines(PUPIL.open, PUPIL.open, 'left'), logo));
  await sleep(200);

  // Phase 5: Look right
  clearLines(FRAME_LINES);
  writeFrame(buildFrame(makeEyeLines(PUPIL.open, PUPIL.open, 'right'), logo));
  await sleep(200);

  // Phase 6: Back to center
  clearLines(FRAME_LINES);
  writeFrame(buildFrame(makeEyeLines(PUPIL.open, PUPIL.open), logo));
  await sleep(150);

  // Phase 7: Big eyes (surprised)
  clearLines(FRAME_LINES);
  writeFrame(buildFrame(makeEyeLines(PUPIL.big, PUPIL.big), logo));
  await sleep(250);

  // Phase 8: Blink
  clearLines(FRAME_LINES);
  writeFrame(buildFrame(blinkLines(), logo));
  await sleep(80);

  // Phase 9: Open with glow
  clearLines(FRAME_LINES);
  writeFrame(buildFrame(makeEyeLines(PUPIL.glow, PUPIL.glow), logo));
  await sleep(200);

  // Phase 10: Settle
  clearLines(FRAME_LINES);
  writeFrame(buildFrame(makeEyeLines(PUPIL.open, PUPIL.open), logo));

  process.stderr.write('\n');
  process.stderr.write(`   ${ghost(`v${VERSION} · Project-first MCP server manager`)}\n`);
  process.stderr.write('\n');
}

// ──── Static fallback ────

function displayBannerStatic(): void {
  const logo = logoLines();
  process.stderr.write('\n');
  writeFrame(buildFrame(makeEyeLines(PUPIL.open, PUPIL.open), logo));
  process.stderr.write('\n');
  process.stderr.write(`   ${ghost(`v${VERSION} · Project-first MCP server manager`)}\n`);
  process.stderr.write('\n');
}

export function displayBanner(): void {
  if (shown) return;
  shown = true;
  displayBannerStatic();
}
