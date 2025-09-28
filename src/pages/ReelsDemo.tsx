import React from 'react';
import { ThemeToggle } from '../components/ThemeToggle';

const reels = [
  {
    id: 1,
    title: 'Intro to React',
    tags: ['React', 'Beginner'],
    poster: '/posters/react-intro.jpg',
    caption: 'React is a library for building UIs...'
  },
  {
    id: 2,
    title: 'TypeScript Basics',
    tags: ['TypeScript', 'Types'],
    poster: '/posters/ts-basics.jpg',
    caption: 'TypeScript adds types to JavaScript...'
  },
];

function Button({ children, variant = 'primary', ...props }: any) {
  const base = 'px-4 py-2 rounded-lg font-medium transition focus:cs-focus';
  const variants: any = {
    primary: 'bg-[var(--cs-primary)] text-[var(--cs-on-primary)] hover:opacity-95 active:opacity-90 focus:ring-2 focus:ring-[var(--cs-outline)]',
    secondary: 'bg-[var(--cs-secondary)] text-[var(--cs-on-secondary)]',
    tertiary: 'bg-[var(--cs-tertiary)] text-[var(--cs-on-tertiary)]',
  };
  return <button className={`${base} ${variants[variant]}`} {...props}>{children}</button>;
}

function Card({ children, variant = 'base' }: any) {
  const base = 'p-6 rounded-xl shadow-sm border';
  const variants: any = {
    base: 'bg-[var(--cs-surface)] text-[var(--cs-on-surface)] border-[var(--cs-outline)]',
    variant: 'bg-[var(--cs-surface-variant)] text-[var(--cs-on-surface-variant)] border-[var(--cs-outline)]',
  };
  return <div className={`${base} ${variants[variant]}`}>{children}</div>;
}

function CaptionBlock({ text }: { text: string }) {
  return (
    <div className="mt-2 px-4 py-2 rounded-full text-xs font-medium"
      style={{ background: 'color-mix(in srgb, var(--cs-surface) 60%, transparent)' }}>
      {text}
    </div>
  );
}

export default function ReelsDemo() {
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);
  return (
    <div className="min-h-screen bg-[var(--cs-bg)] text-[var(--cs-on-bg)] font-sans transition-colors">
      <ThemeToggle />
      <main className="max-w-md mx-auto py-12 space-y-8">
        <h1 className="text-2xl font-bold mb-4">CodeSnap Color System Demo</h1>
        <div className="space-x-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
        </div>
        <Card>
          <div className="text-lg font-semibold mb-2">Base Card</div>
          <div>bg-[var(--cs-surface)] text-[var(--cs-on-surface)] border-[var(--cs-outline)]</div>
        </Card>
        <Card variant="variant">
          <div className="text-lg font-semibold mb-2">Variant Card</div>
          <div>bg-[var(--cs-surface-variant)] text-[var(--cs-on-surface-variant)]</div>
        </Card>
        <CaptionBlock text="This is a sample caption with a high-contrast pill background for legibility." />
      </main>
    </div>
  );
}
