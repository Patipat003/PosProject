const { color } = require('framer-motion');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ปรับตามโครงสร้างโปรเจกต์ของคุณ
  ],
  theme: {
    extend: {
      keyframes: {
        "pulse-blink": {
          "0%, 100%": { backgroundColor: "#ef4444", opacity: "1" }, // สีแดง
          "50%": { backgroundColor: "#f87171", opacity: "0.5" }, // สีแดงอ่อน
        },
      },
      // colors : {
      //   white: "#3D3D3DFF",
      //   black: "#ffffff",
      //   gray: {
      //     100: "#3D3D3DFF",
      //     200: "#edf2f7",
      //     300: "#e2e8f0",
      //     400: "#cbd5e0",
      //     500: "#f7fafc",
      //     600: "#f7fafc",
      //     700: "#f7fafc",
      //     800: "#f7fafc",
      //     900: "#f7fafc",
      //   },
      // },  
      animation: {
        "pulse-blink": "pulse-blink 1.5s ease-in-out infinite",
      },
      fontFamily: {
        sans: ["SF Pro Text", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      
      typography: {
        DEFAULT: {
          css: {
            fontFamily: "Inter, sans-serif", // ใช้กับ prose (บทความ)
          },
        },
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
}

