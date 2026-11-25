import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        background: 'var(--bg)',
        surface: 'var(--bg-subtle)',
        sidebar: 'var(--sidebar)',
        border: 'var(--border)',
        foreground: 'var(--text)',
        muted: 'var(--muted)',
        hover: 'var(--hover)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          foreground: '#FFFFFF',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
};

export default config;

