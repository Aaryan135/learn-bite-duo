
import React, { useEffect, useState } from 'react';

// Helper to get system theme
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  // Set theme on mount and when theme changes
  useEffect(() => {
    let applied = theme;
    if (theme === 'system') {
      applied = getSystemTheme();
    }
    document.documentElement.setAttribute('data-theme', applied);
  }, [theme]);

  // Listen for system theme changes if using system
  useEffect(() => {
    if (theme !== 'system') return;
    const listener = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [theme]);

  const handleToggle = () => {
    // Cycle: system -> light -> dark -> system
    setTheme(prev => {
      let next = prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  let icon = '🌙';
  let label = 'Dark';
  if (theme === 'system') { icon = '💻'; label = 'System'; }
  else if (theme === 'dark') { icon = '🌞'; label = 'Light'; }

  return (
    <button
      className="fixed top-4 right-4 z-50 px-3 py-2 rounded-full bg-[var(--cs-surface-variant)] text-[var(--cs-on-surface-variant)] shadow cs-focus"
      onClick={handleToggle}
      aria-label="Toggle theme"
      title={`Switch theme (current: ${label})`}
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}
