/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'canvas': 'var(--color-canvas)',
        'surface': 'var(--color-surface)',
        'surface-subtle': 'var(--color-surface-subtle)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-hover': 'var(--color-border-hover)',
        'text-main': 'var(--color-text-main)',
        'text-muted': 'var(--color-text-muted)',
        'text-caption': 'var(--color-text-caption)',
        'brand-teal': '#0EA5A8',
        'brand-blue': '#3478C9',
        'op-green': '#168A63',
        'op-amber': '#B7791F',
        'op-red': '#D64545',
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0,0,0,0.04)',
        'elevated': '0 4px 12px rgba(0,0,0,0.08)',
        'modal': '0 20px 40px rgba(0,0,0,0.12)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'card': '16px',
        'xl': '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
