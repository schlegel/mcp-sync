import { CONFIG_FILENAME } from './constants.js';

let currentConfigFilename: string = CONFIG_FILENAME;

export function setConfigFilename(filename: string): void {
  currentConfigFilename = filename;
}

export function getConfigFilename(): string {
  return currentConfigFilename;
}
