export type Theme = 'light' | 'dark';

export const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem('xavier-theme') as Theme | null;
  if (stored) return stored;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const setTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('xavier-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
};

export const toggleTheme = (): Theme => {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
};
