import { describe, it, expect } from 'vitest';
import { getTemplate, listTemplates, TEMPLATES } from '../../src/core/templates.js';
import { ServerConfigSchema } from '../../src/core/schema.js';

describe('TEMPLATES', () => {
  it('has 6 templates', () => {
    expect(TEMPLATES).toHaveLength(6);
  });

  it('includes all expected template names', () => {
    const names = TEMPLATES.map((t) => t.name);
    expect(names).toContain('web');
    expect(names).toContain('python');
    expect(names).toContain('fullstack');
    expect(names).toContain('devops');
    expect(names).toContain('data');
    expect(names).toContain('minimal');
  });

  it('each template has valid server configs', () => {
    for (const template of TEMPLATES) {
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(Object.keys(template.servers).length).toBeGreaterThan(0);

      for (const [name, server] of Object.entries(template.servers)) {
        const result = ServerConfigSchema.safeParse(server);
        expect(result.success, `Template "${template.name}" server "${name}" is invalid`).toBe(true);
      }
    }
  });

  it('all templates include filesystem server', () => {
    for (const template of TEMPLATES) {
      expect(template.servers.filesystem, `Template "${template.name}" missing filesystem`).toBeDefined();
    }
  });

  it('templates use variable syntax for portability', () => {
    const web = getTemplate('web')!;
    const fsArgs = web.servers.filesystem.args?.join(' ') ?? '';
    expect(fsArgs).toContain('${workspaceFolder}');
  });
});

describe('getTemplate', () => {
  it('returns template by name', () => {
    const web = getTemplate('web');
    expect(web).toBeDefined();
    expect(web!.name).toBe('web');
  });

  it('returns undefined for unknown name', () => {
    expect(getTemplate('nonexistent')).toBeUndefined();
  });
});

describe('listTemplates', () => {
  it('returns all templates', () => {
    const list = listTemplates();
    expect(list).toHaveLength(6);
    expect(list).toEqual(TEMPLATES);
  });
});
