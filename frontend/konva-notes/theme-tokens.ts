// theme-tokens.ts - Ensure color/theme consistency with project CSS variables

export type ThemeTokens = {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
};

export function getThemeTokens(): ThemeTokens {
  const root = getComputedStyle(document.documentElement);
  return {
    background: root.getPropertyValue('--color-background').trim(),
    foreground: root.getPropertyValue('--color-foreground').trim(),
    primary: root.getPropertyValue('--color-primary').trim(),
    primaryForeground: root.getPropertyValue('--color-primary-foreground').trim(),
    secondary: root.getPropertyValue('--color-secondary').trim(),
    secondaryForeground: root.getPropertyValue('--color-secondary-foreground').trim(),
    muted: root.getPropertyValue('--color-muted').trim(),
    mutedForeground: root.getPropertyValue('--color-muted-foreground').trim(),
    accent: root.getPropertyValue('--color-accent').trim(),
    accentForeground: root.getPropertyValue('--color-accent-foreground').trim()
  };
}

export function token(name: keyof ThemeTokens) {
  return getThemeTokens()[name];
}

export function themeColorCssVar(name: keyof ThemeTokens) {
  switch (name) {
    case 'background': return 'var(--color-background)';
    case 'foreground': return 'var(--color-foreground)';
    case 'primary': return 'var(--color-primary)';
    case 'primaryForeground': return 'var(--color-primary-foreground)';
    case 'secondary': return 'var(--color-secondary)';
    case 'secondaryForeground': return 'var(--color-secondary-foreground)';
    case 'muted': return 'var(--color-muted)';
    case 'mutedForeground': return 'var(--color-muted-foreground)';
    case 'accent': return 'var(--color-accent)';
    case 'accentForeground': return 'var(--color-accent-foreground)';
  }
}
