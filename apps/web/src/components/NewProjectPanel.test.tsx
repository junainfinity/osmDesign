import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { NewProjectPanel } from './NewProjectPanel';

describe('NewProjectPanel create tabs', () => {
  it('offers only prototype, slide deck, and from-template creation', () => {
    const html = renderToStaticMarkup(
      <NewProjectPanel
        skills={[]}
        designSystems={[]}
        defaultDesignSystemId={null}
        templates={[]}
        onCreate={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="new-project-tab-prototype"');
    expect(html).toContain('data-testid="new-project-tab-deck"');
    expect(html).toContain('data-testid="new-project-tab-template"');
    expect(html).not.toContain('data-testid="new-project-tab-image"');
    expect(html).not.toContain('data-testid="new-project-tab-video"');
    expect(html).not.toContain('data-testid="new-project-tab-audio"');
    expect(html).not.toContain('data-testid="new-project-tab-other"');
  });
});
