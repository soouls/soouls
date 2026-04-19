export type AtmosphereKey = 'clear_horizon' | 'living_archive' | 'signal_tower' | 'depth_chamber';

type ThemePalette = {
  accent: string;
  accentStrong: string;
  accentSoft: string;
  glow: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  text: string;
  textMuted: string;
  sidebar: string;
};

export const DEFAULT_ATMOSPHERE: AtmosphereKey = 'signal_tower';

export const ATMOSPHERE_THEMES: Record<AtmosphereKey, ThemePalette> = {
  clear_horizon: {
    accent: '#f4c95d',
    accentStrong: '#ffd978',
    accentSoft: 'rgba(244, 201, 93, 0.18)',
    glow: 'rgba(244, 201, 93, 0.35)',
    background: '#090a10',
    backgroundSecondary: '#171420',
    surface: 'rgba(18, 19, 28, 0.82)',
    surfaceStrong: '#12131b',
    border: 'rgba(244, 201, 93, 0.16)',
    text: '#f8f2df',
    textMuted: '#b9b1a1',
    sidebar: '#0d0d12',
  },
  living_archive: {
    accent: '#78c18b',
    accentStrong: '#91d9a4',
    accentSoft: 'rgba(120, 193, 139, 0.18)',
    glow: 'rgba(120, 193, 139, 0.34)',
    background: '#08100d',
    backgroundSecondary: '#122019',
    surface: 'rgba(13, 24, 18, 0.82)',
    surfaceStrong: '#0f1714',
    border: 'rgba(120, 193, 139, 0.18)',
    text: '#edf6ee',
    textMuted: '#aab8ad',
    sidebar: '#09110e',
  },
  signal_tower: {
    accent: '#f4956c',
    accentStrong: '#ffb088',
    accentSoft: 'rgba(244, 149, 108, 0.2)',
    glow: 'rgba(244, 149, 108, 0.34)',
    background: '#090910',
    backgroundSecondary: '#171322',
    surface: 'rgba(20, 16, 27, 0.82)',
    surfaceStrong: '#121018',
    border: 'rgba(244, 149, 108, 0.16)',
    text: '#f8efe8',
    textMuted: '#b7a59a',
    sidebar: '#0b0a10',
  },
  depth_chamber: {
    accent: '#8d7be7',
    accentStrong: '#ab9aff',
    accentSoft: 'rgba(141, 123, 231, 0.2)',
    glow: 'rgba(141, 123, 231, 0.34)',
    background: '#07070f',
    backgroundSecondary: '#141327',
    surface: 'rgba(14, 14, 26, 0.84)',
    surfaceStrong: '#10101a',
    border: 'rgba(141, 123, 231, 0.18)',
    text: '#efeefe',
    textMuted: '#afacc4',
    sidebar: '#090911',
  },
};

export function resolveAtmosphereTheme(atmosphere?: string | null): ThemePalette {
  if (!atmosphere || !(atmosphere in ATMOSPHERE_THEMES)) {
    return ATMOSPHERE_THEMES[DEFAULT_ATMOSPHERE];
  }

  return ATMOSPHERE_THEMES[atmosphere as AtmosphereKey];
}

export function applyAtmosphereTheme(atmosphere?: string | null) {
  if (typeof document === 'undefined') {
    return;
  }

  const theme = resolveAtmosphereTheme(atmosphere);
  const root = document.documentElement;

  root.style.setProperty('--app-accent', theme.accent);
  root.style.setProperty('--app-accent-strong', theme.accentStrong);
  root.style.setProperty('--app-accent-soft', theme.accentSoft);
  root.style.setProperty('--app-glow', theme.glow);
  root.style.setProperty('--app-bg', theme.background);
  root.style.setProperty('--app-bg-secondary', theme.backgroundSecondary);
  root.style.setProperty('--app-surface', theme.surface);
  root.style.setProperty('--app-surface-strong', theme.surfaceStrong);
  root.style.setProperty('--app-border', theme.border);
  root.style.setProperty('--app-text', theme.text);
  root.style.setProperty('--app-text-muted', theme.textMuted);
  root.style.setProperty('--app-sidebar', theme.sidebar);
  root.dataset.atmosphere = atmosphere ?? DEFAULT_ATMOSPHERE;
}
