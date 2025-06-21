/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/context/**/*.{js,jsx,ts,tsx}",
    "./src/utils/**/*.{js,jsx,ts,tsx}",
    "./src/assets/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
  backgroundSize: { '300%': '300% 300%' },
   backgroundImage: {
       // Name this key as you like, e.g. 'animated-gradient'
       'animated-gradient': 'linear-gradient(270deg, #4338ca, #6d28d9, #15847b, #4338ca, #6d28d9)',
       

      //  linear-gradient(270deg, #4f46e5, #34d399, #4f46e5, #34d399),
     },
  keyframes: {
    gradient: {
      '0%':   { backgroundPosition: '0% 50%' },
      '100%':  { backgroundPosition: '100% 50%' },
    },
  },
  animation: {
    'gradient': 'gradient 6s linear infinite',
  }
},
  },
  plugins: [],
}

