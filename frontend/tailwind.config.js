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
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': 'var(--shadow-subtle)',
        'elevated': 'var(--shadow-elevated)',
        'modal': 'var(--shadow-modal)',
        'glass': 'var(--shadow-glass)',
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
}
