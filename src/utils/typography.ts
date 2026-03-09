export const FONT_SIZE_MAP: Record<string, string> = {
  xs: "0.75rem",
  small: "0.875rem",
  medium: "1rem",
  large: "1.25rem",
  xl: "1.5rem",
  "2xl": "2rem",
};

export const FONT_WEIGHT_MAP: Record<string, number> = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export function resolveFontSize(token?: string | null, fallback?: string) {
  if (!token) return fallback;
  return FONT_SIZE_MAP[token] ?? fallback;
}

export function resolveFontWeight(token?: string | null, fallback?: number) {
  if (!token) return fallback;
  return FONT_WEIGHT_MAP[token] ?? fallback;
}
