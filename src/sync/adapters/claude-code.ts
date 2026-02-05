import { BaseAdapter } from './base.js';
import { getClientConfigPath, type ClientId } from '../../core/constants.js';

export class ClaudeCodeAdapter extends BaseAdapter {
  readonly clientId: ClientId = 'claude-code';
  readonly displayName = 'Claude Code';

  getConfigPath(): string {
    return getClientConfigPath('claude-code', 'project');
  }
}
