import React from 'react';

export const BRANDING_STORAGE_KEY = 'field-log:v1:branding';
export const BRANDING_EVENT = 'field-log:branding-updated';

export type SiteBranding = {
  siteName: string;
  tagline: string;
  logoDataUrl: string;
  footerText: string;
};

export const DEFAULT_SITE_BRANDING: SiteBranding = {
  siteName: 'Field Log',
  tagline: 'Written Exam Tracker',
  logoDataUrl: '',
  footerText: '© 2026 Field Log • Government Exam Tracker',
};

export const loadSiteBranding = (): SiteBranding => {
  if (typeof window === 'undefined') {
    return DEFAULT_SITE_BRANDING;
  }

  try {
    const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_BRANDING;

    const parsed = JSON.parse(raw) as Partial<SiteBranding>;

    return {
      ...DEFAULT_SITE_BRANDING,
      siteName:
        typeof parsed.siteName === 'string' && parsed.siteName.trim()
          ? parsed.siteName.trim().slice(0, 80)
          : DEFAULT_SITE_BRANDING.siteName,
      tagline:
        typeof parsed.tagline === 'string' && parsed.tagline.trim()
          ? parsed.tagline.trim().slice(0, 120)
          : DEFAULT_SITE_BRANDING.tagline,
      logoDataUrl:
        typeof parsed.logoDataUrl === 'string'
          ? parsed.logoDataUrl
          : DEFAULT_SITE_BRANDING.logoDataUrl,
      footerText:
        typeof parsed.footerText === 'string' && parsed.footerText.trim()
          ? parsed.footerText.trim().slice(0, 160)
          : DEFAULT_SITE_BRANDING.footerText,
    };
  } catch {
    return DEFAULT_SITE_BRANDING;
  }
};

export const saveSiteBranding = (branding: SiteBranding) => {
  if (typeof window === 'undefined') return;

  const next: SiteBranding = {
    siteName: branding.siteName.trim().slice(0, 80) || DEFAULT_SITE_BRANDING.siteName,
    tagline: branding.tagline.trim().slice(0, 120) || DEFAULT_SITE_BRANDING.tagline,
    logoDataUrl: branding.logoDataUrl,
    footerText: branding.footerText.trim().slice(0, 160) || DEFAULT_SITE_BRANDING.footerText,
  };

  window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent(BRANDING_EVENT, {
      detail: next,
    }),
  );
};

export const resetSiteBranding = () => {
  saveSiteBranding(DEFAULT_SITE_BRANDING);
};

export const applySiteBranding = (branding: SiteBranding) => {
  if (typeof document === 'undefined') return;

  document.title = branding.siteName + ' • ' + branding.tagline;

  let favicon = document.querySelector<HTMLLinkElement>(
    'link[rel="icon"]',
  );

  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  if (branding.logoDataUrl) {
    favicon.href = branding.logoDataUrl;
  } else {
    favicon.removeAttribute('href');
  }

  document.documentElement.setAttribute(
    'data-site-name',
    branding.siteName,
  );
};
