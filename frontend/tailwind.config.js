/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f5f3ef',
          100: '#e8e4db',
          200: '#d5cfc2',
          300: '#bfb6a4',
          400: '#a69a86',
          500: '#8c7f6a',
          600: '#74664f',
          700: '#5e5140',
          800: '#3d3328',
          900: '#231e17',
          950: '#110e0b',
        },
        sage: {
          400: '#84a98c',
          500: '#6b9174',
          600: '#52796f',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-sm': 'bounceSm 0.3s ease-out',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        bounceSm: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.08)' } },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
