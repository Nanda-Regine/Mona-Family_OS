/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Family member colors
        mom: '#FFA07A',
        dad: '#87CEEB',
        phawu: '#FF6B6B',
        tabile: '#98FB98',
        nanda: '#DDA0DD',
        // High contrast palette
        hc: {
          bg: '#FFFFFF',
          text: '#000000',
          border: '#000000',
          accent: '#0000CC',
          warning: '#CC0000',
          success: '#006600'
        }
      },
      fontSize: {
        base: '16px',
        accessible: '18px',
        large: '20px',
        'extra-large': '24px'
      },
      minHeight: {
        'touch': '44px',
        'button': '50px'
      },
      minWidth: {
        'touch': '44px'
      },
      spacing: {
        'touch': '44px'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      animation: {
        'bounce-once': 'bounce 0.5s ease-in-out 1',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'check': 'checkMark 0.3s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        checkMark: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: [],
  safelist: [
    'bg-mom', 'bg-dad', 'bg-phawu', 'bg-tabile', 'bg-nanda',
    'border-mom', 'border-dad', 'border-phawu', 'border-tabile', 'border-nanda',
    'text-mom', 'text-dad', 'text-phawu', 'text-tabile', 'text-nanda',
    'text-accessible', 'text-large', 'text-extra-large',
    'min-h-touch', 'min-h-button', 'min-w-touch'
  ]
};
