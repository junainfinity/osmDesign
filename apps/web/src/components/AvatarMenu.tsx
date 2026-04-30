import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { BrandLogo } from './BrandLogo';
import { Icon } from './Icon';
import type { AppConfig } from '../types';

interface Props {
  config: AppConfig;
  onOpenSettings: () => void;
  onBack?: () => void;
}

/**
 * Compact avatar at the right of the project topbar. Click opens a dropdown
 * with the current AI endpoint and a Settings entry.
 */
export function AvatarMenu({
  config,
  onOpenSettings,
  onBack,
}: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const apiModeLabel = config.apiProvider === 'local' ? 'Local AI server' : 'osmAPI';

  return (
    <div className="avatar-menu" ref={wrapRef}>
      <button
        type="button"
        className="avatar-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t('avatar.title')}
      >
        <BrandLogo className="avatar-btn-photo" />
      </button>
      {open ? (
        <div className="avatar-popover" role="menu">
          <div className="avatar-popover-head">
            <span className="who">{apiModeLabel}</span>
            <span className="where">{safeHost(config.baseUrl)}</span>
          </div>

	          <div style={{ height: 1, background: 'var(--border-soft)', margin: '4px 6px' }} />

          <button
            type="button"
            className="avatar-item"
            onClick={() => {
              setOpen(false);
              onOpenSettings();
            }}
          >
            <span className="avatar-item-icon" aria-hidden>
              <Icon name="settings" size={14} />
            </span>
            <span>{t('avatar.settings')}</span>
          </button>
          {onBack ? (
            <button
              type="button"
              className="avatar-item"
              onClick={() => {
                setOpen(false);
                onBack();
              }}
            >
              <span className="avatar-item-icon" aria-hidden>
                <Icon name="arrow-left" size={14} />
              </span>
              <span>{t('avatar.backToProjects')}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
