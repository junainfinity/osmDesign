import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_CONFIG } from '../state/config';
import { SettingsDialog } from './SettingsDialog';

describe('SettingsDialog acknowledgements', () => {
  it('links quietly to the Open Design repository with thanks', () => {
    const html = renderToStaticMarkup(
      <SettingsDialog
        initial={{ ...DEFAULT_CONFIG, apiKey: 'osm_demo', model: 'gpt-5.2' }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(html).toContain('With thanks to');
    expect(html).toContain('Open Design');
    expect(html).toContain('href="https://github.com/nexu-io/open-design"');
  });
});
