/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f3f4f6', // gray-100
        surface: '#ffffff',
        text: '#1f2937', // gray-800
        muted: '#6b7280', // gray-500
        primary: '#2563eb', // azul forte
        primaryHover: '#1d4ed8',
        success: '#16a34a',
        danger: '#dc2626'
      }
    }
  },
  plugins: []
}
