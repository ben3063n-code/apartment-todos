import type { AccentColor, Priority } from './models';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentText: string;
  danger: string;
  priority: Record<Priority, string>;
};

const PRIORITY_COLORS: Record<'light' | 'dark', Record<Priority, string>> = {
  light: { 1: '#d92d20', 2: '#dc7609', 3: '#d9a30f', 4: '#8fae2f', 5: '#4a8f3c' },
  dark: { 1: '#f2665b', 2: '#f2a344', 3: '#f2cf4a', 4: '#a8d16b', 5: '#79c46a' },
};

const NEUTRAL_STOPS = {
  light: {
    background: { dim: '#e8e8e4', mid: '#ffffff', bright: '#ffffff' },
    surface: { dim: '#deded9', mid: '#f7f7f8', bright: '#f7f7f8' },
    surfaceAlt: { dim: '#d2d2cd', mid: '#efeff1', bright: '#efeff1' },
    text: '#111111',
    textMuted: '#8a8a8e',
    border: '#e2e2e4',
    danger: '#d92d20',
  },
  dark: {
    background: { dim: '#000000', mid: '#0e0e10', bright: '#242428' },
    surface: { dim: '#000000', mid: '#1a1a1d', bright: '#2e2e33' },
    surfaceAlt: { dim: '#050506', mid: '#242428', bright: '#38383f' },
    text: '#f2f2f3',
    textMuted: '#9a9aa0',
    border: '#2e2e33',
    danger: '#f2665b',
  },
};

const ACCENT_PRESETS: Record<Exclude<AccentColor, 'monochrome'>, string> = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#16a34a',
  orange: '#ea580c',
  red: '#dc2626',
  pink: '#db2777',
  teal: '#0d9488',
};

export const ACCENT_SWATCH_PREVIEW: Record<AccentColor, string> = {
  monochrome: '#888888',
  ...ACCENT_PRESETS,
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const value = parseInt(clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`;
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

function lerp3(stops: { dim: string; mid: string; bright: string }, t: number): string {
  if (t <= 0.5) return lerpColor(stops.dim, stops.mid, t / 0.5);
  return lerpColor(stops.mid, stops.bright, (t - 0.5) / 0.5);
}

export function buildTheme(scheme: 'light' | 'dark', brightness: number, accent: AccentColor): ThemeColors {
  const neutrals = NEUTRAL_STOPS[scheme];
  const isMonochrome = accent === 'monochrome';

  return {
    background: lerp3(neutrals.background, brightness),
    surface: lerp3(neutrals.surface, brightness),
    surfaceAlt: lerp3(neutrals.surfaceAlt, brightness),
    text: neutrals.text,
    textMuted: neutrals.textMuted,
    border: neutrals.border,
    danger: neutrals.danger,
    accent: isMonochrome ? (scheme === 'dark' ? '#f2f2f3' : '#111111') : ACCENT_PRESETS[accent],
    accentText: isMonochrome ? (scheme === 'dark' ? '#0e0e10' : '#ffffff') : '#ffffff',
    priority: PRIORITY_COLORS[scheme],
  };
}
