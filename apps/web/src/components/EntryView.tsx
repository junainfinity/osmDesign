import { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '../i18n';
import type {
  AppConfig,
  DesignSystemSummary,
  Project,
  ProjectTemplate,
  SkillSummary,
} from '../types';
import { BrandLogo } from './BrandLogo';
import { DesignsTab } from './DesignsTab';
import { Icon } from './Icon';
import { LanguageMenu } from './LanguageMenu';
import { CenteredLoader } from './Loading';
import { NewProjectPanel, type CreateInput } from './NewProjectPanel';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  skills: SkillSummary[];
  designSystems: DesignSystemSummary[];
  projects: Project[];
  templates: ProjectTemplate[];
  defaultDesignSystemId: string | null;
  config: AppConfig;
  loading?: boolean;
  onCreateProject: (input: CreateInput & { pendingPrompt?: string }) => void;
  onImportDesignZip: (file: File) => Promise<void> | void;
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onOpenSettings: () => void;
}

const SIDEBAR_MIN = 320;
const SIDEBAR_MAX = 560;
const SIDEBAR_DEFAULT = 380;
const SIDEBAR_STORAGE_KEY = 'osmdesign-entry-sidebar-width';
const LEGACY_SIDEBAR_STORAGE_KEY = 'od-entry-sidebar-width';

function loadSidebarWidth(): number {
  try {
    const raw =
      window.localStorage.getItem(SIDEBAR_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_SIDEBAR_STORAGE_KEY);
    if (!raw) return SIDEBAR_DEFAULT;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return SIDEBAR_DEFAULT;
    return Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, n));
  } catch {
    return SIDEBAR_DEFAULT;
  }
}

export function EntryView({
  skills,
  designSystems,
  projects,
  templates,
  defaultDesignSystemId,
  config,
  loading = false,
  onCreateProject,
  onImportDesignZip,
  onOpenProject,
  onDeleteProject,
  onOpenSettings,
}: Props) {
  const t = useT();
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => loadSidebarWidth());
  const [resizing, setResizing] = useState(false);

  const envMetaLine = useMemo(() => {
    try {
      return `${config.model} · ${new URL(config.baseUrl).host}`;
    } catch {
      return config.model;
    }
  }, [config.model, config.baseUrl]);
  const apiModeLabel = config.apiProvider === 'local' ? 'Local AI server' : 'osmAPI';

  function handleCreate(input: CreateInput) {
    onCreateProject(input);
  }

  const startWidthRef = useRef(0);
  const startXRef = useRef(0);

  useEffect(() => {
    if (!resizing) return;
    function onMove(e: MouseEvent) {
      const dx = e.clientX - startXRef.current;
      const next = Math.max(
        SIDEBAR_MIN,
        Math.min(SIDEBAR_MAX, startWidthRef.current + dx),
      );
      setSidebarWidth(next);
    }
    function onUp() {
      setResizing(false);
    }
    document.body.classList.add('entry-resizing');
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      document.body.classList.remove('entry-resizing');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidth));
      window.localStorage.removeItem(LEGACY_SIDEBAR_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [sidebarWidth]);

  return (
    <div
      className="entry"
      style={{ gridTemplateColumns: `${sidebarWidth}px 1fr` }}
    >
      <aside className="entry-side" style={{ width: sidebarWidth }}>
        <div className="entry-brand">
          <span className="entry-brand-mark" aria-hidden>
            <BrandLogo className="brand-mark-img" />
          </span>
          <div className="entry-brand-text">
            <div className="entry-brand-title-row">
              <span className="entry-brand-title">{t('app.brand')}</span>
              <span className="entry-brand-pill">{t('app.brandPill')}</span>
            </div>
            <div className="entry-brand-subtitle">{t('app.brandSubtitle')}</div>
          </div>
        </div>
        <NewProjectPanel
          skills={skills}
          designSystems={designSystems}
          defaultDesignSystemId={defaultDesignSystemId}
          templates={templates}
          onCreate={handleCreate}
          onImportDesignZip={onImportDesignZip}
          loading={loading}
        />
        <div className="entry-side-foot">
          <button
            type="button"
            className="foot-pill"
            onClick={onOpenSettings}
            title={t('settings.envConfigure')}
          >
            <Icon name="settings" size={12} />
            <span>
              {apiModeLabel}
            </span>
            <span style={{ color: 'var(--text-faint)' }}>·</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
              {envMetaLine}
            </span>
          </button>
          <LanguageMenu />
        </div>
        <button
          type="button"
          aria-label={t('entry.resizeAria')}
          className={`entry-side-resizer${resizing ? ' dragging' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            startWidthRef.current = sidebarWidth;
            startXRef.current = e.clientX;
            setResizing(true);
          }}
        />
      </aside>
      <main className="entry-main">
        <div className="entry-header">
          <div className="entry-tabs" role="tablist">
            <button
              role="tab"
              data-testid="entry-tab-designs"
              aria-selected="true"
              className="entry-tab active"
            >
              {t('entry.tabDesigns')}
            </button>
          </div>
          <div className="entry-header-right">
            <ThemeToggle />
          </div>
        </div>
        <div className="entry-tab-content">
          {loading ? (
            <CenteredLoader label={t('entry.loadingWorkspace')} />
          ) : (
            <DesignsTab
              projects={projects}
              skills={skills}
              designSystems={designSystems}
              onOpen={onOpenProject}
              onDelete={onDeleteProject}
            />
          )}
        </div>
      </main>
    </div>
  );
}
