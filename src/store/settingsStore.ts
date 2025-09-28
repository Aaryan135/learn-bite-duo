import { create } from 'zustand';

interface SettingsState {
  theme: 'dark' | 'light';
  sound: boolean;
  setTheme: (t: 'dark' | 'light') => void;
  setSound: (v: boolean) => void;
}

const initialTheme = ((): 'dark' | 'light' => {
  try {
    const saved = localStorage.getItem('codesnap_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'dark';
})();

const initialSound = ((): boolean => {
  try {
    const saved = localStorage.getItem('codesnap_sound');
    if (saved === 'true' || saved === 'false') return saved === 'true';
  } catch {}
  return true;
})();

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: initialTheme,
  sound: initialSound,
  setTheme: (theme) => {
    try { localStorage.setItem('codesnap_theme', theme); } catch {}
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    set({ theme });
  },
  setSound: (sound) => {
    try { localStorage.setItem('codesnap_sound', String(sound)); } catch {}
    set({ sound });
  },
}));


