import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        foreground: '#0F172A',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
          hover: '#F8FAFC',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
        primary: {
          DEFAULT: '#4F46E5',
          foreground: '#FFFFFF',
          hover: '#4338CA',
          muted: '#EEF2FF',
        },
        secondary: {
          DEFAULT: '#F1F5F9',
          foreground: '#1E293B',
          hover: '#E2E8F0',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        accent: {
          DEFAULT: '#F1F5F9',
          foreground: '#1E293B',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
          muted: '#FEE2E2',
        },
        success: {
          DEFAULT: '#16A34A',
          foreground: '#FFFFFF',
          muted: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#D97706',
          foreground: '#FFFFFF',
          muted: '#FEF3C7',
        },
        info: {
          DEFAULT: '#2563EB',
          foreground: '#FFFFFF',
          muted: '#DBEAFE',
        },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#4F46E5',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.07)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
