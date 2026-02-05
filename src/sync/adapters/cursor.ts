import { BaseAdapter } from './base.js';
import { getClientConfigPath, type ClientId } from '../../core/constants.js';

export class CursorAdapter extends BaseAdapter {
  readonly clientId: ClientId = 'cursor';
  readonly displayName = 'Cursor';

  constructor(private scope: 'global' | 'project' = 'project') {
    super();
  }

  getConfigPath(): string {
    return getClientConfigPath('cursor', this.scope);
  }
}
