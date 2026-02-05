import { readFile, writeFile, rename, mkdir, access, copyFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const cleaned = content.replace(/,\s*([\]}])/g, '$1');
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureDir(dirname(filePath));
  const content = JSON.stringify(data, null, 2) + '\n';
  await atomicWrite(filePath, content);
}

export async function atomicWrite(filePath: string, content: string): Promise<void> {
  const tmpPath = filePath + '.tmp';
  await ensureDir(dirname(filePath));
  await writeFile(tmpPath, content, 'utf-8');
  await rename(tmpPath, filePath);
}

export async function createBackup(filePath: string, suffix = '.owl07-backup'): Promise<string | null> {
  if (!(await fileExists(filePath))) return null;
  const backupPath = filePath + suffix;
  await copyFile(filePath, backupPath);
  return backupPath;
}
