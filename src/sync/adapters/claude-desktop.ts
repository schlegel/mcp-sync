import { BaseAdapter } from './base.js';
import { getClientConfigPath, type ClientId } from '../../core/constants.js';

export class ClaudeDesktopAdapter extends BaseAdapter {
  readonly clientId: ClientId = 'claude-desktop';
  readonly displayName = 'Claude Desktop';

  getConfigPath(): string {
    return getClientConfigPath('claude-desktop');
  }
}
