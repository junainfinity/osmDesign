import { useEffect, useRef, useState } from 'react';
import { LOCALE_LABEL, LOCALES, useI18n } from '../i18n';
import type { Locale } from '../i18n';
import {
  LOCAL_AI_SERVER_PRESETS,
  OSM_API_BASE_URL,
  withApiProvider,
} from '../state/config';
import type { ApiProviderKind, AppConfig } from '../types';
import { Icon } from './Icon';

interface Props {
  initial: AppConfig;
  welcome?: boolean;
  onSave: (cfg: AppConfig) => void;
  onClose: () => void;
}

const SUGGESTED_MODELS = [
  'gpt-5.2',
  'gpt-5.2-mini',
  'gpt-oss-120b',
  'llama-3.3-70b',
  'qwen3-coder',
];

export function SettingsDialog({
  initial,
  welcome,
  onSave,
  onClose,
}: Props) {
  const { t, locale, setLocale } = useI18n();
  const [cfg, setCfg] = useState<AppConfig>({ ...initial, mode: 'api' });
  const [showApiKey, setShowApiKey] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'execution' | 'language'>('execution');
  const [languageMenuRect, setLanguageMenuRect] = useState<DOMRect | null>(null);
  const languageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!languageOpen) return;
    const updateRect = () => {
      const button = languageRef.current?.querySelector('button');
      setLanguageMenuRect(button?.getBoundingClientRect() ?? null);
    };
    updateRect();
    function onDown(e: MouseEvent) {
      if (languageRef.current?.contains(e.target as Node)) return;
      setLanguageOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLanguageOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [languageOpen]);

  const setApiProvider = (apiProvider: ApiProviderKind) =>
    setCfg((current) => withApiProvider(current, apiProvider));
  const apiProvider = cfg.apiProvider ?? 'osm';
  const apiKeyRequired = apiProvider === 'osm';
  const canSave = Boolean(
    (!apiKeyRequired || cfg.apiKey.trim()) &&
      cfg.model.trim() &&
      cfg.baseUrl.trim(),
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-settings"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          {welcome ? (
            <>
              <span className="kicker">{t('settings.welcomeKicker')}</span>
              <h2>{t('settings.welcomeTitle')}</h2>
              <p className="subtitle">{t('settings.welcomeSubtitle')}</p>
            </>
          ) : (
            <>
              <span className="kicker">{t('settings.kicker')}</span>
              <h2>{t('settings.title')}</h2>
              <p className="subtitle">{t('settings.subtitle')}</p>
            </>
          )}
        </header>

        <div className="modal-body">
          <aside className="settings-sidebar" aria-label="Settings sections">
            <button
              type="button"
              className={`settings-nav-item${activeSection === 'execution' ? ' active' : ''}`}
              onClick={() => setActiveSection('execution')}
            >
              <Icon name="sliders" size={18} />
              <span>
                <strong>AI endpoint</strong>
                <small>osmAPI / local</small>
              </span>
            </button>
            <button
              type="button"
              className={`settings-nav-item${activeSection === 'language' ? ' active' : ''}`}
              onClick={() => setActiveSection('language')}
            >
              <Icon name="languages" size={18} />
              <span>
                <strong>{t('settings.language')}</strong>
                <small>{t('settings.languageHint')}</small>
              </span>
            </button>
          </aside>

          <div className="settings-content">
            {activeSection === 'execution' ? (
              <section className="settings-section">
                <div className="section-head">
                  <div>
                    <h3>{apiProvider === 'osm' ? 'osmAPI' : 'Local AI server'}</h3>
                    <p className="hint">
                      {apiProvider === 'osm'
                        ? 'Use your osmAPI.com API key and any model your account has credits for.'
                        : 'Use an OpenAI-compatible endpoint from Ollama, LM Studio, or another local server.'}
                    </p>
                  </div>
                </div>

                <div
                  className="seg-control api-provider-control"
                  role="tablist"
                  aria-label="AI API provider"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={apiProvider === 'osm'}
                    className={'seg-btn' + (apiProvider === 'osm' ? ' active' : '')}
                    onClick={() => setApiProvider('osm')}
                  >
                    <span className="seg-title">osmAPI</span>
                    <span className="seg-meta">Hosted credits</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={apiProvider === 'local'}
                    className={'seg-btn' + (apiProvider === 'local' ? ' active' : '')}
                    onClick={() => setApiProvider('local')}
                  >
                    <span className="seg-title">Local AI server</span>
                    <span className="seg-meta">OpenAI-compatible</span>
                  </button>
                </div>

                <label className="field">
                  <span className="field-label">
                    {apiKeyRequired ? t('settings.apiKey') : `${t('settings.apiKey')} (optional)`}
                  </span>
                  <div className="field-row">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder={apiKeyRequired ? 'osmAPI key' : 'Optional for local servers'}
                      value={cfg.apiKey}
                      onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="ghost icon-btn"
                      onClick={() => setShowApiKey((value) => !value)}
                      title={
                        showApiKey ? t('settings.hideKey') : t('settings.showKey')
                      }
                    >
                      {showApiKey ? t('settings.hide') : t('settings.show')}
                    </button>
                  </div>
                </label>

                <label className="field">
                  <span className="field-label">{t('settings.model')}</span>
                  <input
                    type="text"
                    value={cfg.model}
                    list="suggested-models"
                    placeholder="Model id"
                    onChange={(e) => setCfg({ ...cfg, model: e.target.value })}
                  />
                  <datalist id="suggested-models">
                    {SUGGESTED_MODELS.map((model) => (
                      <option value={model} key={model} />
                    ))}
                  </datalist>
                </label>

                <label className="field">
                  <span className="field-label">{t('settings.baseUrl')}</span>
                  <input
                    type="text"
                    value={apiProvider === 'osm' ? OSM_API_BASE_URL : cfg.baseUrl}
                    readOnly={apiProvider === 'osm'}
                    onChange={(e) => setCfg({ ...cfg, baseUrl: e.target.value })}
                  />
                </label>

                {apiProvider === 'local' ? (
                  <label className="field">
                    <span className="field-label">Local server preset</span>
                    <select
                      value=""
                      onChange={(e) => {
                        const preset = LOCAL_AI_SERVER_PRESETS.find(
                          (entry) => entry.baseUrl === e.target.value,
                        );
                        if (preset) {
                          setCfg((current) => ({ ...current, baseUrl: preset.baseUrl }));
                        }
                      }}
                    >
                      <option value="">Keep current endpoint</option>
                      {LOCAL_AI_SERVER_PRESETS.map((preset) => (
                        <option key={preset.baseUrl} value={preset.baseUrl}>
                          {preset.label} - {preset.baseUrl}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <p className="hint">
                  {apiProvider === 'osm'
                    ? 'The endpoint is fixed to osmAPI.com. The key and model are stored locally on this device.'
                    : 'Local server requests stay on your machine or private network. Remote third-party API providers are blocked.'}
                </p>
              </section>
            ) : null}

            {activeSection === 'language' ? (
              <section className="settings-section">
                <div className="section-head">
                  <div>
                    <h3>{t('settings.language')}</h3>
                    <p className="hint">{t('settings.languageHint')}</p>
                  </div>
                </div>
                <div className="settings-language-picker" ref={languageRef}>
                  <button
                    type="button"
                    className="settings-language-button"
                    aria-haspopup="menu"
                    aria-expanded={languageOpen}
                    onClick={() => setLanguageOpen((value) => !value)}
                  >
                    <span className="settings-language-icon" aria-hidden="true">
                      <Icon name="languages" size={22} strokeWidth={1.8} />
                    </span>
                    <span className="settings-language-text">
                      <span className="settings-language-title">
                        {LOCALE_LABEL[locale]}
                      </span>
                      <span className="settings-language-code">{locale}</span>
                    </span>
                    <Icon name="chevron-down" size={16} />
                  </button>
                  {languageOpen && languageMenuRect ? (
                    <div
                      className="settings-language-menu"
                      role="menu"
                      style={{
                        bottom: window.innerHeight - languageMenuRect.top + 6,
                        left: languageMenuRect.left,
                        width: languageMenuRect.width,
                      }}
                    >
                      {LOCALES.map((code) => {
                        const active = locale === code;
                        return (
                          <button
                            key={code}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            className={`settings-language-option${active ? ' active' : ''}`}
                            onClick={() => {
                              setLocale(code as Locale);
                              setLanguageOpen(false);
                            }}
                          >
                            <span>
                              <span className="settings-language-option-title">
                                {LOCALE_LABEL[code]}
                              </span>
                              <span className="settings-language-option-code">
                                {code}
                              </span>
                            </span>
                            {active ? <Icon name="check" size={16} /> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <footer className="modal-foot">
          <button type="button" className="ghost" onClick={onClose}>
            {welcome ? t('settings.skipForNow') : t('common.cancel')}
          </button>
          <button
            type="button"
            className="primary"
            disabled={!canSave}
            onClick={() => onSave({ ...cfg, mode: 'api', mediaProviders: {} })}
          >
            {welcome ? t('settings.getStarted') : t('common.save')}
          </button>
        </footer>
      </div>
    </div>
  );
}
