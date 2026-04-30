import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_CONFIG } from '../state/config';
import { EntryView } from './EntryView';

describe('EntryView main header', () => {
  it('shows only the Designs tab and no top-right logo button', () => {
    const html = renderToStaticMarkup(
      <EntryView
        skills={[]}
        designSystems={[]}
        projects={[]}
        templates={[]}
        defaultDesignSystemId={null}
        config={DEFAULT_CONFIG}
        onCreateProject={vi.fn()}
        onImportDesignZip={vi.fn()}
        onOpenProject={vi.fn()}
        onDeleteProject={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="entry-tab-designs"');
    expect(html).not.toContain('data-testid="entry-tab-examples"');
    expect(html).not.toContain('data-testid="entry-tab-design-systems"');
    expect(html).not.toContain('data-testid="entry-tab-image-templates"');
    expect(html).not.toContain('data-testid="entry-tab-video-templates"');
    expect(html).not.toContain('avatar-btn');
  });
});
