/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': 'var(--primary-color)',
        'primary-dark': 'var(--primary-dark)',
        'secondary-color': 'var(--secondary-color)',
        'text-color': 'var(--text-color)',
        'bg-color': 'var(--bg-color)',
        'bg-secondary': 'var(--bg-secondary)',
        'border-color': 'var(--border-color)',
        'error-color': 'var(--error-color)',
      },
    },
  },
  plugins: [],
}
