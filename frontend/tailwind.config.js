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
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

