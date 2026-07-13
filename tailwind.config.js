/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0a0d12',
          bg2: '#0d1117',
          panel: '#12171e',
          panel2: '#161d26',
          line: '#232c37',
          line2: '#2e3946',
          text: '#e9eef5',
          muted: '#8593a4',
        },
        neon: '#2ff58f',
        cyan: '#37d7ff',
        amber: '#ffb43b',
        danger: '#ff5d6c',
      },
      fontFamily: {
        display: ['"Black Han Sans"', 'Pretendard', 'sans-serif'],
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        score: ['"Chakra Petch"', 'Pretendard', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(47,245,143,.25), 0 0 40px -8px rgba(47,245,143,.35)',
        card: '0 18px 40px -20px rgba(0,0,0,.8)',
      },
      keyframes: {
        'spotlight-sweep': {
          '0%,100%': { transform: 'translateX(-18%) rotate(8deg)', opacity: '.5' },
          '50%': { transform: 'translateX(18%) rotate(8deg)', opacity: '.9' },
        },
        'grid-drift': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '52px 52px' },
        },
        clash: {
          '0%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(6px)' },
          '30%': { transform: 'translateX(-5px)' },
          '45%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-3px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        spotlight: 'spotlight-sweep 6s ease-in-out infinite',
        grid: 'grid-drift 8s linear infinite',
        clash: 'clash .5s ease-out',
      },
    },
  },
  plugins: [],
};
