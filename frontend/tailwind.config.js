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
      animation: {
        "pulse-blink": "pulse-blink 1.5s ease-in-out infinite",
      },
      colors: {
        base: '#540606',
        teal: {
          500: '#540606',
          600: '#420505', // เปลี่ยนสี #teal-600 เป็น #red-600
          700: '#300404',
        },
        gray: {
          400: '#1d0202',
          500: '#540606',
          600: '#420505', // เปลี่ยนสี #teal-600 เป็น #red-600
          700: '#300404',
        },
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

