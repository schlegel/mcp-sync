export function parseJson<T>(content: string): T {
  const cleaned = content.replace(/,\s*([\]}])/g, '$1');
  return JSON.parse(cleaned) as T;
}

export function stringifyJson(data: unknown, indent = 2): string {
  return JSON.stringify(data, null, indent);
}

export function mergeDeep<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const output = { ...target };

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (
      sourceVal &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      (output as Record<string, unknown>)[key as string] = mergeDeep(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      );
    } else {
      (output as Record<string, unknown>)[key as string] = sourceVal;
    }
  }

  return output;
}
