/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'canvas': '#F8FAFC',
        'surface': '#FFFFFF',
        'surface-subtle': '#F1F5F7',
        'border-subtle': '#E2E8EC',
        'border-hover': '#CBD5E1',
        'text-main': '#17232D',
        'text-muted': '#60727D',
        'text-caption': '#8A9AA3',
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
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
}
