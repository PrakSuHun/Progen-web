import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'progen-purple': '#7c3aed',
        'progen-dark': '#0f172a',
        'progen-gray': '#1e293b',
      },
    },
  },
  plugins: [],
}
export default config
