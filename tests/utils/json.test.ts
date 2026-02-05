import { describe, it, expect } from 'vitest';
import { parseJson, stringifyJson, mergeDeep } from '../../src/utils/json.js';

describe('parseJson', () => {
  it('parses valid JSON', () => {
    expect(parseJson('{"key": "value"}')).toEqual({ key: 'value' });
  });

  it('handles trailing commas in objects', () => {
    expect(parseJson('{"key": "value",}')).toEqual({ key: 'value' });
  });

  it('handles trailing commas in arrays', () => {
    expect(parseJson('["a", "b",]')).toEqual(['a', 'b']);
  });

  it('handles nested trailing commas', () => {
    const json = '{\n  "servers": {\n    "test": { "command": "echo", },\n  },\n}';
    const result = parseJson<any>(json);
    expect(result.servers.test.command).toBe('echo');
  });

  it('throws on invalid JSON', () => {
    expect(() => parseJson('not json')).toThrow();
    expect(() => parseJson('')).toThrow();
  });
});

describe('stringifyJson', () => {
  it('formats with default indent of 2', () => {
    const result = stringifyJson({ key: 'value' });
    expect(result).toBe('{\n  "key": "value"\n}');
  });

  it('formats with custom indent', () => {
    const result = stringifyJson({ key: 'value' }, 4);
    expect(result).toBe('{\n    "key": "value"\n}');
  });
});

describe('mergeDeep', () => {
  it('merges flat objects', () => {
    const result = mergeDeep({ a: 1, b: 2 }, { b: 3, c: 4 });
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('deep merges nested objects', () => {
    const result = mergeDeep(
      { nested: { a: 1, b: 2 } },
      { nested: { b: 3, c: 4 } },
    );
    expect(result).toEqual({ nested: { a: 1, b: 3, c: 4 } });
  });

  it('arrays overwrite (not merge)', () => {
    const result = mergeDeep({ arr: [1, 2] }, { arr: [3, 4, 5] } as any);
    expect(result.arr).toEqual([3, 4, 5]);
  });

  it('does not mutate source objects', () => {
    const target = { a: 1, nested: { b: 2 } };
    const source = { nested: { c: 3 } };
    mergeDeep(target, source as any);
    expect(target.nested).toEqual({ b: 2 }); // unchanged
  });

  it('handles empty source', () => {
    expect(mergeDeep({ a: 1 }, {})).toEqual({ a: 1 });
  });
});
