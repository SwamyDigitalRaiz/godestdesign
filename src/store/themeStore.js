import { create } from 'zustand';

export const useThemeStore = create((set) => {
  const storedTheme = localStorage.getItem('maat_theme') || 'light';
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  return {
    theme: storedTheme,
    toggleTheme: () =>
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('maat_theme', newTheme);
        return { theme: newTheme };
      }),
    setTheme: (theme) => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('maat_theme', theme);
      set({ theme });
    },
  };
});
